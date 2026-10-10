# AI skenirani PDF → uređivi Word i sinhronizovana provjera

## Cilj
PRO PDF → Word način će moći prepoznati sadržaj skeniranih dokumenata, uključujući raspored, tabele i kolone, te izraditi uređivi DOCX. Nakon konverzije korisnik će pregledati izvornu PDF stranicu i odgovarajuću DOCX stranicu jednu pored druge uz sinhronizovano listanje.

## Šta će biti izgrađeno

1. **AI obrada skeniranog PDF-a**
   - U PRO načinu dodati jasan izbor AI obrade skeniranog dokumenta.
   - PDF stranice se pripremaju za siguran serverski poziv; Lovable AI prepoznaje tekst, naslove, odlomke, tabele, kolone i redoslijed čitanja.
   - Koristi se `openai/gpt-6-astra` kroz Lovable AI Gateway; ključ, prompt i model ostaju isključivo u Edge Functionu.
   - Obrada zahtijeva prijavu i aktivnu pretplatu, uz postojeći administratorski izuzetak.

2. **Strukturirani uređivi DOCX**
   - AI rezultat se strogo validira prije izrade dokumenta.
   - Naslovi, odlomci, tabele, kolone i prijelomi stranica mapiraju se u uređive Word elemente.
   - Ako AI ne može pouzdano prepoznati element, sadržaj se zadržava kao običan tekst umjesto da se izmišlja.
   - Privremeni rezultat ostaje privatan i evidentira se za postojeće dnevno brisanje.

3. **Paralelni prikaz stranica**
   - Izvorni PDF se prikazuje kao sve stranice, ne samo prva.
   - Konvertovani DOCX se prikazuje kao stvarne stranice pomoću `docx-preview`.
   - Na računaru su PDF i DOCX jedan pored drugog; na telefonu ostaju pregledni u dvije povezane kolone ili prilagođenom preklopnom prikazu.
   - Listanje jednog dokumenta pomjera drugi na odgovarajuću relativnu poziciju, bez beskonačne povratne petlje.
   - Prikaz uključuje broj trenutne stranice i opciju uključivanja/isključivanja sinhronizacije.

4. **Greške i lokalizacija**
   - Dodati prevode za BS latinicu, BS ćirilicu, EN, DE i TR.
   - Jasno prikazati stanja učitavanja, nepodržanog/zaštićenog PDF-a, AI odbijanja, nedovoljnih AI kredita i neuspjelog prikaza, bez gubitka već izrađenog fajla.
   - Ne prikazivati sirove serverske ili prijavne greške.

## Tehnički detalji
- Nova autentifikovana Edge Function prima skenirani PDF, renderuje ograničen broj stranica za model, poziva Responses API strimovano i vraća validiranu strukturu dokumenta ili gotov DOCX.
- Poziv koristi request-local Gateway run ID, `store: false`, obavezne Astra reasoning opcije i postojeći CORS obrazac.
- DOCX generator ostaje modularan i odvojen od AI poziva; vizuelni privatni način se ne mijenja.
- `PreviewPanel` dobija višestranični PDF renderer i zajednički kontroler listanja za PDF i DOCX spremnike.
- Postojeći PRO pristup, direktni `fetch()` sa korisničkim tokenom i dnevno čišćenje ostaju obavezni.

## Provjera
- Provjeriti stvarni višestranični skenirani PDF sa tabelom i dvije kolone.
- Potvrditi uređiv tekst, redoslijed kolona, tabelu, prijelome stranica, preuzimanje i DOCX prikaz.
- Potvrditi sinhronizaciju u oba smjera, isključivanje sinhronizacije te prikaz na telefonu i računaru.
- Provjeriti administratorski pristup, PRO blokadu, lokalizovane greške i evidentiranje rezultata za brisanje.
- Pokrenuti provjeru tipova, automatski build i stvarni AI Gateway poziv prije objave.