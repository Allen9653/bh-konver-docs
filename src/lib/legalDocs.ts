// Catalog of BiH legal documents (Pravni dokumenti i izjave).
// All user-facing labels are i18n keys (namespace: `legal.*`) so the wizard is
// fully localized (BS, BS-Cyrl, EN, DE, TR). Field keys/IDs stay English.
// NOTE: `body()` renders the legally binding document text, which must remain in
// Bosnian to stay valid before BiH authorities (notar / općina / sud).

export type LegalFieldType = "text" | "textarea" | "date" | "select" | "number";

export interface LegalField {
  key: string;
  /** i18n key for the field label */
  labelKey: string;
  type: LegalFieldType;
  /** i18n key for the placeholder */
  placeholderKey?: string;
  required?: boolean;
  options?: { value: string; labelKey: string }[];
  /** i18n key for the helper text */
  helpKey?: string;
}

export interface LegalDoc {
  id: string;
  /** i18n key — localized BiH terminology, prefer "Ovjerena izjava" over "Affidavit". */
  titleKey: string;
  shortTitleKey: string;
  descriptionKey: string;
  premium: boolean;
  // When true, a wizard is implemented; otherwise we show a "coming soon" placeholder.
  implemented: boolean;
  fields?: LegalField[];
  // Renders the body of the document. Receives form values keyed by field.key.
  body?: (values: Record<string, string>) => string;
}

export interface LegalCategory {
  id: string;
  titleKey: string;
  descriptionKey: string;
  docs: LegalDoc[];
}

// BiH entities — used in the entity selector.
export const BIH_ENTITIES = [
  { value: "FBiH", labelKey: "legal.entities.FBiH" },
  { value: "RS", labelKey: "legal.entities.RS" },
  { value: "BD", labelKey: "legal.entities.BD" },
];

const commonIdentityFields: LegalField[] = [
  { key: "fullName", labelKey: "legal.fields.fullName", type: "text", required: true, placeholderKey: "legal.placeholders.fullName" },
  { key: "jmbg", labelKey: "legal.fields.jmbg", type: "text", required: true, placeholderKey: "legal.placeholders.jmbg" },
  { key: "address", labelKey: "legal.fields.address", type: "text", required: true, placeholderKey: "legal.placeholders.address" },
  { key: "entity", labelKey: "legal.fields.entity", type: "select", required: true, options: BIH_ENTITIES },
  { key: "idNumber", labelKey: "legal.fields.idNumber", type: "text", required: true },
  { key: "idIssuedBy", labelKey: "legal.fields.idIssuedBy", type: "text", required: true, placeholderKey: "legal.placeholders.idIssuedBy" },
];

