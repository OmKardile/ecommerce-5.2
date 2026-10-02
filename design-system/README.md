# Patel Networks — Design System

> **"Luxury in presentation, precision in functionality."**
>
> A design system built around the hero section and kit builder — the two UI patterns
> the client approved and locked in. Every other component derives from these primitives.

---

## What's in here

| File | Purpose |
|---|---|
| `tokens.md` | All design tokens (color, type, spacing, radius, shadow) with hex values + usage rules |
| `tokens.css` | The same tokens as CSS custom properties — copy into your `:root` |
| `components.md` | Component specs: ProductCard, Buttons, Badges, Inputs, Tables, StepIndicator, etc. |
| `patterns.md` | Layout patterns: Full-bleed Hero, Selection Grid, Sticky Summary Sidebar, Step Indicator, Trust Bar |
| `guidelines.md` | Do's and don'ts, responsive rules, motion rules, accessibility rules |
| `README.md` | This file — how to use the design system |

---

## Design DNA

The system is built on **two locked patterns**:

### 1. The Hero (homepage)
A full-bleed dark image with centered text overlay. Gradient from bottom for legibility. Large Georgia serif headline. Minimal copy. One bold CTA.

```
┌──────────────────────────────────┐
│                                  │
│        [full-bleed image]        │
│                                  │
│   ┌─ gradient overlay ─┐         │
│   │                   │          │
│   │  • EYEBROW LABEL  │         │
│   │  See everything.  │         │
│   │  Miss nothing.     │         │
│   │  Subtitle text     │         │
│   │  [ Shop Now → ]    │         │
│   │                   │          │
│   └───────────────────┘         │
└──────────────────────────────────┘
```

### 2. The Kit Builder (step-based configurator)
A 5-step wizard with a sticky summary sidebar. Each step shows a selection grid of cards. Selected = solid dark inverted. Step indicator at top with numbered cells.

```
┌─────────────────────────────────────────────┐
│ 01  02  03  04  05  (step indicator)         │
├─────────────────────────────────┬───────────┤
│ Step 1 of 5                     │  SUMMARY  │
│ Select your recorder            │           │
│                                 │  DVR: ... │
│ ┌─────┐ ┌─────┐ ┌─────┐       │  Cams: 0  │
│ │ A   │ │ B ✓ │ │ C   │       │  HDD: ... │
│ │     │ │     │ │     │       │  Total:   │
│ └─────┘ └─────┘ └─────┘       │  ₹12,400  │
│                                 │           │
│              [ Next → ]         │ [Add Cart]│
└─────────────────────────────────┴───────────┘
```

Everything else — ProductCard, category tiles, brand strips, trust bars — is derived from these two patterns.

---

## How to use

1. Copy `tokens.css` into your `globals.css` `:root` block
2. Follow `components.md` for building new components
3. Follow `patterns.md` for page-level layouts
4. Check `guidelines.md` before shipping

---

## Designed by

**Omkar Kardile** — [omkardile.is-a.dev](https://omkardile.is-a.dev/)
Patel Networks · India · 2026
