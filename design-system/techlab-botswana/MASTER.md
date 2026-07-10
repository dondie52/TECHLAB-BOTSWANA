# Design System Master File

> **LOGIC:** When building a specific page, first check `design-system/pages/[page-name].md`.
> If that file exists, its rules **override** this Master file.
> If not, strictly follow the rules below.

---

**Project:** TechLab Botswana  
**Generated:** 2026-07-10 (ui-ux-pro-max)  
**Reconciled with:** [PRODUCT.md](../../PRODUCT.md), [DESIGN.md](../../DESIGN.md)  
**Category:** Local IT / home & business tech services (Mahalapye, Botswana)

---

## Brand overrides (source of truth)

Skill defaults that conflict with brand are **rejected**:

| Skill suggestion | Decision |
|------------------|----------|
| EB Garamond + Lato | Keep **Epilogue** (display/UI) + **Source Serif 4** (body) |
| Mint ground `#ECFDF5` | Keep clean near-white / oklch paper from DESIGN.md |
| Orange CTA `#F97316` | Keep **verdant green** primary actions |
| Heavy card shadows / SaaS glass | Prefer flat borders; documentary imagery is the visual anchor |
| Purple / Inter / neon glow | Forbidden by PRODUCT.md |

Personality: **practical, local, trustworthy**.

---

## Global Rules

### Color Palette

Use CSS variables in `styles.css` (oklch). Approximate hex for reference:

| Role | Token | Approx |
|------|-------|--------|
| Ground | `--paper` | near `#F7FAF9` |
| Ink | `--ink` | near `#0B1A1C` |
| Muted | `--muted` | ≥ 4.5:1 on paper |
| Primary / CTA | `--green` | near `#0D7A55` |
| Deep accent | `--green-deep` | darker green |
| Label accent | `--gold` | warm metal, sparingly |
| Line | `--line` | ink at ~12% |

Dark mode follows `prefers-color-scheme` with DESIGN.md dark tokens.

### Typography

- **Display / headings / labels:** Epilogue (600–800), tight tracking
- **Body:** Source Serif 4 (400), line-height ~1.65
- **Labels:** Epilogue uppercase, letter-spacing ~0.06em

### Spacing Variables

| Token | Value | Usage |
|-------|-------|--------|
| `--space-xs` | `4px` | Tight gaps |
| `--space-sm` | `8px` | Icon / inline |
| `--space-md` | `16px` | Standard padding |
| `--space-lg` | `24px` | Section padding |
| `--space-xl` | `32px` | Large gaps |
| `--space-2xl` | `48px` | Section margins |
| `--space-3xl` | `64px` | Hero padding |

### Interaction

- Transitions: **150–220ms** ease (color, opacity, border) — not layout-shifting scale
- Hover: color / opacity / background only
- Focus: visible `:focus-visible` ring using green tint
- Cursor: `pointer` on all clickable controls and links
- Continuous decorative animation: avoid; loading only. Respect `prefers-reduced-motion`

### Page Pattern

**Conversion-Optimized + Trust** (from skill)

- Section order: Hero → Chapters/value → Services → Nationwide → Quote CTA → Contact
- Primary CTA: WhatsApp above the fold + sticky chip + quote form
- Contact details: visible in a **post-hero strip** and contact section — never only in the footer; never crowding the hero

### Hero budget

First viewport only:

1. Brand lockup  
2. One headline  
3. One short supporting sentence  
4. CTA group  
5. Full-bleed documentary hero image  

Move phone / address / hours out of the hero into a contact strip or contact section.

---

## Style Guidelines

**Style:** Flat Design (skill) + documentary craft (PRODUCT)

**Key effects:** Simple hover (color/opacity), clean transitions 150–200ms, SVG icons only, imagery over illustration chrome.

---

## Anti-Patterns (Do NOT Use)

- Hidden contact info
- Emojis as icons
- Missing `cursor: pointer` on clickables
- Layout-shifting hovers (scale / large translate)
- Low-contrast muted text
- Instant state changes (no transition)
- Invisible focus states
- Content gated behind opacity:0 without JS / reduced-motion fallback
- Generic AI SaaS look (purple gradients, glassmorphism, Inter, neon)
- Editorial broadsheet / italic display serif stacks

---

## Pre-Delivery Checklist

- [ ] No emojis as icons (SVG only)
- [ ] `cursor: pointer` on clickable elements
- [ ] Hover transitions 150–300ms, no layout shift
- [ ] Light mode text contrast ≥ 4.5:1
- [ ] Focus states visible
- [ ] `prefers-reduced-motion` respected; content visible by default
- [ ] Responsive: 375 / 768 / 1024 / 1440
- [ ] No content under fixed header; no horizontal scroll
- [ ] Hero stays within budget (no address/hours/phone strip in first viewport)
