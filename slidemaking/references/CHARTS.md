# Chart Creation Guide — chart-maker

All charts in this skill are produced via [chart-maker](https://chart.altree.co) (source: `/Users/neo/Desktop/chart-maker`). It runs entirely in-browser, takes CSV input, and exports PNGs you embed into slides via pptxgenjs `addImage`.

**Why chart-maker (not matplotlib):** single rendering engine across the whole deck means consistent palette, typography, and spacing — every chart looks like it belongs to the same deck. No script-per-chart-type drift.

---

## Workflow

1. Open https://chart.altree.co
2. Paste CSV into the textarea
3. Pick chart type, set toggles
4. Click **Copy chart** → PNG copied to clipboard (or auto-downloaded)
5. Save PNG into the deck's asset folder
6. Embed in slide:

```javascript
slide.addImage({ path: "chart.png", x: 0.5, y: 1.5, w: 12.3, h: 5.0 });
```

---

## Chart Types and CSV Formats

### Bar / Stacked Bar / Line / Area / Pie / Doughnut

First column = row labels; first row = column headers.

```
Region,2022,2023,2024
North America,42,51,68
Europe,31,38,44
Asia Pacific,55,72,91
```

### Combi (stacked bars + line on secondary axis)

Last row is the line series. All other rows are stacked bars.

```
Region,2022,2023,2024
North America,42,51,68
Europe,31,38,44
Asia Pacific,55,72,91
Growth,62,65,76
```

Toggle **Data Pivot ON** to flip — columns become categories, rows become bar series.

### Waterfall

Two columns: label + value. Negative = decrease. Optional third column `total` pins a running-total bar.

```
Category,Value
Starting point,120
New contracts,45
Churn,-18
Expansion,32
Q4 Total,179,total
```

### Bubble (categorical or numerical, auto-detected)

Required: `Label`, `X`, `Y`, `Size`. Optional: `Group` (drives colour).

Categorical (X or Y is text):
```
Label,X,Y,Size,Group
17%,West,Rackets,450,High
13%,West,Bats,400,Medium
```

Numerical (all X/Y numeric):
```
Label,X,Y,Size,Group
16%,0.5,1.0,0.2,A
72%,0.3,0.4,3.7,A
```

---

## Toggles

| Toggle | When to enable |
|--------|----------------|
| **With headers** | Always (default), unless first row is data |
| **Data labels** | On for executive slides; off only when bars are too small to label |
| **Grid lines** | On for line/area; off for bars (cleaner) |
| **Legend** | On when >1 series; off for single-series |
| **Connectors** | On for stacked bars showing growth (dashed lines between bar tops) |
| **CAGR** | On for time-series totals where growth rate matters |
| **CAGR (Series)** | Stacked-bar only — per-series growth labels on right |
| **Data Pivot** | When CSV is shaped opposite to what you want plotted |
| **Rotate 90°** | Horizontal bar layout (>5 categories or long labels) |

---

## Palettes

Match the deck's slide palette. chart-maker offers:

| Palette | Use when |
|---------|----------|
| **Blue** (`#051C2A` `#163E93` `#30A3DA` `#A2AAAD` `#D9D9D9`) | Default analytical decks |
| **Mono** (all `#D9D9D9`) | Backdrop charts where the data table is the focus |
| **Alt** (`#00966C` `#113E88` `#F28E42` `#4DC7B1`) | Decks with a green/orange brand identity |

A deck must use one palette throughout. Do not mix palettes across slides.

---

## Heat-Map Tables

chart-maker doesn't render heat-map tables natively. For these, build the table directly in pptxgenjs using `slide.addTable` with per-cell `fill` colors derived from the value's quintile:

| Quintile | Background | Text |
|----------|------------|------|
| Top 20% | `051C2A` | `FFFFFF` |
| 60–80% | `163E93` | `FFFFFF` |
| 40–60% | `30A3DA` | `1A1A1A` |
| 20–40% | `A2AAAD` | `1A1A1A` |
| Bottom 20% | `D9D9D9` | `1A1A1A` |
| NA | `E8E8E8` | `888888` |
| Highlight row | `FAD4B4` | `1A1A1A` (bold) |

Header row: white background, bold, `1A1A1A`, bottom border `051C2A`.

---

## Common Mistakes

- **Palette drift across charts in one deck** — pick once, stick with it
- **Data labels on every bar** — disable on small bars; readers can't read 8pt numbers
- **Forgetting to set Rotate 90° for >5 categories** — vertical bars with rotated labels are ugly
- **Pasting unscaled bubble Size values** — chart-maker √-scales them, but extreme ratios still distort; trim outliers
