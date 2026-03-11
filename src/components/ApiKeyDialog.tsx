import { useState } from "react";
import { saveApiKey, deleteApiKey, saveHouseSystem } from "../lib/api";
import { HOUSE_SYSTEMS } from "../types/astrology";

interface Props {
  hasKey: boolean;
  houseSystem: string;
  onClose: () => void;
  onUpdate: (hasKey: boolean) => void;
  onHouseSystemChange: (hs: string) => void;
}

export default function ApiKeyDialog({ hasKey, houseSystem, onClose, onUpdate, onHouseSystemChange }: Props) {
  const [key, setKey] = useState("");
  const [selectedHs, setSelectedHs] = useState(houseSystem);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      if (key.trim()) {
        await saveApiKey(key.trim());
        onUpdate(true);
      }
      if (selectedHs !== houseSystem) {
        await saveHouseSystem(selectedHs);
        onHouseSystemChange(selectedHs);
      }
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "保存に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setSaving(true);
    setError(null);
    try {
      await deleteApiKey();
      onUpdate(false);
      onClose();
    } catch (e) {
      setError(e instanceof Error ? e.message : "削除に失敗しました。");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = key.trim() !== "" || selectedHs !== houseSystem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[28rem] rounded-lg bg-gray-900 border border-gray-700 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-100 mb-4">設定</h3>

        {/* APIキー */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">APIキー</h4>
          {hasKey && (
            <p className="mb-2 text-sm text-green-400">
              APIキーは設定済みです。
            </p>
          )}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasKey ? "新しいキーで上書き..." : "sk-ant-api03-..."}
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
            disabled={saving}
          />
        </div>

        {/* ハウスシステム */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">ハウスシステム</h4>
          <select
            value={selectedHs}
            onChange={(e) => setSelectedHs(e.target.value)}
            disabled={saving}
            title="ハウスシステム"
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            {Object.entries(HOUSE_SYSTEMS).map(([id, label]) => (
              <option key={id} value={id}>{label}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            変更後、次回のチャート生成から反映されます。
          </p>
        </div>

        {error && (
          <p className="mb-3 text-sm text-red-400">{error}</p>
        )}

        <div className="flex justify-between">
          <div>
            {hasKey && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={saving}
                className="rounded bg-red-800 px-3 py-1.5 text-sm text-white hover:bg-red-700 disabled:opacity-40 transition-colors"
              >
                キーを削除
              </button>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
              className="rounded bg-gray-700 px-3 py-1.5 text-sm text-gray-300 hover:bg-gray-600 transition-colors"
            >
              キャンセル
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
