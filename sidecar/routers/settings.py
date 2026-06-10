import os

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

from services.settings import has_api_key, get_house_system, set_house_system

router = APIRouter(prefix="/settings")


class HouseSystemRequest(BaseModel):
    house_system: str


class RefreshApiKeyRequest(BaseModel):
    api_key: str  # 空文字列は「削除」を意味する


@router.get("/api-key-status")
async def api_key_status():
    """APIキーが設定されているかを返す（キー自体は返さない）。

    v1.0.7 以降、APIキーの保存・削除は Tauri コマンド経由（OS セキュアストア）。
    本エンドポイントは「現在のサイドカープロセスに ANTHROPIC_API_KEY が
    注入されているか」を返すのみ。
    """
    return {"has_key": has_api_key()}


@router.post("/internal/refresh-api-key")
async def refresh_api_key(body: RefreshApiKeyRequest):
    """Tauri 側から呼ばれる内部エンドポイント。

    keyring に保存されている API キーを os.environ にプッシュし、
    サイドカー再起動なしで反映する。永続化はせず、メモリ上の環境変数のみ更新。
    空文字列を受け取った場合は環境変数を削除する。
    """
    key = body.api_key
    if key:
        os.environ["ANTHROPIC_API_KEY"] = key
    else:
        os.environ.pop("ANTHROPIC_API_KEY", None)
    return {"status": "ok", "has_key": has_api_key()}


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
