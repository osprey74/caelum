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

export interface CityGroup {
  label: string;
  cities: string[];
}

export async function fetchCityGroups(): Promise<CityGroup[]> {
  const res = await fetch(`${SIDECAR_URL}/cities`);
  const data = await res.json();
  return data.groups;
}

// --- APIキー設定 ---

export async function fetchApiKeyStatus(): Promise<boolean> {
  const res = await fetch(`${SIDECAR_URL}/settings/api-key-status`);
  const data = await res.json();
  return data.has_key;
}

export async function saveApiKey(apiKey: string): Promise<void> {
  const res = await fetch(`${SIDECAR_URL}/settings/api-key`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ api_key: apiKey }),
  });
  if (!res.ok) throw new Error(await res.text());
}

export async function deleteApiKey(): Promise<void> {
  const res = await fetch(`${SIDECAR_URL}/settings/api-key`, {
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
