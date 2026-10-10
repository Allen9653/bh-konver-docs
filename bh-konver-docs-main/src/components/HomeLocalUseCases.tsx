import { Building2, FileSignature, GraduationCap, Receipt, Stamp, Users } from "lucide-react";

const USE_CASES = [
  {
    icon: Stamp,
    title: "Dokumenti za šalter i ovjeru",
    text:
      "Izvod iz matične knjige rođenih, uvjerenje o prebivalištu ili punomoć skenirani telefonom najčešće stignu kao JPEG. U BH Konveru ih spojite u jedan PDF ispravnog redoslijeda, pa ih pošaljete općini, notaru ili sudu bez odlaska u fotokopirnicu.",
  },
  {
    icon: Building2,
    title: "Prijave na javne pozive i tendere",
    text:
      "Javni pozivi u FBiH, Republici Srpskoj i Brčko distriktu gotovo uvijek traže PDF do određene veličine. Kompresija PDF-a smanjuje ponudu ispod limita portala, a vodeni žig jasno označava kopiju od originala.",
  },
  {
    icon: Receipt,
    title: "Fakture i knjigovodstvo",
    text:
      "Excel tabelu s fakturom pretvorite u PDF prije slanja klijentu, a primljene PDF račune razdvojite po stavkama za knjigovođu. Sve ostaje na vašem računaru — brojevi računa i cijene ne odlaze na strani server.",
  },
  {
    icon: GraduationCap,
    title: "Fakultet i škola",
    text:
      "Seminarski rad u Wordu pretvorite u PDF prije predaje, izvučite samo tražene stranice skripte ili od fotografija predavanja napravite jedan dokument za učenje.",
  },
  {
    icon: FileSignature,
    title: "Izjave i ugovori na bosanskom",
    text:
      "Pripremljene izjave i ugovori koriste domaću pravnu terminologiju i sadrže mjesto i datum, prostor za potpis i pečat, pa su spremni za ovjeru kod nadležnog organa.",
  },
  {
    icon: Users,
    title: "Rad iz dijaspore",
    text:
      "Kada iz Njemačke, Austrije ili Turske šaljete dokumente u BiH, sučelje je dostupno na bosanskom (latinica i ćirilica), engleskom, njemačkom i turskom, pa isti fajl lako pripremite za obje strane.",
  },
];

export const HomeLocalUseCases = () => (
  <section className="border-y border-border bg-background py-14">
    <div className="container mx-auto max-w-6xl px-4">
      <h2 className="font-display text-3xl font-bold text-foreground sm:text-4xl">
        Kako se BH Konver koristi u Bosni i Hercegovini
      </h2>
      <p className="mt-4 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
        BH Konver je napravljen za svakodnevne papire u BiH: šalterske dokumente, prijave na javne pozive, fakture,
        studentske radove i izjave za ovjeru. Konverzija se odvija u vašem pretraživaču, pa dokumenti s ličnim podacima
        ostaju na vašem uređaju, a ono što ipak mora proći kroz server briše se automatski svaki dan u 10:00.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {USE_CASES.map(({ icon: Icon, title, text }) => (
          <article key={title} className="hover-lift rounded-xl border border-border bg-card p-6 shadow-sm">
            <Icon className="h-8 w-8 text-accent" aria-hidden="true" />
            <h3 className="mt-4 font-display text-lg font-semibold text-foreground">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{text}</p>
          </article>
        ))}
      </div>
    </div>
  </section>
);
