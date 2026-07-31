import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import pickle
import os

class FAISSStore:
    def __init__(self):
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")
        self.indexes = {}
        self.documents = {}

    def create_index(self, name: str, dimension: int = 384):
        self.indexes[name] = faiss.IndexFlatL2(dimension)
        self.documents[name] = []

    async def add_texts(self, name: str, texts: List[str]):
        if name not in self.indexes:
            self.create_index(name)
        embeddings = self.embedding_model.encode(texts)
        self.indexes[name].add(np.array(embeddings).astype("float32"))
        self.documents[name].extend(texts)

    async def search(self, name: str, query: str, k: int = 5) -> List[dict]:
        if name not in self.indexes:
            return []
        query_embedding = self.embedding_model.encode([query])
        distances, indices = self.indexes[name].search(
            np.array(query_embedding).astype("float32"), k
        )
        results = []
        for i, idx in enumerate(indices[0]):
            if idx < len(self.documents[name]):
                results.append({
                    "content": self.documents[name][idx],
                    "distance": float(distances[0][i])
                })
        return results

    def save(self, path: str = "faiss_index"):
        os.makedirs(path, exist_ok=True)
        for name, index in self.indexes.items():
            faiss.write_index(index, os.path.join(path, f"{name}.index"))
        with open(os.path.join(path, "documents.pkl"), "wb") as f:
            pickle.dump(self.documents, f)

    def load(self, path: str = "faiss_index"):
        if os.path.exists(os.path.join(path, "documents.pkl")):
            with open(os.path.join(path, "documents.pkl"), "rb") as f:
                self.documents = pickle.load(f)
            for name in self.documents:
                index_path = os.path.join(path, f"{name}.index")
                if os.path.exists(index_path):
                    self.indexes[name] = faiss.read_index(index_path)

faiss_store = FAISSStore()
