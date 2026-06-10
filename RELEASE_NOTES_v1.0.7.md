# Release Notes — v1.0.7

## 🔒 Security Hardening

### API Key Storage Moved to OS Secure Credential Store (Phase 5)

The Anthropic API key is no longer stored as plaintext in `config.json`. Starting with this release, the key is kept in the operating system's native credential store:

- **macOS** — Keychain (service: `com.osprey74.caelum`)
- **Windows** — Credential Manager (DPAPI-backed)
- **Linux** — Secret Service (libsecret) via D-Bus

Only non-secret metadata (`anthropic_api_key_saved`, `anthropic_api_key_last4`) remains in `config.json`. The key is sent only to the Anthropic API endpoint and is never written to logs, crash reports, or exported files (SVG / PNG / PDF). Defensive in-stream redaction has also been added to error responses.

### Automatic Migration

If you are upgrading from v1.0.6 or earlier, the existing plaintext API key in `config.json` is **automatically migrated to the secure credential store** on first launch. The plaintext field is removed from the JSON file in the same operation.

### In-Memory Refresh (No Restart on Key Change)

Saving, updating, or deleting the API key in Settings now reflects in the running sidecar immediately via an internal HTTP refresh endpoint — no sidecar restart required.

## 🙏 Acknowledgements

Many thanks to **@takashi-cw** for the careful security review and the constructive write-up in [Issue #1](https://github.com/osprey74/caelum/issues/1). The threat model and remediation steps proposed there were directly actionable and shaped this release.

---

# リリースノート — v1.0.7

## 🔒 セキュリティ強化

### APIキー保存先を OS セキュア認証情報ストアへ移行 (Phase 5)

Anthropic APIキーは `config.json` の平文保存を廃止しました。本リリースから、キーはOS標準の認証情報ストアに保存されます：

- **macOS** — Keychain（サービス名: `com.osprey74.caelum`）
- **Windows** — Credential Manager（DPAPIベース）
- **Linux** — Secret Service（libsecret）via D-Bus

`config.json` には `anthropic_api_key_saved` と `anthropic_api_key_last4`（末尾4文字）のメタデータのみが保存されます。キー本体は Anthropic API へのリクエスト時にのみ送信され、ログ・クラッシュレポート・エクスポートファイル（SVG / PNG / PDF）には一切書き出されません。エラー応答にも防御的な伏字処理を追加しました。

### 自動マイグレーション

v1.0.6 以前から更新する場合、既存の `config.json` 内の平文APIキーは**初回起動時に自動的にセキュア認証情報ストアへ移行**されます。同じ処理で JSON ファイルからは平文フィールドが削除されます。

### in-memory リフレッシュ（キー更新時の再起動不要）

設定画面でのAPIキー登録・更新・削除は、内部HTTPリフレッシュエンドポイントを経由して実行中のサイドカーへ即時反映されるようになりました。サイドカーの再起動は不要です。

## 🙏 謝辞

[Issue #1](https://github.com/osprey74/caelum/issues/1) で丁寧かつ建設的なセキュリティレビューを行ってくださった **@takashi-cw** 様に深く感謝いたします。ご指摘の脅威モデルと改善提案はそのまま実装方針に反映でき、本リリースの形になりました。
