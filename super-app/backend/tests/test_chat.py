import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_create_chat(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "chat@example.com",
        "username": "chatuser",
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.post("/api/v1/chat/", json={"title": "Test Chat"}, headers=headers)
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Chat"
    assert "id" in data

@pytest.mark.asyncio
async def test_list_chats(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "list@example.com",
        "username": "listuser",
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/chat/", headers=headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

@pytest.mark.asyncio
async def test_create_chat_unauthorized(client: AsyncClient):
    response = await client.post("/api/v1/chat/", json={"title": "Test"})
    assert response.status_code == 401
