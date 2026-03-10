import { useState, useEffect } from "react";
import { fetchCities, BirthData } from "../lib/api";

interface Props {
  onSubmit: (data: BirthData) => void;
  disabled?: boolean;
}

export default function BirthDataForm({ onSubmit, disabled }: Props) {
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");
  const [city, setCity] = useState("");

  const [cities, setCities] = useState<string[]>([]);

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
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

  const isValid =
    name && year && month && day && hour !== "" && minute !== "" && city;

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
          className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
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
            className="w-24 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
            disabled={disabled}
          />
          <input
            type="number"
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            placeholder="月"
            min="1"
            max="12"
            className="w-20 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
            disabled={disabled}
          />
          <input
            type="number"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            placeholder="日"
            min="1"
            max="31"
            className="w-20 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
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
            onChange={(e) => setHour(e.target.value)}
            placeholder="時"
            min="0"
            max="23"
            className="w-20 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
            disabled={disabled}
          />
          <span className="text-gray-400">:</span>
          <input
            type="number"
            value={minute}
            onChange={(e) => setMinute(e.target.value)}
            placeholder="分"
            min="0"
            max="59"
            className="w-20 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
            disabled={disabled}
          />
        </div>
      </div>

      {/* 出生地（ドロップダウン） */}
      <div>
        <label htmlFor="city-select" className="block text-sm text-gray-400 mb-1">出生地</label>
        <select
          id="city-select"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          disabled={disabled}
        >
          <option value="">都市を選択...</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
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
