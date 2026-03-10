"""APIキー設定の永続化管理。

config.json にAPIキーを保存し、.env はフォールバックとして使う。
"""

import json
import os
from pathlib import Path

_CONFIG_PATH = Path(__file__).resolve().parent.parent / "config.json"


def _load_config() -> dict:
    if _CONFIG_PATH.exists():
        with open(_CONFIG_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_config(config: dict) -> None:
    with open(_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def get_api_key() -> str | None:
    """config.json → 環境変数 の優先順でAPIキーを取得。"""
    config = _load_config()
    key = config.get("anthropic_api_key")
    if key:
        return key
    return os.environ.get("ANTHROPIC_API_KEY")


def set_api_key(key: str) -> None:
    """APIキーを config.json に保存。"""
    config = _load_config()
    config["anthropic_api_key"] = key
    _save_config(config)


def delete_api_key() -> None:
    """config.json からAPIキーを削除。"""
    config = _load_config()
    config.pop("anthropic_api_key", None)
    _save_config(config)


def has_api_key() -> bool:
    """APIキーが設定されているか。"""
    return get_api_key() is not None
