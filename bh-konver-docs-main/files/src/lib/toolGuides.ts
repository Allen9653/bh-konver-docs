/**
 * Edukativni sadržaj za stranice alata (ToolInfoGuide).
 *
 * Osnovni jezik je bosanski (bs). Prevodi se mogu dodati u i18n fajlove pod ključem
 * `toolGuides.<id>` (npr. "toolGuides.converter-unit") sa istom strukturom kao ToolGuide
 * (polja koja nisu prevedena preuzimaju se iz ovog fajla).
 */

export type ToolGuideFaq = { q: string; a: string };

export type ToolGuidePreview = {
  /** Kratki naslov primjera, npr. "Primjer: 100 KM bez PDV-a" */
  title: string;
  /** Redovi "ulaz → izlaz" prikazani na paywall stranici bez prijave */
  rows: { label: string; value: string }[];
};

export type ToolGuide = {
  /** Naziv alata koji se koristi u naslovima sekcija */
  name: string;
  /** "Šta je ovaj alat?" — 1–2 kratka paragrafa */
  what: string[];
  /** "Kako se koristi?" — 3–4 koraka */
  steps: string[];
  /** "Prednosti i preporuke BH KONVER-a" */
  benefits: string[];
  /** "Česta pitanja" — 2–4 pitanja */
  faq: ToolGuideFaq[];
  /** Primjer rezultata za zaključane (Premium) alate */
  preview?: ToolGuidePreview;
};

const LOCAL = "Obrada se izvršava lokalno u vašem pregledniku. Unos se ne šalje na server i ne čuva se.";

