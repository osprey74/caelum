# Liber Caeli（リベル・カエリ）

西洋占星術ネイタルチャート生成＆AI解釈デスクトップアプリ。

ラテン語で「天空の書」を意味する **Liber Caeli** は、出生データからネイタルチャートを生成し、Claude AIによる日本語解釈を提供します。

## 機能

- 名前・生年月日時・出生地（ドロップダウン選択）を入力してネイタルチャートを生成
- D3.js SVGによるチャート円盤表示（サインリング、ハウス線、天体シンボル、アスペクト線）
- 天体配置一覧表（サイン/度数/ハウス/逆行表示）
- Claude API（claude-sonnet-4-6）による日本語ストリーミング解釈（Markdownレンダリング対応）

## 技術スタック

| レイヤー | 技術 |
|---|---|
| デスクトップシェル | Tauri v2 |
| フロントエンド | React 18, TypeScript, Tailwind CSS, D3.js |
| バックエンド | Python 3.10+, FastAPI, uvicorn |
| 天体計算 | kerykeion（Swiss Ephemeris内包） |
| AI | Anthropic Claude API |

## セットアップ

### 前提条件

- Node.js 18+
- Python 3.10+
- Rust（Tauri v2用）

### インストール

```bash
# フロントエンド依存
npm install

# サイドカー依存
cd sidecar
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

### 環境変数

```bash
cp .env.example sidecar/.env
# sidecar/.env を編集して ANTHROPIC_API_KEY を設定
```

### 開発サーバー起動

```bash
# サイドカー（別ターミナル）
cd sidecar && source .venv/bin/activate
uvicorn main:app --port 8765 --reload

# Tauri + フロントエンド
npm run tauri dev
```

## 占星術設定

- 黄道：熱帯（Tropical）
- ハウスシステム：プラシダス（Placidus）
- 天体：10天体 + ASC/MC
- アスペクト：主要5種 + セミスクエア・クインカンクス
- 解釈軸：モダン西洋（性格・傾向）

## ライセンス

個人利用。
