const SIDECAR_URL = "http://localhost:8765";

export interface BirthData {
  name: string;
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  city: string;
  lat?: number;
  lng?: number;
  timezone?: string;
  house_system?: string;
  lang?: string;
}

export async function fetchChart(data: BirthData) {
  const res = await fetch(`${SIDECAR_URL}/chart`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- トランジット / シナストリー ---

import type { TransitRequest, SynastryRequest, DualChartResponse, MonthlyCalendarRequest, MonthlyCalendarResponse } from "../types/astrology";

export async function fetchTransit(data: TransitRequest): Promise<DualChartResponse> {
  const res = await fetch(`${SIDECAR_URL}/transit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function streamTransitInterpretation(
  data: TransitRequest,
  onText: (text: string) => void,
  onDone: () => void,
): () => void {
  const controller = new AbortController();

  fetch(`${SIDECAR_URL}/interpret-transit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          try {
            const { text } = JSON.parse(payload);
            onText(text);
          } catch {
            // incomplete SSE chunk
          }
        }
      }
    }
  });

  return () => controller.abort();
}

export async function fetchSynastry(data: SynastryRequest): Promise<DualChartResponse> {
  const res = await fetch(`${SIDECAR_URL}/synastry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function streamSynastryInterpretation(
  data: SynastryRequest,
  onText: (text: string) => void,
  onDone: () => void,
): () => void {
  const controller = new AbortController();

  fetch(`${SIDECAR_URL}/interpret-synastry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          try {
            const { text } = JSON.parse(payload);
            onText(text);
          } catch {
            // incomplete SSE chunk
          }
        }
      }
    }
  });

  return () => controller.abort();
}

export interface CityOption {
  key: string;
  display: string;
}

export interface CityGroup {
  label: string;
  cities: CityOption[];
}

export async function fetchCityGroups(lang?: string): Promise<CityGroup[]> {
  const params = lang ? `?lang=${lang}` : "";
  const res = await fetch(`${SIDECAR_URL}/cities${params}`);
  const data = await res.json();
  return data.groups;
}

// --- ジオコーディング ---

export interface GeocodingResult {
  display_name: string;
  lat: number;
  lng: number;
  timezone: string;
  source: "local" | "nominatim";
}

export async function searchCity(query: string, lang?: string): Promise<GeocodingResult[]> {
  const params = new URLSearchParams({ q: query });
  if (lang) params.set("lang", lang);
  const res = await fetch(`${SIDECAR_URL}/geocode?${params}`);
  if (!res.ok) throw new Error(await res.text());
  const data = await res.json();
  return data.results;
}

// --- APIキー設定（OS セキュア認証情報ストア経由・Tauri コマンド） ---

import { invoke } from "@tauri-apps/api/core";

export async function fetchApiKeyStatus(): Promise<boolean> {
  return await invoke<boolean>("keyring_has_api_key");
}

export async function saveApiKey(apiKey: string): Promise<void> {
  await invoke("keyring_set_api_key", { key: apiKey });
}

export async function deleteApiKey(): Promise<void> {
  await invoke("keyring_delete_api_key");
}

/// keyring の現在値をサイドカーに in-memory プッシュする。
/// サイドカー ready 検知後に呼ぶ。dev / production で冪等。
export async function syncApiKeyToSidecar(): Promise<void> {
  await invoke("keyring_sync_to_sidecar");
}

// --- ハウスシステム設定 ---

export async function fetchHouseSystem(): Promise<string> {
  const res = await fetch(`${SIDECAR_URL}/settings/house-system`);
  const data = await res.json();
  return data.house_system;
}

export async function saveHouseSystem(houseSystem: string): Promise<void> {
  const res = await fetch(`${SIDECAR_URL}/settings/house-system`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ house_system: houseSystem }),
  });
  if (!res.ok) throw new Error(await res.text());
}

// --- プロファイル管理 ---

import type { Profile } from "../types/astrology";

export async function fetchProfiles(): Promise<Profile[]> {
  const res = await fetch(`${SIDECAR_URL}/profiles`);
  const data = await res.json();
  return data.profiles;
}

export async function createProfile(data: Omit<Profile, "id" | "created_at" | "updated_at">): Promise<Profile> {
  const res = await fetch(`${SIDECAR_URL}/profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function updateProfile(id: string, data: Partial<BirthData>): Promise<Profile> {
  const res = await fetch(`${SIDECAR_URL}/profiles/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function deleteProfile(id: string): Promise<void> {
  const res = await fetch(`${SIDECAR_URL}/profiles/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error(await res.text());
}

// --- プロンプト生成（APIキー不要） ---

export async function generatePrompt(data: BirthData): Promise<string> {
  const res = await fetch(`${SIDECAR_URL}/generate-prompt`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result.prompt;
}

export async function generateTransitPrompt(data: TransitRequest): Promise<string> {
  const res = await fetch(`${SIDECAR_URL}/generate-prompt-transit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result.prompt;
}

export async function generateSynastryPrompt(data: SynastryRequest): Promise<string> {
  const res = await fetch(`${SIDECAR_URL}/generate-prompt-synastry`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result.prompt;
}

// --- 月間トランジットカレンダー ---

export async function fetchMonthlyCalendar(data: MonthlyCalendarRequest): Promise<MonthlyCalendarResponse> {
  const res = await fetch(`${SIDECAR_URL}/transit-calendar`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export function streamMonthlyInterpretation(
  data: MonthlyCalendarRequest,
  onText: (text: string) => void,
  onDone: () => void,
): () => void {
  const controller = new AbortController();

  fetch(`${SIDECAR_URL}/interpret-monthly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          try {
            const { text } = JSON.parse(payload);
            onText(text);
          } catch {
            // incomplete SSE chunk
          }
        }
      }
    }
  });

  return () => controller.abort();
}

export async function generateMonthlyPrompt(data: MonthlyCalendarRequest): Promise<string> {
  const res = await fetch(`${SIDECAR_URL}/generate-prompt-monthly`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  const result = await res.json();
  return result.prompt;
}

// --- AI解釈ストリーミング ---

export function streamInterpretation(
  data: BirthData,
  onText: (text: string) => void,
  onDone: () => void,
): () => void {
  const controller = new AbortController();

  fetch(`${SIDECAR_URL}/interpret`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    signal: controller.signal,
  }).then(async (res) => {
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const lines = decoder.decode(value).split("\n");
      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const payload = line.slice(6);
          if (payload === "[DONE]") {
            onDone();
            return;
          }
          try {
            const { text } = JSON.parse(payload);
            onText(text);
          } catch {
            // incomplete SSE chunk, skip
          }
        }
      }
    }
  });

  return () => controller.abort();
}
