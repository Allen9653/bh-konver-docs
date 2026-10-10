import { useState } from "react";
import { Fuel, RotateCcw } from "lucide-react";

const formatBam = (value) => new Intl.NumberFormat("bs-BA", { style: "currency", currency: "BAM" }).format(value);

export default function GorivoKalkulator() {
  const [distance, setDistance] = useState("150");
  const [consumption, setConsumption] = useState("6.5");
  const [fuelPrice, setFuelPrice] = useState("2.55");
  const [returnTrip, setReturnTrip] = useState(true);
  const distanceNumber = Number(distance);
  const consumptionNumber = Number(consumption);
  const fuelPriceNumber = Number(fuelPrice);
  const totalKm = returnTrip ? distanceNumber * 2 : distanceNumber;
  const valid = distanceNumber > 0 && consumptionNumber >= 0 && fuelPriceNumber >= 0;
  const liters = valid ? (totalKm * consumptionNumber) / 100 : 0;
  const cost = liters * fuelPriceNumber;

  const reset = () => {
    setDistance("150");
    setConsumption("6.5");
    setFuelPrice("2.55");
    setReturnTrip(true);
  };

  return (
    <section className="mx-auto w-full max-w-2xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <div className="mb-7 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-700"><Fuel className="h-5 w-5" /></span>
          <div><h1 className="font-display text-2xl font-bold text-foreground">Kalkulator goriva</h1><p className="mt-1 text-sm text-muted-foreground">Procijenite potrošnju i trošak putovanja.</p></div>
        </div>
        <button type="button" onClick={reset} title="Vrati početne vrijednosti" aria-label="Vrati početne vrijednosti" className="rounded-md p-2 text-muted-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" /></button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Udaljenost u jednom smjeru <span className="text-muted-foreground">(km)</span><input type="number" min="1" step="1" value={distance} onChange={(event) => setDistance(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Prosječna potrošnja <span className="text-muted-foreground">(L/100 km)</span><input type="number" min="0" step="0.1" value={consumption} onChange={(event) => setConsumption(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground sm:col-span-2">Cijena goriva po litru <span className="text-muted-foreground">(KM)</span><input type="number" min="0" step="0.01" value={fuelPrice} onChange={(event) => setFuelPrice(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-base outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="flex cursor-pointer items-center gap-3 rounded-md border border-border p-3 text-sm font-medium text-foreground sm:col-span-2">
          <input type="checkbox" checked={returnTrip} onChange={(event) => setReturnTrip(event.target.checked)} className="h-4 w-4 accent-primary" />
          Računaj povratno putovanje (oba smjera)
        </label>
      </div>
      <div aria-live="polite" className="mt-6 space-y-3 rounded-md bg-primary/5 p-4">
        <div className="flex items-center justify-between gap-4 text-sm text-foreground"><span>Ukupna kilometraža</span><strong>{valid ? `${totalKm} km` : "—"}</strong></div>
        <div className="flex items-center justify-between gap-4 text-sm text-foreground"><span>Potrošeno goriva</span><strong>{valid ? `${liters.toFixed(2)} L` : "—"}</strong></div>
        <div className="flex items-center justify-between gap-4 border-t border-primary/15 pt-3 text-base font-bold text-foreground"><span>Ukupan trošak goriva</span><span className="text-lg text-primary">{valid ? formatBam(cost) : "Unesite ispravne vrijednosti"}</span></div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Procjena ne uključuje promjene cijene goriva, uslove vožnje ni dodatne troškove puta.</p>
    </section>
  );
}
