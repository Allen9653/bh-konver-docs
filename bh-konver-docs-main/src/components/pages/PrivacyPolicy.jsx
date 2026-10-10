import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Cookie,
  Database,
  Eye,
  Globe,
  Lock,
  Mail,
  Phone,
  RefreshCw,
  Server,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Footer } from "@/components/Footer";
import { SEO } from "@/components/SEO";

const dataCards = [
  {
    icon: Lock,
    title: "Lokalna obrada datoteka",
    text: "Većina alata za jedinice, tekst, slike i dokumente obrađuje sadržaj direktno u vašem pregledniku. U tim slučajevima datoteke ne napuštaju vaš uređaj. Pojedine cloud i freemium funkcije zahtijevaju obradu na serveru.",
  },
  {
    icon: Eye,
    title: "Tehnički i analitički podaci",
    text: "Radi održavanja i unapređenja servisa možemo obrađivati tehničke podatke kao što su IP adresa, tip preglednika, operativni sistem i posjećene stranice.",
  },
  {
    icon: UserRound,
    title: "Korisnički račun",
    text: "Za registraciju i PREMIUM funkcije koristimo e-mail adresu i podatke potrebne za autentifikaciju. Lozinke se obrađuju putem Supabase Auth servisa i ne pohranjuju se kao čitljiv tekst. Ne tražimo korisničko ime pri registraciji.",
  },
];

const SectionHeading = ({ number, title, children }) => (
  <div className="mb-5 flex items-start gap-4">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary/10 text-sm font-bold text-primary">
      {number}
    </span>
    <div>
      <h2 className="font-display text-xl font-bold text-foreground sm:text-2xl">{title}</h2>
      {children && <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{children}</p>}
    </div>
  </div>
);

const ContactLink = ({ icon: Icon, label, href, external = false }) => {
  const className = "flex min-h-12 items-center gap-3 rounded-md border border-border bg-background px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
  const content = <><Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" /><span>{label}</span></>;

  if (external) {
    return <a className={className} href={href} target="_blank" rel="noopener noreferrer">{content}</a>;
  }

  return <a className={className} href={href}>{content}</a>;
};

