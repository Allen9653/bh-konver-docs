import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { ArrowLeftRight, Check, Copy, Languages } from "lucide-react";
import { cyrillicToLatin, latinToCyrillic } from "@/utils/scriptText";

export default function CyrillicLatinConverter() {
  const [direction, setDirection] = useState("latin-to-cyrillic");
  const [input, setInput] = useState("");
  const { copied, copy, reset } = useCopyToClipboard();
  const output = direction === "latin-to-cyrillic" ? latinToCyrillic(input) : cyrillicToLatin(input);
  const sourceLabel = direction === "latin-to-cyrillic" ? "Latinica" : "Ćirilica";
  const targetLabel = direction === "latin-to-cyrillic" ? "Ćirilica" : "Latinica";

  const copyOutput = () => copy(output);

  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-sky-500/10 text-sky-700"><Languages className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Ćirilica / latinica</h2><p className="mt-1 text-sm text-muted-foreground">Preslovite tekst uz podršku za BH i srpska slova.</p></div></header>
      <div className="mb-5 flex flex-wrap items-center justify-center gap-3 rounded-md bg-muted/60 p-3">
        <span className="text-sm font-semibold text-foreground">{sourceLabel}</span>
        <button type="button" onClick={() => { setDirection((current) => current === "latin-to-cyrillic" ? "cyrillic-to-latin" : "latin-to-cyrillic"); reset(); }} aria-label="Zamijeni smjer konverzije" className="flex h-9 w-9 items-center justify-center rounded-md border border-border bg-background text-primary hover:bg-muted"><ArrowLeftRight className="h-4 w-4" /></button>
        <span className="text-sm font-semibold text-foreground">{targetLabel}</span>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Unos ({sourceLabel})<textarea value={input} onChange={(event) => { setInput(event.target.value); reset(); }} rows={8} placeholder={direction === "latin-to-cyrillic" ? "Unesite tekst na latinici..." : "Unesite tekst na ćirilici..."} className="mt-2 min-h-48 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 font-mono text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Rezultat ({targetLabel})<textarea readOnly value={output} rows={8} placeholder="Rezultat konverzije..." className="mt-2 min-h-48 w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2.5 font-mono text-sm outline-none" /></label>
      </div>
      <div className="mt-4 flex justify-end"><button type="button" disabled={!output} onClick={copyOutput} className="inline-flex min-h-11 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Kopirano" : "Kopiraj rezultat"}</button></div>
      <p className="mt-3 text-xs leading-5 text-muted-foreground">Podržani su digrafi lj/lj, nj/nj i dž/dž te slova č, ć, đ, š i ž.</p>
    </section>
  );
}
