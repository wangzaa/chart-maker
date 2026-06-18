// Dual-output build: same slide spec → .pptx (canonical) + preview.html (review).
// Run: node build.js   (assumes pptxgenjs is installed in the project)

import pptxgen from "pptxgenjs";
import { SLIDE, REGIONS, COLORS, TYPE, parseInline } from "./layout.js";
import { writePreview } from "./preview.js";
import { getBrandKit } from "./brandKits.js";

// ---------- Brand kit ----------
// Set to "ubs" | "jefferies" | null. When non-null, kit overrides apply:
//   - cover background + title color
//   - colored rule under content-slide titles (overrides default "no rule")
//   - kit.issueBadge() available for top-right badges (UBS only)
//   - kit.palette[] is the chart color order — mirror in chart-maker
const BRAND_KIT = null;
const kit = getBrandKit(BRAND_KIT);

// Convenience: kit-aware title/body styles fall back to defaults when no kit.
const titleStyle = kit ? { ...TYPE.title, color: kit.titleColor } : TYPE.title;
const bodyStyle  = kit ? { ...TYPE.body,  color: kit.bodyColor  } : TYPE.body;
const footStyle  = kit ? { ...TYPE.footnote, color: kit.sourceColor } : TYPE.footnote;

// ---------- Slide spec ----------
// One source of truth. Each slide has elements; each element has identical
// coordinates (in inches) used by both renderers.

const slides = [
  {
    title: "Cover",
    background: kit ? kit.cover.background : "051C2A",
    elements: [
      // Optional left-edge accent block when a brand kit is active
      ...(kit ? [{
        type: "shape", x: 0, y: 0, w: 0.15, h: SLIDE.heightIn,
        fill: kit.cover.accentBlock,
      }] : []),
      { type: "text", text: "Deck title", x: 0.6, y: 4.5, w: 12, h: 1.2,
        style: { sizePt: 54, bold: true,
                 color: kit ? kit.cover.titleColor : "FFFFFF" } },
      { type: "text", text: "Subtitle • Date", x: 0.6, y: 5.8, w: 12, h: 0.5,
        style: { sizePt: 16, bold: false,
                 color: kit ? kit.cover.titleColor : "A2AAAD" } },
    ],
  },
  {
    title: "Standard content slide",
    background: "FFFFFF",
    elements: [
      { type: "text", text: "Section description / data annotation",
        ...REGIONS.subtitle, style: TYPE.subtitle },
      { type: "text", text: "Bold headline that summarizes the takeaway",
        ...REGIONS.titleBar, style: titleStyle },
      // Brand kits override the default "no rule under title" — UBS uses a 1pt
      // red rule, Jefferies a 0.75pt navy rule. Default style omits the rule.
      ...(kit ? [kit.titleRule()] : []),
      // UBS issue-of-N badge top-right (kit-specific)
      ...(kit?.issueBadge ? kit.issueBadge("Issue 1 of 5") : []),
      { type: "text", text: "Body copy goes here. Bold the <b>$1.5B</b> and <b>34%</b>.",
        ...REGIONS.body, style: bodyStyle },
      { type: "text", text: "Source: internal analysis",
        ...REGIONS.source, style: footStyle },
      { type: "text", text: "1", ...REGIONS.pageNum, style: footStyle, align: "right" },
    ],
  },
];

// ---------- pptxgenjs renderer ----------

function buildPptx(slides, outPath) {
  const pres = new pptxgen();
  pres.layout = "LAYOUT_WIDE"; // 13.333 x 7.5

  for (const slide of slides) {
    const s = pres.addSlide();
    if (slide.background) {
      s.background = { color: slide.background };
    }
    for (const el of slide.elements) {
      switch (el.type) {
        case "text": {
          const t = el.style || TYPE.body;
          // Parse <b>/<i>/\n into rich-text array so pptxgenjs renders inline
          // bold/italic/breaks. Plain strings without markup pass through as
          // a single-segment array.
          const segments = parseInline(el.text).map((seg) => ({
            text: seg.text,
            options: {
              ...(seg.options || {}),
              fontSize: t.sizePt,
              color: t.color,
              // Per-segment bold from parseInline overrides the base style
              bold: (seg.options && seg.options.bold) || t.bold || undefined,
              italic: (seg.options && seg.options.italic) || undefined,
            },
          }));
          s.addText(segments, {
            x: el.x, y: el.y, w: el.w, h: el.h,
            align: el.align || "left",
            margin: 0,
            valign: el.valign || "top",
            ...(t.lineSpacingMultiple ? { lineSpacingMultiple: t.lineSpacingMultiple } : {}),
          });
          break;
        }
        case "image":
          s.addImage({ path: el.path, x: el.x, y: el.y, w: el.w, h: el.h });
          break;
        case "rule":
          s.addShape(pres.ShapeType.line, {
            x: el.x, y: el.y, w: el.w, h: 0,
            line: {
              color: el.color || COLORS.rule,
              width: el.thicknessPt || 0.75,
              dashType: el.dash ? "dash" : "solid",
            },
          });
          break;
        case "shape": {
          // rounded rect when radius > 0; plain rect otherwise
          const shapeType = el.radius ? pres.ShapeType.roundRect : pres.ShapeType.rect;
          s.addShape(shapeType, {
            x: el.x, y: el.y, w: el.w, h: el.h,
            fill: el.fill ? { color: el.fill } : undefined,
            line: el.border ? { color: el.border, width: 0.5 } : { type: "none" },
            // pptxgenjs roundRect uses rectRadius (0..0.5 fraction of shorter side)
            ...(el.radius ? { rectRadius: Math.min(el.radius / 100, 0.3) } : {}),
          });
          break;
        }
        case "table": {
          const rows = el.rows.map((row) =>
            row.map((c) => ({
              text: c.text ?? "",
              options: {
                fill: c.fill ? { color: c.fill } : undefined,
                color: c.color || "1A1A1A",
                bold: !!c.bold,
                align: c.align || "left",
                fontSize: 11,
              },
            }))
          );
          s.addTable(rows, { x: el.x, y: el.y, w: el.w });
          break;
        }
      }
    }
  }
  return pres.writeFile({ fileName: outPath });
}

// ---------- Run both ----------

await buildPptx(slides, "deck.pptx");
writePreview(slides, "preview.html", { title: "Deck preview" });
console.log("→ deck.pptx + preview.html");
