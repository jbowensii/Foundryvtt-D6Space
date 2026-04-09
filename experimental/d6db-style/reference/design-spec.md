# D6DB.com Design Specification — Reference for FoundryVTT Character Sheets

## Technology Stack
- Next.js (React SSR) with Tailwind CSS + custom design tokens
- Lucide icon set (SVG, strokeWidth 1.5)
- Three theme modes: dark, light, neutral

## Color System — "Holographic Terminal" Aesthetic

| Token | Hex | Role |
|-------|-----|------|
| Holo (primary) | `#38bdf8` (cyan-400) | ALL game stats, dice codes, interactive elements, headings |
| Rebel (secondary) | `#f59e0b` (amber-500) | Badges, alerts |
| Body background | `#07090f` | Near-black with blue undertone |
| Card background | `#0a0f1a` | Slightly lighter dark blue |
| Card border | `#1e3255` | Dark blue border |
| Holo glow | `rgba(56,189,248,0.5)` at 12px | Box shadow glow effect |

Space neutral scale: `space-400` (#1e3255) → `space-900` (#07090f)

Section icons color-coded: red (combat), yellow (points), teal (equipment), violet (abilities/Force), amber (identity).

## Typography — 3 Fonts

| Font | Class | Used For |
|------|-------|----------|
| **Orbitron** | `font-display` | Headings, attribute labels, dice codes, stat values |
| **Exo 2** | `font-ui` | Buttons, nav, UI labels |
| **Inter** | body | Descriptions, skill names, body text |

Key pattern: ALL headings/labels use `tracking-widest uppercase` with Orbitron for sci-fi feel.

## Card System (`card-holo`)

- Border: `1px solid #1e3255`
- Background: `#0a0f1a` with subtle cyan grid pattern at 3% opacity
- Shadow: `0 4px 24px rgba(0,0,0,0.5)` + inset top highlight
- Radius: `0.5rem` (8px)
- Hover: border brightens, glow shadow appears

## Character Sheet Layout (NPC Detail Page)

1. **Character Identity Card** — name (Orbitron, uppercase, cyan), subtitle (faction), type badge
2. **Quick Stats Grid** — 2x2 mobile, 4x1 desktop: Move, Force Points, CP, Dark Side Points
3. **Attributes & Skills** — 2-column grid:
   - Left: Dexterity, Perception, Strength
   - Right: Knowledge, Mechanical, Technical
   - Attribute: tiny uppercase label + bold cyan dice code
   - Skills: 2px cyan left-border, pl-3 indent, flex justify-between (name left, dice right)
4. **Points Summary** — label/value rows
5. **Special Abilities** — violet icon, whitespace-pre-wrap
6. **Equipment** — teal icon, list items
7. **Background/Description** — Inter font, leading-relaxed

## Interactive Elements

- All dice codes clickable (`role="button"`, `data-dice-roll`)
- Cards have group hover effects (border brightens, icon color change)
- Search: command palette pattern (Cmd+K)

## Animations

- `holo-breathe`: 6s pulse
- `scanline-scroll`: 4s CRT scanline
- `holo-flicker`: 8s irregular opacity
- Cards have faint scanline overlay via `repeating-linear-gradient` at 4px spacing

## Recommended CSS Variables for FoundryVTT

```css
:root {
  --d6-body-bg: #07090f;
  --d6-card-bg: #0a0f1a;
  --d6-card-border: #1e3255;
  --d6-holo: #38bdf8;
  --d6-holo-glow: 0 0 12px rgba(56, 189, 248, 0.5);
  --d6-rebel: #f59e0b;
  --d6-text: #e2e8f0;
  --d6-text-muted: #94a3b8;
  --d6-radius: 0.5rem;
  --d6-font-display: 'Orbitron', sans-serif;
  --d6-font-ui: 'Exo 2', sans-serif;
  --d6-font-body: 'Inter', sans-serif;
}
```

## Key Design Principles

1. **Minimal color palette** — just cyan + amber against dark space
2. **Typography hierarchy** — Orbitron for game data, Inter for prose
3. **Card-based layout** — every section in a card-holo container
4. **Consistent spacing** — Tailwind scale (p-3, p-4, gap-2, gap-4)
5. **Subtle animation** — breathe/scanline effects add life without distraction
6. **Dice codes are interactive** — clickable with hover transitions
