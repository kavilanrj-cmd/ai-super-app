import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_register(client: AsyncClient):
    response = await client.post("/api/v1/auth/register", json={
        "email": "test@example.com",
        "username": "testuser",
        "password": "TestPass123!",
        "full_name": "Test User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "test@example.com"
    assert data["user"]["username"] == "testuser"

@pytest.mark.asyncio
async def test_login(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "username": "loginuser",
        "password": "TestPass123!",
    })
    response = await client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "TestPass123!",
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data

@pytest.mark.asyncio
async def test_login_invalid(client: AsyncClient):
    response = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "WrongPass123!",
    })
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_me(client: AsyncClient):
    reg = await client.post("/api/v1/auth/register", json={
        "email": "me@example.com",
        "username": "meuser",
        "password": "TestPass123!",
    })
    token = reg.json()["access_token"]
    response = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["email"] == "me@example.com"

@pytest.mark.asyncio
async def test_register_duplicate(client: AsyncClient):
    await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser",
        "password": "TestPass123!",
    })
    response = await client.post("/api/v1/auth/register", json={
        "email": "dup@example.com",
        "username": "dupuser2",
        "password": "TestPass123!",
    })
    assert response.status_code == 400
