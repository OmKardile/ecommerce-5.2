# Design Guidelines

> Rules for building with the Patel Networks design system.

---

## Do's and Don'ts

### ✅ Do

- Use Georgia serif (`font-display`) for all major headings (h1, h2) — it's the signature
- Use system sans (`font-sans`) for all body text, UI labels, buttons, data
- Use mono (`font-mono`) for prices, SKUs, model numbers, order numbers
- Use `clamp()` for all headline font sizes — responsive by default
- Use the 3-level border hierarchy: `border-strong` (structural) → `border` (component) → `border-subtle` (divider)
- Use `gap-px bg-border` for hairline grid dividers (kit builder pattern)
- Use `bg-foreground text-background` for selected/inverted states (kit builder pattern)
- Use `rounded-xl` (16px) for product cards and category tiles
- Use `rounded-lg` (12px) for modals and feature cards
- Use `rounded` (6px) for buttons and inputs
- Use white-on-dark inversion for hero sections (white CTA on dark overlay)
- Use `strokeWidth={1.5}` on all Lucide icons (thin, refined — not default 2)
- Keep copy minimal on hero sections (Apple-style: headline + 1 line + button)
- Show prices prominently on product cards (text-lg font-bold)
- Show "Add to Cart" button on product cards (not hidden behind hover)

### ❌ Don't

- Don't use blue/indigo as the primary accent — cobalt `#1E3A5F` only
- Don't use gradients on buttons (solid color only)
- Don't use glassmorphism (`backdrop-blur` on cards)
- Don't use pure black `#000000` for backgrounds — use `#1A1A1A` (warm near-black)
- Don't use `rounded-2xl` or `rounded-3xl` — max is `rounded-xl` (16px)
- Don't use heavy shadows in default state — borders separate, shadows only on hover
- Don't use emoji as UI elements
- Don't use decorative SVG illustrations
- Don't use custom decorative icon libraries — Lucide only
- Don't use 5 different font families — max 3 (display serif, sans, mono)
- Don't make every heading huge — reserve large sizes for hero + section headlines only
- Don't center everything — use asymmetric grids where appropriate
- Don't add motion that distracts — transitions should be 150-400ms, subtle
- Don't use `alert()` for user feedback — use UI feedback (setFeedback, toast, inline error)
- Don't use `catch (err: any)` — use `catch (err: unknown)` + instanceof narrowing

---

## Responsive Rules

| Breakpoint | Tailwind prefix | What changes |
|---|---|---|
| < 640px | (default) | 2-col product grid, stacked sections, mobile menu, px-4 |
| ≥ 640px | `sm:` | 3-col categories, search visible, px-6 |
| ≥ 768px | `md:` | Sidebar visible on admin, px-6 |
| ≥ 1024px | `lg:` | 4-col product grid, sticky sidebar, px-10, desktop nav |
| ≥ 1280px | `xl:` | No changes (max-w-[1400px] container) |

### Mobile-first rules:
1. All grids start at 1 or 2 columns, expand at `lg:`
2. All padding starts at `px-4`, expands to `px-6` at `sm:` and `px-10` at `lg:`
3. All section padding starts at `py-12`, expands to `py-16` or `py-20` at `lg:`
4. Sticky sidebars: `lg:sticky lg:top-24` (not sticky on mobile)
5. Desktop-only elements: `hidden lg:block` or `hidden lg:flex`
6. Mobile-only elements: `lg:hidden`

---

## Motion Rules

| Interaction | Duration | Easing | Property |
|---|---|---|---|
| Button hover | 150ms | ease | translateY(-1px) |
| Button press | 150ms | ease | scale(0.98) |
| Card hover | 250ms | cubic-bezier(0.4, 0, 0.2, 1) | border-color + shadow |
| Image zoom | 500ms | cubic-bezier(0.2, 0.8, 0.2, 1) | transform: scale(1.1) |
| Modal open | 250ms | cubic-bezier(0.2, 0.8, 0.2, 1) | opacity + translateY |
| Dropdown | 200ms | ease | opacity + height |
| Scroll reveal | 600ms | cubic-bezier(0.2, 0.8, 0.2, 1) | opacity + translateY(10px) |

### `prefers-reduced-motion`:
All animations must be disabled when `prefers-reduced-motion: reduce` is active. Set `transition: none` and `opacity: 1` / `transform: none` for all animated elements.

---

## Accessibility Rules

1. **Contrast**: All text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text)
2. **Focus states**: `:focus-visible` outline = 2px solid `var(--brand)`, offset 2px
3. **Keyboard**: All interactive elements must be `<button>`, `<a>`, or `<input>` (semantic)
4. **Screen readers**: Use `sr-only` for visually hidden but screen-reader-accessible text
5. **Alt text**: All images must have descriptive `alt` attributes
6. **Labels**: All form inputs must have associated `<label>` or `aria-label`
7. **Touch targets**: Minimum 44px × 44px for all interactive elements on mobile
8. **Color independence**: Information must not rely on color alone (use text + color)

---

## Color Usage Rules

### Light theme (default):
- Background: `--paper` (`#FAF8F5`) — warm off-white
- Text: `--ink` (`#1A1A1A`) — warm near-black
- Accent: `--brand` (`#1E3A5F`) — cobalt, used for: links, CTAs, active states, brand name
- Cards: `--card` (`#FFFFFF`) — pure white (creates subtle layering on off-white bg)
- Borders: 3-level hierarchy (never use the same border weight everywhere)

### Dark theme (toggle):
- Background: `--paper` (`#1C1917`) — warm charcoal (NOT pure black)
- Text: `--ink` (`#FAFAF9`) — warm off-white
- Accent: `--brand` (`#F59E0B`) — amber (different from light theme's cobalt)
- Cards: `--card` (`#292524`) — stone-800
- Borders: 3-level hierarchy (stone-500 → stone-600 → stone-700)

### Status colors (both themes):
- Success (in stock): green dot + "In Stock" text
- Warning (low stock): amber dot + "X left" text
- Danger (out of stock): grey dot + "Sold Out" text + grayscale image

### Accent usage rules:
- Cobalt/amber is for INTERACTIVE states only: links, active, hover, selected
- Never use cobalt/amber for decorative borders, backgrounds, or non-interactive elements
- The accent should appear on max 3-5 elements per viewport
