# Design Log

## The world we're borrowing from

The people who read this product's screens all day live inside **survey drawings, site plans, rent rolls, and lease redlines**. Their reference documents are cool, technical, drafted, and dense with numbers. If we ship the AI-default look (warm cream + serif + terracotta accent), we look like a marketing landing page and their eyes will glaze. The look has to belong on the same desk as a Phase II ESA report.

Direction, in one sentence: **ink and blueprint, not cream and clay.**

## Three defaults rejected (per brief §4)

1. **Warm cream (#F4F1EA) + high-contrast serif + terracotta accent (#D97757).** Anthropic's own accent — reads as a tell. Wrong domain, and the last product Kyle would want on the same screen as a signed CAM reconciliation.
2. **Near-black with one acid-green accent.** Terminal-hacker vibe. Kyle is not a developer, and this product's job is trust, not swagger.
3. **Broadsheet hairline-rule newspaper columns.** Editorial. Wrong tempo — we need tables, not articles.

## Palette (locked)

Cool greys and blueprint blue. Every colour name earns its keep — no vanity tokens.

```
--ink:        #111820   /* primary text, dark surfaces */
--slate:      #38475A   /* secondary text, borders on dark */
--blueprint:  #23486E   /* primary action, links, active nav */
--paper:      #ECEEF1   /* app background — cool grey, not cream */
--card:       #F8F9FA   /* raised surfaces */
--rule:       #C9CFD7   /* hairlines, table borders */
--pass:       #2E6A57   /* deterministic pass */
--fail:       #9E3520   /* deterministic fail / hard-filter kill */
--na:         #8A929C   /* criterion does not apply — MUST be visually distinct */
--signal:     #B57516   /* flags, warnings, "review this" */
```

Contrast check (against `--paper` #ECEEF1):
- `--ink` (#111820): ~15.4:1 — AAA
- `--slate` (#38475A): ~7.6:1 — AAA
- `--blueprint` (#23486E): ~8.4:1 — AAA
- `--pass` (#2E6A57): ~5.2:1 — AA large + normal body
- `--fail` (#9E3520): ~5.3:1 — AA
- `--signal` (#B57516): ~4.7:1 — AA normal body (borderline; used sparingly with icon reinforcement)
- `--na` (#8A929C): ~2.6:1 — used only for non-text glyphs and secondary rule; every na cell has a text label "does not apply" in `--slate`.

## Type roles (locked)

- **Display:** `Archivo` (variable, wide weights). Only for page titles, big funnel counts, and small-caps eyebrow labels. Tight tracking; uppercase only where it's a section label.
- **Body:** `Public Sans` (variable). Neutral, generous small-size legibility. Rejected Inter because it's the AI-default choice and reads as generic.
- **Data:** `IBM Plex Mono` (regular + medium). Every currency figure, sqft, PSF, date, unit number, and score. Tabular numerals everywhere via `font-variant-numeric: tabular-nums`. This is the most identity-defining choice in the product.

Delivery: **self-hosted `.woff2`** in `public/fonts/`. Never a CDN, never `next/font` from Google (network at build/runtime). See `public/fonts/README.md` for the exact files.

## The signature

Everything else in the app is quiet so the **criteria matrix** is what a reviewer remembers. The matrix's rules:

- Every one of the 52 criteria renders on every candidate. No collapse, no omission. `does not apply` is a first-class outcome with its own glyph AND the words.
- Deterministic marks: filled square (pass), hollow square with slash (fail), muted diamond (n/a). Hard geometric — no dot, no check, no emoji.
- AI marks: 5-segment horizontal bar, filled to score, numeric 1–5 tabular next to it.
- Provenance chip on every row: `deterministic` (small square + label) vs `AI-scored` (small bar icon + label). The legend explains why they look different in one sentence, because that legend is the trust argument.

## Motion

One orchestrated moment: the pipeline run. Stages settle in sequence, log lines append, funnel counts count down from 400. Everything else: 120ms hover/press. `prefers-reduced-motion: reduce` disables the counting animation and stage settle; log lines still append immediately.

## What did NOT get built

- No icon-heavy nav. Typographic labels win in a dense product.
- No global chart dashboard on the home screen. Two charts total in the whole app (rent-over-time in B, funnel in A).
- No hero image on login. A private tool doesn't need a hero.

---

## Redesign — 13 Aug 2026

### Why

Original palette ("ink and blueprint") was the correct opening move for a technical evaluator, but too clinical for the non-technical end user. The buyer signalled a wish for more warmth and life without losing the seriousness. The redesign shifts the aesthetic **from engineering-drawing severity to designed-professional-tool** — Linear's density with Airbnb's warmth and Stripe Dashboard's typographic care — while keeping every trust-critical detail intact.

### Palette shift

Token names preserved so every existing reference resolves; only values changed.

- **Surface warmth.** `--paper` from `#eceef1` (cool grey) → `#f7f5f1` (warm off-white). `--card` bumped to pure white for stronger contrast against warm paper. `--rule` softened and warmed to `#e4e0da`.
- **Ink warmed.** `#111820` → `#1e1b18` — no longer blue-black, sits better next to warm paper.
- **Primary accent shifted from blueprint blue to deep teal.** `--blueprint` `#23486e` → `#1f5a6d`. Same token name, more grown-up hue. Added `--blueprint-tint` for tinted backgrounds.
- **Per-section accent identity added.** `--accent-acq` deep violet (Acquisitions), `--accent-lea` amber (Leasing), `--accent-know` teal (Knowledge). Each with a matching tint. Used sparingly — sidebar active-item bars, stat-block icon backgrounds, source chips on Attention items. Never used as body colour.
- **State colours** friendlier and more saturated but still grown-up. `--pass` deeper green, `--fail` warmer red-brick, `--signal` amber with more life.
- **Shadow tokens introduced.** `--shadow-sm/md/lg` soft warm shadows replace hairline-only surfaces on raised cards.

### Primitives really overhauled

- `globals.css` — full token rewrite, new `.card` and `.card-lift` utilities, section accent-bar utilities, running-shimmer + live-pulse keyframes.
- `Sidebar.tsx` — icon per nav item (lucide), grouped by heading (Overview / Workflows / Reference / System), active-item left accent bar in the section's colour.
- `Topbar.tsx` — taller (60px), spotlight-style search chip, gradient avatar mixing the two workspace-y accents.
- `StatBlock.tsx` — proper cards with icon chip in section colour + bottom accent bar that grows on hover; `card-lift` translate-Y hover.
- `home/page.tsx` — hero band with soft radial-tint background, larger typography, "workspace synced" live-pulse indicator, redesigned Attention list (severity bars + surface chips), reports as tile grid, right-rail "What this workspace knows" with icon.
- `login/page.tsx` — ambient two-tone background wash, softer inputs with focus ring, three trust marker chips (SOC 2 / Encrypted / Single-tenant).
- `ProvenanceChip.tsx` — tighter labels ("Det" / "AI"), consistent rounded-md shape.
- `CriteriaMatrix.tsx` — group headers get a coloured left band per group, sticky header has a subtle shadow when sticky, fail-row uses a left accent bar instead of full-row tint.
- `FunnelDiagram.tsx` — bars use a horizontal gradient, "− N dropped" microcopy between stages, final stage number bigger to feel triumphant.
- `StageRow.tsx` — running stage gets a `running-shimmer` on its left border, log panel has a fade-to-ink gradient at the bottom, chevron indicator for expandable state.
- `EmptyState.tsx` — larger padding, primary button has real shadow lift on hover.

### What was preserved (deliberately)

- The criterion glyph language (filled square = pass, hollow-square-with-slash = fail, muted diamond = does not apply, 5-segment bar = AI score). This is the trust argument — softening these would undermine the whole "deterministic vs AI" distinction.
- All 52 criteria still render for every candidate, including "does not apply" — never collapsed, never hidden.
- Monospaced tabular numerals everywhere for money, sqft, PSF, dates, scores.
- The "no autonomy" copy — every framed note on Expiry Watch, the Run pipeline button subtitle, and the recommendation cards is untouched.
- Fixtures, engines, API layer, and types — zero changes.

### Verification

- `pnpm typecheck` — clean
- `pnpm build` — clean, 27 routes
- `pnpm dev` — `/login`, `/home`, `/leasing`, `/acquisitions`, `/knowledge/retailers` all return 200
