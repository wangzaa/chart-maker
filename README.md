# Chart Maker

A browser-based chart builder with no backend, no build step, and no dependencies beyond Chart.js. Paste CSV data, pick a chart type, and export a PNG — all in one page.

**Live:** https://wangzaa.github.io/chart-maker/

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

---

## Data format

Paste or drop a CSV. First column = row labels; first row = column headers.  
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

Toggle **Data Pivot ON** to flip x-axis: columns become categories, rows become bar series.  
With the example above + Data Pivot: years on x-axis, regions stacked, Growth line visible.

---

## Options

| Toggle | Effect |
|---|---|
| **With headers** | Treat first row as column headers |
| **Data labels** | Show values inside/above bars and slices |
| **Grid lines** | Y-axis gridlines |
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

- **Combi line-on-top:** Chart.js 4 mixed charts always paint bar rectangles after line paths regardless of `order`. A custom `afterDraw` plugin repaints line datasets after the full chart render, clipped to the chart area.
- **CAGR arrow:** Custom canvas plugin with dynamic vertical clearance — scans all intermediate bars and lifts the arrow enough to clear the tallest one, then places the oval callout above the midpoint.
- **y2 scale:** Explicit clean `min`/`max` derived from line data using a "nice number" step algorithm (rounds to `1/2/5/10/20/25/50…` multiples). Avoids Chart.js auto-scale producing odd decimals like `118.3`.
- **Number parser:** Strips `%`, `$`, `£`, `€`, spaces, and thousands commas before `Number()` conversion.

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
