# Chart Maker

**Make visually effective charts you can paste directly into PowerPoint, Google Slides, Word, or any document — in seconds.**

🔗 **[Open Chart Maker →](https://wangzaa.github.io/chart-maker/)**

---

## What it does

Chart Maker turns a pasted table or CSV file into a clean, consulting-grade chart with one click. Copy the result to your clipboard and paste it anywhere — no design software, no exports, no fuss.

Works with: **PowerPoint · Google Slides · Keynote · Word · Google Docs · Notion · email**

---

## How to use it

### Step 1 — Paste your data

Copy a table from Excel, Google Sheets, or any spreadsheet and paste it into the **data input box**.

```
Region,         2022,  2023,  2024
North America,    42,    51,    68
Europe,           31,    38,    44
Asia Pacific,     55,    72,    91
```

Or drag and drop a `.csv` file directly onto the drop zone.

> **Tip:** Make sure "With headers" is toggled **on** if your first row contains column names.

---

### Step 2 — Pick a chart type

Choose from the dropdown:

| Chart type | Best used for |
|---|---|
| **Bar chart** | Comparing values across categories |
| **Stacked bar** | Showing composition and totals |
| **Waterfall** | Revenue bridges, budget variance |
| **Line chart** | Trends over time |
| **Area chart** | Cumulative trends, volume |
| **Pie chart** | Share of a whole (5 categories max) |
| **Doughnut** | Same as pie, cleaner look |

---

### Step 3 — Choose a colour palette

Three palettes are available:

- **Brand** — deep navy → mid blue → light blue → grey (default consulting palette)
- **Mono** — all grey with white dividers (print-friendly, monochrome)
- **Alt** — green · navy · orange · teal (alternative brand)

---

### Step 4 — Set a title (optional)

Type your chart title in the **Chart title** field. It will appear above the chart in the output.

---

### Step 5 — Adjust options

Use the **Options** toggle strip to refine the chart:

| Toggle | What it does |
|---|---|
| **With headers** | Treats the first row as column labels |
| **Data labels** | Shows values on each bar or slice |
| **Grid lines** | Adds horizontal guide lines |
| **Legend** | Shows the series colour key |
| **Connectors** | Dashed lines between bars (best for stacked charts) |
| **Data Pivot** | Swaps which dimension is on the axis vs legend |
| **Rotate 90°** | Flips the chart to horizontal layout |

---

### Step 6 — Render

Click **Render chart**. The chart appears instantly below the controls.

---

### Step 7 — Copy and paste

Click **Copy chart**.

The chart is copied to your clipboard as a **transparent PNG at 2× resolution** — crisp on any screen, ready to paste onto any background colour.

Then:
- **PowerPoint / Keynote** → `Ctrl+V` / `Cmd+V` on any slide
- **Google Slides** → `Ctrl+V` / `Cmd+V`
- **Word / Google Docs** → `Ctrl+V` / `Cmd+V`
- **Notion / email** → `Ctrl+V` / `Cmd+V`

> If clipboard copy is blocked by your browser, a PNG file downloads automatically instead. Insert it via Insert → Image.

---

## Tips & tricks

**Waterfall charts** — just paste two columns (label + value). Positive numbers are increases, negative are decreases. A **Total** bar is added automatically.

```
Label,             Value
Starting revenue,  500000
New customers,     150000
Churn,             -30000
Upsells,            60000
Expenses,         -100000
```

**Data Pivot** — if your data has regions as rows and years as columns but you want years on the axis, toggle **Data Pivot** on. No need to reformat your spreadsheet.

**Rotate 90°** — long category names (like region names) often look better as a horizontal bar. Toggle **Rotate 90°** to flip without changing the data.

**Stacked bar with connectors** — select **Stacked bar**, then turn on **Connectors** to draw dashed bridge lines between segments across categories. Useful for showing flow between time periods.

---

## Supported data formats

- **Comma-separated** (`.csv`)
- **Tab-separated** (copied from Excel or Google Sheets)
- **With or without headers** — toggle "With headers" accordingly

Data is processed entirely in your browser. Nothing is sent to any server.

---

## Built with

- [Chart.js 4.4](https://www.chartjs.org/) — charting library
- [chartjs-plugin-datalabels](https://chartjs-plugin-datalabels.netlify.app/) — value labels
- Vanilla HTML / CSS / JavaScript — no framework, no build step

---

## Local development

No build process needed. Just open `index.html` in a browser:

```bash
git clone https://github.com/wangzaa/chart-maker.git
cd chart-maker
open index.html        # macOS
start index.html       # Windows
xdg-open index.html   # Linux
```

To deploy updates:

```bash
git add index.html
git commit -m "Update"
git push
```

GitHub Pages publishes automatically within ~30 seconds.

---

## Licence

MIT — free to use, modify, and share.
