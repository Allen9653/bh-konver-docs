# PDF → Word sa dva načina konverzije

## Cilj
PDF → Word alat će ponuditi jasan izbor između privatne vizuelne kopije i PRO uređivog Word dokumenta. Oba načina će imati stvarni prikaz rezultata u polju „POSLIJE“.

## Šta će biti izgrađeno

1. **Privatna vizuelna kopija**
   - Obrada ostaje potpuno u pregledniku.
   - Svaka PDF stranica se ugrađuje u Word kao kvalitetna slika pune stranice, uz pravilnu A4/landscape orijentaciju i prijelome stranica.
   - Izgled obrazaca, certifikata, tabela, pečata, potpisa i više kolona ostaje vizuelno vjeran originalu.
   - Jasno će biti navedeno da tekst u ovom načinu nije potpuno uređiv.

2. **PRO uređivi Word**
   - Koristi postojeću Cloudmersive konverziju za OCR i rekonstrukciju teksta, tabela i rasporeda.
   - Zahtijeva prijavu i aktivnu pretplatu; administrator zadržava besplatan pristup.
   - Veliki i skenirani dokumenti ići će kroz postojeću pozadinsku obradu kako bi se izbjegao prekid zbog isteka vremena.
   - Postojeća pravila privatnosti, privatni linkovi i dnevno brisanje ostaju na snazi.

3. **Vjeran prikaz rezultata**
   - DOCX prikaz će koristiti `docx-preview` umjesto tekstualnog Mammoth prikaza.
   - Prikaz će izgledati kao stranice dokumenta, sa slikama, tabelama, razmacima i prijelomima stranica koje preglednik može prikazati.
   - Ako prikaz ne uspije, korisnik dobija jasnu lokalizovanu poruku bez gubitka rezultata za preuzimanje.

4. **Jasan izbor i lokalizacija**
   - PDF → Word ekran dobija izbor dva načina prije pokretanja konverzije.
   - Nazivi, opisi, oznake privatnosti/PRO, ograničenja i greške biće prevedeni na BS latinicu, BS ćirilicu, EN, DE i TR.
   - Postojeća dva besplatna tokena primjenjuju se na privatni način; PRO način ostaje iza aktivne pretplate, uz admin izuzetak.

## Tehnički detalji
- Lokalni DOCX će se generisati pomoću `docx` biblioteke, PDF stranice će renderovati `pdf.js`, a slike će biti dodane kao `ImageRun` elementi uz eksplicitne dimenzije i prijelome stranica.
- PRO poziv koristi postojeći direktni `fetch()` sa korisničkim pristupnim tokenom prema `convert-document` funkciji.
- `convert-document` će PDF→DOCX tretirati kao zahtjevnu konverziju kada je potrebno i zadržati konzistentno čišćenje privremenih rezultata.
- Mammoth ostaje dostupan drugim funkcijama, ali više neće biti renderer za DOCX polje „POSLIJE“.

## Provjera
- Generisati višestranični skenirani PDF sa tabelom/kolonama i provjeriti oba načina.
- Potvrditi da privatni DOCX vizuelno odgovara svim PDF stranicama i da PRO rezultat prikazuje strukturirani sadržaj.
- Provjeriti prikaz na telefonu i računaru, lokalizovane tekstove, admin pristup, pretplatničku blokadu, preuzimanje i stanje nakon greške.
- Provjeriti tipove, automatski build i relevantne greške u prikazu.
