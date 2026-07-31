import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer
from typing import List, Optional
import os

class VectorStore:
    def __init__(self):
        self.client = chromadb.Client(Settings(
            persist_directory=os.path.join(os.getcwd(), "chroma_db"),
            anonymized_telemetry=False
        ))
        self.embedding_model = SentenceTransformer("all-MiniLM-L6-v2")

    def get_or_create_collection(self, name: str):
        try:
            return self.client.get_collection(name)
        except ValueError:
            return self.client.create_collection(name)

    async def add_documents(self, collection_name: str, documents: List[str], metadatas: Optional[List[dict]] = None, ids: Optional[List[str]] = None):
        collection = self.get_or_create_collection(collection_name)
        embeddings = self.embedding_model.encode(documents).tolist()
        if ids is None:
            ids = [str(i) for i in range(len(documents))]
        collection.add(
            documents=documents,
            embeddings=embeddings,
            metadatas=metadatas,
            ids=ids
        )

    async def similarity_search(self, collection_name: str, query: str, k: int = 5) -> List[dict]:
        collection = self.get_or_create_collection(collection_name)
        query_embedding = self.embedding_model.encode(query).tolist()
        results = collection.query(
            query_embeddings=[query_embedding],
            n_results=k
        )
        formatted = []
        for i in range(len(results["documents"][0])):
            formatted.append({
                "content": results["documents"][0][i],
                "metadata": results["metadatas"][0][i] if results["metadatas"] else {},
                "distance": results["distances"][0][i] if results["distances"] else 0
            })
        return formatted

    async def delete_collection(self, name: str):
        try:
            self.client.delete_collection(name)
        except ValueError:
            pass

vector_store = VectorStore()
