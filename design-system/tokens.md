# Design Tokens

> Source of truth for every visual value in the Patel Networks design system.
> These are extracted from the approved hero + kit builder patterns.

---

## Color

### Light Theme (default — "Editorial Premium")

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#FAF8F5` | Page background — warm off-white |
| `--ink` | `#1A1A1A` | Primary text — warm near-black |
| `--card` | `#FFFFFF` | Card/container background — pure white on off-white |
| `--surface-1` | `#FFFFFF` | Primary container surface |
| `--surface-2` | `#F3F0EB` | Alt section / nested surface — warm gray |
| `--surface-3` | `#EAE7E2` | Interactive/input surface |
| `--brand` | `#1E3A5F` | Accent — deep cobalt (used sparingly: links, CTAs, active states) |
| `--brand-soft` | `#2C5282` | Hover/active accent — medium cobalt |
| `--brand-tint` | `#EBF2FA` | Whisper cobalt — hover backgrounds |
| `--stone` | `#6B6B6B` | Secondary text — warm gray |
| `--stone-soft` | `#9B9B9B` | Tertiary text — light gray |
| `--border-strong` | `#D1CEC9` | Level 1 border — structural (section boundaries, major containers) |
| `--border` | `#E5E2DD` | Level 2 border — component (cards, inputs, table rows) |
| `--border-subtle` | `#F0EDE8` | Level 3 border — divider (hairlines within cards) |
| `--destructive` | `#B91C1C` | Error/destructive actions |

### Dark Theme (toggle — "Industrial Steel")

| Token | Value | Usage |
|---|---|---|
| `--paper` | `#1C1917` | Page background — warm charcoal (NOT pure black) |
| `--ink` | `#FAFAF9` | Primary text — warm off-white |
| `--card` | `#292524` | Card/container background — stone-800 |
| `--surface-1` | `#292524` | Primary container surface |
| `--surface-2` | `#1C1917` | Alt section — stone-900 |
| `--surface-3` | `#0C0A09` | Interactive/input surface — stone-950 |
| `--brand` | `#F59E0B` | Accent — amber-500 (industrial, technical) |
| `--brand-soft` | `#FBBF24` | Hover/active accent — amber-400 |
| `--brand-tint` | `#422006` | Whisper amber — amber-950 |
| `--stone` | `#A8A29E` | Secondary text — stone-400 |
| `--stone-soft` | `#78716C` | Tertiary text — stone-500 |
| `--border-strong` | `#78716C` | Level 1 — stone-500 |
| `--border` | `#57534E` | Level 2 — stone-600 |
| `--border-subtle` | `#44403C` | Level 3 — stone-700 |

### Hero/Overlay Colors (dark sections on light theme)

| Token | Value | Usage |
|---|---|---|
| `--hero-bg` | `#1A1A1A` | Hero section background (near-black) |
| `--hero-overlay` | `linear-gradient(to top, rgba(0,0,0,0.8), rgba(0,0,0,0.2), rgba(0,0,0,0.4))` | Gradient overlay on hero image |
| `--hero-accent` | `#8BAAC4` | Accent on dark hero (lighter cobalt for legibility) |
| `--hero-text` | `#FFFFFF` | Hero text — pure white |

### Status Colors (both themes)

| Token | Value | Usage |
|---|---|---|
| `--success` | `#1A6B4F` | In stock, success states |
| `--success-soft` | `#E8F5F0` | Success background tint |
| `--warning` | `#A8743A` | Low stock, caution |
| `--warning-soft` | `#F7EFE3` | Warning background tint |
| `--danger` | `#8C3A2E` | Out of stock, errors |
| `--danger-soft` | `#F9ECEA` | Danger background tint |

---

## Typography

### Font Families

| Token | Value | Usage |
|---|---|---|
| `--font-display` | `Georgia, "Times New Roman", serif` | All h1/h2 headings — editorial serif |
| `--font-sans` | `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif` | Body text, UI labels, buttons, data |
| `--font-mono` | `ui-monospace, SFMono-Regular, Menlo, Consolas, monospace` | Prices, SKUs, model numbers, order numbers |

