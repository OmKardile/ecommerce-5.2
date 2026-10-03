# Layout Patterns

> Page-level composition patterns derived from the hero + kit builder.

---

## 1. Full-Bleed Hero (homepage)

The signature pattern. A full-viewport-height dark image with centered text overlay.

```
structure:
  <section class="relative h-[90vh] min-h-[600px] flex items-end justify-center overflow-hidden bg-[#1A1A1A]">
    <Image fill object-cover opacity-90 />           // full-bleed background
    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/40" />  // gradient overlay
    <div class="relative z-10 text-center text-white px-6 pb-16 lg:pb-24 max-w-3xl">
      <eyebrow />                                      // tracking-[0.2em] uppercase text-[11px] text-white/70
      <h1 class="text-[clamp(2rem,6vw,4rem)] font-medium" style="font-family: Georgia, serif" />
      <p class="text-sm sm:text-base text-white/60 max-w-lg mx-auto" />
      <CTA class="bg-white text-[#1A1A1A] px-7 py-3.5 rounded-lg font-bold" />
    </div>
  </section>
```

**Rules:**
- Height: `h-[90vh] min-h-[600px]` — fills viewport on desktop, 600px minimum on mobile
- Image: `object-cover opacity-90` — full bleed, slightly faded
- Gradient: always from bottom (dark → transparent → slightly dark) for text legibility
- Text: centered, max-width 3xl, padded from bottom
- Eyebrow: small dot + uppercase tracked label
- Headline: Georgia serif, clamp() scaling, font-weight 500 (medium, not bold)
- CTA: white button on dark — inverted from normal (normally dark button on light)

---

## 2. Step Indicator + Selection Grid + Sticky Sidebar (kit builder)

The configurator pattern. Three zones working together.

```
structure:
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
    <!-- Left: step content -->
    <div class="lg:col-span-8">
      <StepHeader />                                    // eyebrow "Step X of 5" + serif h2 + description
      <div class="grid grid-cols-1 gap-px bg-border">  // selection grid with hairline dividers
        <SelectionCard />
        <SelectionCard selected />
      </div>
      <NavigationButtons />                             // Previous / Next
    </div>
    <!-- Right: sticky summary -->
    <div class="lg:col-span-4 lg:sticky lg:top-24">
      <SummaryCard />                                   // items list + total + add to cart
    </div>
  </div>
```

**Rules:**
- Step indicator: 5-col grid, active = `bg-foreground text-background` (inverted), done = cobalt check icon
- Selection grid: `gap-px bg-border` creates 1px hairline dividers between cards
- Selected card: `bg-foreground text-background` (inverted — same as active step)
- Unselected card: `bg-background` with `hover:bg-accent/50`
- Sticky sidebar: `lg:sticky lg:top-24` — stays visible while scrolling content
- Summary rows: `border-t border-border-subtle` between each item
- Total: `text-xl font-bold text-[var(--brand)]`

---

## 3. Product Grid (storefront)

Allbirds/Nike-style product-first grid.

```
structure:
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    <ProductCard />
    ...
  </div>
```

**Rules:**
- Mobile: 2 columns (not 1 — products should be browsable on mobile)
- Desktop: 4 columns
- Gap: `gap-4` on mobile, `gap-6` on desktop (spacious)
- Card: rounded-xl, square image, border + hover shadow
- No gap-px dividers (each card is independent, not a continuous surface)

---

## 4. Category Tile Grid (Apple Store style)

```
structure:
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    <CategoryTile />
    ...
  </div>
```

**Rules:**
- Mobile: 2 columns, desktop: 6 columns
- Tile: `bg-card border border-border rounded-xl p-5 hover:shadow-lg`
- Content: centered, name + product count
- No images (text-only tiles — faster, cleaner)

---

## 5. Full-Bleed Banner (kit builder CTA)

A dark section with image at low opacity + text overlay. Used for CTAs between content.

```
structure:
  <section class="relative h-[400px] lg:h-[500px] overflow-hidden bg-[#1A1A1A]">
    <Image fill object-cover opacity-30 />
    <div class="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent" />
    <div class="relative z-10 h-full flex items-center px-6 lg:px-16">
      <div class="max-w-lg text-white">
        <h2 class="text-[clamp(1.5rem,4vw,2.5rem)]" style="font-family: Georgia, serif" />
        <p class="text-sm text-white/60 mb-6" />
        <CTA class="bg-white text-[#1A1A1A]" />
      </div>
    </div>
  </section>
```

**Rules:**
- Height: 400px mobile, 500px desktop
- Image: `object-cover opacity-30` (faded into the dark bg)
- Gradient: left-to-right (dark → transparent) — text on left side
- Text: left-aligned, max-width lg
- CTA: white button on dark (inverted)

---

## 6. Section Spacing

| Section type | Mobile padding | Desktop padding |
|---|---|---|
| Hero | 90vh | 90vh |
| Trust bar | py-6 (24px) | py-6 (24px) |
| Categories | py-12 (48px) | py-16 (64px) |
| Products | pb-12 (48px) | pb-16 (64px) |
| Banner/CTA | my-8 (32px) | my-12 (48px) |
| Brands | py-12 (48px) | py-16 (64px) |
| Footer trust | py-8 (32px) | py-8 (32px) |
| Footer main | py-14 (56px) | py-14 (56px) |
