//! Anthropic API キーの OS セキュア認証情報ストア管理。
//!
//! 保存先:
//!   macOS:   Keychain (com.osprey74.caelum / anthropic_api_key)
//!   Windows: Credential Manager (DPAPI 経由)
//!   Linux:   Secret Service (libsecret) via D-Bus
//!
//! 旧バージョン (v1.0.6 まで) は config.json に平文保存していたため、
//! 起動時に migrate_legacy_key() で OS ストアへ移動する。

use keyring::Entry;
use serde_json::Value;
use std::fs;
use std::path::PathBuf;

const SERVICE: &str = "com.osprey74.caelum";
const ACCOUNT: &str = "anthropic_api_key";
const APP_NAME: &str = "liber-caeli";
const LEGACY_FIELD: &str = "anthropic_api_key";

fn entry() -> Result<Entry, String> {
    Entry::new(SERVICE, ACCOUNT).map_err(|e| format!("keyring init failed: {e}"))
}

/// アプリデータディレクトリ（Python サイドカーの _get_config_dir と一致させること）。
/// dirs::config_dir() は 3 OS とも Python 側のパスと一致する:
///   Windows: %APPDATA%
///   macOS:   ~/Library/Application Support
///   Linux:   $XDG_CONFIG_HOME or ~/.config
fn config_dir() -> Option<PathBuf> {
    dirs::config_dir().map(|p| p.join(APP_NAME))
}

fn config_path() -> Option<PathBuf> {
    config_dir().map(|d| d.join("config.json"))
}

/// keyring から API キーを取得。未設定なら None。
pub fn get_api_key() -> Result<Option<String>, String> {
    match entry()?.get_password() {
        Ok(key) => Ok(Some(key)),
        Err(keyring::Error::NoEntry) => Ok(None),
        Err(e) => Err(format!("keyring get failed: {e}")),
    }
}

/// keyring に API キーを保存し、config.json のメタデータも更新。
pub fn set_api_key(key: &str) -> Result<(), String> {
    let trimmed = key.trim();
    if trimmed.is_empty() {
        return Err("API key is empty".to_string());
    }
    entry()?
        .set_password(trimmed)
        .map_err(|e| format!("keyring set failed: {e}"))?;
    update_metadata(true, Some(trimmed))?;
    Ok(())
}

/// keyring から API キーを削除し、config.json のメタデータもクリア。
pub fn delete_api_key() -> Result<(), String> {
    match entry()?.delete_credential() {
        Ok(_) | Err(keyring::Error::NoEntry) => {}
        Err(e) => return Err(format!("keyring delete failed: {e}")),
    }
    update_metadata(false, None)?;
    Ok(())
}

/// API キーが設定されているか。
pub fn has_api_key() -> Result<bool, String> {
    Ok(get_api_key()?.is_some())
}

/// 旧バージョンが config.json に平文保存していた API キーを keyring へ移動する。
/// 起動時に一度だけ呼ばれる想定。
pub fn migrate_legacy_key() -> Result<bool, String> {
    let Some(path) = config_path() else {
        return Ok(false);
    };
    if !path.exists() {
        return Ok(false);
    }

    let raw = fs::read_to_string(&path).map_err(|e| format!("read config.json failed: {e}"))?;
    let mut config: Value =
        serde_json::from_str(&raw).map_err(|e| format!("parse config.json failed: {e}"))?;

    let legacy_key = config
        .as_object()
        .and_then(|m| m.get(LEGACY_FIELD))
        .and_then(|v| v.as_str())
        .map(|s| s.to_string());

    let Some(legacy_key) = legacy_key else {
        return Ok(false);
    };
    if legacy_key.is_empty() {
        if let Some(map) = config.as_object_mut() {
            map.remove(LEGACY_FIELD);
        }
        let pretty = serde_json::to_string_pretty(&config)
            .map_err(|e| format!("serialize config.json failed: {e}"))?;
        fs::write(&path, pretty).map_err(|e| format!("write config.json failed: {e}"))?;
        return Ok(false);
    }

    entry()?
        .set_password(&legacy_key)
        .map_err(|e| format!("keyring set during migration failed: {e}"))?;

    let last4 = last4(&legacy_key);
    if let Some(map) = config.as_object_mut() {
        map.remove(LEGACY_FIELD);
        map.insert("anthropic_api_key_saved".to_string(), Value::Bool(true));
        map.insert("anthropic_api_key_last4".to_string(), Value::String(last4));
    }
    let pretty = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("serialize config.json failed: {e}"))?;
    fs::write(&path, pretty).map_err(|e| format!("write config.json failed: {e}"))?;

    Ok(true)
}

fn update_metadata(saved: bool, key_for_last4: Option<&str>) -> Result<(), String> {
    let Some(dir) = config_dir() else {
        return Ok(());
    };
    let path = dir.join("config.json");

    let mut config: Value = if path.exists() {
        let raw = fs::read_to_string(&path).map_err(|e| format!("read config.json failed: {e}"))?;
        serde_json::from_str(&raw).map_err(|e| format!("parse config.json failed: {e}"))?
    } else {
        Value::Object(Default::default())
    };

    if let Some(map) = config.as_object_mut() {
        map.remove(LEGACY_FIELD);
        if saved {
            map.insert("anthropic_api_key_saved".to_string(), Value::Bool(true));
            if let Some(key) = key_for_last4 {
                map.insert(
                    "anthropic_api_key_last4".to_string(),
                    Value::String(last4(key)),
                );
            }
        } else {
            map.remove("anthropic_api_key_saved");
            map.remove("anthropic_api_key_last4");
        }
    }

    fs::create_dir_all(&dir).map_err(|e| format!("create config dir failed: {e}"))?;
    let pretty = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("serialize config.json failed: {e}"))?;
    fs::write(&path, pretty).map_err(|e| format!("write config.json failed: {e}"))?;
    Ok(())
}

fn last4(key: &str) -> String {
    let chars: Vec<char> = key.chars().collect();
    if chars.len() <= 4 {
        chars.iter().collect()
    } else {
        chars[chars.len() - 4..].iter().collect()
    }
}