### Type Scale (using clamp() for responsive scaling)

| Element | Size | Weight | Line Height | Tracking | Font |
|---|---|---|---|---|---|
| Hero headline | `clamp(2rem, 6vw, 4rem)` | 500 (medium) | 1.05 | -0.02em | Display (serif) |
| Section heading | `clamp(1.5rem, 4vw, 2.5rem)` | 500 (medium) | 1.15 | -0.02em | Display (serif) |
| Card title | `0.875rem` (14px) | 600 (semibold) | 1.4 | 0 | Sans |
| Body | `0.875rem` (14px) | 400 (regular) | 1.6 | 0 | Sans |
| Small body | `0.75rem` (12px) | 400 (regular) | 1.5 | 0 | Sans |
| Eyebrow label | `0.6875rem` (11px) | 700 (bold) | 1 | 0.2em uppercase | Sans |
| Price | `1.125rem` (18px) | 700 (bold) | 1 | 0 | Mono |
| Micro text | `0.625rem` (10px) | 500 (medium) | 1.4 | 0 | Sans |

---

## Spacing

### Base Scale (4px grid)

| Token | Value | Usage |
|---|---|---|
| `--space-0` | `0` | No gap |
| `--space-1` | `4px` | Tight grouping (icon + text) |
| `--space-2` | `8px` | Related elements (label + input) |
| `--space-3` | `12px` | Card internal padding (mobile) |
| `--space-4` | `16px` | Card internal padding (desktop), grid gap |
| `--space-5` | `20px` | Section internal gaps |
| `--space-6` | `24px` | Between unrelated cards |
| `--space-8` | `32px` | Between sections (mobile) |
| `--space-10` | `40px` | Between sections (desktop) |
| `--space-12` | `48px` | Large section gaps |
| `--space-16` | `64px` | Hero padding |
| `--space-20` | `80px` | Hero vertical padding (desktop) |

### Container

| Token | Value |
|---|---|
| `--container-max` | `1400px` |
| `--container-padding-mobile` | `16px` (px-4) |
| `--container-padding-tablet` | `24px` (px-6) |
| `--container-padding-desktop` | `40px` (px-10) |

---

## Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | `2px` | Badges, pills (minimal — editorial) |
| `--radius` | `6px` | Default — inputs, small buttons |
| `--radius-md` | `8px` | Medium cards, selects |
| `--radius-lg` | `12px` | Large cards, modals |
| `--radius-xl` | `16px` | Feature cards, hero image containers |
| `--radius-full` | `9999px` | Pills, badges, dots |

**Rule**: Use `rounded-xl` (16px) for product cards and category tiles. Use `rounded-lg` (12px) for modals and feature cards. Use `rounded` (6px) for buttons and inputs. Use `rounded-full` for status badges and pills.

---

## Shadow

| Token | Value | Usage |
|---|---|---|
| `--shadow-none` | `none` | Default — borders separate, not shadows |
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle elevation (dropdowns) |
| `--shadow-md` | `0 4px 6px rgba(0,0,0,0.07)` | Hover state on cards |
| `--shadow-lg` | `0 10px 15px rgba(0,0,0,0.1)` | Active modal, prominent card hover |
| `--shadow-xl` | `0 20px 25px rgba(0,0,0,0.15)` | Floating elements, modals |

**Rule**: Default state = no shadow (border only). Hover = `shadow-md` or `shadow-lg`. Modals = `shadow-xl`.

---

## Motion

| Token | Duration | Easing | Usage |
|---|---|---|---|
| `--transition-fast` | `150ms` | `ease` | Button press, toggle |
| `--transition-normal` | `250ms` | `cubic-bezier(0.4, 0, 0.2, 1)` | Hover states, color changes |
| `--transition-slow` | `400ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Card hover, image zoom |
| `--transition-slower` | `700ms` | `cubic-bezier(0.2, 0.8, 0.2, 1)` | Image scale on hover |

**Rule**: Motion should be subtle and fast. No bouncy animations. No dramatic page transitions. Image zoom = 500-700ms slow ease. Button press = scale(0.95-0.98). Card hover = shadow + border color change at 250-300ms.
