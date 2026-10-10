import { useState } from "react";
import { ArrowLeftRight, Ruler } from "lucide-react";

const categories = {
  duzina: {
    label: "Dužina",
    units: [
      { id: "mm", label: "Milimetar (mm)", factor: 0.001 },
      { id: "cm", label: "Centimetar (cm)", factor: 0.01 },
      { id: "m", label: "Metar (m)", factor: 1 },
      { id: "km", label: "Kilometar (km)", factor: 1000 },
      { id: "in", label: "Inč (in)", factor: 0.0254 },
      { id: "ft", label: "Stopa (ft)", factor: 0.3048 },
      { id: "yd", label: "Jard (yd)", factor: 0.9144 },
      { id: "mi", label: "Milja (mi)", factor: 1609.344 },
    ],
  },
  masa: {
    label: "Masa",
    units: [
      { id: "mg", label: "Miligram (mg)", factor: 0.000001 },
      { id: "g", label: "Gram (g)", factor: 0.001 },
      { id: "kg", label: "Kilogram (kg)", factor: 1 },
      { id: "t", label: "Tona (t)", factor: 1000 },
      { id: "oz", label: "Unca (oz)", factor: 0.028349523125 },
      { id: "lb", label: "Funta (lb)", factor: 0.45359237 },
    ],
  },
  zapremina: {
    label: "Zapremina",
    units: [
      { id: "ml", label: "Mililitar (ml)", factor: 0.001 },
      { id: "l", label: "Litar (l)", factor: 1 },
      { id: "m3", label: "Kubni metar (m³)", factor: 1000 },
      { id: "tsp", label: "Kašičica (US tsp)", factor: 0.00492892159375 },
      { id: "cup", label: "Šolja (US cup)", factor: 0.2365882365 },
      { id: "gal", label: "Galon (US gal)", factor: 3.785411784 },
    ],
  },
  povrsina: {
    label: "Površina",
    units: [
      { id: "mm2", label: "Kvadratni milimetar (mm²)", factor: 0.000001 },
      { id: "cm2", label: "Kvadratni centimetar (cm²)", factor: 0.0001 },
      { id: "m2", label: "Kvadratni metar (m²)", factor: 1 },
      { id: "ha", label: "Hektar (ha)", factor: 10000 },
      { id: "km2", label: "Kvadratni kilometar (km²)", factor: 1000000 },
      { id: "ft2", label: "Kvadratna stopa (ft²)", factor: 0.09290304 },
      { id: "acre", label: "Aker (ac)", factor: 4046.8564224 },
    ],
  },
};

const formatResult = (value) => new Intl.NumberFormat("bs-BA", { maximumSignificantDigits: 10 }).format(value);

export default function UnitConverter() {
  const [category, setCategory] = useState("duzina");
  const [from, setFrom] = useState("m");
  const [to, setTo] = useState("km");
  const [value, setValue] = useState("1");
  const currentUnits = categories[category].units;
  const source = currentUnits.find((unit) => unit.id === from) ?? currentUnits[0];
  const target = currentUnits.find((unit) => unit.id === to) ?? currentUnits[1];
  const numericValue = Number(value);
  const result = value.trim() && Number.isFinite(numericValue) ? (numericValue * source.factor) / target.factor : null;

  const changeCategory = (nextCategory) => {
    setCategory(nextCategory);
    setFrom(categories[nextCategory].units[0].id);
    setTo(categories[nextCategory].units[1].id);
  };

  const swap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-500/10 text-sky-700"><Ruler className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Konverter jedinica</h2><p className="mt-1 text-sm text-muted-foreground">Dužina, masa, zapremina i površina.</p></div></header>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Kategorija jedinica">
        {Object.entries(categories).map(([id, item]) => <button key={id} type="button" aria-pressed={category === id} onClick={() => changeCategory(id)} className={`min-h-10 rounded-md border px-3 text-sm font-semibold transition-colors ${category === id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>{item.label}</button>)}
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_auto_1fr] sm:items-end">
        <label className="text-sm font-medium text-foreground">Vrijednost i jedinica<input type="number" value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /><select aria-label="Početna jedinica" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{currentUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}</select></label>
        <button type="button" onClick={swap} className="inline-flex h-11 w-11 items-center justify-center justify-self-center rounded-md border border-border text-muted-foreground hover:bg-muted" aria-label="Zamijeni jedinice"><ArrowLeftRight className="h-4 w-4" /></button>
        <label className="text-sm font-medium text-foreground">Rezultat<select aria-label="Ciljna jedinica" value={to} onChange={(event) => setTo(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{currentUnits.map((unit) => <option key={unit.id} value={unit.id}>{unit.label}</option>)}</select><output aria-live="polite" className="mt-2 flex h-11 items-center rounded-md bg-muted/60 px-3 text-base font-bold text-primary">{result === null ? "Unesite vrijednost" : `${formatResult(result)} ${target.id}`}</output></label>
      </div>
    </section>
  );
}
