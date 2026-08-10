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
