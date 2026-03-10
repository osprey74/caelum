import { useState, useEffect, useRef } from "react";
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
  const [filtered, setFiltered] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const suggestionsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    fetchCities().then(setCities).catch(() => {});
  }, []);

  useEffect(() => {
    if (city.length === 0) {
      setFiltered([]);
      return;
    }
    setFiltered(cities.filter((c) => c.includes(city)));
    setSelectedIndex(-1);
  }, [city, cities]);

  function selectCity(c: string) {
    setCity(c);
    setShowSuggestions(false);
  }

  function handleCityKeyDown(e: React.KeyboardEvent) {
    if (!showSuggestions || filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      selectCity(filtered[selectedIndex]);
    }
  }

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

      {/* 出生地（オートコンプリート） */}
      <div className="relative">
        <label className="block text-sm text-gray-400 mb-1">出生地</label>
        <input
          type="text"
          value={city}
          onChange={(e) => {
            setCity(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
          onKeyDown={handleCityKeyDown}
          placeholder="例: 東京"
          className="w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500"
          disabled={disabled}
        />
        {showSuggestions && filtered.length > 0 && (
          <ul
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 max-h-48 overflow-auto rounded bg-gray-700 border border-gray-600 shadow-lg"
          >
            {filtered.map((c, i) => (
              <li
                key={c}
                onMouseDown={() => selectCity(c)}
                className={`px-3 py-2 cursor-pointer text-gray-100 ${
                  i === selectedIndex
                    ? "bg-indigo-600"
                    : "hover:bg-gray-600"
                }`}
              >
                {c}
              </li>
            ))}
          </ul>
        )}
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
