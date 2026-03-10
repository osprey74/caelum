import { useState, useEffect } from "react";
import { fetchCityGroups, CityGroup, BirthData } from "../lib/api";

interface Props {
  onSubmit: (data: BirthData) => void;
  disabled?: boolean;
}

function clampedSetter(setter: (v: string) => void, min: number, max: number) {
  return (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    if (raw === "") { setter(""); return; }
    const n = parseInt(raw, 10);
    if (isNaN(n)) return;
    if (n < min) { setter(String(min)); return; }
    if (n > max) { setter(String(max)); return; }
    setter(String(n));
  };
}

export default function BirthDataForm({ onSubmit, disabled }: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [city, setCity] = useState("");

  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualTz, setManualTz] = useState("Asia/Tokyo");

  const [groups, setGroups] = useState<CityGroup[]>([]);

  useEffect(() => {
    fetchCityGroups().then(setGroups).catch(() => {});
  }, []);

  const useManual = city === "" && manualLat !== "" && manualLng !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (useManual) {
      onSubmit({
        name,
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        city: `${manualLat},${manualLng}`,
        lat: parseFloat(manualLat),
        lng: parseFloat(manualLng),
        timezone: manualTz,
      });
    } else {
      onSubmit({
        name,
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        city,
      });
    }
  }

  const isValid = name && year && month && day && hour !== "" && minute !== "" && (
    city !== "" || (manualLat !== "" && manualLng !== "" && manualTz)
  );

  const inputClass =
    "w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500";
  const smallInputClass =
    "rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-200">出生データ入力</h2>

      {/* 名前 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">名前</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="例: 太郎"
          className={inputClass}
          disabled={disabled}
        />
      </div>

      {/* 生年月日 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">生年月日</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="年"
            min="1900"
            max="2100"
            className={`w-24 ${smallInputClass}`}
            disabled={disabled}
          />
          <input
            type="number"
            value={month}
            onChange={clampedSetter(setMonth, 1, 12)}
            placeholder="月"
            min="1"
            max="12"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
          <input
            type="number"
            value={day}
            onChange={clampedSetter(setDay, 1, 31)}
            placeholder="日"
            min="1"
            max="31"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
        </div>
      </div>

      {/* 出生時刻 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">出生時刻</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={hour}
            onChange={clampedSetter(setHour, 0, 23)}
            placeholder="時"
            min="0"
            max="23"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
          <span className="text-gray-400">:</span>
          <input
            type="number"
            value={minute}
            onChange={clampedSetter(setMinute, 0, 59)}
            placeholder="分"
            min="0"
            max="59"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
        </div>
      </div>

      {/* 出生地（地方グループ付きドロップダウン） */}
      <div>
        <label htmlFor="city-select" className="block text-sm text-gray-400 mb-1">
          出生地
        </label>
        <select
          id="city-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className={inputClass}
          disabled={disabled}
        >
          <option value="">都市を選択...</option>
          {groups.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.cities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      {/* 緯度経度手動入力（常時表示） */}
      <div className="space-y-2 rounded bg-gray-800/50 border border-gray-700 p-3">
          <p className="text-xs text-gray-500">
            都市リストにない場合、緯度・経度を直接入力できます
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-0.5">緯度</label>
              <input
                type="number"
                step="any"
                value={manualLat}
                onChange={(e) => setManualLat(e.target.value)}
                placeholder="35.6762"
                className={`${inputClass} text-sm`}
                disabled={disabled}
              />
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-0.5">経度</label>
              <input
                type="number"
                step="any"
                value={manualLng}
                onChange={(e) => setManualLng(e.target.value)}
                placeholder="139.6503"
                className={`${inputClass} text-sm`}
                disabled={disabled}
              />
            </div>
          </div>
          <div>
            <label htmlFor="tz-select" className="block text-xs text-gray-500 mb-0.5">タイムゾーン</label>
            <select
              id="tz-select"
              value={manualTz}
              onChange={(e) => setManualTz(e.target.value)}
              className={`${inputClass} text-sm`}
              disabled={disabled}
            >
              <option value="Asia/Tokyo">Asia/Tokyo（日本）</option>
              <option value="America/New_York">America/New_York</option>
              <option value="America/Chicago">America/Chicago</option>
              <option value="America/Los_Angeles">America/Los_Angeles</option>
              <option value="America/Sao_Paulo">America/Sao_Paulo</option>
              <option value="Europe/London">Europe/London</option>
              <option value="Europe/Paris">Europe/Paris</option>
              <option value="Europe/Berlin">Europe/Berlin</option>
              <option value="Europe/Rome">Europe/Rome</option>
              <option value="Asia/Shanghai">Asia/Shanghai</option>
              <option value="Asia/Taipei">Asia/Taipei</option>
              <option value="Asia/Seoul">Asia/Seoul</option>
              <option value="Asia/Bangkok">Asia/Bangkok</option>
              <option value="Asia/Singapore">Asia/Singapore</option>
              <option value="Asia/Kolkata">Asia/Kolkata</option>
              <option value="Asia/Dubai">Asia/Dubai</option>
              <option value="Australia/Sydney">Australia/Sydney</option>
            </select>
          </div>
      </div>

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        チャートを作成
      </button>
    </form>
  );
}
