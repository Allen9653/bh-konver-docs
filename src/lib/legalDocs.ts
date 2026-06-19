// Catalog of BiH legal documents (Pravni dokumenti i izjave).
// UI labels are in Bosnian; field keys/IDs are English for AI/code consistency.

export type LegalFieldType = "text" | "textarea" | "date" | "select" | "number";

export interface LegalField {
  key: string;
  label: string;
  type: LegalFieldType;
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  help?: string;
}

export interface LegalDoc {
  id: string;
  // Localized BiH terminology — prefer "Ovjerena izjava" over "Affidavit".
  title: string;
  shortTitle: string;
  description: string;
  premium: boolean;
  // When true, a wizard is implemented; otherwise we show a "coming soon" placeholder.
  implemented: boolean;
  fields?: LegalField[];
  // Renders the body of the document. Receives form values keyed by field.key.
  body?: (values: Record<string, string>) => string;
}

export interface LegalCategory {
  id: string;
  title: string;
  description: string;
  docs: LegalDoc[];
}

// BiH entities — used in the entity selector.
export const BIH_ENTITIES = [
  { value: "FBiH", label: "Federacija Bosne i Hercegovine (FBiH)" },
  { value: "RS", label: "Republika Srpska (RS)" },
  { value: "BD", label: "Brčko Distrikt BiH" },
];

const commonIdentityFields: LegalField[] = [
  { key: "fullName", label: "Ime i prezime davatelja izjave", type: "text", required: true, placeholder: "npr. Amir Hodžić" },
  { key: "jmbg", label: "JMBG", type: "text", required: true, placeholder: "13-cifreni JMBG" },
  { key: "address", label: "Adresa prebivališta", type: "text", required: true, placeholder: "Ulica i broj, mjesto" },
  { key: "entity", label: "Entitet / Distrikt", type: "select", required: true, options: BIH_ENTITIES },
  { key: "idNumber", label: "Broj lične karte", type: "text", required: true },
  { key: "idIssuedBy", label: "Lična karta izdata od", type: "text", required: true, placeholder: "npr. MUP KS Sarajevo" },
];

