import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Nazad
        </Button>

        <div className="prose prose-slate dark:prose-invert max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">USLOVI KORIŠTENJA</h1>
          
          <p className="text-muted-foreground mb-6">
            Dobrodošli na BH KONVER, digitalnu uslugu B&H Assistant d.o.o. Korištenjem ove platforme 
            prihvatate sljedeće uslove korištenja. Molimo vas da ih pažljivo pročitate jer definišu vaša 
            prava i obaveze.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Prihvatljivost korištenja</h2>
            <p className="text-muted-foreground">
              BH KONVER je namijenjen privatnim i poslovnim korisnicima u Bosni i Hercegovini i šire. 
              Korištenjem aplikacije potvrđujete da ste stariji od 18 godina ili da koristite uslugu uz 
              saglasnost roditelja/staratelja.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Vlasništvo i licenca</h2>
            <p className="text-muted-foreground">
              Sve aplikacije, softver i sadržaji dostupni putem BH KONVER-a ostaju vlasništvo B&H Assistant d.o.o. 
              Korisnicima se daje ograničena, neprenosiva licenca za korištenje aplikacije u skladu s ovim uslovima.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Komercijalni uslovi</h2>
            <p className="text-muted-foreground mb-4">
              Aplikacije se naplaćuju po važećem cjenovniku.
            </p>
            <p className="text-muted-foreground">
              BH Telecom korisnici ostvaruju popust od 30% u odnosu na tržišnu cijenu.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Sigurnost podataka</h2>
            <p className="text-muted-foreground">
              Vaši podaci se obrađuju u skladu s našom Politikom privatnosti. Primjenjujemo SSL/TLS enkripciju, 
              sigurnosne servere i monitoring aktivnosti kako bismo osigurali povjerljivost i integritet podataka.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Ograničenja korištenja</h2>
            <p className="text-muted-foreground mb-3">Korisnicima nije dozvoljeno:</p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>neovlašteno kopiranje, distribucija ili izmjena aplikacija,</li>
              <li>korištenje aplikacija u nezakonite svrhe,</li>
              <li>pokušaj pristupa sistemima ili podacima bez odobrenja.</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Plaćanja i naplata</h2>
            <p className="text-muted-foreground">
              Plaćanja se vrše putem podržanih metoda (kartice, PayPal, drugi online servisi). Svi troškovi 
              su transparentni, bez skrivenih naknada ili ugovornih obaveza.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Ograničenje odgovornosti</h2>
            <p className="text-muted-foreground">
              B&H Assistant d.o.o. ne garantuje da će usluga uvijek biti bez grešaka ili prekida. Ne snosimo 
              odgovornost za gubitke podataka ili štetu nastalu korištenjem aplikacije, osim u slučajevima 
              definisanim zakonom.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Izmjene uslova</h2>
            <p className="text-muted-foreground">
              Zadržavamo pravo izmjene ovih Uslova korištenja. Sve izmjene će biti objavljene na ovoj stranici 
              i stupaju na snagu odmah po objavi.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Kontakt</h2>
            <p className="text-muted-foreground">
              Za sva pitanja ili pritužbe vezane za Uslove korištenja, obratite nam se putem:{" "}
              <a href="mailto:info@bh-assistant.ba" className="text-primary hover:underline">
                📧 info@bh-assistant.ba
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
