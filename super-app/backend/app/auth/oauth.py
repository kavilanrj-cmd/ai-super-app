from fastapi import APIRouter, HTTPException
from httpx import AsyncClient
from app.core.config import settings
from app.core.security import create_access_token, create_refresh_token
from app.schemas.user import Token, UserResponse

router = APIRouter()

async def verify_google_token(token: str):
    async with AsyncClient() as client:
        response = await client.get(
            f"https://oauth2.googleapis.com/tokeninfo?id_token={token}"
        )
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid Google token")
        return response.json()

async def verify_github_token(token: str):
    async with AsyncClient() as client:
        headers = {"Authorization": f"Bearer {token}"}
        response = await client.get("https://api.github.com/user", headers=headers)
        if response.status_code != 200:
            raise HTTPException(status_code=400, detail="Invalid GitHub token")
        return response.json()

@router.post("/google")
async def google_login(token: str):
    user_data = await verify_google_token(token)
    return {"email": user_data.get("email"), "name": user_data.get("name")}

@router.post("/github")
async def github_login(token: str):
    user_data = await verify_github_token(token)
    return {"email": user_data.get("email"), "name": user_data.get("login")}
