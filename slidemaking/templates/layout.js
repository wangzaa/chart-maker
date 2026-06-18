// Shared layout constants — consumed by both pptxgenjs (build.js) and the HTML preview renderer.
// Single source of truth: changing a value here updates both outputs.

export const SLIDE = {
  // pptxgenjs LAYOUT_WIDE = 13.333" x 7.5"
  widthIn: 13.333,
  heightIn: 7.5,
  // 1 inch = 96 px in browser
  pxPerIn: 96,
};

export const SLIDE_PX = {
  width: SLIDE.widthIn * SLIDE.pxPerIn,   // 1280
  height: SLIDE.heightIn * SLIDE.pxPerIn, // 720
};

// chart-maker palettes — pick one per deck
export const PALETTES = {
  blue: ["#051C2A", "#163E93", "#30A3DA", "#A2AAAD", "#D9D9D9"],
  mono: ["#D9D9D9", "#D9D9D9", "#D9D9D9", "#D9D9D9", "#D9D9D9"],
  alt: ["#00966C", "#113E88", "#F28E42", "#4DC7B1"],
};

export const COLORS = {
  titleText: "1A1A1A",
  bodyText: "333333",
  mutedText: "888888",
  rule: "CCCCCC",
  background: "FFFFFF",
  callout: "F4CCCC",
};

export const TYPE = {
  // Title uses tighter-than-default line spacing so 2-line wraps look compact.
  // lineSpacingMultiple: 0.9 ≈ tight (PowerPoint default is ~1.15).
  title: { sizePt: 36, bold: true, color: COLORS.titleText, lineSpacingMultiple: 0.9 },
  // Section description / subtitle: small eyebrow at top-left.
  subtitle: { sizePt: 10, bold: false, color: "888888" },
  body: { sizePt: 13, bold: false, color: COLORS.bodyText },
  footnote: { sizePt: 9, bold: false, color: COLORS.mutedText },
  callout: { sizePt: 28, bold: true, color: COLORS.titleText },
};

// Standard slide regions (inches) — use as anchors when laying out content.
//
// Vertical zones (% of 7.5" slide height):
//   0–5%    Top margin (whitespace; no content)
//   5–8%    Eyebrow / section description (10pt, top-left)
//   9–21%   Title region (h = 0.9", fits 2-line wrap at lineSpacingMultiple 0.9)
//   22–90%  Body
//   90–95%  Footer (source bottom-left, page number bottom-right)
//
// Title uses valign: "middle" so single-line titles sit at the vertical midpoint
// of the title region — i.e., at the same visual band as the centerline of a
// 2-line wrap. No rule under the title; separation is whitespace.
export const REGIONS = {
  subtitle: { x: 0.4, y: 0.4,  w: SLIDE.widthIn - 0.8, h: 0.2 },
  titleBar: { x: 0.5, y: 0.65, w: SLIDE.widthIn - 1.0, h: 0.9 },
  body:     { x: 0.5, y: 1.7,  w: SLIDE.widthIn - 1.0, h: 5.0 },
  source:   { x: 0.5, y: 6.9,  w: 9.0, h: 0.25 },
  pageNum:  { x: SLIDE.widthIn - 0.7, y: 6.9, w: 0.5, h: 0.25 },
};

// Multi-column grid — set ratios per slide as needed
// Returns array of {x, w} in inches given a column ratio array (e.g. [40, 60] or [33, 33, 34])
export function columns(ratios, opts = {}) {
  const { gutter = 0.25, marginX = 0.5 } = opts;
  const usable = SLIDE.widthIn - 2 * marginX - gutter * (ratios.length - 1);
  const total = ratios.reduce((a, b) => a + b, 0);
  let cursor = marginX;
  return ratios.map((r) => {
    const w = (r / total) * usable;
    const out = { x: cursor, w };
    cursor += w + gutter;
    return out;
  });
}

// Convert inches → CSS px string (for HTML preview)
export const inToPx = (i) => `${i * SLIDE.pxPerIn}px`;
// Convert pt → CSS px (1pt = 1.333px)
export const ptToPx = (p) => `${p * 1.3333}px`;

