from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.settings import get_api_key, set_api_key, delete_api_key, has_api_key, get_house_system, set_house_system

router = APIRouter(prefix="/settings")


class ApiKeyRequest(BaseModel):
    api_key: str


class HouseSystemRequest(BaseModel):
    house_system: str


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


@router.get("/house-system")
async def get_house_system_setting():
    """現在のハウスシステム設定を返す。"""
    return {"house_system": get_house_system()}


@router.post("/house-system")
async def save_house_system(body: HouseSystemRequest):
    hs = body.house_system.strip()
    try:
        set_house_system(hs)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    return {"status": "ok", "house_system": hs}
