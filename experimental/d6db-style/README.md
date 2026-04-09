# D6DB-Style Character Sheet — Experimental

Inspired by the holographic terminal aesthetic of [d6db.com](https://d6db.com/characters).

## Status: Research & Mockup

Not yet integrated into the od6s system. These files are experimental reference material.

## Files

```
d6db-style/
├── css/
│   ├── d6db-theme.css      — Design tokens, card system, typography, animations
│   └── d6db-sheet.css       — Sheet layout, FoundryVTT overrides
├── templates/
│   └── character-sheet-mockup.html  — Handlebars template mockup
├── reference/
│   └── design-spec.md       — Full design research from d6db.com
├── mockups/                  — Screenshots, wireframes (add later)
└── README.md
```

## Key Design Elements

- **Fonts:** Orbitron (headings/stats), Exo 2 (UI), Inter (body)
- **Colors:** Cyan (#38bdf8) on dark space (#07090f)
- **Cards:** Subtle grid pattern overlay, glow on hover
- **Skills:** 2px cyan left-border indent under attributes
- **Dice codes:** Clickable, glow on hover

## Implementation Plan

1. Create a new sheet subclass (like the Star Wars themes)
2. Register it as an optional sheet in the system or companion module
3. Use existing od6s partials for body content
4. Apply d6db theme CSS on top
