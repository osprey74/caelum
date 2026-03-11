from fastapi import APIRouter, HTTPException

from models.schemas import ProfileCreate, ProfileUpdate
from services.profiles import (
    list_profiles,
    get_profile,
    create_profile,
    update_profile,
    delete_profile,
)

router = APIRouter(prefix="/profiles")


@router.get("")
async def get_profiles():
    """全プロファイル一覧を返す。"""
    return {"profiles": list_profiles()}


@router.get("/{profile_id}")
async def get_profile_by_id(profile_id: str):
    """IDでプロファイルを取得。"""
    profile = get_profile(profile_id)
    if not profile:
        raise HTTPException(status_code=404, detail="プロファイルが見つかりません。")
    return profile


@router.post("")
async def create_new_profile(body: ProfileCreate):
    """新規プロファイルを作成。"""
    profile = create_profile(body.model_dump())
    return profile


@router.put("/{profile_id}")
async def update_existing_profile(profile_id: str, body: ProfileUpdate):
    """既存プロファイルを更新。"""
    data = {k: v for k, v in body.model_dump().items() if v is not None}
    if not data:
        raise HTTPException(status_code=400, detail="更新データが空です。")
    profile = update_profile(profile_id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="プロファイルが見つかりません。")
    return profile


@router.delete("/{profile_id}")
async def delete_existing_profile(profile_id: str):
    """プロファイルを削除。"""
    if not delete_profile(profile_id):
        raise HTTPException(status_code=404, detail="プロファイルが見つかりません。")
    return {"status": "ok"}