export const TOOL_GUIDES: Record<string, ToolGuide> = {
  /* ------------------------------ Besplatni konvertori ------------------------------ */
  "converter-unit": {
    name: "Konverter jedinica",
    what: [
      "Konverter jedinica pretvara vrijednosti između najčešćih mjernih jedinica: dužine (mm, cm, m, km, inč, stopa, jard, milja), mase (mg, g, kg, tona, unca, funta), zapremine (ml, litar, m³, kašičica, šolja, galon) i površine (mm², cm², m², hektar, km², ft², aker).",
      "Koristan je za školu, kuhinju, građevinu, kupovinu u inostranstvu i svaki posao u kojem se miješaju metrički i anglosaksonski sistemi.",
    ],
    steps: [
      "Odaberite kategoriju: dužina, masa, zapremina ili površina.",
      "Upišite vrijednost koju želite pretvoriti.",
      "Izaberite početnu i ciljnu jedinicu. Dugme sa strelicama zamjenjuje jedinice.",
      "Rezultat se prikazuje odmah, bez dodatnog klika.",
    ],
    benefits: [LOCAL, "Besplatno je i radi bez prijave i registracije.", "Rezultat se ažurira dok kucate, a veliki i mali brojevi se prikazuju čitljivo."],
    faq: [
      { q: "Koliko inča ima u jednom metru?", a: "Jedan metar je približno 39,37 inča, jer je jedan inč tačno 0,0254 metra." },
      { q: "Zašto su kašičica, šolja i galon označeni sa US?", a: "Konverter koristi američke mjere (US tsp ≈ 4,93 ml, US cup ≈ 236,6 ml, US gal ≈ 3,785 l). Britanske mjere se razlikuju, pa za njih rezultat može odstupati." },
      { q: "Mogu li pretvarati jedinice iz različitih kategorija?", a: "Ne. Pretvaranje je moguće samo unutar iste kategorije, na primjer iz kilometara u milje, a ne iz kilograma u litre." },
    ],
  },
  "converter-currency": {
    name: "Konverter valuta",
    what: [
      "Konverter valuta preračunava iznose između konvertibilne marke (KM/BAM), eura, američkog dolara, švicarskog franka, britanske funte i drugih valuta, na osnovu javno dostupnih kurseva.",
      "Namijenjen je za brzu orijentaciju pri putovanju, online kupovini i poređenju cijena. Nije zamjena za kurs vaše banke.",
    ],
    steps: [
      "Upišite iznos koji želite preračunati.",
      "Izaberite polaznu i ciljnu valutu. Dugme sa strelicama ih zamjenjuje.",
      "Pročitajte rezultat i vrijeme posljednjeg osvježavanja kurseva.",
      "Po potrebi pritisnite dugme za osvježavanje da preuzmete najnovije kurseve.",
    ],
    benefits: ["Kursevi se privremeno pamte u pregledniku (do 30 minuta), pa je konverter brz.", "Ako preuzimanje kurseva ne uspije, koristi se posljednje sačuvano stanje uz jasnu poruku.", "Besplatno je i bez prijave."],
    faq: [
      { q: "Koliko je jedan euro u KM?", a: "Konvertibilna marka je vezana za euro po fiksnom kursu: 1 EUR = 1,95583 KM." },
      { q: "Da li su prikazani kursevi službeni?", a: "Ne. Kursevi su informativni i dolaze iz javnog kursnog API-ja. Za plaćanja i mjenjačnice važi kurs vaše banke ili mjenjačnice." },
      { q: "Zašto se rezultat ne prikazuje odmah?", a: "Pri prvom otvaranju kursevi se preuzimaju sa interneta. Ako je veza spora ili nedostupna, prikazuje se poruka, a dugme za osvježavanje omogućava novi pokušaj." },
    ],
  },
  "converter-script": {
    name: "Konverter ćirilice i latinice",
    what: [
      "Alat preslovljava tekst sa latinice na ćirilicu i obrnuto, uz podršku za bosanska, hrvatska i srpska slova: č, ć, đ, š, ž te digrafe lj, nj i dž.",
      "Praktičan je za dokumente, obrasce, natpise i društvene mreže kada je potrebno brzo promijeniti pismo.",
    ],
    steps: [
      "Odaberite smjer: latinica → ćirilica ili ćirilica → latinica.",
      "Upišite ili zalijepite tekst u lijevo polje.",
      "Rezultat se prikazuje odmah u desnom polju.",
      "Pritisnite dugme za kopiranje i zalijepite rezultat gdje vam treba.",
    ],
    benefits: [LOCAL, "Podržani su digrafi i velika/mala slova (npr. Lj, Nj, Dž).", "Besplatno je, bez ograničenja dužine koje bi bile vidljive u običnoj upotrebi."],
    faq: [
      { q: "Da li alat prepoznaje strane riječi i imena?", a: "Preslovljavanje je mehaničko, slovo po slovo. Za strane riječi i imena (npr. Wikipedia) rezultat treba provjeriti ručno." },
      { q: "Šta kad se n i j čitaju odvojeno, kao u riječi „injekcija“?", a: "Alat takve slučajeve ne prepoznaje automatski i može napisati jedno slovo (њ) umjesto dva. Pregledajte rezultat za takve riječi." },
      { q: "Da li se tekst negdje čuva?", a: "Ne. Tekst ostaje u vašem pregledniku i briše se zatvaranjem stranice." },
    ],
  },
  "converter-case": {
    name: "Promjena velikih i malih slova",
    what: [
      "Text Case konverter mijenja oblik teksta: VELIKA SLOVA, mala slova, Capitalize (prvo slovo rečenice) i Title Case (prvo slovo svake riječi), uz ispravno rukovanje slovima č, ć, đ, š i ž.",
      "Koristi se za uređivanje naslova, pripremu dokumenata i ispravljanje teksta koji je greškom ukucan sa uključenim Caps Lock-om.",
    ],
    steps: ["Zalijepite ili upišite tekst u polje za unos.", "Izaberite stil: velika slova, mala slova, Capitalize ili Title Case.", "Provjerite rezultat u desnom polju.", "Kopirajte rezultat jednim klikom."],
    benefits: [LOCAL, "Dijakritički znakovi ostaju očuvani.", "Besplatno je i bez prijave."],
    faq: [
      { q: "Koja je razlika između Capitalize i Title Case?", a: "Capitalize pretvara samo prvo slovo svake rečenice u veliko, a Title Case prvo slovo svake riječi." },
      { q: "Mijenjaju li se brojevi i interpunkcija?", a: "Ne. Mijenjaju se samo slova, dok brojevi i znakovi interpunkcije ostaju isti." },
    ],
  },
  "converter-hijri": {
    name: "Konverter hidžretskog datuma",
    what: [
      "Konverter pretvara datume između gregorijanskog i hidžretskog (Umm al-Qura) kalendara, u oba smjera.",
      "Koristan je za planiranje vjerskih i kulturnih događaja, genealogiju i čitanje starih dokumenata.",
    ],
    steps: ["Odaberite smjer: gregorijanski → hidžretski ili obrnuto.", "Za prvi smjer izaberite datum u kalendaru, a za drugi upišite dan, mjesec i godinu.", "Rezultat se prikazuje ispod, a za gregorijanski datum i u dugom zapisu.", "Ako rezultat prikazuje poruku o grešci, provjerite da dan, mjesec i godina postoje u kalendaru."],
    benefits: [LOCAL, "Koristi Umm al-Qura kalendar koji je dostupan u modernim preglednicima.", "Besplatno je i bez prijave."],
    faq: [
      { q: "Zašto se datum može razlikovati od onog u mom kalendaru?", a: "Umm al-Qura je računski kalendar. Početak mjeseca u praksi zavisi od viđenja mlađaka i odluka vjerskih tijela, pa razlika od jednog dana nije neuobičajena. Za vjerske obaveze koristite službeni kalendar Islamske zajednice." },
      { q: "Zašto je dan ograničen na 30?", a: "Hidžretski mjeseci imaju 29 ili 30 dana." },
    ],
  },
  "converter-length": {
    name: "Konverter dužine",
    what: ["Konverter dužine pretvara metre, stope, inče, kilometre i milje. Namijenjen je brzim provjerama kada se susrećete sa anglosaksonskim mjerama, na primjer pri kupovini, putovanju ili čitanju tehničkih opisa."],
    steps: ["Upišite vrijednost.", "Izaberite početnu jedinicu.", "Izaberite ciljnu jedinicu.", "Pročitajte rezultat ili zamijenite jedinice jednim klikom."],
    benefits: [LOCAL, "Tačni faktori konverzije (1 inč = 0,0254 m, 1 milja = 1609,344 m).", "Besplatno je i bez prijave."],
    faq: [
      { q: "Koliko je kilometara jedna milja?", a: "Jedna milja je 1,609344 kilometra." },
      { q: "Koliko stopa ima u metru?", a: "Jedan metar je približno 3,28 stope." },
    ],
  },
  "converter-roman": {
    name: "Konverter rimskih brojeva i datuma",
    what: ["Alat pretvara arapske brojeve i datume u rimske brojeve i obrnuto. Podržava standardni zapis od I do MMMCMXCIX (1–3999) i datume u obliku dan / mjesec / godina."],
    steps: ["Odaberite način: datum → rimski, rimski → datum, broj → rimski ili rimski → broj.", "Unesite datum, broj ili rimski zapis.", "Rezultat se prikazuje odmah.", "Ako je unos neispravan, prikazuje se jasna poruka umjesto rezultata."],
    benefits: [LOCAL, "Provjerava ispravnost standardnog zapisa (npr. odbacuje IIII).", "Besplatno je i bez prijave."],
    faq: [
      { q: "Kako se piše 2026. u rimskim brojevima?", a: "MMXXVI." },
      { q: "Zašto je najveći podržani broj 3999?", a: "Standardni rimski zapis bez dodatnih oznaka ne ide dalje od MMMCMXCIX." },
      { q: "Zašto datum iz daleke budućnosti ili prošlosti nije preveden?", a: "Godina mora biti između 1 i 3999 da bi imala standardni rimski zapis." },
    ],
  },
  "converter-temperature": {
    name: "Konverter temperature",
    what: ["Konverter temperature pretvara stepene Celzijusa, Fahrenheita i Kelvina. Alat provjerava i apsolutnu nulu (−273,15 °C), pa ne prihvata fizički nemoguće vrijednosti."],
    steps: ["Upišite temperaturu.", "Izaberite početnu skalu.", "Izaberite ciljnu skalu.", "Pročitajte rezultat, prikazan sa do četiri decimale."],
    benefits: [LOCAL, "Zaštita od vrijednosti ispod apsolutne nule.", "Besplatno je i bez prijave."],
    faq: [
      { q: "Kako se Celzijus pretvara u Fahrenheit?", a: "Pomnožite Celzijuse sa 9/5 i dodajte 32. Na primjer, 20 °C je 68 °F." },
      { q: "Koliko je apsolutna nula?", a: "Apsolutna nula je 0 K, odnosno −273,15 °C ili −459,67 °F." },
    ],
  },

  /* ------------------------------ Premium generatori ------------------------------ */
  "generator-uuid": {
    name: "UUID v4 generator",
    what: ["UUID v4 generator pravi nasumične jedinstvene identifikatore koji se koriste u bazama podataka, API-jima, testiranju i razvoju softvera. Možete generisati od 1 do 50 vrijednosti odjednom, sa malim ili velikim slovima."],
    steps: ["Unesite broj UUID vrijednosti (1–50).", "Po želji uključite velika slova.", "Pritisnite „Generiši UUID“.", "Kopirajte sve vrijednosti jednim klikom."],
    benefits: ["Koristi sigurni generator slučajnih brojeva vašeg preglednika.", "Generisanje se odvija lokalno. Vrijednosti se ne šalju na server.", "Rezultat je spreman za kopiranje, jedan UUID po redu."],
    faq: [
      { q: "Šta je UUID v4?", a: "To je 128-bitni identifikator zasnovan na slučajnim vrijednostima. Vjerovatnoća da se dva puta generiše ista vrijednost je zanemarivo mala." },
      { q: "Mogu li UUID koristiti kao lozinku ili token za pristup?", a: "Ne preporučuje se. UUID služi za identifikaciju, a ne za zaštitu pristupa." },
    ],
    preview: { title: "Primjer rezultata", rows: [{ label: "Broj vrijednosti", value: "2" }, { label: "UUID #1", value: "f47ac10b-58cc-4372-a567-0e02b2c3d479" }, { label: "UUID #2", value: "9b2c3d4e-1a5f-4c6b-8d7e-0f1a2b3c4d5e" }] },
  },
  "generator-qr": {
    name: "QR Code generator",
    what: ["QR generator pravi QR kod za običan tekst, web adresu, e-mail poruku ili povezivanje na WiFi mrežu. Gotov kod preuzimate kao PNG sliku za štampu, vizit-karte, jelovnike ili objave."],
    steps: ["Izaberite vrstu: tekst, URL, e-mail ili WiFi.", "Unesite sadržaj (za WiFi naziv mreže, zaštitu i lozinku).", "Pregledajte QR kod koji se pojavljuje odmah.", "Preuzmite PNG i provjerite kod skeniranjem prije štampe."],
    benefits: ["QR kod se kreira u pregledniku, bez slanja sadržaja na server.", "Podržani su WiFi i e-mail formati koje telefoni prepoznaju.", "Slika je 320 × 320 px, dovoljna za većinu štampanih materijala."],
    faq: [
      { q: "Smijem li u QR kod staviti lozinku od WiFi mreže?", a: "Možete, ali svako ko skenira kod vidi lozinku. Štampajte ga samo na mjestima na kojima je to prihvatljivo." },
      { q: "Zašto se QR kod ne skenira?", a: "Najčešći razlozi su premala štampa, slab kontrast ili predug sadržaj. Pokušajte kraći tekst i veću sliku." },
    ],
    preview: { title: "Primjer rezultata", rows: [{ label: "Vrsta", value: "URL" }, { label: "Sadržaj", value: "https://www.bh-konver.ba" }, { label: "Izlaz", value: "PNG, 320 × 320 px" }] },
  },
  "generator-slug": {
    name: "SEO slug generator",
    what: ["Slug generator pretvara naslov ili rečenicu u čistu, čitljivu URL oznaku. Bosanska slova se pretvaraju u osnovna latinična slova (č, ć → c, š → s, ž → z, đ → dj), a razmaci i znakovi u crtice."],
    steps: ["Upišite ili zalijepite naslov.", "Pročitajte generisani slug ispod.", "Kopirajte ga jednim klikom.", "Zalijepite ga u adresu stranice ili CMS."],
    benefits: ["Radi lokalno u pregledniku.", "Pravilno rukuje bosanskim slovima.", "Rezultat je spreman za URL: mala slova, brojevi i crtice."],
    faq: [
      { q: "Zašto su slugovi dobri za SEO?", a: "Kratke, čitljive adrese lakše se pamte i dijele, a pretraživačima daju jasnu naznaku o sadržaju stranice." },
      { q: "Koliko dug treba da bude slug?", a: "Praktično je zadržati ga kratkim, uglavnom do nekoliko riječi, bez suvišnih veznika." },
    ],
    preview: { title: "Primjer rezultata", rows: [{ label: "Naslov", value: "Čaršija, ćevapi i šetnja kroz Žepče" }, { label: "Slug", value: "carsija-cevapi-i-setnja-kroz-zepce" }] },
  },
  "generator-barcode": {
    name: "Barcode generator",
    what: ["Barcode generator pravi linijske barkodove u formatima CODE128, EAN-13 i EAN-8. Rezultat preuzimate kao vektorski SVG koji se može štampati u bilo kojoj veličini bez gubitka kvalitete."],
    steps: ["Upišite tekst ili broj.", "Izaberite format: CODE128, EAN-13 ili EAN-8.", "Provjerite pregled barkoda. Ako unos nije ispravan, prikazuje se poruka šta format traži.", "Preuzmite SVG ili kopirajte vrijednost."],
    benefits: ["SVG ostaje oštar pri štampi.", "Provjera unosa za EAN formate (broj cifara).", "Generisanje je lokalno, bez slanja podataka."],
    faq: [
      { q: "Koliko cifara traži EAN-13?", a: "EAN-13 traži 12 cifara, a kontrolna cifra se računa automatski, ili 13 cifara sa već upisanom kontrolnom cifrom." },
      { q: "Mogu li koristiti ove barkodove za prodaju u prodavnicama?", a: "EAN brojeve za prodaju dodjeljuje GS1. Generator pravi grafički prikaz, ali ne dodjeljuje službene brojeve proizvoda." },
    ],
    preview: { title: "Primjer rezultata", rows: [{ label: "Format", value: "CODE128" }, { label: "Vrijednost", value: "BHK-2026-001" }, { label: "Izlaz", value: "SVG barkod" }] },
  },

  /* ------------------------------ Premium kalkulatori ------------------------------ */
  "calculator-gorivo": {
    name: "Kalkulator goriva",
    what: ["Kalkulator goriva procjenjuje koliko goriva i novca vam treba za putovanje, na osnovu udaljenosti, prosječne potrošnje vozila (L/100 km) i cijene litre goriva u KM. Moguće je računati i povratno putovanje."],
    steps: ["Upišite udaljenost u jednom smjeru u kilometrima.", "Upišite prosječnu potrošnju vozila (L/100 km).", "Upišite cijenu goriva po litru.", "Uključite ili isključite povratno putovanje i pročitajte trošak."],
    benefits: ["Rezultat se računa odmah i lokalno.", "Dugme za vraćanje početnih vrijednosti.", "Prikaz u KM, uz ukupnu kilometražu i litre."],
    faq: [
      { q: "Kako izračunati potrošnju za vlastito vozilo?", a: "Natočite do vrha, pređite poznatu kilometražu i ponovo natočite. Podijelite litre sa pređenim kilometrima i pomnožite sa 100." },
      { q: "Da li kalkulator uračunava putarine i troškove vožnje?", a: "Ne. Procjena obuhvata samo gorivo, bez putarina, parkinga i promjena cijene." },
    ],
    preview: { title: "Primjer: 100 km u jednom smjeru, 6 L/100 km, 2,50 KM po litru, povratno", rows: [{ label: "Ukupna kilometraža", value: "200 km" }, { label: "Potrošeno goriva", value: "12,00 L" }, { label: "Ukupan trošak", value: "30,00 KM" }] },
  },
  "calculator-pdv": {
    name: "PDV kalkulator",
    what: ["PDV kalkulator dodaje PDV na iznos bez poreza ili izdvaja PDV iz ukupnog iznosa. Koristi standardnu stopu od 17%, koja važi u Bosni i Hercegovini."],
    steps: ["Odaberite način: dodaj PDV (bez → sa) ili izdvoji PDV (sa → bez).", "Upišite iznos u KM.", "Pročitajte osnovicu, iznos PDV-a i ukupan iznos.", "Za drugi iznos samo promijenite unos."],
    benefits: ["Radi odmah, bez prijave i bez slanja podataka.", "Jasan prikaz osnovice, PDV-a i ukupnog iznosa.", "Namijenjen je za brzu provjeru faktura i cijena."],
    faq: [
      { q: "Koja je stopa PDV-a u BiH?", a: "Standardna stopa je 17%. Kalkulator koristi samo tu stopu." },
      { q: "Može li kalkulator zamijeniti knjigovodstvo?", a: "Ne. Služi za brzu orijentaciju. Za fakture i prijave koristite službene propise i savjet knjigovođe." },
    ],
    preview: { title: "Primjer: 100 KM bez PDV-a", rows: [{ label: "Osnovica", value: "100,00 KM" }, { label: "PDV (17%)", value: "17,00 KM" }, { label: "Ukupno sa PDV-om", value: "117,00 KM" }] },
  },
  "calculator-staz": {
    name: "Kalkulator radnog staža",
    what: ["Kalkulator izračunava kalendarsko trajanje između dva datuma izraženo u godinama, mjesecima i danima. Koristan je za orijentacionu provjeru radnog staža."],
    steps: ["Upišite datum početka rada.", "Upišite datum završetka ili ostavite današnji datum.", "Pročitajte trajanje u godinama, mjesecima i danima.", "Ako je završetak prije početka, prikazuje se upozorenje."],
    benefits: ["Brz i jasan rezultat.", "Proračun je lokalan, datumi se ne šalju na server.", "Napomena o ograničenjima vidljiva je uz rezultat."],
    faq: [
      { q: "Da li je rezultat službeni radni staž?", a: "Ne. Rezultat je kalendarski proračun i ne uzima u obzir prekide rada, beneficirani staž ni propise o priznavanju. Službeni staž utvrđuju nadležne institucije." },
      { q: "Zašto datum završetka ne može biti u budućnosti?", a: "Kalkulator računa ostvareni staž, pa je najkasniji dozvoljeni datum današnji." },
    ],
    preview: { title: "Primjer: od 01.09.2015. do 01.09.2025.", rows: [{ label: "Početak", value: "01.09.2015." }, { label: "Završetak", value: "01.09.2025." }, { label: "Ostvareni staž", value: "10 godina, 0 mjeseci, 0 dana" }] },
  },
  "calculator-struja": {
    name: "Kalkulator potrošnje struje",
    what: ["Kalkulator procjenjuje potrošnju električne energije jednog aparata i mjesečni trošak, na osnovu snage u vatima, dnevnog broja sati rada i cijene jednog kWh."],
    steps: ["Upišite snagu aparata u W (piše na naljepnici uređaja).", "Upišite prosječan broj sati rada dnevno (0–24).", "Upišite cijenu 1 kWh u KM.", "Pročitajte dnevnu i mjesečnu potrošnju i trošak."],
    benefits: ["Pomaže da uporedite aparate i uštedite.", "Prikaz u kWh i KM.", "Proračun je lokalan i bez prijave podataka."],
    faq: [
      { q: "Kako se računa potrošnja u kWh?", a: "Snaga u vatima se podijeli sa 1000 i pomnoži brojem sati rada. Aparat od 1000 W koji radi 5 sati potroši 5 kWh." },
      { q: "Zašto je moj račun za struju drugačiji?", a: "Račun uključuje tarife, naknade i poreze, a kalkulator procjenjuje samo potrošnju jednog aparata za 30 dana." },
    ],
    preview: { title: "Primjer: 1000 W, 5 sati dnevno, 0,20 KM po kWh", rows: [{ label: "Dnevno", value: "5,00 kWh" }, { label: "Mjesečno (30 dana)", value: "150,00 kWh" }, { label: "Mjesečni trošak", value: "30,00 KM" }] },
  },

  /* ------------------------------ Premium testovi ------------------------------ */
  "test-opste-znanje": {
    name: "Kviz opšteg znanja o BiH",
    what: ["Kratki kviz od 5 pitanja o geografiji, historiji i kulturi Bosne i Hercegovine. Na kraju dobijate rezultat, a tačni i netačni odgovori se označavaju."],
    steps: ["Odgovorite na sva pitanja izborom jedne ponuđene opcije.", "Kada ste odgovorili na sva pitanja, pritisnite „Prikaži rezultat“.", "Pregledajte označene tačne i netačne odgovore.", "Pritisnite „Pokušaj ponovo“ da vježbate ponovo."],
    benefits: ["Brz format, nekoliko minuta.", "Odgovori se ne šalju i ne čuvaju na serveru.", "Pogodno za učenje i zabavu."],
    faq: [
      { q: "Da li se rezultat čuva?", a: "Ne. Rezultat se prikazuje samo u vašem pregledniku dok je stranica otvorena." },
      { q: "Mogu li ponovo riješiti kviz?", a: "Da, neograničeno puta." },
    ],
    preview: { title: "Primjer pitanja", rows: [{ label: "Pitanje", value: "Koji je glavni grad Bosne i Hercegovine?" }, { label: "Format", value: "5 pitanja, rezultat na kraju" }] },
  },
  "test-logika": {
    name: "IQ i logički test",
    what: ["Kratak test sa 5 zadataka logičkog zaključivanja, nizova i prepoznavanja obrazaca. Rezultat je informativan i nije zamjena za stručno testiranje inteligencije."],
    steps: ["Pažljivo pročitajte zadatak.", "Izaberite jedan od ponuđenih odgovora.", "Nakon svih odgovora pritisnite „Prikaži rezultat“.", "Pregledajte tačne odgovore i pokušajte ponovo."],
    benefits: ["Vježba logičko razmišljanje.", "Rezultat odmah.", "Odgovori se ne čuvaju."],
    faq: [
      { q: "Da li ovaj test mjeri pravi IQ?", a: "Ne. Radi se o kratkom zabavnom i edukativnom testu, a ne o standardizovanom mjerenju inteligencije." },
    ],
    preview: { title: "Primjer testa", rows: [{ label: "Vrsta zadataka", value: "Nizovi i logičko zaključivanje" }, { label: "Format", value: "5 zadataka, rezultat na kraju" }] },
  },
  "test-saobracajni": {
    name: "Saobraćajni test",
    what: ["Kratki test od 5 pitanja o saobraćajnim znakovima, prednosti prolaza i sigurnom ponašanju u saobraćaju. Služi za ponavljanje i nije zamjena za zvanični ispit za vozače."],
    steps: ["Pročitajte pitanje.", "Izaberite jedan odgovor.", "Pritisnite „Prikaži rezultat“ kada odgovorite na sva pitanja.", "Pogledajte označene tačne odgovore i ponovite test."],
    benefits: ["Dobro za ponavljanje osnova.", "Rezultat odmah.", "Odgovori se ne čuvaju."],
    faq: [
      { q: "Da li test važi za polaganje vozačkog ispita?", a: "Ne. Za polaganje se koristi službeni materijal autoškole i nadležnih institucija." },
    ],
    preview: { title: "Primjer testa", rows: [{ label: "Teme", value: "Znakovi, prednost prolaza, ponašanje u saobraćaju" }, { label: "Format", value: "5 pitanja, rezultat na kraju" }] },
  },
  "test-licnost": {
    name: "Test ličnosti",
    what: ["Kratka samoprocjena ličnih preferencija sa 6 pitanja i informativnim opisom profila. Rezultat nije psihološka dijagnoza ni stručna procjena."],
    steps: ["Odgovorite na pitanja prema svojim uobičajenim navikama.", "Pritisnite „Prikaži rezultat“.", "Pročitajte informativni opis profila.", "Po želji ponovite test."],
    benefits: ["Brz i jednostavan.", "Odgovori se ne šalju na server.", "Jasno naznačeno da je rezultat informativan."],
    faq: [
      { q: "Da li je rezultat psihološka procjena?", a: "Ne. Test služi samorefleksiji i zabavi. Za stručnu procjenu obratite se psihologu." },
    ],
    preview: { title: "Primjer testa", rows: [{ label: "Format", value: "6 pitanja, informativni profil na kraju" }] },
  },

  /* ------------------------------ Kategorije ------------------------------ */
  "category-kalkulatori": {
    name: "Kalkulatori",
    what: ["Kalkulatori su Premium alati za svakodnevne proračune u KM: trošak goriva, PDV 17%, radni staž i potrošnja električne energije. Svaki kalkulator ima jasan unos, trenutačan rezultat i napomenu o ograničenjima."],
    steps: ["Izaberite kalkulator.", "Unesite tražene vrijednosti.", "Pročitajte rezultat koji se ažurira odmah.", "Za novi proračun promijenite unos."],
    benefits: ["Proračun je lokalan, bez slanja unosa na server.", "Prilagođeno BiH: KM, PDV 17%.", "Premium pristup otključava sve kalkulatore."],
    faq: [
      { q: "Šta je potrebno za korištenje kalkulatora?", a: "Aktivna Premium pretplata i prijavljen korisnički račun." },
      { q: "Jesu li rezultati zvanični?", a: "Rezultati su informativni. Za službene obračune koristite propise i nadležne institucije." },
    ],
  },
  "category-testovi": {
    name: "Testovi i kvizovi",
    what: ["Testovi su Premium kvizovi i samoprocjene: opšte znanje o BiH, saobraćajni test, IQ i logički zadaci te test ličnosti. Svaki test ima nekoliko pitanja i odmah prikazuje rezultat."],
    steps: ["Izaberite test.", "Odgovorite na sva pitanja.", "Pritisnite „Prikaži rezultat“.", "Pregledajte odgovore i pokušajte ponovo."],
    benefits: ["Kratko i pregledno.", "Odgovori se ne čuvaju na serveru.", "Premium pristup otključava sve testove."],
    faq: [
      { q: "Šta je potrebno za pristup testovima?", a: "Aktivna Premium pretplata i prijavljen korisnički račun." },
      { q: "Jesu li testovi stručni instrumenti?", a: "Ne. Testovi su edukativni i zabavni, bez dijagnostičke vrijednosti." },
    ],
  },

  /* ------------------------------ Dokument i PDF alati (/alati/*) ------------------------------ */
  "alati-pdf-u-word": {
    name: "PDF u Word",
    what: ["Alat pretvara PDF dokument u Word (DOCX). Dostupna su dva načina: privatna vizuelna kopija koja se pravi u vašem pregledniku i PRO uređivi DOCX koji se obrađuje na serveru za prijavljene korisnike."],
    steps: ["Izaberite način konverzije.", "Dodajte PDF datoteku.", "Pokrenite konverziju i sačekajte da se završi.", "Preuzmite DOCX i provjerite izgled u Wordu."],
    benefits: ["Vizuelni način ne šalje datoteku na server.", "PRO način je namijenjen za uređivanje teksta.", "Besplatne probne konverzije bez prijave, uz ograničen broj."],
    faq: [
      { q: "Koja je razlika između dva načina?", a: "Vizuelna kopija čuva izgled stranice, ali tekst ne mora biti jednostavan za uređivanje. PRO način pokušava napraviti uredive odlomke." },
      { q: "Da li su skenirani PDF-ovi podržani?", a: "Skenirani dokumenti su slike, pa uređiv tekst ne mogu dati bez prepoznavanja teksta (OCR)." },
      { q: "Šta se dešava sa datotekom na serveru?", a: "Privremeni rezultati serverske konverzije se brišu u okviru dnevnog čišćenja." },
    ],
  },
  "alati-word-u-pdf": {
    name: "Word u PDF",
    what: ["Alat pretvara Word dokument (DOCX) u PDF. Konverzija se izvršava u vašem pregledniku, pa dokument ne napušta vaš uređaj."],
    steps: ["Dodajte DOCX datoteku.", "Pokrenite konverziju.", "Sačekajte da se pripremi PDF.", "Preuzmite PDF i provjerite izgled."],
    benefits: ["Obrada u pregledniku bez slanja datoteke.", "Besplatne probne konverzije, uz ograničen broj.", "Jednostavan tok u tri klika."],
    faq: [
      { q: "Zašto se izgled PDF-a razlikuje od Worda?", a: "Konverzija u pregledniku zadržava sadržaj i osnovno oblikovanje, ali složeni elementi (tekstualna polja, posebni fontovi, složeni razmaci) mogu izgledati drugačije." },
      { q: "Podržava li alat stari .doc format?", a: "Podržan je DOCX. Stari .doc dokument prvo sačuvajte kao DOCX." },
    ],
  },
  "alati-excel-u-pdf": {
    name: "Excel u PDF",
    what: ["Alat pretvara Excel tabelu (XLSX ili XLS) u PDF prikladan za štampu ili slanje. Konverzija se izvršava u vašem pregledniku."],
    steps: ["Dodajte Excel datoteku.", "Pokrenite konverziju.", "Sačekajte da se pripremi PDF.", "Preuzmite PDF i provjerite tabelu."],
    benefits: ["Obrada u pregledniku bez slanja datoteke.", "Besplatne probne konverzije, uz ograničen broj.", "Pogodno za izvještaje i cjenovnike."],
    faq: [
      { q: "Hoće li formule i grafikoni biti sačuvani?", a: "PDF prikazuje vrijednosti tabele. Formule se ne prenose, a grafikoni i složeno oblikovanje mogu izostati." },
      { q: "Koje su moguće greške?", a: "Veoma velike tabele mogu se sporo obraditi. U tom slučaju podijelite datoteku na manje dijelove." },
    ],
  },
  "alati-pptx-u-pdf": {
    name: "PowerPoint u PDF (beta)",
    what: ["Alat pretvara PowerPoint prezentaciju (PPTX) u PDF. Alat je u beta fazi i obrada se izvršava na serveru, pa rezultat provjerite prije slanja ili štampe."],
    steps: ["Dodajte PPTX datoteku.", "Pokrenite konverziju.", "Sačekajte obradu na serveru.", "Preuzmite PDF i provjerite sve slajdove."],
    benefits: ["Brz put do PDF-a za dijeljenje.", "Besplatne probne konverzije, uz ograničen broj.", "Beta oznaka jasno upozorava na moguća odstupanja."],
    faq: [
      { q: "Šta znači beta?", a: "Alat se još usavršava. Animacije, neki fontovi i složeni efekti možda neće biti tačno preneseni." },
      { q: "Da li se datoteka šalje na server?", a: "Da, ovaj alat koristi serversku obradu, a privremeni rezultati se brišu u okviru dnevnog čišćenja." },
    ],
  },
  "alati-spoji-pdf": {
    name: "Spajanje PDF dokumenata",
    what: ["Alat spaja više PDF datoteka u jednu, redoslijedom kojim ih dodate. Spajanje se izvršava u vašem pregledniku."],
    steps: ["Dodajte dvije ili više PDF datoteka.", "Provjerite redoslijed.", "Pokrenite spajanje.", "Preuzmite jedan objedinjeni PDF."],
    benefits: ["Datoteke ne napuštaju vaš uređaj.", "Besplatne probne obrade, uz ograničen broj.", "Brzo i bez instalacije."],
    faq: [
      { q: "Mogu li promijeniti redoslijed datoteka?", a: "Redoslijed prati redoslijed dodavanja. Za drugačiji redoslijed dodajte datoteke drugim redom." },
      { q: "Podržavaju li se PDF-ovi zaštićeni lozinkom?", a: "Zaštićene datoteke prvo otključajte u programu u kojem su napravljene." },
    ],
  },
  "alati-podijeli-pdf": {
    name: "Dijeljenje PDF dokumenta",
    what: ["Alat razdvaja PDF na pojedinačne stranice. Obrada se izvršava u vašem pregledniku, a rezultat dobijate kao ZIP arhivu sa po jednim PDF-om za svaku stranicu."],
    steps: ["Dodajte PDF datoteku.", "Pokrenite razdvajanje.", "Sačekajte obradu.", "Preuzmite rezultat i provjerite stranice."],
    benefits: ["Datoteka ne napušta vaš uređaj.", "Besplatne probne obrade, uz ograničen broj.", "Korisno za slanje samo potrebnih stranica."],
    faq: [
      { q: "Mogu li izdvojiti samo određene stranice?", a: "Alat razdvaja dokument na sve stranice. Iz ZIP arhive uzmite one koje su vam potrebne." },
      { q: "Što ako je PDF zaštićen lozinkom?", a: "Prvo uklonite zaštitu u programu u kojem je dokument pravljen." },
    ],
  },
  "alati-html-u-word": {
    name: "HTML u Word",
    what: ["Alat pretvara HTML datoteku u Word dokument (DOCX). Obrada se izvršava u vašem pregledniku, uz uklanjanje skripti i stilova iz sigurnosnih razloga."],
    steps: ["Dodajte HTML datoteku.", "Pokrenite konverziju.", "Sačekajte da se DOCX pripremi.", "Preuzmite dokument i provjerite oblikovanje."],
    benefits: ["Obrada u pregledniku bez slanja datoteke.", "Skripte se uklanjaju prije konverzije.", "Besplatne probne konverzije, uz ograničen broj."],
    faq: [
      { q: "Hoće li CSS stilovi biti sačuvani?", a: "Osnovna struktura (naslovi, odlomci, liste, tabele) se prenosi, a složeni stilovi i vanjski resursi mogu izostati." },
      { q: "Zašto se slike ne prikazuju?", a: "Slike koje se učitavaju sa interneta ne moraju biti dostupne. Koristite ugrađene slike u datoteci." },
    ],
  },
  "alati-html-u-pdf": {
    name: "HTML u PDF",
    what: ["Alat pretvara HTML datoteku u PDF dokument spreman za štampu. Alat je dostupan korisnicima sa aktivnom Premium pretplatom."],
    steps: ["Prijavite se i aktivirajte Premium.", "Dodajte HTML datoteku.", "Pokrenite konverziju.", "Preuzmite PDF i provjerite stranice."],
    benefits: ["Brz put od HTML-a do PDF-a.", "Stranica se prikazuje i pretvara u pregledniku.", "Namijenjeno računima, ponudama i izvještajima."],
    faq: [
      { q: "Šta je potrebno za korištenje?", a: "Aktivna Premium pretplata." },
      { q: "Zašto se dijelovi stranice ne prikazuju?", a: "Eksterni resursi (slike, fontovi) mogu biti nedostupni. Ugradite ih u HTML da bi se prikazali." },
    ],
  },
  "alati-pismo": {
    name: "Konverter ćirilice i latinice",
    what: ["Besplatan alat za preslovljavanje teksta između ćirilice i latinice uz podršku za slova lj, nj, dž, č, ć, đ, š i ž. Dostupan je i u sekciji besplatnih konvertora."],
    steps: ["Odaberite smjer preslovljavanja.", "Upišite ili zalijepite tekst.", "Rezultat se prikazuje odmah.", "Kopirajte rezultat jednim klikom."],
    benefits: [LOCAL, "Besplatno je, bez ograničenja i bez prijave.", "Podržana su bosanska slova i digrafi."],
    faq: [
      { q: "Radi li alat sa dugim tekstovima?", a: "Da, ali za veoma duge dokumente preslovljeni tekst provjerite ručno, naročito za strane riječi." },
      { q: "Je li tekst negdje sačuvan?", a: "Ne. Tekst ostaje u pregledniku." },
    ],
  },

  /* ------------------------------ Slika u PDF ------------------------------ */
  "slika-pdf": {
    name: "Slika u PDF i PDF u sliku",
    what: ["Alat pretvara JPEG i PNG slike u PDF, a PDF stranice u JPEG ili PNG slike. Konverzija se izvršava lokalno u vašem pregledniku."],
    steps: ["Odaberite smjer konverzije.", "Dodajte jednu ili više datoteka.", "Pokrenite konverziju.", "Preuzmite rezultat."],
    benefits: ["Datoteke ne napuštaju vaš uređaj.", "Pogodno za skenirane dokumente i potvrde.", "Pregled historije konverzija za prijavljene korisnike."],
    faq: [
      { q: "Mogu li spojiti više slika u jedan PDF?", a: "Da. Dodajte više slika i dobit ćete jedan PDF sa po jednom slikom po stranici." },
      { q: "Koji su formati slike podržani?", a: "JPEG i PNG za pretvaranje u PDF, a PDF se pretvara u JPEG ili PNG." },
    ],
  },

  /* ------------------------------ Moduli (/modul/*) ------------------------------ */
  "module-jedinice": {
    name: "Jedinice i valute",
    what: ["Modul okuplja besplatne konvertore jedinica i valuta na jednom mjestu. Pokriva dužinu, masu, zapreminu i površinu te preračun KM, eura, dolara i drugih valuta."],
    steps: ["Za jedinice izaberite kategoriju, unesite vrijednost i izaberite jedinice.", "Za valute upišite iznos i izaberite valute.", "Rezultat se prikazuje odmah.", "Za osvježavanje kurseva koristite dugme za osvježavanje."],
    benefits: ["Besplatno je i bez prijave.", "Jedinice se računaju lokalno u pregledniku.", "Kursevi se privremeno pamte radi brzine."],
    faq: [
      { q: "Da li je modul besplatan?", a: "Da, jedinice i valute su besplatne bez ograničenja." },
      { q: "Gdje su ostali konvertori?", a: "Konvertore pisma, datuma, rimskih brojeva i temperature nalazite u sekciji Konvertori." },
    ],
  },
  "module-kompresuj-pdf": {
    name: "Kompresija PDF-a",
    what: ["Premium alat smanjuje veličinu PDF dokumenta, što olakšava slanje e-poštom i otpremanje na portale koji ograničavaju veličinu datoteke. Obrada se izvršava na serveru."],
    steps: ["Prijavite se sa aktivnom Premium pretplatom.", "Dodajte PDF datoteku.", "Pokrenite kompresiju.", "Preuzmite manji PDF i provjerite čitljivost."],
    benefits: ["Manje datoteke za e-poštu i portale.", "Serverski rezultati se brišu u okviru dnevnog čišćenja.", "Jednostavan tok u nekoliko koraka."],
    faq: [
      { q: "Hoće li kvaliteta biti smanjena?", a: "Kompresija može smanjiti kvalitetu slika u dokumentu. Pregledajte rezultat prije slanja." },
      { q: "Šta je potrebno za korištenje?", a: "Aktivna Premium pretplata." },
    ],
  },
  "module-vodeni-zig": {
    name: "Vodeni žig na PDF-u",
    what: ["Premium alat dodaje vodeni žig (tekst) na stranice PDF dokumenta, na primjer „KOPIJA“ ili „POVJERLJIVO“. Obrada se izvršava na serveru."],
    steps: ["Prijavite se sa aktivnom Premium pretplatom.", "Dodajte PDF datoteku.", "Podesite tekst vodenog žiga.", "Preuzmite PDF i provjerite izgled."],
    benefits: ["Označavanje dokumenata prije slanja.", "Serverski rezultati se brišu u okviru dnevnog čišćenja.", "Jednostavno za korištenje."],
    faq: [
      { q: "Mogu li vodeni žig kasnije ukloniti?", a: "Sačuvajte originalni dokument. Žig upisan u PDF ne treba računati kao reverzibilnu izmjenu." },
      { q: "Šta je potrebno za korištenje?", a: "Aktivna Premium pretplata." },
    ],
  },
  "module-audio": {
    name: "Audio konverter",
    what: ["Premium modul za konverziju audio datoteka između formata MP3, OGG, WAV, M4A, AAC i FLAC. Gdje je moguće, obrada se izvršava u pregledniku, a u ostalim slučajevima na serveru."],
    steps: ["Prijavite se sa aktivnom Premium pretplatom.", "Dodajte audio datoteku.", "Izaberite ciljni format.", "Preuzmite konvertovanu datoteku."],
    benefits: ["Podržani su najčešći audio formati.", "Serverski rezultati se brišu u okviru dnevnog čišćenja.", "Jednostavan tok bez instalacije."],
    faq: [
      { q: "Koji su formati podržani?", a: "MP3, OGG, WAV, M4A, AAC i FLAC." },
      { q: "Šta je potrebno za korištenje?", a: "Aktivna Premium pretplata." },
    ],
  },
  "module-video": {
    name: "Video konverter",
    what: ["Premium modul za konverziju video datoteka između formata MP4, MOV, AVI, WEBM, MKV i FLV. Gdje je moguće, obrada se izvršava u pregledniku, a u ostalim slučajevima na serveru."],
    steps: ["Prijavite se sa aktivnom Premium pretplatom.", "Dodajte video datoteku.", "Izaberite ciljni format.", "Preuzmite konvertovanu datoteku."],
    benefits: ["Podržani su najčešći video formati.", "Serverski rezultati se brišu u okviru dnevnog čišćenja.", "Jednostavan tok bez instalacije."],
    faq: [
      { q: "Koji su formati podržani?", a: "MP4, MOV, AVI, WEBM, MKV i FLV." },
      { q: "Zašto je konverzija spora?", a: "Veliki video zahtijeva dosta obrade. Za brže rezultate koristite manje datoteke." },
    ],
  },
};

