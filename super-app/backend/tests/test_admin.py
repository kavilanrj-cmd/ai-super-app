import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_admin_stats_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/admin/stats")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_admin_users_unauthorized(client: AsyncClient):
    response = await client.get("/api/v1/admin/users")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_regular_user_cannot_access_admin(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "regular@example.com",
        "username": "regularuser",
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    response = await client.get("/api/v1/admin/stats", headers=headers)
    assert response.status_code == 403
