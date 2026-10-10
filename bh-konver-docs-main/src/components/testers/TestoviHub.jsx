import { Link } from "react-router-dom";
import { ArrowRight, Brain, CarFront, Landmark, Sparkles } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SEO } from "@/components/SEO";

const tests = [
  { title: "Opšte znanje o BiH", description: "Kratki kviz o geografiji, historiji i kulturi Bosne i Hercegovine.", icon: Landmark, to: "/testovi/opste-znanje", available: true },
  { title: "Saobraćajni test", description: "Pitanja za ponavljanje osnovnih saobraćajnih pravila.", icon: CarFront, to: "/testovi/saobracajni", available: true },
  { title: "IQ i logički test", description: "Zadaci za logičko zaključivanje i prepoznavanje obrazaca.", icon: Brain, to: "/testovi/logika", available: true },
  { title: "Test ličnosti", description: "Istražite svoje navike i lične preferencije.", icon: Sparkles, to: "/testovi/licnost", available: true },
];

export default function TestoviHub() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO title="Online kvizovi i testovi znanja | BH KONVER" description="Pregledajte interaktivne Premium testove opšteg znanja o BiH, saobraćajna pitanja, IQ i logičke zadatke te test ličnosti." path="/testovi" jsonLd={{ "@type": "CollectionPage", name: "Testovi i kvizovi BH KONVER", description: "Interaktivni kvizovi i testovi znanja." }} />
      <Navbar activeCategory="TESTOVI" />
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <header className="mb-8 border-b border-border pb-7">
          <p className="text-xs font-semibold uppercase text-primary">BH KONVER · TESTOVI</p>
          <h1 className="mt-3 font-display text-3xl font-bold text-foreground sm:text-4xl">Testovi i kvizovi</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">Odaberite test i provjerite svoje znanje kroz kratka interaktivna pitanja.</p>
        </header>
        <section aria-label="Dostupni testovi" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {tests.map(({ title, description, icon: Icon, to, available }) => {
            const content = (
              <>
                <div className="flex items-start justify-between gap-3">
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary"><Icon className="h-5 w-5" /></span>
                  {available ? <ArrowRight className="h-4 w-4 text-primary transition-transform group-hover:translate-x-1" /> : <span className="rounded-sm bg-muted px-2 py-1 text-[10px] font-semibold uppercase text-muted-foreground">U pripremi</span>}
                </div>
                <h2 className="mt-5 font-semibold text-foreground">{title}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{description}</p>
              </>
            );
            const className = `group rounded-lg border border-border bg-card p-5 transition-colors ${available ? "hover:border-primary/40 hover:bg-primary/[0.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" : "opacity-75"}`;
            return available ? <Link key={title} to={to} className={className}>{content}</Link> : <article key={title} aria-disabled="true" className={className}>{content}</article>;
          })}
        </section>
      </main>
      <Footer activeCategory="TESTOVI" />
    </div>
  );
}
