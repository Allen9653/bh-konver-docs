import { useState } from "react";
import { Thermometer } from "lucide-react";

const units = [
  { id: "c", label: "Celsius", symbol: "°C" },
  { id: "f", label: "Fahrenheit", symbol: "°F" },
  { id: "k", label: "Kelvin", symbol: "K" },
];

const toCelsius = (value, unit) => unit === "f" ? (value - 32) * 5 / 9 : unit === "k" ? value - 273.15 : value;
const fromCelsius = (value, unit) => unit === "f" ? value * 9 / 5 + 32 : unit === "k" ? value + 273.15 : value;
const formatValue = (value) => new Intl.NumberFormat("bs-BA", { maximumFractionDigits: 4 }).format(value);

export default function TemperatureConverter() {
  const [value, setValue] = useState("20");
  const [from, setFrom] = useState("c");
  const [to, setTo] = useState("f");
  const number = Number(value);
  const source = units.find((unit) => unit.id === from);
  const target = units.find((unit) => unit.id === to);
  const celsius = toCelsius(number, from);
  const valid = value.trim() !== "" && Number.isFinite(number) && celsius >= -273.15;
  const result = valid ? fromCelsius(celsius, to) : null;

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-orange-500/10 text-orange-700"><Thermometer className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Konverter temperature</h2><p className="mt-1 text-sm text-muted-foreground">Celsius, Fahrenheit i Kelvin.</p></div></header>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Temperatura<input type="number" step="any" value={value} onChange={(event) => setValue(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /><select aria-label="Početna temperaturna skala" value={from} onChange={(event) => setFrom(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label} ({unit.symbol})</option>)}</select></label>
        <label className="text-sm font-medium text-foreground">Rezultat<select aria-label="Ciljna temperaturna skala" value={to} onChange={(event) => setTo(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring">{units.map((unit) => <option key={unit.id} value={unit.id}>{unit.label} ({unit.symbol})</option>)}</select><output aria-live="polite" className="mt-2 flex h-11 items-center rounded-md bg-muted/60 px-3 text-base font-bold text-primary">{result === null ? "Unesite temperaturu iznad apsolutne nule" : `${formatValue(result)} ${target.symbol}`}</output></label>
      </div>
    </section>
  );
}
