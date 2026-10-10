import { useState } from "react";
import { useCopyToClipboard } from "@/hooks/useCopyToClipboard";
import { Check, Copy, Link2, WandSparkles } from "lucide-react";

const createSlug = (value) => value
  .toLocaleLowerCase("bs")
  .replace(/đ/g, "dj")
  .replace(/[čć]/g, "c")
  .replace(/š/g, "s")
  .replace(/ž/g, "z")
  .normalize("NFD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[^a-z0-9]+/g, "-")
  .replace(/^-+|-+$/g, "");

export default function SlugGenerator() {
  const [value, setValue] = useState("");
  const { copied, copy } = useCopyToClipboard();
  const slug = createSlug(value);

  const copySlug = () => copy(slug, { success: "Slug kopiran" });

  return (
    <section className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-7 flex items-center gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-orange-500/10 text-orange-700"><Link2 className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Slug generator</h2><p className="mt-1 text-sm text-muted-foreground">Pretvorite naslov u čist, čitljiv URL slug.</p></div></header>
      <label className="block text-sm font-medium text-foreground">Naslov ili tekst<textarea value={value} onChange={(event) => setValue(event.target.value)} rows={4} placeholder="npr. Čaršija, ćevapi i šetnja kroz Žepče" className="mt-2 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
      <div className="mt-5 rounded-md border border-border bg-muted/40 p-4">
        <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground"><WandSparkles className="h-3.5 w-3.5" aria-hidden="true" />Generisani slug</p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center"><output className="min-h-11 flex-1 break-all rounded-md bg-background px-3 py-3 font-mono text-sm text-foreground">{slug || "vas-url-slug"}</output><button type="button" disabled={!slug} onClick={copySlug} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Kopirano" : "Kopiraj slug"}</button></div>
      </div>
      <p className="mt-4 text-xs leading-5 text-muted-foreground">Dijakritički znakovi se preslikavaju u latinicu, a razmaci i specijalni znakovi zamjenjuju se crticama.</p>
    </section>
  );
}
