import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Check, Copy, Dices, RefreshCw } from "lucide-react";

const createUuid = () => {
  if (globalThis.crypto?.randomUUID) return globalThis.crypto.randomUUID();
  if (!globalThis.crypto?.getRandomValues) throw new Error("Sigurno generisanje UUID-a nije podržano u ovom pregledniku.");
  const bytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0"));
  return `${hex.slice(0, 4).join("")}-${hex.slice(4, 6).join("")}-${hex.slice(6, 8).join("")}-${hex.slice(8, 10).join("")}-${hex.slice(10).join("")}`;
};

export default function UuidGenerator() {
  const [quantity, setQuantity] = useState("1");
  const [uppercase, setUppercase] = useState(false);
  const [uuids, setUuids] = useState([]);
  const [notice, setNotice] = useState("");
  const { copy } = useCopyToClipboard();

  const generate = () => {
    try {
      const next = Array.from({ length: Number(quantity) }, () => createUuid());
      setUuids(uppercase ? next.map((uuid) => uuid.toUpperCase()) : next);
      setNotice("");
    } catch (error) {
      setNotice(error.message || "UUID nije moguće generisati.");
    }
  };

  const copyUuids = async () => {
    if (!uuids.length) return;
    const message = `${uuids.length} UUID ${uuids.length === 1 ? "kopiran" : "kopirano"}.`;
    const ok = await copy(uuids.join("\n"), { success: message });
    setNotice(ok ? message : "Clipboard nije dostupan. Označite i kopirajte vrijednosti ručno.");
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-7 flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary"><Dices className="h-5 w-5" aria-hidden="true" /></span>
        <div><h2 className="font-display text-2xl font-bold text-foreground">UUID v4 generator</h2><p className="mt-1 text-sm leading-6 text-muted-foreground">Generišite nasumične UUID v4 identifikatore lokalno u pregledniku.</p></div>
      </header>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end">
        <label className="text-sm font-medium text-foreground">Broj UUID vrijednosti <span className="text-muted-foreground">(1–50)</span>
          <input type="number" min="1" max="50" step="1" value={quantity} onChange={(event) => setQuantity(String(Math.max(1, Math.min(50, Number(event.target.value) || 1))))} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" />
        </label>
        <button type="button" onClick={generate} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"><RefreshCw className="h-4 w-4" aria-hidden="true" />Generiši UUID</button>
      </div>
      <label className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2.5 text-sm text-foreground"><input type="checkbox" checked={uppercase} onChange={(event) => setUppercase(event.target.checked)} className="h-4 w-4 accent-primary" />Koristi velika slova</label>
      {uuids.length > 0 && <div className="mt-5 rounded-md border border-border bg-muted/40 p-3 sm:p-4">
        <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase text-muted-foreground">Generisano: {uuids.length}</p><button type="button" onClick={copyUuids} className="inline-flex min-h-9 items-center gap-2 rounded-md border border-border bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:bg-muted"><Copy className="h-3.5 w-3.5" aria-hidden="true" />Kopiraj sve</button></div>
        <ul className="max-h-72 space-y-2 overflow-auto" aria-label="Generisani UUID nizovi">{uuids.map((uuid) => <li key={uuid} className="break-all rounded-sm bg-background px-3 py-2 font-mono text-xs text-foreground sm:text-sm">{uuid}</li>)}</ul>
      </div>}
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">{notice && (notice.includes("kopiran") || notice.includes("kopirano") ? <Check className="mr-1 inline h-4 w-4 text-emerald-600" /> : null)}{notice}</p>
    </section>
  );
}
