import { useState } from "react";
import { Lightbulb } from "lucide-react";

const formatBam = (value) => new Intl.NumberFormat("bs-BA", { style: "currency", currency: "BAM" }).format(value);

export default function StrujaKalkulator() {
  const [power, setPower] = useState("1000");
  const [hoursPerDay, setHoursPerDay] = useState("5");
  const [pricePerKwh, setPricePerKwh] = useState("0.20");
  const powerNumber = Number(power);
  const hoursNumber = Number(hoursPerDay);
  const priceNumber = Number(pricePerKwh);
  const valid = powerNumber >= 0 && hoursNumber >= 0 && hoursNumber <= 24 && priceNumber >= 0;
  const dailyKwh = valid ? (powerNumber / 1000) * hoursNumber : 0;
  const monthlyKwh = dailyKwh * 30;
  const monthlyCost = monthlyKwh * priceNumber;

  return (
    <section className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-yellow-500/15 text-yellow-700"><Lightbulb className="h-5 w-5" /></span><div><h1 className="font-display text-2xl font-bold text-foreground">Kalkulator potrošnje struje</h1><p className="mt-1 text-sm text-muted-foreground">Procijenite potrošnju jednog aparata i mjesečni trošak.</p></div></div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Snaga aparata <span className="text-muted-foreground">(W)</span><input type="number" min="0" step="1" value={power} onChange={(event) => setPower(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Prosječno sati rada dnevno<input type="number" min="0" max="24" step="0.1" value={hoursPerDay} onChange={(event) => setHoursPerDay(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground sm:col-span-2">Cijena 1 kWh <span className="text-muted-foreground">(KM)</span><input type="number" min="0" step="0.01" value={pricePerKwh} onChange={(event) => setPricePerKwh(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
      </div>
      <div aria-live="polite" className="mt-6 space-y-3 rounded-md bg-amber-500/10 p-4">
        <div className="flex items-center justify-between gap-4 text-sm text-foreground"><span>Potrošnja dnevno</span><strong>{valid ? `${dailyKwh.toFixed(2)} kWh` : "Unesite ispravne vrijednosti"}</strong></div>
        <div className="flex items-center justify-between gap-4 text-sm text-foreground"><span>Potrošnja mjesečno (30 dana)</span><strong>{valid ? `${monthlyKwh.toFixed(2)} kWh` : "—"}</strong></div>
        <div className="flex items-center justify-between gap-4 border-t border-amber-500/20 pt-3 text-base font-bold text-foreground"><span>Mjesečni trošak</span><span className="text-lg text-amber-700">{valid ? formatBam(monthlyCost) : "—"}</span></div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Procjena koristi mjesec od 30 dana. Stvarni račun može uključivati tarife, poreze i naknade koje nisu obuhvaćene ovim izračunom.</p>
    </section>
  );
}
