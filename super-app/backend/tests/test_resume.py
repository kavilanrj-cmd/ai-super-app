import pytest
from httpx import AsyncClient
import io

@pytest.mark.asyncio
async def test_analyze_resume_no_auth(client: AsyncClient):
    response = await client.post("/api/v1/resume/analyze")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_resume_history_empty(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "resume@example.com",
        "username": "resumeuser",
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/resume/history", headers=headers)
    assert response.status_code == 200
    assert response.json() == []
