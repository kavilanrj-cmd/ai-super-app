from app.vectorstore.chroma_store import vector_store
from app.llm.provider import llm_provider
from typing import List

class RAGService:
    @staticmethod
    async def process_document(collection_name: str, text: str, chunk_size: int = 500) -> int:
        chunks = [text[i:i+chunk_size] for i in range(0, len(text), chunk_size)]
        await vector_store.add_documents(collection_name, chunks)
        return len(chunks)

    @staticmethod
    async def query_document(collection_name: str, query: str) -> dict:
        results = await vector_store.similarity_search(collection_name, query, k=5)
        context = "\n\n".join([r["content"] for r in results])

        messages = [
            {"role": "system", "content": "Answer based on the provided context. Cite sources when possible."},
            {"role": "user", "content": f"Context:\n{context}\n\nQuestion: {query}"}
        ]

        answer = ""
        async for chunk in llm_provider.get_chat_response(messages, stream=True):
            answer += chunk

        return {
            "answer": answer,
            "sources": [{"content": r["content"][:200], "score": r["distance"]} for r in results[:3]]
        }
