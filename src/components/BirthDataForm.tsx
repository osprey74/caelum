import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { fetchCityGroups, searchCity, CityGroup, BirthData, GeocodingResult } from "../lib/api";

interface Props {
  onSubmit: (data: BirthData) => void;
  disabled?: boolean;
  initialData?: BirthData | null;
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

type CityMode = "dictionary" | "search";

export default function BirthDataForm({ onSubmit, disabled, initialData }: Props) {
  const { t, i18n } = useTranslation();
  const [name, setName] = useState("");
  const [year, setYear] = useState("");
  const [month, setMonth] = useState("");
  const [day, setDay] = useState("");
  const [hour, setHour] = useState("");
  const [minute, setMinute] = useState("");

  // 都市選択: 辞書モード
  const [city, setCity] = useState("");
  const [groups, setGroups] = useState<CityGroup[]>([]);

  // 都市選択: 検索モード
  const [cityMode, setCityMode] = useState<CityMode>("dictionary");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedGeocode, setSelectedGeocode] = useState<GeocodingResult | null>(null);
  const [showResults, setShowResults] = useState(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // 手動入力フォールバック
  const [manualLat, setManualLat] = useState("");
  const [manualLng, setManualLng] = useState("");
  const [manualTz, setManualTz] = useState("Asia/Tokyo");

  useEffect(() => {
    fetchCityGroups(i18n.language).then(setGroups).catch(() => {});
  }, [i18n.language]);

  // プロファイル選択時にフォームを自動入力
  useEffect(() => {
    if (!initialData) return;
    setName(initialData.name);
    setYear(String(initialData.year));
    setMonth(String(initialData.month));
    setDay(String(initialData.day));
    setHour(String(initialData.hour));
    setMinute(String(initialData.minute));
    // 辞書にある都市名か、検索結果の都市名かを判定
    setCity(initialData.city);
    if (initialData.lat != null && initialData.lng != null) {
      setManualLat(String(initialData.lat));
      setManualLng(String(initialData.lng));
      setManualTz(initialData.timezone || "Asia/Tokyo");
    } else {
      setManualLat("");
      setManualLng("");
      setManualTz("Asia/Tokyo");
    }
    setSelectedGeocode(null);
    setCityMode("dictionary");
  }, [initialData]);

  // 検索結果外クリックで閉じる
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const doSearch = useCallback(async (query: string) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    try {
      const results = await searchCity(query, i18n.language);
      setSearchResults(results);
      setShowResults(true);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  function handleSelectGeocode(result: GeocodingResult) {
    setSelectedGeocode(result);
    setSearchQuery(result.display_name);
    setShowResults(false);
    // 検索モードの場合、辞書のcityはクリア
    setCity("");
    setManualLat(String(result.lat));
    setManualLng(String(result.lng));
    setManualTz(result.timezone);
  }

  function handleModeChange(mode: CityMode) {
    setCityMode(mode);
    if (mode === "dictionary") {
      setSelectedGeocode(null);
      setSearchQuery("");
      setSearchResults([]);
    } else {
      setCity("");
    }
  }

  // 有効な都市選択があるか
  const hasCityFromDict = cityMode === "dictionary" && city !== "";
  const hasCityFromSearch = cityMode === "search" && selectedGeocode !== null;
  const hasCityFromManual = manualLat !== "" && manualLng !== "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (hasCityFromSearch && selectedGeocode) {
      onSubmit({
        name,
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        city: selectedGeocode.display_name,
        lat: selectedGeocode.lat,
        lng: selectedGeocode.lng,
        timezone: selectedGeocode.timezone,
      });
    } else if (hasCityFromDict) {
      onSubmit({
        name,
        year: parseInt(year),
        month: parseInt(month),
        day: parseInt(day),
        hour: parseInt(hour),
        minute: parseInt(minute),
        city,
      });
    } else if (hasCityFromManual) {
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
    }
  }

  const isValid = name && year && month && day && hour !== "" && minute !== "" && (
    hasCityFromDict || hasCityFromSearch || hasCityFromManual
  );

  const inputClass =
    "w-full rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500";
  const smallInputClass =
    "rounded bg-gray-800 border border-gray-600 px-3 py-2 text-gray-100 focus:outline-none focus:border-indigo-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-lg font-bold text-gray-200">{t("form.title")}</h2>

      {/* 名前 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t("form.name")}</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder={t("form.namePlaceholder")}
          className={inputClass}
          disabled={disabled}
        />
      </div>

      {/* 生年月日 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t("form.birthDate")}</label>
        <div className="flex gap-2">
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder={t("form.year")}
            min="1900"
            max="2100"
            className={`w-24 ${smallInputClass}`}
            disabled={disabled}
          />
          <input
            type="number"
            value={month}
            onChange={clampedSetter(setMonth, 1, 12)}
            placeholder={t("form.month")}
            min="1"
            max="12"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
          <input
            type="number"
            value={day}
            onChange={clampedSetter(setDay, 1, 31)}
            placeholder={t("form.day")}
            min="1"
            max="31"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
        </div>
      </div>

      {/* 出生時刻 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t("form.birthTime")}</label>
        <div className="flex gap-2 items-center">
          <input
            type="number"
            value={hour}
            onChange={clampedSetter(setHour, 0, 23)}
            placeholder={t("form.hour")}
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
            placeholder={t("form.minute")}
            min="0"
            max="59"
            className={`w-20 ${smallInputClass}`}
            disabled={disabled}
          />
        </div>
      </div>

      {/* 出生地 — モード切替 */}
      <div>
        <label className="block text-sm text-gray-400 mb-1">{t("form.birthPlace")}</label>
        <div className="flex gap-2 mb-2">
          <button
            type="button"
            onClick={() => handleModeChange("dictionary")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              cityMode === "dictionary"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            disabled={disabled}
          >
            {t("form.selectFromList")}
          </button>
          <button
            type="button"
            onClick={() => handleModeChange("search")}
            className={`px-3 py-1 rounded text-sm transition-colors ${
              cityMode === "search"
                ? "bg-indigo-600 text-white"
                : "bg-gray-700 text-gray-400 hover:bg-gray-600"
            }`}
            disabled={disabled}
          >
            {t("form.searchByName")}
          </button>
        </div>

        {/* 辞書モード: ドロップダウン */}
        {cityMode === "dictionary" && (
          <select
            id="city-select"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className={inputClass}
            disabled={disabled}
          >
            <option value="">{t("form.selectCity")}</option>
            {groups.map((group) => (
              <optgroup key={group.label} label={group.label}>
                {group.cities.map((c) => (
                  <option key={c.key} value={c.key}>
                    {c.display}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        )}

        {/* 検索モード: テキスト入力 + 候補リスト */}
        {cityMode === "search" && (
          <div className="relative" ref={resultsRef}>
            <div className="flex gap-2">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedGeocode(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    doSearch(searchQuery);
                  }
                }}
                placeholder={t("form.searchPlaceholder")}
                className={`flex-1 ${inputClass}`}
                disabled={disabled}
              />
              <button
                type="button"
                onClick={() => doSearch(searchQuery)}
                disabled={disabled || searching || searchQuery.length < 2}
                className="px-4 py-2 rounded bg-indigo-600 text-white text-sm hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                {searching ? t("form.searching") : t("form.search")}
              </button>
            </div>

            {/* 検索結果候補 */}
            {showResults && searchResults.length > 0 && (
              <div className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto rounded bg-gray-800 border border-gray-600 shadow-lg">
                {searchResults.map((result, i) => (
                  <button
                    key={`${result.source}-${i}`}
                    type="button"
                    onClick={() => handleSelectGeocode(result)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors border-b border-gray-700 last:border-b-0"
                  >
                    <div className="text-sm text-gray-100">{result.display_name}</div>
                    <div className="text-xs text-gray-500">
                      {result.lat.toFixed(4)}, {result.lng.toFixed(4)} | {result.timezone}
                      {result.source === "local" && (
                        <span className="ml-2 text-indigo-400">{t("form.builtinDict")}</span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}

            {showResults && searchResults.length === 0 && !searching && searchQuery.length >= 2 && (
              <div className="absolute z-10 w-full mt-1 rounded bg-gray-800 border border-gray-600 px-3 py-2 text-sm text-gray-500">
                {t("form.noResults")}
              </div>
            )}

            {/* 選択済み表示 */}
            {selectedGeocode && (
              <div className="mt-2 rounded bg-gray-800/50 border border-indigo-500/30 p-2 text-sm">
                <span className="text-indigo-400">{t("form.selected")}</span>
                <span className="text-gray-200">{selectedGeocode.display_name}</span>
                <span className="text-gray-500 ml-2">
                  ({selectedGeocode.lat.toFixed(4)}, {selectedGeocode.lng.toFixed(4)} | {selectedGeocode.timezone})
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 緯度経度手動入力（辞書モードで都市未選択時のフォールバック） */}
      {cityMode === "dictionary" && (
        <div className="space-y-2 rounded bg-gray-800/50 border border-gray-700 p-3">
          <p className="text-xs text-gray-500">
            {t("form.manualCoordsHint")}
          </p>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 mb-0.5">{t("form.latitude")}</label>
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
              <label className="block text-xs text-gray-500 mb-0.5">{t("form.longitude")}</label>
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
            <label htmlFor="tz-select" className="block text-xs text-gray-500 mb-0.5">{t("form.timezone")}</label>
            <select
              id="tz-select"
              aria-label={t("form.timezone")}
              value={manualTz}
              onChange={(e) => setManualTz(e.target.value)}
              className={`${inputClass} text-sm`}
              disabled={disabled}
            >
              <option value="Asia/Tokyo">{t("form.tzJapan")}</option>
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
      )}

      {/* 送信ボタン */}
      <button
        type="submit"
        disabled={disabled || !isValid}
        className="w-full rounded bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
      >
        {t("form.createChart")}
      </button>
    </form>
  );
}
