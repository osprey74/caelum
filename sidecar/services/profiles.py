"""プロファイルの永続化管理。

profiles.json にプロファイル一覧を保存。
保存先は settings.py と同じアプリデータディレクトリ。
"""

import json
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from services.settings import _CONFIG_DIR


_PROFILES_PATH = _CONFIG_DIR / "profiles.json"


def _load_profiles() -> list[dict[str, Any]]:
    if _PROFILES_PATH.exists():
        with open(_PROFILES_PATH, encoding="utf-8") as f:
            return json.load(f)
    return []


def _save_profiles(profiles: list[dict[str, Any]]) -> None:
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(_PROFILES_PATH, "w", encoding="utf-8") as f:
        json.dump(profiles, f, ensure_ascii=False, indent=2)


def list_profiles() -> list[dict[str, Any]]:
    """全プロファイルを返す（作成日時順）。"""
    return _load_profiles()


def get_profile(profile_id: str) -> dict[str, Any] | None:
    """IDでプロファイルを取得。"""
    for p in _load_profiles():
        if p["id"] == profile_id:
            return p
    return None


def create_profile(data: dict[str, Any]) -> dict[str, Any]:
    """新規プロファイルを作成して返す。"""
    profiles = _load_profiles()
    now = datetime.now(timezone.utc).isoformat()
    profile = {
        "id": uuid.uuid4().hex[:12],
        **data,
        "created_at": now,
        "updated_at": now,
    }
    profiles.append(profile)
    _save_profiles(profiles)
    return profile


def update_profile(profile_id: str, data: dict[str, Any]) -> dict[str, Any] | None:
    """既存プロファイルを更新して返す。"""
    profiles = _load_profiles()
    for p in profiles:
        if p["id"] == profile_id:
            for k, v in data.items():
                if v is not None:
                    p[k] = v
            p["updated_at"] = datetime.now(timezone.utc).isoformat()
            _save_profiles(profiles)
            return p
    return None


def delete_profile(profile_id: str) -> bool:
    """プロファイルを削除。成功時True。"""
    profiles = _load_profiles()
    new_profiles = [p for p in profiles if p["id"] != profile_id]
    if len(new_profiles) == len(profiles):
        return False
    _save_profiles(new_profiles)
    return True