export const getToolGuide = (id?: string): ToolGuide | undefined => (id ? TOOL_GUIDES[id] : undefined);

/** Mapira rutu (sa ili bez ?tab=) na ID uputstva. */
export const guideIdForPath = (fullPath: string): string | undefined => {
  const [path, query = ""] = fullPath.split("?");
  const tab = new URLSearchParams(query).get("tab");
  let match: RegExpMatchArray | null;

  if (path === "/category/generatori") return `generator-${tab && TOOL_GUIDES[`generator-${tab}`] ? tab : "uuid"}`;
  if (path === "/category/konvertori") return `converter-${tab && TOOL_GUIDES[`converter-${tab}`] ? tab : "unit"}`;
  if (path === "/category/kalkulatori") return "category-kalkulatori";
  if (path === "/category/testovi" || path === "/testovi") return "category-testovi";
  if ((match = path.match(/^\/kalkulatori\/([^/]+)$/))) return TOOL_GUIDES[`calculator-${match[1]}`] ? `calculator-${match[1]}` : undefined;
  if ((match = path.match(/^\/testovi\/([^/]+)$/))) return TOOL_GUIDES[`test-${match[1]}`] ? `test-${match[1]}` : undefined;
  if ((match = path.match(/^\/alati\/([^/]+)$/))) return TOOL_GUIDES[`alati-${match[1]}`] ? `alati-${match[1]}` : undefined;
  if ((match = path.match(/^\/modul\/([^/]+)$/))) return TOOL_GUIDES[`module-${match[1]}`] ? `module-${match[1]}` : undefined;
  if (path === "/slika-pdf") return "slika-pdf";
  return undefined;
};