export const LEGAL_CATEGORIES: LegalCategory[] = [
  {
    id: "standard",
    titleKey: "legal.categories.standard.title",
    descriptionKey: "legal.categories.standard.description",
    docs: [
      {
        id: "domicile",
        titleKey: "legal.docs.domicile.title",
        shortTitleKey: "legal.docs.domicile.shortTitle",
        descriptionKey: "legal.docs.domicile.description",
        premium: false,
        implemented: true,
        fields: [
          ...commonIdentityFields,
          { key: "residenceSince", labelKey: "legal.fields.residenceSince", type: "date", required: true },
          { key: "purpose", labelKey: "legal.fields.purpose", type: "textarea", required: true, placeholderKey: "legal.placeholders.purpose" },
        ],
        body: (v) =>
`Ja, ${v.fullName || "_______________"}, JMBG ${v.jmbg || "_______________"}, sa prebivalištem na adresi ${v.address || "_______________"} (${v.entity || "_____"}), nosilac lične karte broj ${v.idNumber || "_______________"} izdate od strane ${v.idIssuedBy || "_______________"},

pod punom materijalnom i kaznenom odgovornošću izjavljujem:

Da imam prijavljeno prebivalište na navedenoj adresi neprekidno od ${v.residenceSince || "_______________"} godine.

Izjava se izdaje u svrhu: ${v.purpose || "_______________"}.`,
      },
      {
        id: "identity",
        titleKey: "legal.docs.identity.title",
        shortTitleKey: "legal.docs.identity.shortTitle",
        descriptionKey: "legal.docs.identity.description",
        premium: false,
        implemented: true,
        fields: [
          ...commonIdentityFields,
          { key: "dateOfBirth", labelKey: "legal.fields.dateOfBirth", type: "date", required: true },
          { key: "placeOfBirth", labelKey: "legal.fields.placeOfBirth", type: "text", required: true },
          { key: "citizenship", labelKey: "legal.fields.citizenship", type: "text", required: true, placeholderKey: "legal.placeholders.citizenship" },
          { key: "purpose", labelKey: "legal.fields.purpose", type: "textarea", required: true, placeholderKey: "legal.placeholders.purpose" },
        ],
        body: (v) =>
`Ja, ${v.fullName || "_______________"}, rođen/a ${v.dateOfBirth || "_______________"} u mjestu ${v.placeOfBirth || "_______________"}, državljanin/ka ${v.citizenship || "BiH"}, JMBG ${v.jmbg || "_______________"}, sa prebivalištem na adresi ${v.address || "_______________"} (${v.entity || "_____"}),

pod punom materijalnom i kaznenom odgovornošću izjavljujem:

Da su gore navedeni podaci o mom identitetu istiniti i tačni, te da odgovaraju podacima iz lične karte broj ${v.idNumber || "_______________"} izdate od ${v.idIssuedBy || "_______________"}.

Izjava se izdaje u svrhu: ${v.purpose || "_______________"}.`,
      },
      {
        id: "gift",
        titleKey: "legal.docs.gift.title",
        shortTitleKey: "legal.docs.gift.shortTitle",
        descriptionKey: "legal.docs.gift.description",
        premium: false,
        implemented: true,
        fields: [
          { key: "donorName", labelKey: "legal.fields.donorName", type: "text", required: true },
          { key: "donorJmbg", labelKey: "legal.fields.donorJmbg", type: "text", required: true },
          { key: "donorAddress", labelKey: "legal.fields.donorAddress", type: "text", required: true },
          { key: "doneeName", labelKey: "legal.fields.doneeName", type: "text", required: true },
          { key: "doneeJmbg", labelKey: "legal.fields.doneeJmbg", type: "text", required: true },
          { key: "doneeAddress", labelKey: "legal.fields.doneeAddress", type: "text", required: true },
          { key: "relationship", labelKey: "legal.fields.relationship", type: "text", placeholderKey: "legal.placeholders.relationship" },
          { key: "giftDescription", labelKey: "legal.fields.giftDescription", type: "textarea", required: true, placeholderKey: "legal.placeholders.giftDescription" },
          { key: "giftValue", labelKey: "legal.fields.giftValue", type: "number", required: true },
          { key: "entity", labelKey: "legal.fields.entity", type: "select", required: true, options: BIH_ENTITIES },
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
        titleKey: "legal.docs.service.title",
        shortTitleKey: "legal.docs.service.shortTitle",
        descriptionKey: "legal.docs.service.description",
        premium: false,
        implemented: false,
      },
      {
        id: "title",
        titleKey: "legal.docs.title.title",
        shortTitleKey: "legal.docs.title.shortTitle",
        descriptionKey: "legal.docs.title.description",
        premium: true,
        implemented: false,
      },
      {
        id: "death",
        titleKey: "legal.docs.death.title",
        shortTitleKey: "legal.docs.death.shortTitle",
        descriptionKey: "legal.docs.death.description",
        premium: true,
        implemented: false,
      },
    ],
  },
  {
    id: "business-employment",
    titleKey: "legal.categories.businessEmployment.title",
    descriptionKey: "legal.categories.businessEmployment.description",
    docs: [
      {
        id: "business",
        titleKey: "legal.docs.business.title",
        shortTitleKey: "legal.docs.business.shortTitle",
        descriptionKey: "legal.docs.business.description",
        premium: true,
        implemented: false,
      },
      {
        id: "employment",
        titleKey: "legal.docs.employment.title",
        shortTitleKey: "legal.docs.employment.shortTitle",
        descriptionKey: "legal.docs.employment.description",
        premium: true,
        implemented: false,
      },
    ],
  },
  {
    id: "personal-finance",
    titleKey: "legal.categories.personalFinance.title",
    descriptionKey: "legal.categories.personalFinance.description",
    docs: [
      {
        id: "family",
        titleKey: "legal.docs.family.title",
        shortTitleKey: "legal.docs.family.shortTitle",
        descriptionKey: "legal.docs.family.description",
        premium: false,
        implemented: false,
      },
      {
        id: "finance",
        titleKey: "legal.docs.finance.title",
        shortTitleKey: "legal.docs.finance.shortTitle",
        descriptionKey: "legal.docs.finance.description",
        premium: true,
        implemented: false,
      },
      {
        id: "government",
        titleKey: "legal.docs.government.title",
        shortTitleKey: "legal.docs.government.shortTitle",
        descriptionKey: "legal.docs.government.description",
        premium: false,
        implemented: false,
      },
    ],
  },
  {
    id: "commercial",
    titleKey: "legal.categories.commercial.title",
    descriptionKey: "legal.categories.commercial.description",
    docs: [
      {
        id: "purchase-sale",
        titleKey: "legal.docs.purchaseSale.title",
        shortTitleKey: "legal.docs.purchaseSale.shortTitle",
        descriptionKey: "legal.docs.purchaseSale.description",
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
