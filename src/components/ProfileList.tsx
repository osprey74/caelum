import { useState, useEffect } from "react";
import { fetchProfiles, createProfile, deleteProfile, BirthData } from "../lib/api";
import type { Profile } from "../types/astrology";

interface Props {
  onSelect: (data: BirthData) => void;
  currentBirthData: BirthData | null;
  disabled?: boolean;
}

export default function ProfileList({ onSelect, currentBirthData, disabled }: Props) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfiles();
  }, []);

  async function loadProfiles() {
    try {
      const list = await fetchProfiles();
      setProfiles(list);
    } catch {
      // sidecar not ready yet
    }
  }

  function handleSelect(e: React.ChangeEvent<HTMLSelectElement>) {
    const id = e.target.value;
    setSelectedId(id);
    if (!id) return;
    const profile = profiles.find((p) => p.id === id);
    if (profile) {
      onSelect({
        name: profile.name,
        year: profile.year,
        month: profile.month,
        day: profile.day,
        hour: profile.hour,
        minute: profile.minute,
        city: profile.city,
        lat: profile.lat,
        lng: profile.lng,
        timezone: profile.timezone,
      });
    }
  }

  async function handleSave() {
    if (!currentBirthData) return;
    setSaving(true);
    try {
      const created = await createProfile({
        name: currentBirthData.name,
        year: currentBirthData.year,
        month: currentBirthData.month,
        day: currentBirthData.day,
        hour: currentBirthData.hour,
        minute: currentBirthData.minute,
        city: currentBirthData.city,
        lat: currentBirthData.lat,
        lng: currentBirthData.lng,
        timezone: currentBirthData.timezone,
      });
      await loadProfiles();
      setSelectedId(created.id);
    } catch {
      // error
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!selectedId) return;
    try {
      await deleteProfile(selectedId);
      setSelectedId("");
      await loadProfiles();
    } catch {
      // error
    }
  }

  const inputClass =
    "w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500";

  return (
    <div className="space-y-2 mb-4">
      <div className="flex items-center justify-between">
        <label className="text-sm text-gray-400">保存済みプロファイル</label>
        <span className="text-xs text-gray-600">{profiles.length}件</span>
      </div>

      <select
        value={selectedId}
        onChange={handleSelect}
        className={inputClass}
        disabled={disabled}
      >
        <option value="">選択してください...</option>
        {profiles.map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}（{p.year}/{p.month}/{p.day}）
          </option>
        ))}
      </select>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={disabled || !currentBirthData || saving}
          className="flex-1 rounded bg-gray-700 px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="現在の入力内容をプロファイルとして保存"
        >
          {saving ? "保存中..." : "保存"}
        </button>
        <button
          type="button"
          onClick={handleDelete}
          disabled={disabled || !selectedId}
          className="rounded bg-gray-700 px-3 py-1.5 text-xs text-red-400 hover:bg-red-900/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          title="選択中のプロファイルを削除"
        >
          削除
        </button>
      </div>
    </div>
  );
}
