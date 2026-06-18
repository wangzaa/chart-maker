---
name: slides
description: "Use this skill whenever the user wants to create, edit, or improve a professional slide deck or presentation. Triggers include: requests for presentations, slide decks, pitch decks, strategy decks, or any .pptx file. Also trigger when the user wants to: add charts (bar, stacked bar, combi, waterfall, line, area, pie, doughnut, bubble), build slides from data or a document, or create a visual table with heat-map shading. If the user mentions 'slides', 'deck', or 'presentation', use this skill."
---

# Slides Skill

Clean, analytical slide creation — covers layout, typography, and chart generation via [chart-maker](https://chart.altree.co).

## Slide Design System

### Cover Slides

Two patterns:

**Dark Cover:**
- Full dark background (`051C2A`) with optional thin geometric accent
- Large bold title (white, 48-60pt) left-aligned, bottom third
- Subtitle + date below in lighter weight
- Optional photo panel (right 40%, full height)
- Confidentiality footer (bottom-left, 8pt, muted)

**Photo Cover:**
- Full-bleed photo as background
- Semi-transparent dark overlay panel (center-bottom, ~60% opacity)
- Logo(s) left side of panel
- Title + subtitle right side, separated by thin vertical rule
- Disclaimer at very bottom (8pt)

### Content Slides (Standard Layout)

```
┌─────────────────────────────────────────────┐
│ Section description (10pt, gray, top-left)   │ ← eyebrow, above title
│ BOLD HEADLINE (36-40pt, near-black,          │
│   wraps to 2 lines if needed)                │
│                                              │
│  [MAIN CONTENT AREA]    (≥ 0.3″ buffer above) │
│                                              │
│ Source: ... (footnote, 9pt, bottom-left)     │
│                                 Org   Pg#    │
└─────────────────────────────────────────────┘
```

The section description sits *above* the title (not below) so that wrapping 2-line titles can't overlap it — keep it short, it's an eyebrow label not a sentence.

Title-band rules: there is **no horizontal rule under the slide title**. Visual separation between the title and the body comes from whitespace, not a line. Long titles wrap to two lines without crashing into anything because the title region is sized for it (h = 1.2″) and the body starts at y ≈ 1.85″.

Per-column rules inside layouts like `nCol` are unrelated to the slide title rule — those stay (one rule under each column header).

**Key rules:**
- Title: bold, 36-40pt, color `1A1A1A`. Region sized for 2-line wrap (h ≈ 1.2″).
- No horizontal rule under the title — separation is whitespace, not a line.
- Body: 12-14pt, `333333`. Starts at y ≈ 1.85″ for ≥ 0.3″ buffer below title.
- Source/footnote: 9pt, `888888`, bottom-left
- Logo + page number: bottom-right, consistent across all slides

### Two-Column Layouts

```
Left column (40-50%):          Right column (50-60%):
─────────────────────          ────────────────────────
Chart / Data Visual            Headline
                               ─────────────────────────
                               • Bullet with bold stat
                               • Bullet with bold stat

                               Secondary paragraph
                               • Sub-bullets

                               ┌─────────────────────┐
                               │ Callout box (dark    │
                               │ background, white    │
                               │ text)                │
                               └─────────────────────┘
```

Bold key numbers/stats inline using `b="1"` — e.g., **$1.5 billion**, **34%**, **25%**.

### Multi-Column Layouts

Three patterns: the **N-column primitive** (default), and two named variants (Pillar Grid, Pillar × Attribute Table) for specific recurring decks. All assume `LAYOUT_WIDE` (13.333″ × 7.5″).

**Trigger phrases (strict):**
- "**N col**" / "**N column**" → use `nCol(N)` / `colsFromSpec("N col")`. Equal-width vertical columns.
- "**N row**" → use `nRow(N)` / `rowsFromSpec("N row")`. Horizontal rows with label boxes on the left, content on the right, dashed separators between rows.

Use these primitives **only when the user explicitly mentions "n col" or "n row"**. Don't reach for them as a default content layout.

---

**Primitive — N columns ("2 col", "3 col", "4 col", …)**

When the user says "2 col" / "3 col" / "make it 4 column", use this. Behaviour:
- Equal width per column (auto-computed from N and gutter)
- Each column has a **bold header** with a **thin rule drawn directly under it**
- Body text below the rule, **left-justified**, fills down to the source/footnote band
- All columns vertically aligned; rules at identical y

```
┌──────────────────────────────────────────────────────┐
│ Title                                                 │
│ ──────────────────────────────────────────────────── │
│  Header 1     │  Header 2     │  Header 3            │
│  ────────     │  ────────     │  ────────            │
│  body text    │  body text    │  body text            │
│  left-just    │  left-just    │  left-just            │
│  …            │  …            │  …                    │
└──────────────────────────────────────────────────────┘
```

Use `nCol(n, opts)` (or `colsFromSpec("3 col", opts)`) from `layout.js`. Returns `{ headers, rules, bodies }` — one entry per column, all equal width. Drop each into the build via the `text` and `rule` element types.

Tunable: `marginX`, `headerY`, `headerH`, `gutter`, `bodyBottomY`, `ruleColor`, `ruleThicknessPt`.

---

**Primitive — N rows ("2 row", "3 row", "4 row", …)**

When the user says "n row", use `nRow(n)`. Behaviour:
- Each row has a **label box** on the left (rounded rectangle, soft fill) and **content text** on the right
- **Dashed separator lines** between rows (n-1 separators for n rows)
- Equal row height, computed from `(bottomY - topY) / n`
- Slide title and slide background are independent — only the row template body is generated

```
┌──────────────────────────────────────────────────────┐
│ Title                                                 │
│                                                       │
│ ┌──────┐  Content text                                │
│ │label1│  …                                           │
│ └──────┘                                              │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│ ┌──────┐  Content text                                │
│ │label2│  …                                           │
│ └──────┘                                              │
│ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─    │
│ ┌──────┐  Content text                                │
│ │label3│  …                                           │
│ └──────┘                                              │
└──────────────────────────────────────────────────────┘
```

`nRow(n)` returns `{ labels, contents, dashes }`. Drop labels in via `shape` element + an inset `text`; contents via `text`; dashes via `rule` with `dash: true`.

Tunable: `topY`, `bottomY`, `labelW`, `labelGap`, `labelFill`, `labelRadius`, `dashColor`, `rowPad`.

---

**Pattern A — Pillar Grid** (named variant of N-col with staggered headers + enabler bands)

**Pattern A — Pillar Grid**

Use for: strategic pillars / OKR overview / framework summary where N pillars sit side-by-side and 1–2 cross-cutting enablers run underneath as horizontal bands.

```
┌──────────────────────────────────────────────────────┐
│ Title                                                 │
│ ──────────────────────────────────────────────────── │
│  ┌P1─┐  ┌P2─┐  ┌P3─┐  ┌P4─┐    ← staggered y         │
│  │   │  │   │  │   │  │   │      (alt by 0.25")      │
│  │body│ │body│ │body│ │body│                          │
│  └───┘  └───┘  └───┘  └───┘                            │
│ ┌──────── enabler band 1 ────────────────────────────┐│
│ ├──────── enabler band 2 ────────────────────────────┤│
└──────────────────────────────────────────────────────┘
```

Use `pillarGrid(n, opts)` from `layout.js` to compute pillar positions.

**Pattern B — Pillar × Attribute Table**

Use for: rollout tracker / RACI / pillar-to-owner mapping. Three columns: narrow label · wide content · narrow label.

```
┌──────────────────────────────────────────────────────┐
│ Title                                                 │
│ ──────────────────────────────────────────────────── │
│ ┌Pillar┐ ┌──Priorities──────────┐ ┌──PIC──┐          │
│ │  R1  │ │       R1              │ │  R1   │          │
│ │  R2  │ │       R2              │ │  R2   │          │
│ │  R3  │ │       R3              │ │  R3   │          │
│ │  R4  │ │       R4              │ │  R4   │          │
│ │  R5  │ │       R5              │ │  R5   │          │
│ └──────┘ └───────────────────────┘ └───────┘          │
└──────────────────────────────────────────────────────┘
```

Use `pillarTable(rowCount, opts)` from `layout.js` for column anchors and row y-positions.

For arbitrary 2/3/N column splits with custom ratios, use `columns([ratios], opts)`.

### Agenda / Table of Contents Slides

Solid brand-color background, white text, active section in white-bordered box. Or white background with numbered list center-left, logos top-right.

---

## Data Table Slides (Heat-Map Style)

Cell shading intensity encodes magnitude. See [CHARTS.md](references/CHARTS.md) for chart-maker setup.

Key pattern:
- Header row: white background, bold text, column group labels
- Data cells: shaded from dark navy (`051C2A`) → mid blue (`163E93`) → light blue (`30A3DA`) → near-white based on value
- Highlighted focus row: peach (`F4CCCC`) to draw attention
- Left column (labels): no shading, left-aligned
- Right columns (data): center-aligned, white or dark text by background

---

## Color Palettes

Use the chart-maker palettes as the canonical visual identity:

| Palette | Colours |
|---------|---------|
| **Blue** | `#051C2A` `#163E93` `#30A3DA` `#A2AAAD` `#D9D9D9` |
| **Mono** | All `#D9D9D9` with white borders |
| **Alt** | `#00966C` `#113E88` `#F28E42` `#4DC7B1` |

Default to **Blue**. Charts must use the same palette as the surrounding slide so visuals integrate.

---

## Brand Kits

Brand kits are opt-in styling overlays for firm-specific decks (UBS issue briefs, Jefferies investor notes, etc.). They override specific defaults — palette, title rule, cover treatment, header/footer chrome — without changing the layout primitives (`nCol`, `nRow`, `pillarGrid`, etc.).

**Available kits** ([templates/brandKits.js](templates/brandKits.js)):

| Kit | Palette (chart order) | Title rule | Cover |
|---|---|---|---|
| **UBS** | `#E60028` `#3D3D3D` `#B0A78F` `#CFC6AC` `#E5DDC8` | 1pt red under title | White bg, red left-edge accent stripe |
| **Jefferies** | `#0A1F44` `#1E5BAA` `#A3C5E8` `#5B7A9E` `#D6E3F0` | 0.75pt navy under title | Navy bg, gold accent stripe |

**How to invoke a brand kit:**

1. At the top of `build.js`, set the `BRAND_KIT` constant:
   ```js
   const BRAND_KIT = "ubs"; // "ubs" | "jefferies" | null
   ```
2. The kit auto-applies: cover styling, title-color overrides, the colored rule under the title, and (UBS only) the `kit.issueBadge("Issue 1 of 5")` helper for the top-right red badge.
3. **Charts**: the kit's `palette[]` is the chart series order. Mirror it in chart-maker (the chart tool is external — set its palette by hand to match the kit before generating PNGs).

**Brand-kit overrides to the default rules:**

- Brand kits intentionally violate "Never use a horizontal rule under the slide title." The default rule still applies when `BRAND_KIT = null`; activating a kit opts you into the kit's title-rule convention. Long 2-line titles are sized in the title region to clear the rule.
- Cover slides under a brand kit use the kit's background + accent stripe rather than the default `#051C2A` dark cover.
- Single-font-color cover rule still applies — kits set one color across eyebrow/title/date.

**UBS chart conventions** (mirror in chart-maker):

- Stacked bars / multi-series: red `#E60028` for the featured/headline series, then warm-gray gradient (charcoal → taupe → tan → cream) for the rest.
- Waterfall: charcoal for base, light tan for decrements, **red for the total bar**.
- Single-accent variant (no hero series): drop red, use the 4-step gray gradient only — darkest = most important category.

**Adding a new kit:** add an entry to `BRAND_KITS` in [brandKits.js](templates/brandKits.js) with the same shape (palette, accent, titleColor, cover, titleRule, optional issueBadge). The constant lookup picks it up automatically.

---

## Typography

| Element | Size | Weight |
|---------|------|--------|
| Slide title | 36-40pt | Bold |
| Cover title | 48-60pt | Bold |
| Subheading | 18-20pt | Bold |
| Body text | 12-14pt | Regular |
| Footnote/source | 8-10pt | Regular |
| Callout number | 28-36pt | Bold |

Use system sans (Calibri / Aptos / Helvetica). Avoid mixing serif and sans on the same deck unless one is reserved exclusively for cover titles.

---

## Process

### Step 1 — Understand the Brief
1. What style? (dark, clean white, branded?)
2. How many slides? What sections?
3. What chart types are needed?

### Step 2 — Design the Deck Structure
Cover → Agenda → Content → Appendix. For each content slide, decide layout: single column, two-column, multi-column, full chart, table, or matrix grid.

### Step 3 — Generate Charts First
Generate charts before building slides — they embed as PNG images. Use [chart-maker](https://chart.altree.co) per [CHARTS.md](references/CHARTS.md): paste CSV → set toggles → Copy chart → embed via `addImage`.

### Step 4 — Build with pptxgenjs

Minimal content slide:

```javascript
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

const slide = pres.addSlide();

// Section description (eyebrow, top-left)
slide.addText("Data annotation or section label", {
  x: 0.4, y: 0.15, w: 12.5, h: 0.2,
  fontSize: 10, color: "888888", margin: 0
});

// Title (h = 1.2 to allow 2-line wrap)
slide.addText("Slide title", {
  x: 0.5, y: 0.35, w: 12.3, h: 1.2,
  fontSize: 36, bold: true, color: "1A1A1A", margin: 0, valign: "top"
});

// Body / chart image — body starts at y=1.85 leaving ≥0.3" buffer below title
slide.addImage({ path: "chart.png", x: 0.5, y: 1.85, w: 12.3, h: 4.9 });

// Source
slide.addText("Source: ...", {
  x: 0.5, y: 6.9, w: 9, h: 0.25,
  fontSize: 9, color: "888888", margin: 0
});

// Page number
slide.addText("1", {
  x: 12.5, y: 6.9, w: 0.5, h: 0.25,
  fontSize: 9, color: "888888", align: "right", margin: 0
});

await pres.writeFile({ fileName: "deck.pptx" });
```

### Step 5 — Preview & QA
Use the dual-renderer pattern: same slide spec drives both `.pptx` and an HTML preview. See [PREVIEW.md](references/PREVIEW.md). Workflow:
- Author slides as a JS spec consumed by `templates/build.js`
- Run `node build.js` → emits `deck.pptx` + `preview.html`
- Open `preview.html` via the `Claude_Preview` MCP server to review in-window
- For final visual check before sending externally, open `.pptx` directly

---

## Rules

Each rule includes the *why* so edge cases can be judged on intent, not blind compliance.

### Always

**Use whitespace, not a line, to separate the title from the body.**
- *Why:* A horizontal rule under the title gets crashed by long (2-line wrapping) titles, producing visible overlap. Whitespace separation never collides.
- *How to apply:* Title region sized for 2-line wrap (h ≈ 1.2″); body starts at y ≈ 1.85″, giving ≥ 0.3″ of clear space below the title's worst-case bottom. No `addShape(line)` under the title.

**Include a source/footnote line on data slides.**
- *Why:* Unsourced numbers are not credible in analytical decks; readers quietly discount them.
- *How to apply:* Bottom-left, 9pt, `888888`. If the source is "internal analysis," say so explicitly rather than omitting.

**Use page numbers bottom-right.**
- *Why:* Discussion in meetings constantly references "slide 12"; without numbers people lose place.
- *How to apply:* Same position, font, and color on every content slide. Cover and section slides may omit.

**Bold key numbers and statistics inline within body text.**
- *Why:* Body copy reads as a wall; the bolded numbers are what the reader actually retains.
- *How to apply:* Bold the figure plus its unit (**$1.5B**, **34%**) but not the surrounding sentence.

**Default background is white. Use beige only on explicit request.**
- *Why:* White maximises contrast for analytical content and is the safer default for charts and tables. Beige (`EFEAD8`) is a deliberate choice the user makes for warmth, not a default.
- *How to apply:* Omit `slide.background` or set it to `FFFFFF` for content slides. Use `EFEAD8` only when the user says "beige slide" (or explicitly requests beige). Cover slides may use any background.

**Cover (title) slides use a single font colour throughout.**
- *Why:* Mixed colours on a cover read as decorative noise. A single colour with size/weight variation establishes hierarchy without visual clutter.
- *How to apply:* Pick one colour (white on dark, dark on light) and use it for the eyebrow, title, and date/subtitle. Vary by `sizePt` and `bold`, not by `color`.

**Numbered and bulleted lists separate items with a blank line.**
- *Why:* At slide-reading distance, items packed at single line spacing read as one wall of text. A blank line between items lets the eye chunk them, which is the entire point of a list.
- *How to apply:* In the body string, emit `\n\n` between every numbered item (`1. ...\n\n2. ...\n\n3. ...`) and between every main bullet group. Single line spacing within an item is fine — only the inter-item gap doubles.

**Bulleted lists use bold for the main bullet, plain for sub- and sub-sub-bullets.**
- *Why:* The reader scans the bold lead lines first to get the structure, then dives into the supporting detail. If everything is plain, hierarchy disappears; if everything is bold, emphasis dies.
- *How to apply:* Wrap the main bullet line in `<b>...</b>`. Indent sub-bullets with two spaces + `•` (or `   •`) at plain weight. Cap nesting at sub-sub-bullets — go no deeper.

**Body text starts at y = 1.85 (top of body region); tables sit below with a 2-line gap.**
- *Why:* Body text frames the takeaway in plain language; the table provides the proof. Both are needed on data slides — neither alone is sufficient. Anchoring text at the top of the body region and inserting a fixed 2-line gap below it gives the table predictable space and prevents footer overlap.
- *How to apply:*
   - Body text: `y = 1.85`, height sized tightly to content (3-line body ≈ `h = 0.70`; 4-line body ≈ `h = 0.95` at 13pt with `lineSpacingMultiple: 1.2`).
   - Gap: `0.40″` below body bottom — this is 2 text lines at 13pt × 1.2 line height.
   - Table: `y = body.y + body.h + 0.40` → `y ≈ 2.95` for 3-line body, `y ≈ 3.20` for 4-line body.
   - Available table height = `6.7 - table.y` (footer at 6.9 with 0.20″ buffer). 3-line layout gives 3.75″, comfortably fits 11 rows.

**Body text uses one salient point per line, no bullets.**
- *Why:* When 3-5 short observations frame a data block, bullet markers add visual weight without information. Newline alone provides enough separation.
- *How to apply:* Each salient point on its own line, separated by single `\n`. Bold the key noun phrase or figure inline. No `•`, no numbering — just line breaks. Cap at 4 lines on table slides so the table has enough room.

### Never

**Use accent lines directly under titles as decorative elements.**
- *Why:* The standard `CCCCCC` rule already lives there. A second decorative line creates two competing horizontal weights and doubles the visual mass of the header.
- *How to apply:* For emphasis use a colored title or background block, not a second line. If the existing rule needs to feel stronger, thicken it to 1pt — don't add a sibling.

**Leave placeholder text in the final output.**
- *Why:* "Lorem ipsum" or "Title goes here" surviving into a sent deck damages credibility instantly.
- *How to apply:* Before declaring done, search the source for known placeholders (lorem, TKTK, TBD, [bracket]).

**Use more than 3 font sizes on one slide.**
- *Why:* Each new size is a new hierarchy level the reader has to interpret. Past 3, the hierarchy stops communicating and reads as visual noise.
- *How to apply:* Title (36–40), body (12–14), footnote (9). If a stat needs emphasis, use bold or a color shift at the body size, or replace the body number with a 28pt callout — but don't introduce a fourth size alongside.

**Center-align body text or bullet lists.**
- *Why:* Centered text creates ragged left edges, which kills scanability — readers track the left margin to move down a list. Centering also reads as decorative, undermining analytical content.
- *How to apply:* Left-align all body, bullets, and table data. Center only short callout numbers, chart titles, and labels where the surrounding visual block is itself centered.

**Use more than 2 chart types on a single slide.**
- *Why:* Each chart type asks the reader to learn a new visual encoding. Two is the comprehension ceiling for a 30-second slide.
- *How to apply:* If you need a third chart, split into two slides or convert one to a table.

---

## Quality Checklist

- [ ] Title present on all content slides; no horizontal rule under it
- [ ] Source attribution on every data slide
- [ ] No placeholder or leftover text
- [ ] Chart labels readable (contrast check)
- [ ] Heat-map tables have correct intensity mapping
- [ ] Page numbers consistent
- [ ] Charts use the chart-maker palette matching the deck
