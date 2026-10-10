import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "bhk_free_doc_conversions";
export const FREE_DOC_LIMIT = 2;

function readUsed(): number {
  if (typeof window === "undefined") return 0;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const n = raw ? parseInt(raw, 10) : 0;
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/**
 * Tracks anonymous "high-quality document conversion" usage in localStorage.
 * Premium / authenticated-paid users bypass this entirely (handled by caller).
 */
export function useFreeQuota() {
  const [used, setUsed] = useState<number>(() => readUsed());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUsed(readUsed());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const remaining = Math.max(0, FREE_DOC_LIMIT - used);
  const exhausted = remaining <= 0;

  const consume = useCallback(() => {
    const next = readUsed() + 1;
    try {
      localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      /* ignore */
    }
    setUsed(next);
  }, []);

  const reset = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* ignore */
    }
    setUsed(0);
  }, []);

  return { used, remaining, exhausted, limit: FREE_DOC_LIMIT, consume, reset };
}
