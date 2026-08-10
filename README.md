# EM Real Estate — Private AI Workspace (Prototype)

A high-fidelity, fully clickable frontend prototype of a private AI workspace for **EM Real Estate**, a family-owned commercial real estate company operating 42 shopping centres in Eastern Canada. This is a **demo artifact** for a fixed-price sales conversation — every screen, table, funnel, matrix, ingest flow, financing model and export is real, but nothing hits a real backend, real AI, or a real file system.

---

## Run it

```bash
pnpm install
pnpm dev             # http://localhost:3000
```

Any valid-looking email and a ≥6-character password sign you in as Kyle.

```bash
pnpm build           # production build (zero TS errors, 27 routes)
pnpm typecheck       # tsc --noEmit strict
```

---

## What is mocked, and what would be real

The prototype has one architectural rule that matters more than any other:

**Components never touch fixtures directly.** They call async functions in `src/mock/api/*` that mirror a plausible real API surface. Swapping in a real backend later is editing those files only.

| Concern | Mocked as | Would-be-real replacement |
|---|---|---|
| Session | Zustand store, no server | Real auth + session cookies |
| Data reads | `mockDelay()` + typed fixtures in `src/mock/fixtures/*` | Real HTTP + database |
| Hard-filter search | **Real deterministic code** in `src/mock/engine/hardFilters.ts` over mock data | Same code, real data |
| Soft (AI) scoring | Pre-authored per (retailer, unit, criterion) via seeded hash in `softScores.ts` | Anthropic API with a proper prompt + rubric |
| Underwriting pipeline | An async generator emitting scripted stage events with real logs | Anthropic + document processors |
| Financing model | **Real math** in `financeModel.ts` (PMT, IRR by Newton, yearly amortization, sensitivity matrix) | Same code, unchanged |
| Excel export | **Real .xlsx with live formulas** (SheetJS). Changing LTV in Excel recomputes DSCR. | Same code |
| Word export | **Real .docx** (`docx` npm) | Same code |
| Data-room ingest | Simulated staged ingest with two deliberate failure paths (password-protected PDF, scan needing OCR) and a working OCR retry | A real document pipeline (OCR + parse + index) |
| Retailer refresh | Simulated `refreshVolatile()` async generator; user corrections in Zustand persist and are excluded from refresh | A scheduled scraper / data feed job |
| Global search | In-memory scan of all fixtures | Search index |

The prototype is **byte-identical** across reloads: one `seedrandom('em-2026')` instance powers every draw. Edits made during a session persist to Zustand and reset on reload — expected behavior for a prototype.

---

## Assumptions

These were noted in §12 of the build brief. Both are carried as documented assumptions rather than blockers:

1. **Word/Excel templates.** The client has proprietary underwriting and renewal templates that were not supplied for the demo. We ship a credible default layout and keep the export layer template-driven — swapping to a real template is editing `src/components/export/*` only.
2. **The 52 criteria.** The real criteria list is coming from the client. We ship 52 plausible small-town criteria and 31 major-city criteria in `src/mock/fixtures/criteriaSets.ts`, fully data-driven so replacing them requires no component changes.

---

## The three principles that shaped every design choice

Baked into the UI, not just the copy:

1. **AI reasons, extracts, scores, ranks — it never decides or acts.** Hard filters (legal restriction conflict, size band, required feature) are **real deterministic code**, not AI judgment. The `ProvenanceChip` labels each criterion as `Deterministic` or `AI-scored` everywhere it appears; the `CriteriaLegend` on every candidate page explains why they look different. A previous prototype used AI for these — got wrong answers — destroyed trust. We do not repeat that.
2. **No autonomy.** Every job is user-triggered. The pipeline runner shows "Every step is triggered by you. Nothing runs on its own." beneath the button. Expiry watch **notifies Kyle only** — never tenants, never third parties — and explicitly does not start a tenant search (a manual `Start tenant search →` link on every row is the handoff).
3. **The criteria matrix is the signature.** All 52 criteria render for every candidate. `Does not apply` is a first-class outcome with its own glyph and the words — never omitted. The failed-only filter reveals the pattern; the top-20 matrix view puts candidates as columns and criteria as rows for a memorable dense grid.

---

## Fonts

Self-hosted `.woff2` in `public/fonts/`:

- **Archivo** (display) — page titles, big numbers, eyebrow labels
- **Public Sans** (body) — everything else
- **IBM Plex Mono** (data) — every currency figure, sqft, PSF, date, unit number, score

If the `.woff2` files are missing the CSS falls back to a platform stack. See `public/fonts/README.md` and `src/app/globals.css`.

---

## Where the credibility details live

- **`src/app/(app)/leasing/search/[searchId]/[candidateId]/page.tsx`** — the criteria matrix. All 52 rows, every candidate. Filter for fails, copy assessment, provenance chips everywhere.
- **`src/app/(app)/acquisitions/[dealId]/data-room/page.tsx`** — folder drop, staged ingest, two failure paths, working OCR retry.
- **`src/app/(app)/acquisitions/[dealId]/model/page.tsx`** — real financing math, real live-formula .xlsx export.
- **`src/app/(app)/knowledge/retailers/page.tsx`** — 1,240 retailers virtualized. Inline edit any cell; corrections marked and preserved through simulated refresh.
- **`src/app/(app)/leasing/renewals/[renewalId]/page.tsx`** — document timeline, superseded clauses struck through with citation to the amendment.
- **`src/app/(app)/settings/security/page.tsx`** — the security story as a real screen, because security is the client's number-one requirement.

Read **`notes/DESIGN_LOG.md`** for the rejected AI-default looks and the palette decision.  
Read **`DEMO_SCRIPT.md`** for the 7-minute click path to a sales conversation.
