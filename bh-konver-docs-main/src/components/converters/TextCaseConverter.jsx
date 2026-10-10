import { useState } from "react";
import { Check, Copy, Type } from "lucide-react";

const capitalizeSentences = (value) => value.toLocaleLowerCase("bs").replace(/(^|[.!?]\s+)([\p{L}])/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("bs")}`);
const titleCase = (value) => value.toLocaleLowerCase("bs").replace(/(^|[\s-])([\p{L}])/gu, (match, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("bs")}`);

const transforms = [
  { id: "upper", label: "VELIKA SLOVA", apply: (value) => value.toLocaleUpperCase("bs") },
  { id: "lower", label: "mala slova", apply: (value) => value.toLocaleLowerCase("bs") },
  { id: "capitalize", label: "Capitalize", apply: capitalizeSentences },
  { id: "title", label: "Title Case", apply: titleCase },
];

export default function TextCaseConverter() {
  const [input, setInput] = useState("");
  const [caseId, setCaseId] = useState("upper");
  const [copied, setCopied] = useState(false);
  const output = transforms.find((transform) => transform.id === caseId).apply(input);

  const copyOutput = async () => {
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-4xl rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
      <header className="mb-6 flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-md bg-amber-500/10 text-amber-700"><Type className="h-5 w-5" aria-hidden="true" /></span><div><h2 className="font-display text-2xl font-bold text-foreground">Promjena velikih i malih slova</h2><p className="mt-1 text-sm text-muted-foreground">Primijenite oblikovanje teksta uz očuvanje dijakritičkih znakova.</p></div></header>
      <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Stil slova">
        {transforms.map((transform) => <button key={transform.id} type="button" aria-pressed={caseId === transform.id} onClick={() => { setCaseId(transform.id); setCopied(false); }} className={`min-h-10 rounded-md border px-3 text-sm font-semibold transition-colors ${caseId === transform.id ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background text-muted-foreground hover:bg-muted"}`}>{transform.label}</button>)}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <label className="text-sm font-medium text-foreground">Ulazni tekst<textarea value={input} onChange={(event) => { setInput(event.target.value); setCopied(false); }} rows={7} placeholder="Unesite tekst za oblikovanje..." className="mt-2 min-h-44 w-full resize-y rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring" /></label>
        <label className="text-sm font-medium text-foreground">Rezultat<textarea readOnly value={output} rows={7} placeholder="Oblikovani tekst..." className="mt-2 min-h-44 w-full resize-y rounded-md border border-border bg-muted/40 px-3 py-2.5 text-sm outline-none" /></label>
      </div>
      <div className="mt-4 flex justify-end"><button type="button" disabled={!output} onClick={copyOutput} className="inline-flex min-h-10 items-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:opacity-50">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Kopirano" : "Kopiraj rezultat"}</button></div>
    </section>
  );
}
