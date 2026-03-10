# caelum — Liber Caeli

西洋占星術ネイタルチャートアプリ（個人利用）。
ラテン語で「天空の書」。

## 技術スタック
- フロントエンド: Tauri v2, React 18, TypeScript, Tailwind CSS, D3.js
- バックエンド: Python 3.10+, FastAPI, kerykeion（online=False）, uvicorn
- AI: Anthropic Claude API (claude-sonnet-4-6)
- 位置情報: 内蔵都市辞書（GeoNames不使用）

## ディレクトリ
- src/         React フロントエンド
- sidecar/     Python サイドカー（FastAPI, ポート8765固定）
- src-tauri/   Tauri設定・Rustコード

## 開発コマンド
```bash
# フロントエンド + Tauri起動
npm run tauri dev

# サイドカー単体起動（デバッグ用）
cd sidecar && source .venv/bin/activate
uvicorn main:app --port 8765 --reload

# Pythonパッケージインストール
cd sidecar && pip install -r requirements.txt
```

## 占星術設定（変更禁止）
- 黄道: 熱帯（Tropical）
- ハウス: プラシダス（Placidus）
- online: False（GeoNames不使用）
- ポート: 8765固定

## CI/CD
- GitHub Actions（Windows x86_64 + macOS Intel/ARM）でタグプッシュ時に自動ビルド
- PyInstallerでサイドカーをバイナリ化 → Tauriでインストーラー生成
- バージョン更新対象: `package.json`, `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`
- `Cargo.lock` は `cargo generate-lockfile` で自動更新

## コーディング規約
- TypeScript: strict mode、型定義は src/types/ に集約
- Python: PEP8準拠、型ヒント必須（mypy対応）
- コミット: Conventional Commits（feat/fix/docs/refactor/chore）
- ブランチ: main / develop / feature/xxx / fix/xxx

## 注意事項
- ANTHROPIC_API_KEY は .env に記載（コミット厳禁）
- kerykeionの呼び出しは必ず sidecar/services/kerykeion_service.py 経由
- online=False を必ず指定すること
