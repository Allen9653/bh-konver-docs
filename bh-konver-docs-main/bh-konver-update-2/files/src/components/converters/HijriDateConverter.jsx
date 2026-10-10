import { useMemo, useState } from "react";
import { CalendarDays, ArrowLeftRight } from "lucide-react";

const hijriFormatter = new Intl.DateTimeFormat("en-u-ca-islamic-umalqura-nu-latn", {
  calendar: "islamic-umalqura",
  numberingSystem: "latn",
  timeZone: "UTC",
  year: "numeric",
  month: "numeric",
  day: "numeric",
});

const currentIsoDate = () => new Date().toISOString().slice(0, 10);

const getHijriParts = (date) => {
  const parts = Object.fromEntries(hijriFormatter.formatToParts(date).map(({ type, value }) => [type, value]));
  return { year: Number(parts.year), month: Number(parts.month), day: Number(parts.day) };
};

const safeHijriParts = (date) => {
  try {
    if (Number.isNaN(date.getTime())) return null;
    const parts = getHijriParts(date);
    return Number.isFinite(parts.year) && Number.isFinite(parts.month) && Number.isFinite(parts.day) ? parts : null;
  } catch {
    return null;
  }
};

const findGregorianDate = (year, month, day) => {
  if (!Number.isInteger(year) || year < 1 || !Number.isInteger(month) || month < 1 || month > 12 || !Number.isInteger(day) || day < 1 || day > 30) return null;
  const approximateGregorianYear = Math.floor(year * 0.970224 + 621.5774);
  const start = Date.UTC(approximateGregorianYear - 1, 0, 1);
  const end = Date.UTC(approximateGregorianYear + 2, 0, 1);
  for (let timestamp = start; timestamp < end; timestamp += 86400000) {
    const date = new Date(timestamp);
    const parts = getHijriParts(date);
    if (parts.year === year && parts.month === month && parts.day === day) return date.toISOString().slice(0, 10);
  }
  return null;
};

export default function HijriDateConverter() {
  const [mode, setMode] = useState("to-hijri");
  const [gregorianDate, setGregorianDate] = useState(currentIsoDate);
  const [hijriYear, setHijriYear] = useState(() => String(getHijriParts(new Date()).year));
  const [hijriMonth, setHijriMonth] = useState(() => String(getHijriParts(new Date()).month));
  const [hijriDay, setHijriDay] = useState(() => String(getHijriParts(new Date()).day));

  const hijriResult = useMemo(() => (gregorianDate ? safeHijriParts(new Date(`${gregorianDate}T00:00:00Z`)) : null), [gregorianDate]);
  const gregorianResult = useMemo(() => (mode === "to-gregorian" ? findGregorianDate(Number(hijriYear), Number(hijriMonth), Number(hijriDay)) : null), [mode, hijriYear, hijriMonth, hijriDay]);

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-violet-500/10 text-violet-700"><CalendarDays className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Hidžretski datum</h2><p className="mt-1 text-sm text-muted-foreground">Pretvaranje između gregorijanskog i Umm al-Qura kalendara.</p></div></header>
      <div className="mb-5 grid grid-cols-2 gap-2 rounded-md bg-muted p-1" role="group" aria-label="Smjer konverzije">
        <button type="button" aria-pressed={mode === "to-hijri"} onClick={() => setMode("to-hijri")} className={`min-h-10 rounded px-3 text-sm font-semibold ${mode === "to-hijri" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Gregorijanski → hidžretski</button>
        <button type="button" aria-pressed={mode === "to-gregorian"} onClick={() => setMode("to-gregorian")} className={`min-h-10 rounded px-3 text-sm font-semibold ${mode === "to-gregorian" ? "bg-background text-primary shadow-sm" : "text-muted-foreground"}`}>Hidžretski → gregorijanski</button>
      </div>
      {mode === "to-hijri" ? <label className="block text-sm font-medium text-foreground">Gregorijanski datum<input type="date" value={gregorianDate} onChange={(event) => setGregorianDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label> : <div className="grid grid-cols-3 gap-3">
        <label className="text-sm font-medium text-foreground">Dan<input type="number" min="1" max="30" value={hijriDay} onChange={(event) => setHijriDay(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Mjesec<input type="number" min="1" max="12" value={hijriMonth} onChange={(event) => setHijriMonth(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Godina<input type="number" min="1" value={hijriYear} onChange={(event) => setHijriYear(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
      </div>}
      <div aria-live="polite" className="mt-5 flex items-start gap-3 rounded-md bg-muted/60 p-4"><ArrowLeftRight className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><div><p className="text-xs font-semibold uppercase text-muted-foreground">Rezultat</p><p className="mt-1 text-lg font-bold text-primary">{mode === "to-hijri" ? hijriResult ? `${hijriResult.day}.${hijriResult.month}.${hijriResult.year}.` : "Unesite ispravan datum" : gregorianResult ?? "Uneseni datum nije validan u Umm al-Qura kalendaru."}</p>{mode === "to-gregorian" && gregorianResult && <p className="mt-1 text-sm text-muted-foreground">{new Intl.DateTimeFormat("bs-BA", { dateStyle: "long", timeZone: "UTC" }).format(new Date(`${gregorianResult}T00:00:00Z`))}</p>}</div></div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Datumi hidžretskog kalendara mogu se razlikovati za jedan dan zavisno od lokalnog viđenja mlađaka i korištene metode.</p>
    </section>
  );
}
