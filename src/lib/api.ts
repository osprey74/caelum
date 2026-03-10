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

export async function fetchCities(): Promise<string[]> {
  const res = await fetch(`${SIDECAR_URL}/cities`);
  const data = await res.json();
  return data.cities;
}

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
