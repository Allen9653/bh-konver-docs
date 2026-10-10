# Project Architecture Rules

- PDF-to-Word exposes two explicit pipelines: a private client-side visual-copy DOCX and an authenticated PRO editable conversion, because visual fidelity and editability require different engines.
- DOCX previews use `docx-preview` for page-like rendering; Mammoth remains for semantic content conversion only, because it intentionally discards complex layout.
- Temporary server conversion results must create a cleanup job when stored, because the product promises daily document deletion.