// ---------- Inline markup parser ----------
// Parses a string with <b>, <i>, and \n into a pptxgenjs rich-text array:
//   [{ text, options: { bold?, italic?, breakLine? } }, ...]
//
// Supported:
//   <b>...</b>   — bold
//   <i>...</i>   — italic
//   \n           — line break
//
// HTML preview consumes the original string directly (browsers render <b>/<i>
// natively), so this parser is only needed for the pptxgenjs path.
export function parseInline(text) {
  if (text == null) return [{ text: "" }];
  const s = String(text);
  // Fast path: no markup, no newline
  if (!/[<\n]/.test(s)) return [{ text: s }];

  const tokens = [];
  const stack = []; // active tag flags: 'b' | 'i'
  const re = /(<\/?[bi]>)|(\n)/g;
  let last = 0;
  let m;
  const flush = (chunk, breakLine = false) => {
    if (!chunk && !breakLine) return;
    const opts = {};
    if (stack.includes("b")) opts.bold = true;
    if (stack.includes("i")) opts.italic = true;
    if (breakLine) opts.breakLine = true;
    tokens.push({ text: chunk, options: Object.keys(opts).length ? opts : undefined });
  };
  while ((m = re.exec(s)) !== null) {
    if (m.index > last) flush(s.slice(last, m.index));
    if (m[1]) {
      const tag = m[1];
      if (tag === "<b>") stack.push("b");
      else if (tag === "<i>") stack.push("i");
      else if (tag === "</b>") {
        const idx = stack.lastIndexOf("b");
        if (idx >= 0) stack.splice(idx, 1);
      } else if (tag === "</i>") {
        const idx = stack.lastIndexOf("i");
        if (idx >= 0) stack.splice(idx, 1);
      }
    } else if (m[2]) {
      // newline → emit a breakLine token
      flush("", true);
    }
    last = re.lastIndex;
  }
  if (last < s.length) flush(s.slice(last));
  // Drop options field where it's undefined to match pptxgenjs minimal shape
  return tokens.length ? tokens : [{ text: s }];
}

// ---------- Multi-column layout helpers ----------

// N-column equal-width layout — the default multi-column primitive.
// Specified as "2 col" / "3 col" / "4 col" etc.
// Each column: equal width, header text + thin rule under header, body left-aligned.
//
// Returns { headers: [{x,y,w,h}], rules: [{x,y,w}], bodies: [{x,y,w,h}] }
// — one entry per column, all aligned.
export function nCol(n, opts = {}) {
  const {
    marginX = 0.5,
    headerY = 1.85,        // sits inside the body region (REGIONS.body starts at y=1.7) with breathing room
    headerH = 0.5,
    ruleGap = 0.05,        // space between header text and rule
    ruleColor = COLORS.rule,
    ruleThicknessPt = 0.75,
    bodyGap = 0.15,        // space between rule and body
    bodyBottomY = 6.7,
    gutter = 0.4,          // space between columns
  } = opts;

  if (n < 1) throw new Error("nCol: n must be >= 1");
  const usable = SLIDE.widthIn - 2 * marginX - gutter * (n - 1);
  const colW = usable / n;

  const headers = [];
  const rules = [];
  const bodies = [];
  const ruleY = headerY + headerH + ruleGap;
  const bodyY = ruleY + bodyGap;
  const bodyH = bodyBottomY - bodyY;

  for (let i = 0; i < n; i++) {
    const x = marginX + i * (colW + gutter);
    headers.push({ x, y: headerY, w: colW, h: headerH });
    rules.push({ x, y: ruleY, w: colW, color: ruleColor, thicknessPt: ruleThicknessPt });
    bodies.push({ x, y: bodyY, w: colW, h: bodyH });
  }

  return { headers, rules, bodies, n, colW };
}

// Convenience: parse "3 col" / "4col" / "2-col" → integer count, then call nCol.
export function colsFromSpec(spec, opts = {}) {
  const m = String(spec).match(/(\d+)\s*[-_ ]?col/i);
  if (!m) throw new Error(`colsFromSpec: cannot parse "${spec}" (expected like "3 col")`);
  return nCol(parseInt(m[1], 10), opts);
}

