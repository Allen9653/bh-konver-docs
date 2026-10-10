import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, RotateCcw, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";
import { ToolInfoGuide } from "@/components/ToolInfoGuide";

const questions = [
  { prompt: "Kada započinjete novi projekat, prvo želite…", options: [{ text: "Napraviti jasan plan i raspored", type: "planner" }, { text: "Istražiti mogućnosti i krenuti eksperimentisati", type: "explorer" }, { text: "Razgovarati s ljudima koji će učestvovati", type: "collaborator" }] },
  { prompt: "U slobodnom danu najviše uživate u…", options: [{ text: "Mirnoj aktivnosti koju sam unaprijed isplanirao/la", type: "planner" }, { text: "Spontanom izletu ili isprobavanju nečeg novog", type: "explorer" }, { text: "Vremenu provedenom s prijateljima ili porodicom", type: "collaborator" }] },
  { prompt: "Kada naiđete na problem, obično…", options: [{ text: "Razložim ga na manje korake", type: "planner" }, { text: "Isprobam nekoliko različitih pristupa", type: "explorer" }, { text: "Potražim mišljenje i podršku drugih", type: "collaborator" }] },
  { prompt: "U timu vam najčešće odgovara uloga…", options: [{ text: "Organizujem zadatke i rokove", type: "planner" }, { text: "Predlažem nove ideje i pravce", type: "explorer" }, { text: "Povezujem članove i pomažem dogovoru", type: "collaborator" }] },
  { prompt: "Najviše vas motiviše…", options: [{ text: "Jasan napredak i ostvareni ciljevi", type: "planner" }, { text: "Otkrivanje novih stvari", type: "explorer" }, { text: "Osjećaj zajedništva i međusobne podrške", type: "collaborator" }] },
  { prompt: "Kada se plan iznenada promijeni…", options: [{ text: "Želim brzo napraviti novi plan", type: "planner" }, { text: "Prilagodim se i vidim kuda vodi promjena", type: "explorer" }, { text: "Provjerim kako promjena utiče na ostale", type: "collaborator" }] },
];

const profiles = {
  planner: { title: "Organizator", text: "Cijenite strukturu, jasnoću i postepen napredak. Planiranje vam pomaže da ideje pretvorite u konkretne korake." },
  explorer: { title: "Istraživač", text: "Privlače vas novine, mogućnosti i kreativni pristupi. Fleksibilnost vam pomaže da učite kroz iskustvo." },
  collaborator: { title: "Povezivač", text: "Važni su vam odnosi, saradnja i zajedničko razumijevanje. Često doprinosite tako što ljude okupljate oko cilja." },
};

export default function TestLicnosti() {
  const [answers, setAnswers] = useState(Array(questions.length).fill(null));
  const [submitted, setSubmitted] = useState(false);
  const complete = answers.every((answer) => answer !== null);
  const scores = answers.reduce((total, type) => { if (type) total[type] += 1; return total; }, { planner: 0, explorer: 0, collaborator: 0 });
  const highest = Math.max(...Object.values(scores));
  const topTypes = Object.entries(scores).filter(([, score]) => score === highest).map(([type]) => type);
  const profile = topTypes.length === 1 ? profiles[topTypes[0]] : null;

  const reset = () => { setAnswers(Array(questions.length).fill(null)); setSubmitted(false); };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Informativni test ličnosti | BH KONVER" description="Kratka samoprocjena ličnih preferencija s prikazom informativnog profila. Rezultat nije psihološka dijagnoza." path="/testovi/licnost" />
      <Navbar activeCategory="TESTOVI" />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        <Link to="/testovi" className="inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><ArrowLeft className="h-4 w-4" />Svi testovi</Link>
        <header className="mb-7 mt-5 border-b border-border pb-6"><p className="text-xs font-semibold uppercase text-primary">BH KONVER · SAMOPROCJENA</p><h1 className="mt-2 font-display text-3xl font-bold text-foreground sm:text-4xl">Test ličnosti</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Odgovorite prema svojim uobičajenim preferencijama. Rezultat je informativan i nije psihološka procjena.</p></header>
        <form onSubmit={(event) => { event.preventDefault(); if (complete) setSubmitted(true); }} className="space-y-4">
          {questions.map((question, index) => <fieldset key={question.prompt} disabled={submitted} className="rounded-lg border border-border bg-card p-5"><legend className="w-full font-semibold leading-6 text-foreground"><span className="mr-2 text-primary">{String(index + 1).padStart(2, "0")}</span>{question.prompt}</legend><div className="mt-4 grid gap-2">{question.options.map((option) => <label key={option.type} className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-md border px-3 py-2.5 text-sm ${answers[index] === option.type ? "border-primary bg-primary/5 text-foreground" : "border-border text-foreground/80 hover:bg-muted"}`}><input type="radio" name={`personality-${index}`} checked={answers[index] === option.type} onChange={() => setAnswers((current) => current.map((answer, answerIndex) => answerIndex === index ? option.type : answer))} className="accent-primary" /><span>{option.text}</span></label>)}</div></fieldset>)}
          <div className="flex flex-col gap-4 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
            {submitted ? <div aria-live="polite" className="rounded-md bg-primary/5 p-4"><p className="flex items-center gap-2 font-semibold text-primary"><Sparkles className="h-4 w-4" />{profile?.title ?? "Uravnotežen profil"}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{profile?.text ?? "Vaši odgovori pokazuju uravnoteženu kombinaciju različitih pristupa. Prilagođavate se situaciji i koristite više svojih snaga."}</p></div> : <p className="text-sm text-muted-foreground">Odgovoreno: {answers.filter(Boolean).length} / {questions.length}</p>}
            {submitted ? <button type="button" onClick={reset} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-semibold text-foreground hover:bg-muted"><RotateCcw className="h-4 w-4" />Pokušaj ponovo</button> : <button type="submit" disabled={!complete} className="min-h-11 shrink-0 rounded-md bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">Prikaži rezultat</button>}
          </div>
        </form>
        <ToolInfoGuide toolId="test-licnost" />
      </main>
      <Footer activeCategory="TESTOVI" />
    </div>
  );
}
