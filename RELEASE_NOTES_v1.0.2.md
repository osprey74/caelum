# Release Notes — v1.0.2

## 🐛 Bug Fixes

- **Fix sidecar not starting in production builds**: Added `if __name__ == "__main__"` entry point to `main.py` so the PyInstaller binary correctly starts the uvicorn server on port 8765
- **Remove environment variable fallback for API key**: API key is now read exclusively from `config.json` in the OS app data directory, preventing unintended key leakage from development `.env` files

## 🎨 Improvements

- **Custom app icon**: Added orbit-themed application icon (credit: Eucalyp - Flaticon)
- **Flaticon attribution**: Added icon attribution link in README.md

---

# リリースノート — v1.0.2

## 🐛 バグ修正

- **プロダクションビルドでサイドカーが起動しない問題を修正**: `main.py` に `if __name__ == "__main__"` エントリポイントを追加し、PyInstallerバイナリがuvicornサーバーをポート8765で正しく起動するように修正
- **APIキーの環境変数フォールバックを削除**: APIキーはOSアプリデータディレクトリの `config.json` からのみ読み取るように変更。開発用 `.env` ファイルからの意図しないキー漏洩を防止

## 🎨 改善

- **カスタムアプリアイコン**: 軌道をモチーフにしたアプリケーションアイコンを追加（クレジット: Eucalyp - Flaticon）
- **Flaticon帰属表示**: README.mdにアイコン帰属リンクを追加
