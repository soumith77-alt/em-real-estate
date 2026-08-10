# Demo Script — 7 minutes

For a live sales conversation with Jordan (technical intermediary) and Kyle (end user). Optimized to answer the three anxieties the client has already voiced: (1) confidentiality, (2) no autonomy, (3) memory. The signature moment is the criteria matrix — do not rush through it.

The seed is deterministic (`em-2026`), so every number below is what the demo will actually show.

---

## Before you start

- `pnpm dev`, browser at `http://localhost:3000`
- Sign in with any email + any 6+ character password (autofilled with `kyle@emrealestate.ca` and no password — type any 6 chars)
- Land on **Today**

---

## 0 · Set the frame (30s)

> "This is a private workspace. Everything you'll see runs on infrastructure EM controls. No document ever leaves your walls to a consumer AI product. We're going to walk through one acquisition and one tenant search, and I'll show you the memory piece at the end."

Point at the right rail on **Today** — *"What this workspace knows: 42 properties, 607 units, 573 tenancies, 1,240 retailers, 12 standing rules."*

---

## 1 · Tenant search (Workflow A) — the signature (2:30)

Sidebar → **Leasing** → land on the vacancy board.

> "45 units are vacant or under notice. Kyle will start a search on this one."

Click **Start tenant search** on a small-town unit (e.g. `prop-11 · Bulk Barn`-adjacent). On the config page:

1. Point at the **restrictions panel** — "This unit's property has 3 legal restrictions on file. Any retailer in one of those categories is going to fail deterministically, not because AI decided, because the code checked."
2. Show the criteria set toggle — "Two sets: 52 criteria for small-town, 31 for major-city. Not written into code."
3. Point at the starting pool — "1,240 retailers total, ~400 in scope for this format and province."

Click **Run search**.

On the results page:

- Point at the funnel: `1,240 → 400 in scope → 112 pass hard filters → 68 ranked`. *"Deterministic filters kill more than half. AI never touches those."*
- Toggle **Complete list (400)** — *"Nothing is hidden. If Kyle wants the whole list including who dropped and why, one click."*
- Drag one of the four weight sliders — the ranking recomputes live. *"Judgment lever, not a decision."*
- Toggle **Matrix view (top 20)** — hold on the dense grid for 3 seconds. *"This is what the product is really about."*

Click any top-ranked brand → **candidate detail page**.

- Say: *"This is the entire assessment. Every one of the 52 criteria, whether it applied or not."*
- Scroll to a `Does not apply` row — *"If the retailer doesn't need a drive-thru, we say so. We never hide it — that's how we lost trust before."*
- Point at a `Deterministic` chip and an `AI-scored` chip side by side — *"Different marks, different confidence, and the legend at the top explains why."*
- Point at a failed hard filter — *"The exact clause from the exact lease and page."*

---

## 2 · Acquisitions (Workflow — deal pipeline) (2:30)

Sidebar → **Acquisitions**. Click the deal in **Data room** stage — *"Carrefour Trois-Rivières Ouest, NDA signed 12 days ago."*

Tab: **Data room**.

- Show the messy folder tree — 90 files, real filenames.
- Point at the two attention items in the right rail: *"Every data room has files that don't ingest cleanly. One is password-protected — we ask the broker for it. One is a scan without a text layer — hit 'Send for OCR' and it comes back in a few seconds."*
- Actually click **Send for OCR** and let it resolve. Toast confirms.

Tab: **Run**.

- Point at the line under the button: *"Every step is triggered by you. Nothing runs on its own."*
- Click **Run underwriting**. Stages resolve in ~15s. Click into stage 5 to show the streaming log with citations.

Tab: **Report**.

- Executive summary → rent roll → red flags → recommendation. *"Every number has a source citation in the data room."*
- Click **Export to Word**. Real .docx downloads.

Tab: **Model**.

- Change LTV from 65% to 70% — DSCR updates instantly. Point at the sensitivity grid.
- Click **Export to Excel**. Open the file. *"These aren't baked numbers. Change LTV in Excel and DSCR recomputes. Same math."*

---

## 3 · The memory answer (1:30)

Sidebar → **Knowledge**.

Say: *"This is the answer to the thing you told me you find most frustrating — the AI never remembers you."*

Click **Retailer universe**.

- 1,240 rows, virtualized. Filter and search work.
- Hover a cell with a blue dot: *"Volatile — updates on scheduled refresh."*
- Edit a `locationsCanada` cell (hover the row and click the pencil). Save. It turns amber. *"Your correction is marked, dated, and locked."*
- Click **Refresh volatile fields**. Watch the counter climb. When it finishes: *"Your correction is preserved. Never overwritten."*
- Toggle **Your corrections** — the correction shows up in the filter.

Back to **Knowledge** → **Standing rules**.

- 12 rules. Click **Edit** on the cap-rate rule. Save. *"Every future report reads from this. You write it once."*

---

## 4 · Expiry watch, and the security screen (1:00)

Sidebar → **Leasing** → **Expiry watch**.

- Show the framed note: *"This watch notifies you. It does not start a tenant search. When you want candidates for a unit, you start the search — the link is right here on every row."*
- The reminder log is Kyle-only, always. *"No auto-emails to tenants. No autonomous action. Ever."*

Sidebar → **Settings** → **Security &amp; hosting**.

- Point at "single-tenant, encrypted at rest, Canadian region" and "files themselves never enter any third-party consumer product."
- Show the two hosting options — client-managed vs dedicated private cloud.
- Scroll to the access log. *"Every read, every export, logged."*

---

## 5 · Close (30s)

Back to **Today** to close where you started.

> "One workspace. It remembers your portfolio, your criteria, your rules, and every document you've ever signed. It reasons and ranks — but it never decides, never sends, never runs on its own. This is what a private version of the tool Kyle actually needs looks like."

Stop.

---

## If they probe

- *"What if a criterion doesn't fit?"* → Knowledge → Criteria → edit one; show it in the next search.
- *"How is soft scoring different from AI hallucinating?"* → Show the reasoning column on a candidate detail — every AI score has a written reason grounded in the retailer's actual profile and the property's actual town.
- *"How do we know what the AI saw?"* → Every citation on the report is clickable; the pipeline logs are visible per stage.
- *"How do we host it?"* → Settings → Security. Two options, one screen.
