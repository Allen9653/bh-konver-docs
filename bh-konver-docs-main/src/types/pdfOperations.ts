export type PDFOperation = 
  | "remove-watermark"
  | "add-watermark"
  | "rotate"
  | "compress-pdf"
  | "compress-jpeg"
  | "split-pdf"
  | "merge-pdf";

export interface PDFOperationConfig {
  operation: PDFOperation;
  displayName: string;
  description: string;
  requiresMultipleFiles?: boolean;
  supportsRotation?: boolean;
}

export const PDF_OPERATIONS: Record<PDFOperation, PDFOperationConfig> = {
  "remove-watermark": {
    operation: "remove-watermark",
    displayName: "Izbriši Watermark",
    description: "Uklonite watermark iz PDF dokumenta"
  },
  "add-watermark": {
    operation: "add-watermark",
    displayName: "Dodaj Watermark",
    description: "Dodajte vlastiti watermark na PDF"
  },
  "rotate": {
    operation: "rotate",
    displayName: "Rotiraj Dokument",
    description: "Rotirajte stranice dokumenta",
    supportsRotation: true
  },
  "compress-pdf": {
    operation: "compress-pdf",
    displayName: "Compress PDF",
    description: "Smanjite veličinu PDF fajla"
  },
  "compress-jpeg": {
    operation: "compress-jpeg",
    displayName: "Compress JPEG",
    description: "Smanjite veličinu JPEG slike"
  },
  "split-pdf": {
    operation: "split-pdf",
    displayName: "Split PDF",
    description: "Podijelite PDF na više fajlova"
  },
  "merge-pdf": {
    operation: "merge-pdf",
    displayName: "Merge PDF",
    description: "Spojite više PDF fajlova u jedan",
    requiresMultipleFiles: true
  }
};
