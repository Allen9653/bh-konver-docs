## 1. Audit — trenutno stanje aplikacije

Pregledao sam `src/utils/clientConverter.ts`, `src/components/PDFToolsInterface.tsx`, `src/types/pdfOperations.ts`, `src/pages/Index.tsx` i `package.json`. Već su instalirani: **pdf-lib, pdfjs-dist, docx, jszip, cyrillic-to-translit-js**.

| Feature iz vaše liste | Trenutno stanje | Radi bez registracije? |
|---|---|---|
| **JPG/PNG → PDF** | ✅ Implementirano 100% klijentski (pdf-lib) | ❌ Zaključano paywall-om |
| **PDF → JPEG** | ✅ Klijentski (pdfjs) | ❌ Zaključano paywall-om |
| **PDF → Word (DOCX)** | ⚠️ Samo preko Cloudmersive (plaćeni server) | ❌ Ne |
| **Word → PDF** | ⚠️ Samo preko Cloudmersive | ❌ Ne |
| **Excel → PDF** | ⚠️ Samo preko Cloudmersive | ❌ Ne |
| **PPTX → PDF** | ⚠️ Samo preko Cloudmersive | ❌ Ne |
| **Latinica ↔ Ćirilica** | ❌ Biblioteka instalirana ali nema korisničkog alata (samo language switcher) | — |
| **Merge PDF** | ⚠️ Postoji UI ali zove Cloudmersive (može 100% klijentski) | ❌ Zaključano paywall-om |
| **Split PDF** | ⚠️ Postoji UI ali zove Cloudmersive (može 100% klijentski) | ❌ Zaključano paywall-om |
| **"100% Besplatno / Bez registracije"** | ❌ Trenutno svaka konverzija traži login + aktivnu pretplatu | — |

**Strateški konflikt koji moram istaknuti:** Cijela aplikacija je trenutno postavljena kao **subscription-only** (paywall u `Index.tsx` linija 109 i u edge funkciji `convert-document`). Vaš novi launch zahtjev "100% Besplatno, Bez registracije" je suprotan postojećoj poslovnoj logici. U planu ispod predlažem da **launch tools (sa vaše liste) budu javni i besplatni**, dok ostali napredni alati (audio/video, batch, async server konverzije) ostaju iza pretplate. Tako čuvate prihod i istovremeno dobijate "free hook" za javnu aktivaciju.

---

## 2. Plan implementacije

### Korak 1 — Novi modul "Launch Tools" (bez login-a)

Nova ruta **`/alati`** (i CTA dugme na hero sekciji) sa karticama za svaki alat. Renderuje se **bez `useAdminAuth` paywall provjere**. Postojeći `Index.tsx` modules ostaju za premium korisnike.

```text
┌──────────────── HERO ──────────────────┐
│  100% BESPLATNO · BEZ REGISTRACIJE     │
│  [Otvori besplatne alate →]            │
└────────────────────────────────────────┘
┌─ KONVERZIJA FORMATA ─┐ ┌─ KONVERZIJA PISMA ─┐
│ PDF → Word           │ │ Latinica ↔ Ćirilica│
│ Word → PDF           │ └────────────────────┘
│ JPG/PNG → PDF        │ ┌─ DODATNI ALATI ────┐
│ Excel → PDF          │ │ Merge PDF          │
│ PPTX → PDF           │ │ Split PDF          │
└──────────────────────┘ └────────────────────┘
```

### Korak 2 — Klijentske implementacije (bez plaćenih API-ja)

| Alat | Biblioteka | Realna fidelity |
|---|---|---|
| **JPG/PNG → PDF** | pdf-lib (već postoji) | Visoka |
| **Word → PDF** | mammoth.js → HTML → html2pdf.js/jsPDF | Srednja (preserve bold/italic/headings/lists/tabele) |
| **PDF → Word** | pdfjs-dist (extract text + layout) → docx | **Niska–srednja** (vraća tekst sa paragrafima, gubi kompleksan layout). Iskreno označiti u UI: *"Tekstualna konverzija — kompleksno formatiranje može biti pojednostavljeno"* |
| **Excel → PDF** | xlsx (SheetJS Community) → HTML tabela → jsPDF | Srednja (vrijednosti + osnovno formatiranje, gubi grafikone) |
| **PPTX → PDF** | ⚠️ **Nemoguće dobro u browseru.** Plan: prikazati alat sa porukom *"Za PPTX → PDF preporučujemo besplatni server-side rendering"* + dugme koje koristi postojeću Cloudmersive edge funkciju **bez paywall-a** (samo za ovaj alat) ili LibreOffice headless edge funkcija (vidi Korak 4). |
| **Latinica → Ćirilica** | cyrillic-to-translit-js (već instalirano) + mapping za bosanski (č,ć,š,ž,đ,dž,lj,nj) | Visoka. Real-time tekstualno polje + file upload (.txt, .docx via mammoth) |
| **Merge PDF** | pdf-lib — `copyPages` (već poznato pdf-lib API) | Visoka, 100% klijentski |
| **Split PDF** | pdf-lib — kreira pojedinačne PDF-ove, pakuje u ZIP (jszip već instalirano) | Visoka, 100% klijentski |

