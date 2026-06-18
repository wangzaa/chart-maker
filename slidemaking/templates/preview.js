// HTML preview renderer — emits a self-contained preview.html that mirrors the
// pptxgenjs output using the same coordinates from layout.js.
//
// Layout integrity guarantee: both the pptxgenjs build path and this renderer
// consume the same slide spec and the same constants. Position drift is
// impossible by construction.
//
// Known divergences from .pptx (acceptable for review, not for final QA):
// - Browser font rendering ≠ PowerPoint font rendering (kerning, line-height
//   may differ by 1-2 px). Use the same font family on both sides.
// - Chart images render identically (PNG embed in both).
// - Tables: pptxgenjs addTable cell padding differs from CSS table cell padding;
//   normalize via inline padding in both renderers.

import fs from "node:fs";
import { SLIDE, SLIDE_PX, REGIONS, TYPE, COLORS, inToPx, ptToPx } from "./layout.js";

const escapeHtml = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

// Render a single element (text | image | shape | rule | table) as absolutely
// positioned HTML inside a slide container.
function renderElement(el) {
  const styleBase = (e) => `
    position: absolute;
    left: ${inToPx(e.x)};
    top: ${inToPx(e.y)};
    width: ${inToPx(e.w)};
    ${e.h != null ? `height: ${inToPx(e.h)};` : ""}
    box-sizing: border-box;
    margin: 0;
  `;

  switch (el.type) {
    case "text": {
      const t = el.style || TYPE.body;
      const align = el.align || "left";
      const valign = el.valign || "top";
      const lh = t.lineSpacingMultiple || 1.25;
      // Map pptxgenjs valign → flexbox alignment for the inner text block.
      const justify = valign === "middle" ? "center" : valign === "bottom" ? "flex-end" : "flex-start";
      return `<div style="${styleBase(el)}
        display: flex;
        flex-direction: column;
        justify-content: ${justify};
        font-size: ${ptToPx(t.sizePt)};
        font-weight: ${t.bold ? 700 : 400};
        color: #${t.color};
        text-align: ${align};
        line-height: ${lh};
        font-family: Calibri, Aptos, 'Helvetica Neue', Arial, sans-serif;
      "><span style="white-space: pre-wrap;">${el.text}</span></div>`;
    }
    case "image":
      return `<img src="${escapeHtml(el.path)}" style="${styleBase(el)}
        object-fit: ${el.fit || "contain"};
      " />`;
    case "rule":
      return `<div style="${styleBase({ ...el, h: 0 })}
        border-top: ${el.thicknessPt || 0.75}px ${el.dash ? "dashed" : "solid"} #${el.color || COLORS.rule};
      "></div>`;
    case "shape": {
      const fill = el.fill ? `background: #${el.fill};` : "";
      const border = el.border ? `border: 1px solid #${el.border};` : "";
      const radius = el.radius ? `border-radius: ${el.radius}px;` : "";
      return `<div style="${styleBase(el)}${fill}${border}${radius}"></div>`;
    }
    case "table": {
      // el.rows: array of rows; each row: array of cells {text, fill?, color?, bold?, align?}
      const rows = el.rows.map((row) => {
        const cells = row
          .map((c) => {
            const fill = c.fill ? `background:#${c.fill};` : "";
            const color = `color:#${c.color || "1A1A1A"};`;
            const bold = c.bold ? "font-weight:700;" : "";
            const align = `text-align:${c.align || "left"};`;
            return `<td style="${fill}${color}${bold}${align}padding:6px 10px;border:1px solid #EEE;font-size:${ptToPx(11)};">${c.text ?? ""}</td>`;
          })
          .join("");
        return `<tr>${cells}</tr>`;
      }).join("");
      return `<div style="${styleBase(el)}">
        <table style="width:100%;border-collapse:collapse;font-family:Calibri,Aptos,'Helvetica Neue',Arial,sans-serif;">${rows}</table>
      </div>`;
    }
    default:
      return `<!-- unknown element type: ${el.type} -->`;
  }
}

function renderSlide(slide, idx) {
  const elements = slide.elements.map(renderElement).join("\n");
  return `
    <section class="slide" data-idx="${idx + 1}">
      <div class="slide-inner" style="
        width: ${SLIDE_PX.width}px;
        height: ${SLIDE_PX.height}px;
        background: ${slide.background ? `#${slide.background}` : "#FFFFFF"};
        position: relative;
        overflow: hidden;
      ">
        ${elements}
      </div>
      <div class="slide-label">${idx + 1} / ${slide.title || "untitled"}</div>
    </section>
  `;
}

export function renderPreview(slides, opts = {}) {
  const { title = "Slide preview" } = opts;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escapeHtml(title)}</title>
<style>
  :root { --slide-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  body {
    margin: 0;
    background: #F5F5F5;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    color: #222;
    padding: 24px 0;
  }
  header {
    max-width: ${SLIDE_PX.width}px;
    margin: 0 auto 16px;
    padding: 0 4px;
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    font-size: 13px;
    color: #666;
  }
  header h1 { font-size: 16px; margin: 0; color: #222; }
  .slide {
    max-width: ${SLIDE_PX.width}px;
    margin: 0 auto 32px;
  }
  .slide-inner {
    box-shadow: var(--slide-shadow);
    /* scale to fit narrower viewports */
    transform-origin: top left;
  }
  .slide-label {
    font-size: 11px;
    color: #888;
    margin-top: 6px;
    padding-left: 4px;
  }
  @media (max-width: ${SLIDE_PX.width + 48}px) {
    .slide-inner {
      transform: scale(calc((100vw - 48px) / ${SLIDE_PX.width}));
      width: ${SLIDE_PX.width}px !important;
    }
    .slide {
      height: calc((100vw - 48px) * ${SLIDE_PX.height / SLIDE_PX.width} + 24px);
    }
  }
</style>
</head>
<body>
  <header>
    <h1>${escapeHtml(title)}</h1>
    <span>${slides.length} slide${slides.length === 1 ? "" : "s"} • ${SLIDE.widthIn}″ × ${SLIDE.heightIn}″</span>
  </header>
  ${slides.map(renderSlide).join("\n")}
</body>
</html>`;
}

export function writePreview(slides, outPath, opts) {
  const html = renderPreview(slides, opts);
  fs.writeFileSync(outPath, html, "utf8");
  return outPath;
}
