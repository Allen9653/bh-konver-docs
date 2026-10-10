import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

/** Kopira tekst u clipboard (uz rezervni način za starije preglednike i nesigurne kontekste). */
export const copyTextToClipboard = async (text: string): Promise<boolean> => {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // pada na rezervni način ispod
  }
  try {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(area);
    return ok;
  } catch {
    return false;
  }
};

type Messages = { success?: string; error?: string };

/**
 * Hook za dugmad "Kopiraj": vraća `copied` (privremeno true nakon uspjeha) i `copy(text)`,
 * te prikazuje toast sa potvrdom ili jasnom porukom o grešci.
 */
export const useCopyToClipboard = (messages: Messages = {}) => {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number>();

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(async (text: string, override: Messages = {}) => {
    if (!text) return false;
    const ok = await copyTextToClipboard(text);
    window.clearTimeout(timer.current);
    if (ok) {
      setCopied(true);
      toast.success(override.success ?? messages.success ?? "Kopirano u clipboard");
      timer.current = window.setTimeout(() => setCopied(false), 1800);
    } else {
      setCopied(false);
      toast.error(override.error ?? messages.error ?? "Kopiranje nije uspjelo. Označite tekst i kopirajte ga ručno.");
    }
    return ok;
  }, [messages.success, messages.error]);

  const reset = useCallback(() => setCopied(false), []);
  return { copied, copy, reset };
};
