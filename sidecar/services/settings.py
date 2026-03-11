"""APIキー設定の永続化管理。

config.json にAPIキーを保存し、環境変数はフォールバックとして使う。
保存先はOSのアプリデータディレクトリ:
  Windows: %APPDATA%/liber-caeli/config.json
  macOS:   ~/Library/Application Support/liber-caeli/config.json
  Linux:   ~/.config/liber-caeli/config.json
"""

import json
import os
import sys
from pathlib import Path

_APP_NAME = "liber-caeli"


def _get_config_dir() -> Path:
    """OSに応じたアプリデータディレクトリを返す。"""
    if sys.platform == "win32":
        base = Path(os.environ.get("APPDATA", Path.home() / "AppData" / "Roaming"))
    elif sys.platform == "darwin":
        base = Path.home() / "Library" / "Application Support"
    else:
        base = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    return base / _APP_NAME


_CONFIG_DIR = _get_config_dir()
_CONFIG_PATH = _CONFIG_DIR / "config.json"


def _load_config() -> dict:
    if _CONFIG_PATH.exists():
        with open(_CONFIG_PATH, encoding="utf-8") as f:
            return json.load(f)
    return {}


def _save_config(config: dict) -> None:
    _CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    with open(_CONFIG_PATH, "w", encoding="utf-8") as f:
        json.dump(config, f, ensure_ascii=False, indent=2)


def get_api_key() -> str | None:
    """config.json からAPIキーを取得。"""
    config = _load_config()
    return config.get("anthropic_api_key") or None


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


# --- ハウスシステム設定 ---

VALID_HOUSE_SYSTEMS = {"P", "W", "A"}  # Placidus, Whole Sign, Equal


def get_house_system() -> str:
    """保存されたハウスシステムを取得（既定: P=Placidus）。"""
    config = _load_config()
    hs = config.get("house_system", "P")
    return hs if hs in VALID_HOUSE_SYSTEMS else "P"


def set_house_system(system: str) -> None:
    """ハウスシステムを config.json に保存。"""
    if system not in VALID_HOUSE_SYSTEMS:
        raise ValueError(f"無効なハウスシステム: {system}（有効: {VALID_HOUSE_SYSTEMS}）")
    config = _load_config()
    config["house_system"] = system
    _save_config(config)
