# Restrukturiranje početne stranice i stranica alata

## Cilj
Pretvoriti početnu stranicu u jasan ulaz u BH KONVER: snažan hero sa direktnim uploadom, pregledna mreža svih modula i namjenske stranice alata sa koracima, stvarnim previewom i dosljednim Freemium/PRO pravilima.

## Šta ću izgraditi

### 1. Nova početna stranica
- Zadržati postojeći lokalni identitet i karusel gradova, ali složiti hero u dvije jasne kolone: naslov i 3–4 prednosti lijevo, velika drag-and-drop upload zona desno.
- Upload u hero sekciji će prepoznati tip fajla i otvoriti odgovarajući namjenski tok, umjesto da bude dekorativan.
- Zamijeniti sadašnje tabove i rasute ulaze jedinstvenom responsivnom mrežom kartica za:
  - Slike i PDF/Word/Excel konverzije
  - Split, Merge, Compress i Watermark
  - HTML konverzije
  - Pravne dokumente
  - Audio/video i ostale postojeće module
- Svaka kartica dobija ikonu, kratak opis i vidljivu oznaku `BESPLATNO`, `2 BESPLATNE` ili `PRO`; zaključane kartice ostaju vidljive i otvaraju plaćanje.
- Zadržati postojeće cijene, sponzorske zone, footer i lokalizovani sadržaj, bez promjena backend poslovne logike.

### 2. Namjenske stranice modula
- Uvesti stabilne URL-ove za konverzijske alate (npr. `/alati/pdf-u-word`, `/alati/spoji-pdf`, `/alati/html-u-pdf`) i zajednički template stranice.
- Svaka stranica prikazuje:
  1. Upload dokumenta
  2. Izbor izlaznog formata ili relevantnih opcija
  3. Konverziju i Download/Edit akcije
- Ponovo koristiti postojeće, provjerene konvertere (`ToolRunner`, batch conversion, PDF interfejs i pravni wizard), umjesto dupliranja logike.
- Podržati direktan ulaz sa homepage hero uploada i ispravan povratak na katalog alata.

### 3. Stvarni Live Preview
- Nadograditi zajednički tok alata da nakon uploada odmah pokaže preview originala, a poslije uspješne konverzije preview rezultata.
- Za slike i PDF prikazati stvarni vizuelni sadržaj; za Office/HTML i nepodržane formate prikazati dosljedan dokument preview sa nazivom, tipom i veličinom umjesto lažnog rendera.
- Preview i kontrole će biti mobile-first, bez pomjeranja layouta tokom obrade.

### 4. Freemium i PRO pristup
- Sačuvati postojeća pravila kao jedini izvor istine:
  - alati koji su uvijek besplatni ostaju bez prijave;
  - kvalitetne dokument konverzije koriste postojeća 2 besplatna tokena;
  - HTML PRO, napredni PDF, audio/video i batch tokovi zahtijevaju aktivan paket;
  - admin zadržava puni pristup bez naplate.
- PRO kartica neće pokretati upload ili konverziju bez prava pristupa; odmah otvara postojeći paketni popup, a neprijavljenog korisnika plaćanje vodi kroz postojeću prijavu.
- Premium pravni obrasci zadržavaju postojeće zaključavanje i biće jasno označeni u gridu.

### 5. Lokalizacija i provjera
- Sve nove poruke, koraci, oznake i opisi dodati u BS, BS ćirilicu, EN, DE i TR prevode.
- Provjeriti desktop i mobilni prikaz, navigaciju sa svake kartice, upload, preview prije/poslije, besplatni limit, PRO popup i download.
- Ispraviti eventualne build/runtime greške pronađene tokom provjere, bez mijenjanja postojećih backend endpointa ili sigurnosnih pravila.

## Tehnički detalji
- Centralni katalog modula će definisati rutu, format, ikonu, pristupni nivo i postojeći handler, kako homepage i podstranice ne bi imale različita pravila.
- Nova dinamička ruta koristi zajednički layout, ali delegira izvršenje postojećim konverzijskim komponentama.
- Koristit će se postojeći Tailwind tokeni, Shadcn kontrole, Lucide ikone, `useSubscription`, `useFreeQuota` i postojeći PayPal modal.
- Ne uvodim nove tabele, migracije, servise za pohranu niti server-side obradu gdje već postoji privatna klijentska obrada.
