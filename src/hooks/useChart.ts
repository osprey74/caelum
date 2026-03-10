import { useState, useEffect } from "react";

const SIDECAR_URL = "http://localhost:8765";

export function useSidecarReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let attempts = 0;
    const poll = setInterval(async () => {
      try {
        const res = await fetch(`${SIDECAR_URL}/health`);
        if (res.ok) {
          setReady(true);
          clearInterval(poll);
        }
      } catch {
        attempts++;
        if (attempts > 30) clearInterval(poll); // 15秒でタイムアウト
      }
    }, 500);
    return () => clearInterval(poll);
  }, []);

  return ready;
}
