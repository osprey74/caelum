from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.settings import get_api_key, set_api_key, delete_api_key, has_api_key

router = APIRouter(prefix="/settings")


class ApiKeyRequest(BaseModel):
    api_key: str


@router.get("/api-key-status")
async def api_key_status():
    """APIキーが設定されているかを返す（キー自体は返さない）。"""
    return {"has_key": has_api_key()}


@router.post("/api-key")
async def save_api_key(body: ApiKeyRequest):
    key = body.api_key.strip()
    if not key:
        raise HTTPException(status_code=400, detail="APIキーが空です。")
    set_api_key(key)
    return {"status": "ok"}


@router.delete("/api-key")
async def remove_api_key():
    delete_api_key()
    return {"status": "ok"}