export default function PrivacyPolicy() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SEO
        title="Politika privatnosti — BH KONVER"
        description="Saznajte koje podatke BH KONVER obrađuje, kako funkcioniše obrada datoteka i kako možete ostvariti svoja prava."
        path="/privacy"
      />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Povratak na početnu
        </Link>

        <header className="mb-10 border-b border-border pb-8 sm:mb-12 sm:pb-10">
          <div className="mb-4 inline-flex items-center gap-2 rounded-md bg-accent/10 px-3 py-1.5 text-xs font-semibold text-foreground">
            <ShieldCheck className="h-4 w-4 text-accent" aria-hidden="true" />
            Vaša privatnost nam je važna
          </div>
          <p className="mb-3 text-xs font-semibold uppercase text-muted-foreground">Posljednja izmjena: Oktobar 2026.</p>
          <h1 className="font-display text-3xl font-bold text-foreground sm:text-4xl lg:text-5xl">Politika privatnosti</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted-foreground">
            Ova politika objašnjava koje podatke obrađujemo, kako koristimo i štitimo vaše informacije i koja prava imate dok koristite BH KONVER na adresi www.bh-konver.ba.
          </p>
        </header>

        <div className="space-y-8">
          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeading number="01" title="Podaci koje prikupljamo">
              Podaci zavise od toga koje funkcije koristite i da li obrađujete sadržaj lokalno ili putem cloud servisa.
            </SectionHeading>
            <div className="grid gap-4 md:grid-cols-3">
              {dataCards.map(({ icon: Icon, title, text }) => (
                <article key={title} className="rounded-md border border-border bg-background p-5">
                  <Icon className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-foreground">{title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                </article>
              ))}
            </div>
          </section>

          <section id="security" className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeading number="02" title="Sigurnost i zaštita podataka">
              Sigurnost korisnika i njihovih podataka važan je dio načina na koji gradimo i održavamo BH KONVER.
            </SectionHeading>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-md border border-border bg-background p-5">
                <Lock className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">SSL/TLS enkripcija podataka</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Cjelokupan promet između vašeg preglednika i poslužitelja www.bh-konver.ba zaštićen je 256-bitnom SSL/TLS enkripcijom, koja štiti podatke tokom prijenosa od presretanja i neovlaštenog čitanja.
                </p>
              </article>
              <article className="rounded-md border border-border bg-background p-5">
                <ShieldCheck className="mb-4 h-5 w-5 text-primary" aria-hidden="true" />
                <h3 className="font-semibold text-foreground">Sigurnost korisničkih računa</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Lozinke se obrađuju putem Supabase Auth servisa i pohranjuju u obliku kriptografskih hash vrijednosti, a ne kao čitljiv tekst. Pristup podacima računa štitimo primjenom sigurnosnih kontrola platforme.
                </p>
              </article>
            </div>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeading number="03" title="Korištenje i čuvanje datoteka">
              Datoteke koje se obrađuju lokalno ostaju na vašem uređaju. Kod server-side obrade privremeni rezultati se evidentiraju za automatsko čišćenje.
            </SectionHeading>
            <div className="grid gap-4 md:grid-cols-[1fr_auto] md:items-stretch">
              <div className="rounded-md border border-border bg-background p-5">
                <div className="flex items-center gap-3">
                  <Server className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-foreground">Server-side obrada</h3>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  Privremeni fajlovi nastali server konverzijom se označavaju za brisanje u dnevnom ciklusu automatskog čišćenja. Zato ne možemo obećati brisanje u roku od jednog sata. Sadržaj vaših dokumenata, audio/video zapisa i slika ne pregledamo, ne dijelimo niti prodajemo.
                </p>
              </div>
              <div className="flex items-center gap-3 rounded-md border border-primary/20 bg-primary/5 p-5 md:max-w-xs md:flex-col md:items-start">
                <RefreshCw className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-semibold text-foreground">Automatsko čišćenje</p>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">Dnevni ciklus za privremene server datoteke.</p>
                </div>
              </div>
            </div>
          </section>

          <section id="cookies" className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeading number="04" title="Politika kolačića">
              Web-stranica www.bh-konver.ba koristi kolačiće radi funkcionisanja platforme, pamćenja postavki, analize prometa i prilagodbe sadržaja.
            </SectionHeading>
            <p className="mb-4 text-sm leading-6 text-muted-foreground">
              Kolačići su male tekstualne datoteke koje se pohranjuju na vašem uređaju. Koristimo sljedeće kategorije:
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "Neophodni kolačići", text: "Potrebni su za osnovno funkcionisanje stranice, navigaciju i prijavu korisnika." },
                { title: "Funkcionalni kolačići", text: "Pamte vaše postavke, poput odabranih mjernih jedinica ili jezika, radi lakšeg korištenja pri ponovnoj posjeti." },
                { title: "Analitički kolačići", text: "Pomažu nam pratiti posjećenost i unaprijediti performanse platforme i njenih alata." },
              ].map((cookie) => (
                <article key={cookie.title} className="rounded-md border border-border bg-background p-5">
                  <Cookie className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="font-semibold text-foreground">{cookie.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{cookie.text}</p>
                </article>
              ))}
            </div>
            <p className="mt-4 text-sm leading-6 text-muted-foreground">
              Korištenjem stranice pristajete na upotrebu kolačića. Njihove postavke možete prilagoditi ili kolačiće izbrisati u postavkama svog internetskog preglednika.
            </p>
          </section>

          <section className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-7">
            <SectionHeading number="05" title="Vaša prava i kontakt">
              Možete zatražiti pristup svojim podacima, ispravku netačnih informacija ili brisanje korisničkog računa i podataka povezanih s njim.
            </SectionHeading>
            <div className="grid gap-3 sm:grid-cols-2">
              <ContactLink icon={Globe} label="www.bh-assistant.ba" href="https://www.bh-assistant.ba" external />
              <ContactLink icon={Mail} label="info@bh-assistant.ba" href="mailto:info@bh-assistant.ba" />
              <ContactLink icon={Mail} label="alen.jusufovic@proton.me" href="mailto:alen.jusufovic@proton.me" />
              <ContactLink icon={Phone} label="+387 62 580 207" href="tel:+38762580207" />
            </div>
          </section>

          <p className="flex items-start gap-3 px-1 text-xs leading-5 text-muted-foreground">
            <Database className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            Ako imate pitanja o ovoj politici ili obradi svojih podataka, kontaktirajte nas putem navedenih adresa.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}