import { useState } from "react";
import { CalendarDays } from "lucide-react";

const today = new Date();
const toDateInput = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

const calculateDuration = (startValue, endValue) => {
  if (!startValue || !endValue) return null;
  const [startYear, startMonth, startDay] = startValue.split("-").map(Number);
  const [endYear, endMonth, endDay] = endValue.split("-").map(Number);
  const start = new Date(Date.UTC(startYear, startMonth - 1, startDay));
  const end = new Date(Date.UTC(endYear, endMonth - 1, endDay));
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime()) || end < start) return null;

  let years = endYear - startYear;
  let months = endMonth - startMonth;
  let days = endDay - startDay;
  if (days < 0) {
    months -= 1;
    days += new Date(Date.UTC(endYear, endMonth - 1, 0)).getUTCDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
};

export default function StazKalkulator() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(toDateInput(today));
  const duration = calculateDuration(startDate, endDate);

  return (
    <section className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-500/10 text-sky-700"><CalendarDays className="h-5 w-5" /></span><div><h1 className="font-display text-2xl font-bold text-foreground">Kalkulator radnog staža</h1><p className="mt-1 text-sm text-muted-foreground">Izračunajte kalendarsko trajanje između dva datuma.</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Datum početka rada<input type="date" value={startDate} max={endDate || undefined} onChange={(event) => setStartDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Datum završetka (ili danas)<input type="date" value={endDate} min={startDate || undefined} max={toDateInput(today)} onChange={(event) => setEndDate(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
      </div>
      <div aria-live="polite" className="mt-6 rounded-md bg-muted/60 p-5 text-center">
        <p className="text-xs font-semibold uppercase text-primary">Ostvareni staž</p>
        <p className="mt-2 font-display text-xl font-bold text-foreground">
          {startDate && duration ? `${duration.years} godina, ${duration.months} mjeseci, ${duration.days} dana` : startDate ? "Datum završetka mora biti nakon početka" : "Unesite datum početka"}
        </p>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Rezultat je kalendarski proračun i ne uzima u obzir prekide rada, posebne propise niti službeno priznati staž.</p>
    </section>
  );
}
