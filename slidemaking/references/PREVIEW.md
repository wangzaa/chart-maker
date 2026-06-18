# In-Window Preview (no PDF/image export)

Review slides directly in the browser. Same slide spec drives both the `.pptx` build and the HTML preview, so what you see in preview matches what ships in the deck.

---

## Architecture

```
slides spec (single source of truth)
        │
        ├──► pptxgenjs build  ──► deck.pptx   (canonical, editable)
        │
        └──► HTML renderer    ──► preview.html (review in window)
```

Both consume identical coordinates (inches), identical palette, identical typography from `templates/layout.js`. Position drift is impossible by construction — they're computed from the same constants.

**Known divergences** (acceptable for review, not pixel-identical):
- Browser font rendering vs PowerPoint font rendering — line-height and kerning differ by 1-2 px
- Table cell padding differs slightly between CSS tables and pptxgenjs `addTable`
- Chart PNGs render identically (same image embedded in both)

For final visual QA before sending the deck externally, open the `.pptx` directly. Preview is for *iteration*, not final sign-off.

---

## Files

- `templates/layout.js` — shared constants (slide dimensions, palette, regions, typography). Edit here to change both outputs.
- `templates/preview.js` — HTML renderer. Exports `renderPreview(slides)` and `writePreview(slides, path)`.
- `templates/build.js` — example end-to-end script. Run with `node build.js` to emit `deck.pptx` and `preview.html`.

---

## Slide spec format

Each slide is `{ title, background?, elements: [...] }`. Elements:

```js
{ type: "text", text: "...", x, y, w, h, style: {sizePt, bold, color}, align? }
{ type: "image", path: "chart.png", x, y, w, h, fit?: "contain"|"cover" }
{ type: "rule", x, y, w, color, thicknessPt }
{ type: "shape", x, y, w, h, fill?, border?, radius? }
{ type: "table", x, y, w, rows: [[{text, fill?, color?, bold?, align?}]] }
```

All coordinates in inches (slide is 13.333″ × 7.5″ at LAYOUT_WIDE).

---

## Workflow

1. Author slide spec in `build.js` (or import from a JSON file)
2. Run `node build.js` → emits both `.pptx` and `preview.html`
3. Open `preview.html` via the `Claude_Preview` MCP server (or any browser) to review
4. Iterate on the spec; rebuild
5. When happy, the same `.pptx` is ready to ship

---

## Why not Marp / HTML→pptx tools

Tested alternatives and rejected for these reasons:

- **Marp:** lowest authoring friction, but its pptx export flattens every slide to a single PNG. The result is uneditable in PowerPoint and complex layouts (mekko callouts, heat-map tables) lose fidelity. Good for blog-style talks; wrong for analytical decks that need to be hand-edited downstream.
- **HTML → pptx via Puppeteer screenshots:** same flattening problem.
- **HTML preview as primary, pptx as secondary:** would force HTML to be the source of truth, but pptxgenjs gives us real shapes, real text, real tables in the final deck — not images. Keeping pptxgenjs canonical preserves editability.

The dual-renderer pattern keeps the `.pptx` real and gives a fast review loop without producing throwaway PDFs or PNGs.