// N-row layout — horizontal counterpart of nCol.
// Each row has a label box on the left and a content area on the right,
// separated by a dashed line between consecutive rows.
//
// Trigger only when the user says "2 row" / "3 row" / etc. — do not use as a
// default content layout.
//
// Returns { labels, contents, dashes, n, rowH }.
//   labels[i]:   { x, y, w, h, fill, radius }   — pass to a "shape" element + an inset "text"
//   contents[i]: { x, y, w, h }                  — pass to a "text" element
//   dashes[i]:   { x, y, w, color, thicknessPt, dash: true }  — pass to "rule"
export function nRow(n, opts = {}) {
  const {
    marginX = 0.5,
    topY = 1.7,           // start of body region
    bottomY = 6.7,
    labelW = 2.3,         // width of the left label column
    labelGap = 0.3,       // space between label box and content text
    labelFill = "EEEEE5", // soft neutral fill for the label box
    labelRadius = 6,
    dashColor = COLORS.rule,
    dashThicknessPt = 0.75,
    rowPad = 0.1,         // vertical padding inside each row
  } = opts;

  if (n < 1) throw new Error("nRow: n must be >= 1");
  const totalH = bottomY - topY;
  const rowH = totalH / n;
  const cellH = rowH - rowPad;

  const labels = [];
  const contents = [];
  const dashes = [];
  const usableW = SLIDE.widthIn - 2 * marginX;

  for (let i = 0; i < n; i++) {
    const rowY = topY + i * rowH + rowPad / 2;
    labels.push({
      x: marginX, y: rowY, w: labelW, h: cellH,
      fill: labelFill, radius: labelRadius,
    });
    contents.push({
      x: marginX + labelW + labelGap, y: rowY,
      w: usableW - labelW - labelGap, h: cellH,
    });
    if (i < n - 1) {
      dashes.push({
        x: marginX, y: topY + (i + 1) * rowH, w: usableW,
        color: dashColor, thicknessPt: dashThicknessPt, dash: true,
      });
    }
  }
  return { labels, contents, dashes, n, rowH };
}

export function rowsFromSpec(spec, opts = {}) {
  const m = String(spec).match(/(\d+)\s*[-_ ]?row/i);
  if (!m) throw new Error(`rowsFromSpec: cannot parse "${spec}" (expected like "3 row")`);
  return nRow(parseInt(m[1], 10), opts);
}


// Pillar Grid (Pattern A) — N staggered pillar headers + body columns,
// optional cross-cutting enabler bands underneath.
//
// Returns { headers: [{x,y,w,h}], bodies: [{x,y,w,h}], enablers: [{x,y,w,h}] }
export function pillarGrid(n = 4, opts = {}) {
  const {
    marginX = 0.5,
    headerY = 2.0,         // below the title region with buffer (REGIONS.titleBar bottom = 1.55)
    staggerY = 0.25,       // alternating vertical offset
    headerH = 1.0,
    bodyY = 3.1,
    bodyH = 2.5,
    bodyInset = 0.4,       // body cols are narrower than headers (visual nest)
    enablerCount = 2,
    enablerY = 5.7,
    enablerH = 0.6,
    enablerGap = 0.1,
  } = opts;

  const usable = SLIDE.widthIn - 2 * marginX;
  // header columns overlap slightly to create visual continuity
  const headerW = (usable / n) * 1.15;
  const pitch = (usable - headerW) / (n - 1);

  const headers = Array.from({ length: n }, (_, i) => ({
    x: marginX + i * pitch,
    y: headerY + (i % 2 === 1 ? -staggerY : 0),
    w: headerW,
    h: headerH,
  }));

  const bodyW = headerW - 2 * bodyInset;
  const bodies = headers.map((h) => ({
    x: h.x + bodyInset,
    y: bodyY,
    w: bodyW,
    h: bodyH,
  }));

  const enablers = Array.from({ length: enablerCount }, (_, i) => ({
    x: marginX,
    y: enablerY + i * (enablerH + enablerGap),
    w: usable,
    h: enablerH,
  }));

  return { headers, bodies, enablers };
}

// Pillar × Attribute Table (Pattern B) — narrow label | wide content | narrow label.
// Returns { headers: [{x,y,w,h}, ...], rows: [[{x,y,w,h}, ...]] }
export function pillarTable(rowCount = 5, opts = {}) {
  const {
    marginX = 0.5,
    headerY = 1.85,          // below the title region with buffer (REGIONS.titleBar bottom = 1.55)
    headerH = 0.55,
    rowsTopY = 2.5,
    rowsBottomY = 6.7,
    ratios = [20, 60, 20],   // narrow | wide | narrow
    gutter = 0.25,
  } = opts;

  const cols = columns(ratios, { gutter, marginX });
  const headers = cols.map((c) => ({ x: c.x, y: headerY, w: c.w, h: headerH }));

  const rowBandH = (rowsBottomY - rowsTopY) / rowCount;
  const rowH = rowBandH - 0.1;
  const rows = Array.from({ length: rowCount }, (_, r) => {
    const y = rowsTopY + r * rowBandH;
    return cols.map((c) => ({ x: c.x, y, w: c.w, h: rowH }));
  });

  return { headers, rows };
}
