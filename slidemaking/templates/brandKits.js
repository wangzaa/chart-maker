// Brand kits — opt-in styling overlays for the default slide system.
// Set BRAND_KIT in build.js to "ubs" | "jefferies" | null (default = null).
//
// A kit exports:
//   - palette[]       chart palette (used by chart-maker; mirror in the chart tool)
//   - accent          primary brand hex (no '#' prefix — pptxgenjs convention)
//   - titleColor      slide title color override
//   - bodyColor       body text color override
//   - sourceColor     footer/source text color override
//   - cover { background, titleColor, accentBlock }
//   - titleRule(opts)  → returns a "rule" element to place under the title
//                       (overrides the default "no rule under title" guidance)
//   - issueBadge?(text, opts) → returns [shape, text] elements for top-right badge
//
// Usage in build.js:
//   import { getBrandKit } from "./brandKits.js";
//   const BRAND_KIT = "ubs";
//   const kit = getBrandKit(BRAND_KIT);
//   // then in the slide elements array:
//   ...(kit ? [kit.titleRule()] : []),
//   ...(kit?.issueBadge ? kit.issueBadge("Issue 1 of 5") : []),

import { SLIDE } from "./layout.js";

const FULL_W = SLIDE.widthIn - 1.0; // 0.5" margins each side

export const BRAND_KITS = {
  ubs: {
    name: "UBS",
    palette: ["#E60028", "#3D3D3D", "#B0A78F", "#CFC6AC", "#E5DDC8"],
    accent: "E60028",
    titleColor: "1A1A1A",
    bodyColor: "333333",
    sourceColor: "888888",
    cover: {
      background: "FFFFFF",
      titleColor: "1A1A1A",
      accentBlock: "E60028", // left edge accent stripe
    },
    titleRule: ({ y = 1.55, color = "E60028", thicknessPt = 1.0 } = {}) => ({
      type: "rule", x: 0.5, y, w: FULL_W, color, thicknessPt,
    }),
    issueBadge: (text, { x = SLIDE.widthIn - 1.7, y = 0.35, w = 1.3, h = 0.3 } = {}) => [
      { type: "shape", x, y, w, h, fill: "E60028", radius: 0 },
      { type: "text", text, x, y, w, h,
        style: { sizePt: 9, bold: true, color: "FFFFFF" },
        align: "center", valign: "middle" },
    ],
  },

  jefferies: {
    name: "Jefferies",
    // Placeholder palette — confirm hex codes from your chart tool before shipping.
    palette: ["#0A1F44", "#1E5BAA", "#A3C5E8", "#5B7A9E", "#D6E3F0"],
    accent: "0A1F44",
    titleColor: "1A1A1A",
    bodyColor: "333333",
    sourceColor: "888888",
    cover: {
      background: "0A1F44",
      titleColor: "FFFFFF",
      accentBlock: "C9A961", // gold/tan accent
    },
    titleRule: ({ y = 1.55, color = "0A1F44", thicknessPt = 0.75 } = {}) => ({
      type: "rule", x: 0.5, y, w: FULL_W, color, thicknessPt,
    }),
  },
};

export function getBrandKit(name) {
  if (!name) return null;
  const key = String(name).toLowerCase();
  const kit = BRAND_KITS[key];
  if (!kit) {
    throw new Error(
      `Unknown brand kit: "${name}". Available: ${Object.keys(BRAND_KITS).join(", ")}`
    );
  }
  return kit;
}
