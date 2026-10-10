# BH KONVER — update 2 (vodiči, stabilizacija alata, UI/UX)

Osnova: commit 5a19a9f (tvoj "Add ToolInfoGuide component"). Ovaj paket sadrži i ranije SEO izmjene (index.html, sitemap, robots...), pa je kumulativan.

## Primjena
Iz korijena projekta (folder bh-konver-docs-main):  `patch -p1 < bh-konver-update-2.patch`
(`git apply` ne radi zbog relativnih putanja.) Ili prekopiraj sadržaj `files/` preko projekta.

## Stavka 1: ToolInfoGuide
- `src/components/ToolInfoGuide.tsx`: sekcije Šta je alat / Kako se koristi / Prednosti / FAQ (shadcn Accordion), uz FAQPage JSON-LD. Prima `toolId`. Zadržan je i API iz tvog commita (`title, description, steps, benefits, faqs`).
- `src/lib/toolGuides.ts`: 37 vodiča na bosanskom (8 konvertora, 4 generatora, 4 kalkulatora, 4 testa, 2 kategorije, 9 /alati alata, slika-pdf, 5 modula) + `guideIdForPath()`.
- i18n: naslovi sekcija prevedeni u 5 jezika (`toolGuide.*`). Sadržaj vodiča se može prevoditi pod `toolGuides.<id>`; dok nije preveden, prikazuje se bosanski.
- Uključeno na: hubove konvertora i generatora, kalkulatore, testove, kategorije, /alati/*, /slika-pdf, /modul/* i na Premium zaštitnu stranicu.

## Stavka 2: stabilizacija
- Rimski brojevi: datum s godinom van 1–3999 više ne prikazuje "null / null / null".
- Hidžretski: zaštita od izuzetaka (neispravan datum) + memoizacija petlje za pretragu.
- Valute: oštećen localStorage keš više ne ruši konverter, skeleton dok se kursevi učitavaju, poruka o grešci, dugme za kopiranje.
- Jedinice: prikaz simbola (m³, ft²) umjesto "m3", "ft2".
- ModulePage: nepoznat modul koristi `<Navigate>` umjesto `navigate()` u renderu (React greška u konzoli).
- Premium stranice bez prijave: statični primjer rezultata, opis, vodič, dugmad "Premium ponuda" i "Prijavi se". Uklonjeno je automatsko otvaranje paywall modala koje je prekrivalo pregled.

## Stavka 3: UI/UX
- `useCopyToClipboard` (toast uspjeha/greške + rezervni način kopiranja) u svim alatima s kopiranjem; toast pri preuzimanju QR/barkoda; loader za QR; `RouteFallback` skeleton.
- Navbar zna ko je prijavljen (Historija/Odjava umjesto stalnog Login/Sign Up); Footer na bosanskom, bez duplikata, s linkovima na PDF alate i Sliku u PDF; PremiumFooter ima iste kategorije; PremiumHeader više nema drugi h1.
- Veći dodirni ciljevi (min 40–44 px) na mobitelu.

## Provjera (šta jesam, a šta nisam)
- `tsc --noEmit`: bez grešaka (uključujući ranije postojeću u HomeModuleGrid).
- `vite build`: uspješan.
- ESLint: nema novih upozorenja ni grešaka u odnosu na stanje prije izmjena.
- SSR smoke-test (112 provjera): svi vodiči, 8 konvertora, 4 generatora, 4 kalkulatora, hubovi i kvizovi renderuju bez izuzetaka; mapiranje ruta → vodič ispravno.
- NIJE provjereno u pravom pregledniku (nema Playwright okruženja): toast, kopiranje, izgled na mobitelu i interakcije su pregledane kroz kod, ne vizuelno. Testiraj bar jednom na telefonu.
- Ispravka mojih ranijih SEO tekstova: pisalo je "besplatna dnevna kvota", a kod daje 2 besplatne probne konverzije ukupno (localStorage), pa je tekst promijenjen.

## Napomene
- `vite build` regeneriše `supabase/functions/mcp/index.ts` (Lovable plugin). To nije dio ovog paketa; ako ti se pojavi kao izmjena u gitu, nije moja.
- AdSense blokatori iz prvog izvještaja (ID, ads.txt, COEP, CMP) i backend CORS/redirect nalazi ostaju otvoreni.
