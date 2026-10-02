# Component Specs

> Every component in the Patel Networks design system, derived from the hero + kit builder patterns.

---

## Buttons

### Primary (`.btn-ink` or `bg-foreground text-white`)
```
background: var(--ink) / #1A1A1A
color: var(--paper) / #FAF8F5
font: 13px, weight 500, sans-serif
padding: 14px 28px (0.875rem 1.75rem)
border-radius: var(--radius) / 6px
hover: translateY(-1px)
active: translateY(0) scale(0.985)
```
Usage: "Shop Now", "Add to Cart" (on detail page), "Start Builder", "Submit"

### Secondary (`.btn-ghost`)
```
background: transparent
color: var(--ink)
border: 1px solid var(--hairline-strong) / #D1CEC9
padding: 13px 27px (1px less to account for border)
border-radius: var(--radius) / 6px
hover: border-color: var(--ink), background: var(--surface-2), translateY(-1px)
```
Usage: "Build a kit" (text link with border), "Cancel", "Clear filters"

### Accent (cobalt)
```
background: var(--brand) / #1E3A5F
color: #FFFFFF
hover: background: var(--brand-soft) / #2C5282
```
Usage: ProductCard "Add to Cart" button, active step indicator

### Hero CTA (on dark overlay)
```
background: #FFFFFF
color: #1A1A1A
padding: 14px 28px
border-radius: 8px (rounded-lg)
font-weight: 700 (bold)
hover: background: rgba(255,255,255,0.9)
```
Usage: Hero "Shop Now" button only

---

## ProductCard

The core e-commerce card. Derived from Allbirds/Nike product tiles.

```
container: bg-card, rounded-xl, border border-border, hover:shadow-lg + hover:border-[var(--brand)]
image: aspect-square, bg-surface-2, object-contain p-6, hover:scale-110 (500ms)
badges:
  - discount: absolute top-3 left-3, bg-red-500 text-white, text-xs font-bold, rounded-full
  - stock: absolute top-3 right-3, amber-500 (low) / gray-800 (out), text-[10px] uppercase, rounded-full
content: p-4
  - brand: text-[10px] font-bold uppercase text-[var(--brand)]
  - title: text-sm font-semibold, line-clamp-2, hover:text-[var(--brand)]
  - price: text-lg font-bold, font-mono optional
  - MRP: text-xs line-through text-stone-400 (if discount exists)
  - button: full-width, bg-[var(--brand)] text-white, rounded-lg, py-2.5
    states: Adding (spinner) → Added (bg-green-600) → reset 2.5s
```

---

## Badge / Pill

```
base: inline-flex items-center gap-1.5, px-2.5 py-0.5, rounded-full, text-xs font-medium
variants:
  - default: bg-surface-2 text-stone
  - success: bg-green-100 text-green-700 (In Stock)
  - warning: bg-amber-100 text-amber-700 (Low Stock)
  - danger: bg-red-100 text-red-700 (Out of Stock)
  - brand: bg-[var(--brand-tint)] text-[var(--brand)]
```

---

## Input (hairline underline)

```
background: transparent
border: none (border-bottom only)
border-bottom: 1px solid var(--border)
padding: 10px 0
font-size: 14px
color: var(--foreground)
focus: border-bottom-color: var(--foreground) (or var(--brand))
placeholder: color var(--stone-soft)
transition: border-color 250ms
```
Usage: Header search, admin forms, checkout address fields

---

## Table

```
container: border border-[var(--border-strong)], rounded-lg, overflow-hidden
header: bg-[var(--surface-2)], text-[10px] uppercase tracking-[0.1em] font-bold, text-stone-500, py-3 px-4
rows: divide-y divide-[var(--border)], py-3.5 px-4
hover: bg-[var(--surface-2)] at 50% opacity
mono: font-mono for prices, SKUs, order numbers, dates
```

---

## Step Indicator (from Kit Builder)

```
container: grid grid-cols-5, border-t border-border
cell:
  - base: flex flex-col items-center gap-1, py-4 px-3, border-b border-border, transition-colors
  - active: bg-foreground text-background (inverted)
  - done: text-[var(--brand)] with Check icon
  - pending: text-stone-400
number: font-mono text-xs
label: text-xs sm:text-sm font-medium
connector: border-r border-border (between cells, not after last)
```

---

## Selection Card (from Kit Builder)

```
container: grid grid-cols-1 gap-px bg-border (creates hairline dividers)
card:
  - base: flex items-start justify-between gap-4, p-5, bg-background, hover:bg-accent/50, transition-colors
  - selected: bg-foreground text-background (inverted)
  - content: space-y-1.5
    - title: text-sm font-bold
    - specs: text-xs text-stone-500 (or text-background/60 when selected)
    - price: font-mono text-sm
  - check icon: appears when selected, text-[var(--brand)] (or text-background when selected)
```

---

## Sticky Summary Sidebar (from Kit Builder)

```
container: lg:col-span-4, lg:sticky lg:top-24
card: bg-card, border border-[var(--border-strong)], p-7, rounded-lg
sections:
  - header: eyebrow text-stone-500
  - rows: flex justify-between, text-sm, border-t border-[var(--border-subtle)] py-3
  - total: text-xl font-bold, text-[var(--brand)]
  - CTA: btn-ink full-width
```

---

## Category Tile

```
container: bg-card, border border-border, rounded-xl, p-5, hover:shadow-lg transition-all
content: text-center
  - name: text-sm font-bold, group-hover:text-[var(--brand)]
  - count: text-[10px] text-stone, mt-1
```

---

## Brand Wordmark

```
text-lg lg:text-xl, font-display (Georgia serif), font-medium
color: text-stone (default) → text-foreground on hover
layout: flex flex-wrap justify-center gap-6 lg:gap-10
```

---

## Trust Bar (dark strip)

```
container: bg-[#1A1A1A] text-white, py-6, border-t border-white/10
grid: grid-cols-2 lg:grid-cols-4 gap-4
item: flex items-center gap-3
  - icon: w-5 h-5, text-[#8BAAC4], strokeWidth 1.5
  - label: text-xs font-bold text-white
  - sub: text-[10px] text-white/40
```

---

## Modal

```
backdrop: fixed inset-0, bg-foreground/40
panel: relative, bg-card, border border-[var(--border-strong)], max-w-md, p-6, rounded-lg
close: absolute top-4 right-4, text-stone-400 hover:text-foreground
```