Nove dependency: **`mammoth`**, **`xlsx`**, **`jspdf`**, **`html2canvas`** (za jsPDF rendering tabela).

### Korak 3 — Refactor postojećih Merge/Split

Trenutni `PDFToolsInterface.tsx` zove `pdf-operations` edge funkciju za merge/split. Premjestit ću ih na 100% klijentsku obradu preko pdf-lib + jszip. Edge funkcija ostaje za watermark/compress/rotate (premium).

### Korak 4 — PPTX → PDF (preporuka)

Pošto Cloudmersive je već povezan i radi za PPTX, predlažem dvije opcije:
- **A (brže za launch):** Zadržati Cloudmersive ali bez paywall-a samo za ovu jednu konverziju (rate-limit po IP-u u edge funkciji da kontroliše trošak).
- **B (dugoročno besplatno):** Nova edge funkcija sa **LibreOffice headless** kontejnerom (otvoreni izvor, bez API troška). Zahtijeva dodatni Supabase Edge runtime image — komplikovanije za prvi launch.

**Preporuka:** krenuti sa A i u UI naglasiti "Beta" oznaku.

### Korak 5 — UI/UX (iLovePDF-style, BH market)

- Nova `src/pages/Alati.tsx` ruta, dodana u `App.tsx` router.
- Nova komponenta `src/components/FreeToolCard.tsx` (Lucide ikona, naslov, opis, "Besplatno" badge — accent gold hsl(43 96% 56%)).
- Nove komponente po alatu u `src/components/free-tools/`: `WordToPdf.tsx`, `PdfToWord.tsx`, `ImagesToPdf.tsx`, `ExcelToPdf.tsx`, `PptxToPdf.tsx`, `ScriptConverter.tsx`, `MergePdf.tsx`, `SplitPdf.tsx`.
- Drag&drop (postojeći `PremiumDropzone`), progress bar (postojeći `StepProgress`), preview + Download dugme.
- Hero banner na homepage: "100% Besplatno · Bez registracije" badge + CTA dugme `Otvori besplatne alate`.
- Sve responzivno (mobile-first, već u Tailwind setupu).
- i18next ključevi za sve 4 jezika (bs, en, de, tr).

### Korak 6 — Validacija

- Build provjera (TS strict).
- Smoke test: na svakom alatu uploadati jedan fajl, potvrditi download.
- Sigurnost: klijentski alati ne dotiču Supabase Storage (privacy-first u skladu sa core memory).

---

## 3. Detalji za vas (netehnički)

- **Šta dobijate odmah:** 7 od 8 alata iz vaše liste rade 100% u pretraživaču, bez troška, bez registracije.
- **Jedini izuzetak:** **PPTX → PDF** — fizički nije moguće kvalitetno uraditi samo u browseru. Predlažem da privremeno koristi vašu postojeću Cloudmersive vezu (već plaćate je) sa "Beta" oznakom dok ne pređemo na LibreOffice.
- **Postojeći premium tok (audio/video/batch) ostaje netaknut** — i dalje generiše prihod od pretplata.
- **Vreme:** sve gore navedeno mogu implementirati u ovoj sesiji jednim potezom.

---

## 4. Pitanja prije nego krenem

1. **PPTX → PDF:** Opcija A (Cloudmersive, besplatno za korisnika, mali trošak na vašoj strani) ili sakriti alat dok ne uvedemo LibreOffice?
2. **PDF → Word fidelity:** Da li je u redu da bude "tekstualna" konverzija (vraća sadržaj u .docx ali bez kompleksnog layouta)? To je realna granica besplatne klijentske obrade.
3. **Paywall:** Potvrđujete da launch alati iz ove liste idu **potpuno besplatno bez login-a**, a premium ostaje za audio/video/batch?
