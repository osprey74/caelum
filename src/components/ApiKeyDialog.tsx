import { useState } from "react";
import { useTranslation } from "react-i18next";
import i18n from "i18next";
import { saveApiKey, deleteApiKey, saveHouseSystem } from "../lib/api";
import { setLanguage } from "../i18n";

interface Props {
  hasKey: boolean;
  houseSystem: string;
  onClose: () => void;
  onUpdate: (hasKey: boolean) => void;
  onHouseSystemChange: (hs: string) => void;
}

export default function ApiKeyDialog({ hasKey, houseSystem, onClose, onUpdate, onHouseSystemChange }: Props) {
  const { t } = useTranslation();
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
      setError(e instanceof Error ? e.message : t("settings.saveError"));
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
      setError(e instanceof Error ? e.message : t("settings.deleteError"));
    } finally {
      setSaving(false);
    }
  }

  const hasChanges = key.trim() !== "" || selectedHs !== houseSystem;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="w-[28rem] rounded-lg bg-gray-900 border border-gray-700 p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-100 mb-4">{t("settings.title")}</h3>

        {/* APIキー */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">{t("settings.apiKey")}</h4>
          {hasKey && (
            <p className="mb-2 text-sm text-green-400">
              {t("settings.apiKeySet")}
            </p>
          )}
          <input
            type="password"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            placeholder={hasKey ? t("settings.apiKeyOverwrite") : t("settings.apiKeyPlaceholder")}
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
            disabled={saving}
          />
        </div>

        {/* ハウスシステム */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">{t("settings.houseSystem")}</h4>
          <select
            value={selectedHs}
            onChange={(e) => setSelectedHs(e.target.value)}
            disabled={saving}
            title={t("settings.houseSystem")}
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            {["P", "W", "A"].map((id) => (
              <option key={id} value={id}>{t(`houseSystems.${id}`)}</option>
            ))}
          </select>
          <p className="mt-1 text-xs text-gray-500">
            {t("settings.houseSystemHint")}
          </p>
        </div>

        {/* 言語 */}
        <div className="mb-5">
          <h4 className="text-sm font-semibold text-gray-300 mb-2">{t("settings.language")}</h4>
          <select
            value={i18n.language}
            onChange={(e) => setLanguage(e.target.value)}
            disabled={saving}
            title={t("settings.language")}
            className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 text-sm focus:outline-none focus:border-indigo-500"
          >
            <option value="ja">日本語</option>
            <option value="en">English</option>
          </select>
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
                {t("settings.deleteKey")}
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
              {t("common.close")}
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !hasChanges}
              className="rounded bg-indigo-600 px-3 py-1.5 text-sm text-white hover:bg-indigo-500 disabled:opacity-40 transition-colors"
            >
              {t("common.save")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
