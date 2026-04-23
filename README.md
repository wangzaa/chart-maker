# Chart Maker

A browser-based chart builder with no backend, no build step, and no dependencies beyond Chart.js. Paste CSV data, pick a chart type, and export a PNG — all in one page.

**Live:** https://altree.co/chart

---

## Chart types

| Type | Description |
|---|---|
| **Bar chart** | Grouped vertical bars |
| **Stacked bar** | Stacked vertical bars with optional data labels |
| **Combi** | Stacked bars + line on a secondary axis |
| **Waterfall** | Running total bridge chart |
| **Line chart** | Multi-series line |
| **Area chart** | Filled line chart |
| **Pie / Doughnut** | Slice charts with inline labels |
| **Bubble chart** | Size-encoded bubbles on categorical or numerical axes |

---

## Data format

Paste CSV directly into the text area. First column = row labels; first row = column headers.  
Numbers may include `%`, `$`, `£`, `€`, and thousands commas — they are stripped automatically.

### Standard (bar, stacked bar, line, area, pie, doughnut)

```
Region,2022,2023,2024
North America,42,51,68
Europe,31,38,44
Asia Pacific,55,72,91
```

### Waterfall

Two columns: label + value. Negative values are decreases.  
Optional third column: set `total` to pin a bar at the running total.

```
Category,Value
Starting point,120
New contracts,45
Churn,-18
Expansion,32
Q4 Total,179,total
```

### Combi (bar + line)

**Last row** = line series plotted on the secondary (right) axis.  
All other rows = stacked bars on the primary (left) axis.

```
Region,2022,2023,2024
North America,42,51,68
Europe,31,38,44
Asia Pacific,55,72,91
Latin America,12,15,19
Middle East,8,11,14
Growth,62,65,76
```

Toggle **Data Pivot ON** to flip the x-axis: columns become categories, rows become bar series. With the example above + Data Pivot: years on x-axis, regions stacked, Growth line visible on the right axis.

### Bubble chart

Required columns: `Label`, `X`, `Y`, `Size`. Optional: `Group` (drives colour coding).  
Column names are case-insensitive and support common aliases (`lbl`, `name`, `xaxis`, `value`, `volume`, `tier`, etc.).

**Mode is detected automatically:**

| Mode | Condition | Axes |
|---|---|---|
| **Categorical** | X or Y contains text | Grid layout — x-axis at top, y-axis on left |
| **Numerical** | All X and Y values are numbers | Standard linear scatter axes |

**Categorical example** (products × regions):

```
Label,X,Y,Size,Group
17%,West,Rackets,450,High
16%,Central,Rackets,120,High
16%,Coast,Rackets,800,High
13%,West,Bats,400,Medium
12%,West,Gloves,580,Medium
11%,West,Helmets,500,Low
```

**Numerical example** (scatter with sized bubbles):

```
Label,X,Y,Size,Group
16%,0.5,1.0,0.2,A
72%,0.3,0.4,3.7,A
55%,0.6,0.2,7.8,B
33%,0.3,0.8,5.5,B
```

Bubble area is proportional to `Size` (√-scaled). Labels appear inside large bubbles and beside small ones. Size values may use any unit — only relative magnitudes matter.

---

## Options

| Toggle | Effect |
|---|---|
| **With headers** | Treat first row as column headers |
| **Data labels** | Show values inside/above bars and slices; labels on/beside bubbles |
| **Grid lines** | Axis gridlines |
| **Legend** | Series colour key |
| **Connectors** | Dashed lines between bar tops |
| **CAGR** | Arrow + bubble showing compound annual growth rate |
| **CAGR (Series)** | Per-series CAGR labels on the right (stacked bar only) |
| **Data Pivot** | Swap rows ↔ columns (data-level transpose) |
| **Rotate 90°** | Horizontal bar layout (visual flip only) |

### Colour palettes

| Name | Colours |
|---|---|
| **Blue** | `#051C2A` `#163E93` `#30A3DA` `#A2AAAD` `#D9D9D9` |
| **Mono** | All `#D9D9D9` with white borders |
| **Alt** | `#00966C` `#113E88` `#F28E42` `#4DC7B1` |

---

## Export

Click **Copy chart** to copy the chart canvas as a PNG to the clipboard.  
Paste directly into PowerPoint, Figma, Notion, etc.  
If the browser blocks clipboard access, the PNG downloads automatically instead.

---

## Tech stack

- [Chart.js 4.4.1](https://www.chartjs.org/) — charting engine
- [chartjs-plugin-datalabels 2.2.0](https://chartjs-plugin-datalabels.netlify.app/) — value labels
- Vanilla JS / CSS — no framework, no build step
- Single `index.html` file — deploy anywhere

### Notable implementation details

- **Bubble categorical axis labels:** Chart.js 4 silently drops tick labels on `type:'linear'` scales with integer-mapped categories. Fixed with a dedicated `afterDraw` plugin (`bubbleCatAxisPlugin`) that suppresses native ticks entirely and paints x and y labels directly onto the canvas using `chartArea` coordinates, with dynamic left padding computed from the longest label string.
- **Bubble dual-mode detection:** Parser checks whether every X and Y value in the dataset can be cleanly converted to a number after stripping `%`/`$`/currency symbols. Numeric → scatter axes; any text → categorical grid.
- **Combi line-on-top:** Chart.js 4 mixed charts always paint bar rectangles after line paths regardless of `order`. A custom `afterDraw` plugin repaints line datasets after the full chart render, clipped to the chart area.
- **CAGR arrow:** Custom canvas plugin with dynamic vertical clearance — scans all intermediate bars and lifts the arrow enough to clear the tallest one, then places the oval callout above the midpoint.
- **y2 scale:** Explicit clean `min`/`max` derived from line data using a "nice number" step algorithm (rounds to `1/2/5/10/20/25/50…` multiples). Avoids Chart.js auto-scale producing odd decimals.
- **Number parser:** Strips `%`, `$`, `£`, `€`, spaces, and thousands commas before `Number()` conversion, so values like `"62%"` and `"$1,234"` parse correctly.

---

## Local development

No build step needed. Just open `index.html` in a browser:

```bash
git clone https://github.com/wangzaa/chart-maker.git
cd chart-maker
open index.html          # macOS
# or: python3 -m http.server 8080
```

## Deploying updates

```bash
git add index.html README.md
git commit -m "describe changes"
git push
```

GitHub Pages publishes automatically from `main` root.
