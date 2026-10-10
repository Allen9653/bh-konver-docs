import { useState } from "react";
import { ReceiptText, RotateCcw } from "lucide-react";

const formatBam = (value) => new Intl.NumberFormat("bs-BA", { style: "currency", currency: "BAM" }).format(value);

export default function PdvKalkulator() {
  const [amount, setAmount] = useState("");
  const [mode, setMode] = useState("add");
  const amountNumber = Number(amount);
  const valid = amount !== "" && Number.isFinite(amountNumber) && amountNumber >= 0;
  const totalPrice = valid ? (mode === "add" ? amountNumber * 1.17 : amountNumber) : 0;
  const basePrice = valid ? (mode === "add" ? amountNumber : totalPrice / 1.17) : 0;
  const vat = valid ? totalPrice - basePrice : 0;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500/10 text-amber-700"><ReceiptText className="h-5 w-5" /></span><div><h1 className="font-display text-2xl font-bold text-foreground">Kalkulator PDV-a</h1><p className="mt-1 text-sm text-muted-foreground">Izračunajte PDV ili izdvojite PDV iz ukupnog iznosa.</p></div></div>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1" role="group" aria-label="Način obračuna">
        <button type="button" aria-pressed={mode === "add"} onClick={() => setMode("add")} className={`min-h-10 rounded px-3 text-sm font-semibold transition-colors ${mode === "add" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Dodaj PDV (Bez → Sa)</button>
        <button type="button" aria-pressed={mode === "extract"} onClick={() => setMode("extract")} className={`min-h-10 rounded px-3 text-sm font-semibold transition-colors ${mode === "extract" ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>Izbij PDV (Sa → Bez)</button>
      </div>
      <label className="block text-sm font-medium text-foreground">{mode === "add" ? "Iznos bez PDV-a (KM)" : "Ukupan iznos sa PDV-om (KM)"}<input type="number" min="0" step="0.01" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Unesite iznos..." className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base font-semibold outline-none focus:ring-2 focus:ring-ring" /></label>
      <div aria-live="polite" className="mt-6 divide-y divide-border rounded-md bg-muted/60 px-4">
        <div className="flex justify-between gap-4 py-3 text-sm"><span className="text-muted-foreground">Osnovica (bez PDV-a)</span><strong className="text-foreground">{formatBam(basePrice)}</strong></div>
        <div className="flex justify-between gap-4 py-3 text-sm"><span className="text-muted-foreground">Iznos PDV-a (17%)</span><strong className="text-primary">{formatBam(vat)}</strong></div>
        <div className="flex justify-between gap-4 py-3 text-sm"><span className="font-semibold text-foreground">Ukupno sa PDV-om</span><strong className="text-lg text-primary">{formatBam(totalPrice)}</strong></div>
      </div>
      <div className="mt-4 flex items-start gap-2 text-xs leading-5 text-muted-foreground"><RotateCcw className="mt-0.5 h-3.5 w-3.5 shrink-0" />Obračun koristi standardnu stopu PDV-a od 17% u Bosni i Hercegovini.</div>
    </section>
  );
}
