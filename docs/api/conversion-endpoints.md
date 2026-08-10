# BH KONVER — Conversion API

Server-side conversion endpoints. All three endpoints share the same conventions:
authentication, limits, error codes and response envelope.

Base URL: `https://<project-ref>.supabase.co/functions/v1`

## Common conventions

### Authentication
Every request requires a logged-in user's JWT:

```
Authorization: Bearer <SUPABASE_ACCESS_TOKEN>
apikey: <SUPABASE_PUBLISHABLE_KEY>
```

Access rules:
- Admins bypass the paywall.
- All other users need an active (non-expired, completed) subscription, otherwise `402`.

### Limits
| Limit | Value |
| --- | --- |
| Max upload size | 50 MB |
| Max HTML source size | 5 MB |
| Max PDF pages (split) | 200 |
| Result signed URL lifetime | 900 s (15 min) |

Generated files are written to the private `user-documents` bucket and flagged for the
daily cleanup purge — links expire and files are deleted.

### Response envelope

Success (`html-to-pdf`, `html-to-docx`):
```json
{
  "status": "success",
  "file_url": "https://.../signed-url",
  "error": null,
  "filename": "ugovor.pdf",
  "storage_path": "<user-id>/converted/<uuid>_ugovor.pdf",
  "size_bytes": 48213,
  "expires_in": 900
}
```

Success (`split-pdf`):
```json
{
  "status": "success",
  "pages": [
    {
      "page": 1,
      "filename": "ugovor_stranica_1.pdf",
      "file_url": "https://.../signed-url",
      "storage_path": "<user-id>/converted/<uuid>_ugovor_stranica_1.pdf",
      "size_bytes": 10422,
      "expires_in": 900
    }
  ],
  "error": null,
  "total_pages": 12,
  "expires_in": 900
}
```

Error (all endpoints):
```json
{ "status": "error", "error": "Fajl nije validan PDF dokument.", "code": "INVALID_PDF", "pages": [] }
```
(`file_url: null` instead of `pages: []` on the HTML endpoints.)

### Shared error codes
| Code | HTTP | Meaning |
| --- | --- | --- |
| `UNAUTHENTICATED` | 401 | Missing `Authorization` header |
| `INVALID_SESSION` | 401 | Expired or invalid JWT |
| `SUBSCRIPTION_REQUIRED` | 402 | No active subscription (non-admin) |
| `METHOD_NOT_ALLOWED` | 405 | Non-POST request |
| `INVALID_CONTENT_TYPE` | 400 | Unsupported request content type |
| `INVALID_REQUEST_BODY` | 400 | Body could not be parsed |
| `FILE_TOO_LARGE` / `HTML_TOO_LARGE` | 413 | Over the size limit |
| `STORAGE_ERROR` | 500 | Upload or signed-URL creation failed |
| `INTERNAL_ERROR` | 500 | Unexpected failure |

---

## `POST /split-pdf`

Splits a multi-page PDF into one PDF per page.

**Request** — `multipart/form-data`

| Field | Type | Required | Description |
| --- | --- | --- | --- |
| `file` | File (`application/pdf`) | yes | Source document, ≤ 50 MB, ≤ 200 pages |
| `pages` | string | no | Selection such as `1,3,5-8`. Defaults to all pages |

**Specific error codes**

| Code | HTTP | Meaning |
| --- | --- | --- |
| `MISSING_FILE` | 400 | No `file` field |
| `EMPTY_FILE` | 400 | Zero-byte upload |
| `INVALID_PDF` | 400 | Missing `%PDF` header |
| `CORRUPT_PDF` | 400 | Document could not be parsed |
| `ENCRYPTED_PDF` | 400 | Password-protected document |
| `EMPTY_PDF` | 400 | Zero pages |
| `TOO_MANY_PAGES` | 413 | Over 200 pages |
| `INVALID_PAGE_RANGE` | 400 | `pages` selection out of bounds |

**Example**

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/split-pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -F "file=@ugovor.pdf" \
  -F "pages=1,3,5-8"
```

---

## `POST /html-to-pdf`

Renders HTML to a paginated A4 PDF (text/heading/list layout — the server has no browser
engine, so CSS layout and images are not reproduced; use the in-browser tool for pixel-perfect output).

**Request** — one of:

- `multipart/form-data`: `file` (HTML file) **or** `html` (+ optional `filename`)
- `application/json`: `{ "html": "<h1>...</h1>", "filename": "izvjestaj" }`
- `text/html`: raw HTML in the request body

**Specific error codes**

| Code | HTTP | Meaning |
| --- | --- | --- |
| `MISSING_HTML` | 400 | No HTML supplied |
| `EMPTY_HTML` | 400 | HTML has no text content |
| `MALFORMED_HTML` | 400 | Binary or unreadable input |

**Examples**

```bash
# JSON body
curl -X POST "https://<project-ref>.supabase.co/functions/v1/html-to-pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -H "Content-Type: application/json" \
  -d '{"html":"<h1>Izvjestaj</h1><p>Sadrzaj dokumenta.</p>","filename":"izvjestaj"}'

# File upload
curl -X POST "https://<project-ref>.supabase.co/functions/v1/html-to-pdf" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -F "file=@izvjestaj.html"
```

---

## `POST /html-to-docx`

Converts HTML to a Word document, mapping `h1–h4`, `p`, `li`, `blockquote`, `pre` and `td`
to matching Word paragraph styles.

**Request** — identical to `html-to-pdf` (multipart, JSON, or raw `text/html`).

**Specific error codes** — identical to `html-to-pdf`.

**Example**

```bash
curl -X POST "https://<project-ref>.supabase.co/functions/v1/html-to-docx" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "apikey: $PUBLISHABLE_KEY" \
  -F "file=@izvjestaj.html"
```

**Downloading a result**

```bash
curl -L "<file_url>" -o rezultat.docx
```
