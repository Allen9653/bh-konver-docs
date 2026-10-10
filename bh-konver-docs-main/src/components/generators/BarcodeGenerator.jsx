import { useEffect, useRef, useState } from "react";
import { Barcode, Copy, Download } from "lucide-react";
import JsBarcode from "jsbarcode";

export default function BarcodeGenerator() {
  const [value, setValue] = useState("");
  const [format, setFormat] = useState("CODE128");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const svgRef = useRef(null);

  useEffect(() => {
    if (!value.trim() || !svgRef.current) {
      setError("");
      return;
    }
    try {
      JsBarcode(svgRef.current, value.trim(), {
        format,
        lineColor: "#172033",
        background: "#ffffff",
        width: 2,
        height: 92,
        displayValue: true,
        font: "monospace",
        fontSize: 15,
        margin: 12,
      });
      setError("");
    } catch {
      setError(format === "EAN13" ? "EAN-13 zahtijeva 12 ili 13 cifara." : format === "EAN8" ? "EAN-8 zahtijeva 7 ili 8 cifara." : "Unesena vrijednost nije podržana za odabrani format.");
    }
  }, [value, format]);

  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value.trim());
      setNotice("Vrijednost barkoda je kopirana.");
    } catch {
      setNotice("Clipboard nije dostupan u ovom pregledniku.");
    }
  };

  const downloadSvg = () => {
    if (!svgRef.current || error || !value.trim()) return;
    const serialized = new XMLSerializer().serializeToString(svgRef.current);
    const blob = new Blob([serialized], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `bh-konver-barcode-${format.toLowerCase()}.svg`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-rose-500/10 text-rose-700"><Barcode className="h-5 w-5" aria-hidden="true" /></span><div><h1 className="font-display text-2xl font-bold text-foreground">Barcode generator</h1><p className="mt-1 text-sm text-muted-foreground">Generišite i preuzmite linijski barkod.</p></div></header>
      <div className="grid gap-4 sm:grid-cols-[1fr_0.65fr]">
        <label className="text-sm font-medium text-foreground">Tekst ili broj<input value={value} onChange={(event) => { setValue(event.target.value); setNotice(""); }} placeholder="Unesite vrijednost..." className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Format<select value={format} onChange={(event) => setFormat(event.target.value)} className="mt-2 h-11 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-ring"><option value="CODE128">CODE128</option><option value="EAN13">EAN-13</option><option value="EAN8">EAN-8</option></select></label>
      </div>
      <div className="mt-5 flex min-h-40 items-center justify-center overflow-x-auto rounded-md border border-dashed border-border bg-white p-4">
        {value.trim() ? <svg ref={svgRef} role="img" aria-label={`Barkod ${format}`} className={error ? "hidden" : "max-w-full"} /> : <p className="text-sm text-muted-foreground">Barkod će se prikazati ovdje.</p>}
        {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      </div>
      <div className="mt-4 flex flex-wrap gap-2"><button type="button" disabled={!value.trim() || Boolean(error)} onClick={copyValue} className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50"><Copy className="h-4 w-4" aria-hidden="true" />Kopiraj vrijednost</button><button type="button" disabled={!value.trim() || Boolean(error)} onClick={downloadSvg} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"><Download className="h-4 w-4" aria-hidden="true" />Preuzmi SVG</button></div>
      <p aria-live="polite" className="mt-3 min-h-5 text-sm text-muted-foreground">{notice}</p>
      <p className="text-xs leading-5 text-muted-foreground">EAN kodovi prihvataju znamenke i automatski računaju kontrolnu cifru kada je izostavljena.</p>
    </section>
  );
}