export const LEGAL_CATEGORIES: LegalCategory[] = [
  {
    id: "standard",
    title: "Standardne izjave",
    description: "Ovjerene izjave date pod materijalnom i kaznenom odgovornošću.",
    docs: [
      {
        id: "domicile",
        title: "Ovjerena izjava o prebivalištu",
        shortTitle: "Izjava o prebivalištu",
        description: "Izjava kojom potvrđujete adresu prebivališta u BiH.",
        premium: false,
        implemented: true,
        fields: [
          ...commonIdentityFields,
          { key: "residenceSince", label: "Prebivalište od (datum)", type: "date", required: true },
          { key: "purpose", label: "Svrha izdavanja izjave", type: "textarea", required: true, placeholder: "npr. potrebe banke, suda, škole..." },
        ],
        body: (v) =>
`Ja, ${v.fullName || "_______________"}, JMBG ${v.jmbg || "_______________"}, sa prebivalištem na adresi ${v.address || "_______________"} (${v.entity || "_____"}), nosilac lične karte broj ${v.idNumber || "_______________"} izdate od strane ${v.idIssuedBy || "_______________"},

pod punom materijalnom i kaznenom odgovornošću izjavljujem:

Da imam prijavljeno prebivalište na navedenoj adresi neprekidno od ${v.residenceSince || "_______________"} godine.

Izjava se izdaje u svrhu: ${v.purpose || "_______________"}.`,
      },
      {
        id: "identity",
        title: "Ovjerena izjava o identitetu",
        shortTitle: "Izjava o identitetu",
        description: "Potvrda osobnih podataka i identiteta u skladu sa zakonima BiH.",
        premium: false,
        implemented: true,
        fields: [
          ...commonIdentityFields,
          { key: "dateOfBirth", label: "Datum rođenja", type: "date", required: true },
          { key: "placeOfBirth", label: "Mjesto rođenja", type: "text", required: true },
          { key: "citizenship", label: "Državljanstvo", type: "text", required: true, placeholder: "BiH" },
          { key: "purpose", label: "Svrha izjave", type: "textarea", required: true },
        ],
        body: (v) =>
`Ja, ${v.fullName || "_______________"}, rođen/a ${v.dateOfBirth || "_______________"} u mjestu ${v.placeOfBirth || "_______________"}, državljanin/ka ${v.citizenship || "BiH"}, JMBG ${v.jmbg || "_______________"}, sa prebivalištem na adresi ${v.address || "_______________"} (${v.entity || "_____"}),

pod punom materijalnom i kaznenom odgovornošću izjavljujem:

Da su gore navedeni podaci o mom identitetu istiniti i tačni, te da odgovaraju podacima iz lične karte broj ${v.idNumber || "_______________"} izdate od ${v.idIssuedBy || "_______________"}.

Izjava se izdaje u svrhu: ${v.purpose || "_______________"}.`,
      },
      {
        id: "gift",
        title: "Izjava o poklonu (Ugovor o poklonu)",
        shortTitle: "Izjava o poklonu",
        description: "Izjava darodavca o prenosu pokretne imovine bez naknade.",
        premium: false,
        implemented: true,
        fields: [
          { key: "donorName", label: "Darodavac - ime i prezime", type: "text", required: true },
          { key: "donorJmbg", label: "Darodavac - JMBG", type: "text", required: true },
          { key: "donorAddress", label: "Darodavac - adresa", type: "text", required: true },
          { key: "doneeName", label: "Obdarenik - ime i prezime", type: "text", required: true },
          { key: "doneeJmbg", label: "Obdarenik - JMBG", type: "text", required: true },
          { key: "doneeAddress", label: "Obdarenik - adresa", type: "text", required: true },
          { key: "relationship", label: "Srodstvo (ako postoji)", type: "text", placeholder: "npr. otac - sin" },
          { key: "giftDescription", label: "Opis predmeta poklona", type: "textarea", required: true, placeholder: "npr. vozilo marke ..., novčani iznos ..., nekretnina ..." },
          { key: "giftValue", label: "Procijenjena vrijednost (KM)", type: "number", required: true },
          { key: "entity", label: "Entitet / Distrikt", type: "select", required: true, options: BIH_ENTITIES },
        ],
        body: (v) =>
`Ja, ${v.donorName || "_______________"}, JMBG ${v.donorJmbg || "_______________"}, sa prebivalištem na adresi ${v.donorAddress || "_______________"}, kao DARODAVAC,

dajem na poklon, bez ikakve naknade, obdareniku ${v.doneeName || "_______________"}, JMBG ${v.doneeJmbg || "_______________"}, sa prebivalištem ${v.doneeAddress || "_______________"}${v.relationship ? ` (srodstvo: ${v.relationship})` : ""}, sljedeće:

${v.giftDescription || "_______________"}

Procijenjena vrijednost poklona iznosi ${v.giftValue || "______"} KM (konvertibilnih maraka).

Obdarenik izjavljuje da prima navedeni poklon i da je upoznat sa svojim pravima i obavezama u skladu sa pozitivnim propisima ${v.entity || "BiH"}.

Ova izjava je sačinjena u skladu sa Zakonom o obligacionim odnosima koji se primjenjuje na teritoriji Bosne i Hercegovine.`,
      },
      {
        id: "service",
        title: "Ovjerena izjava o uručenju",
        shortTitle: "Izjava o uručenju",
        description: "Potvrda o uručenju dokumenata ili pošiljke određenom licu.",
        premium: false,
        implemented: false,
      },
      {
        id: "title",
        title: "Ovjerena izjava o vlasništvu",
        shortTitle: "Izjava o vlasništvu",
        description: "Izjava o pravu vlasništva nad pokretnom ili nepokretnom imovinom.",
        premium: true,
        implemented: false,
      },
      {
        id: "death",
        title: "Izjava o smrti (svjedočanstvo)",
        shortTitle: "Izjava o smrti",
        description: "Izjava svjedoka o smrti pravnog ili fizičkog lica.",
        premium: true,
        implemented: false,
      },
    ],
  },
  {
    id: "business-employment",
    title: "Poslovne i radne izjave",
    description: "Izjave vezane uz poslovanje, registraciju djelatnosti i radne odnose.",
    docs: [
      {
        id: "business",
        title: "Poslovna izjava (Business)",
        shortTitle: "Poslovna izjava",
        description: "Izjave za potrebe registracije, partnerstva i poslovne saradnje.",
        premium: true,
        implemented: false,
      },
      {
        id: "employment",
        title: "Izjava o radnom odnosu",
        shortTitle: "Radna izjava",
        description: "Potvrda o zaposlenju, naknadama i obavezama poslodavca/zaposlenika.",
        premium: true,
        implemented: false,
      },
    ],
  },
  {
    id: "personal-finance",
    title: "Lične i finansijske izjave",
    description: "Porodične, finansijske i izjave prema državnim organima u BiH.",
    docs: [
      {
        id: "family",
        title: "Porodična izjava",
        shortTitle: "Porodična izjava",
        description: "Izjave o porodičnim odnosima, izdržavanju i starateljstvu.",
        premium: false,
        implemented: false,
      },
      {
        id: "finance",
        title: "Finansijska izjava",
        shortTitle: "Finansijska izjava",
        description: "Izjave o prihodima, dugovanjima i finansijskoj sposobnosti.",
        premium: true,
        implemented: false,
      },
      {
        id: "government",
        title: "Izjava prema državnim organima",
        shortTitle: "Izjava - državni organi",
        description: "Izjave za potrebe institucija FBiH, RS i Brčko Distrikta.",
        premium: false,
        implemented: false,
      },
    ],
  },
  {
    id: "commercial",
    title: "Trgovačke izjave",
    description: "Izjave vezane uz kupoprodaju i komercijalne transakcije.",
    docs: [
      {
        id: "purchase-sale",
        title: "Izjava o kupoprodaji",
        shortTitle: "Kupoprodaja",
        description: "Izjava o kupoprodaji pokretne imovine (vozila, opreme, itd.).",
        premium: true,
        implemented: false,
      },
    ],
  },
];

export const findDoc = (docId: string): LegalDoc | undefined => {
  for (const cat of LEGAL_CATEGORIES) {
    const found = cat.docs.find((d) => d.id === docId);
    if (found) return found;
  }
  return undefined;
};
