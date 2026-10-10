import { useState } from "react";
import { ArrowLeftRight, MoveHorizontal } from "lucide-react";

const units = [
  { id: "m", label: "Metar", symbol: "m", meters: 1 },
  { id: "ft", label: "Stopa", symbol: "ft", meters: 0.3048 },
  { id: "in", label: "Inč", symbol: "in", meters: 0.0254 },
  { id: "km", label: "Kilometar", symbol: "km", meters: 1000 },
  { id: "mi", label: "Milja", symbol: "mi", meters: 1609.344 },
];

const formatValue = (value) => new Intl.NumberFormat("bs-BA", { maximumSignificantDigits: 10 }).format(value);

export default function LengthConverter() {
  const [value, setValue] = useState("1");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("ft");
  const source = units.find((unit) => unit.id === from);
  const target = units.find((unit) => unit.id === to);
  const number = Number(value);
  const result = value.trim() && Number.isFinite(number) ? number * source.meters / target.meters : null;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-500/10 text-cyan-700"><MoveHorizontal className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Konverter dužina</h2><p className="mt-1 text-sm text-muted-foreground">Metri, stope, inči, kilometri i milje.</p></div></header>
      <div className="grid gap-4 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="text-sm font-medium text-foreground">Početna vrijednost<input type="number" value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /><select aria-label="Početna jedinica dužine" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label} ({unit.symbol})</option>)}</select></label>
        <button type="button" onClick={() => { setFrom(to); setTo(from); }} aria-label="Zamijeni jedinice" className="flex h-11 w-11 items-center justify-center justify-self-center rounded-md border border-border text-primary hover:bg-muted"><ArrowLeftRight className="h-4 w-4" /></button>
        <label className="text-sm font-medium text-foreground">Pretvorena vrijednost<select aria-label="Ciljna jedinica dužine" value={to} onChange={(event) => setTo(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label} ({unit.symbol})</option>)}</select><output aria-live="polite" className="mt-2 flex h-11 items-center rounded-md bg-muted/60 px-3 text-base font-bold text-primary">{result === null ? "Unesite vrijednost" : `${formatValue(result)} ${target.symbol}`}</output></label>
      </div>
    </section>
  );
}
