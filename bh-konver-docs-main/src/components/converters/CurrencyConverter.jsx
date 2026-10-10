import { CurrencyConverter as ExistingCurrencyConverter } from "@/components/CurrencyConverter";

export default function CurrencyConverter() {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <ExistingCurrencyConverter />
      <p className="mx-auto mt-3 max-w-md text-center text-xs leading-5 text-muted-foreground">
        Dostupne valute uključuju BAM (KM), EUR, USD, CHF i GBP. Kursevi se osvježavaju preko javnog kursnog API-ja.
      </p>
    </section>
  );
}
