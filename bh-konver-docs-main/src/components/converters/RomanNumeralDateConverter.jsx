import { useState } from "react";
import { CalendarRange, ArrowLeftRight } from "lucide-react";

const ROMAN_PAIRS = [[1000, "M"], [900, "CM"], [500, "D"], [400, "CD"], [100, "C"], [90, "XC"], [50, "L"], [40, "XL"], [10, "X"], [9, "IX"], [5, "V"], [4, "IV"], [1, "I"]];

const toRoman = (value) => {
  if (!Number.isInteger(value) || value < 1 || value > 3999) return null;
  let remaining = value;
  let output = "";
  for (const [number, symbol] of ROMAN_PAIRS) {
    while (remaining >= number) {
      output += symbol;
      remaining -= number;
    }
  }
  return output;
};

const fromRoman = (value) => {
  const normalized = value.trim().toUpperCase();
  if (!normalized || !/^[IVXLCDM]+$/.test(normalized)) return null;
  let total = 0;
  let previous = 0;
  const values = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };
  for (let index = normalized.length - 1; index >= 0; index -= 1) {
    const current = values[normalized[index]];
    total += current < previous ? -current : current;
    previous = current;
  }
  return total <= 3999 && toRoman(total) === normalized ? total : null;
};

const getRomanDate = (date) => {
  if (!date) return "";
  const [year, month, day] = date.split("-").map(Number);
  return `${toRoman(day)} / ${toRoman(month)} / ${toRoman(year)}`;
};

const parseRomanDate = (value) => {
  const parts = value.trim().split(/[\s./-]+/).filter(Boolean);
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(fromRoman);
  if (!day || !month || !year || year < 1 || month > 12) return null;
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return `${String(day).padStart(2, "0")}.${String(month).padStart(2, "0")}.${year}.`;
};

const modes = [
  { id: "date-to-roman", label: "Datum → rimski" },
  { id: "roman-to-date", label: "Rimski → datum" },
  { id: "number-to-roman", label: "Broj → rimski" },
  { id: "roman-to-number", label: "Rimski → broj" },
];

export default function RomanNumeralDateConverter() {
  const [mode, setMode] = useState(modes[0].id);
  const [date, setDate] = useState("");
  const [number, setNumber] = useState("");
  const [romanInput, setRomanInput] = useState("");
  let result = "";
  let invalid = false;

  if (mode === "date-to-roman") result = getRomanDate(date);
  if (mode === "roman-to-date" && romanInput.trim()) {
    result = parseRomanDate(romanInput) ?? "";
    invalid = !result;
  }
  if (mode === "number-to-roman" && number !== "") {
    result = toRoman(Number(number)) ?? "";
    invalid = !result;
  }
  if (mode === "roman-to-number" && romanInput.trim()) {
    const parsed = fromRoman(romanInput);
    result = parsed === null ? "" : String(parsed);
    invalid = parsed === null;
  }

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-rose-500/10 text-rose-700"><CalendarRange className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Rimski brojevi i datumi</h2><p className="mt-1 text-sm text-muted-foreground">Pretvaranje brojeva i datuma u rimske brojeve i obrnuto.</p></div></header>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Način konverzije">
        {modes.map((item) => <button key={item.id} type="button" aria-pressed={mode === item.id} onClick={() => setMode(item.id)} className={`min-h-10 rounded-md border px-2 text-xs font-semibold transition-colors sm:text-sm ${mode === item.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>{item.label}</button>)}
      </div>
      {mode === "date-to-roman" ? <label className="block text-sm font-medium text-foreground">Gregorijanski datum<input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label> : mode === "number-to-roman" ? <label className="block text-sm font-medium text-foreground">Broj <span className="text-muted-foreground">(1–3999)</span><input type="number" min="1" max="3999" step="1" value={number} onChange={(event) => setNumber(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label> : <label className="block text-sm font-medium text-foreground">{mode === "roman-to-date" ? "Rimski datum (dan / mjesec / godina)" : "Rimski broj"}<input value={romanInput} onChange={(event) => setRomanInput(event.target.value)} placeholder={mode === "roman-to-date" ? "XIV / III / MMXXVI" : "npr. MMXXVI"} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm uppercase outline-none focus:ring-2 focus:ring-ring" /></label>}
      <div aria-live="polite" className="mt-5 flex items-start gap-3 rounded-md bg-muted/60 p-4"><ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div className="min-w-0"><p className="text-xs font-semibold uppercase text-muted-foreground">Rezultat</p><output className="mt-1 block break-all font-mono text-lg font-bold text-primary">{result || (invalid ? "Neispravan broj ili datum" : "Rezultat će se prikazati ovdje")}</output></div></div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Standardni rimski zapis podržava vrijednosti od I do MMMCMXCIX (1–3999).</p>
    </section>
  );
}
