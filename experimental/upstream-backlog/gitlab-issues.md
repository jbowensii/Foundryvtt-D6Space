# OpenD6 Space Upstream Backlog (GitLab vtt2/opend6-space)

Captured 2026-04-09 from https://gitlab.com/vtt2/opend6-space/

## Status Notes

- **Sole developer:** madseumas (reactive, no formal roadmap)
- **Current upstream version:** 1.0.7 (supports Foundry v11-v12)
- **Active MR:** v13 migration (MR !442, updated 2026-04-07) — they're still working on v13, we're already on v14
- **Our fork:** v14.1.1, fully v14-native, well ahead of upstream

---

## Open Bugs

### #252 — Error adding item to vehicle cargo hold
- **Status:** Fix merged to dev (MR !441), not yet released
- **Date:** 2026-02-24
- **Relevance:** Check if we have this bug too

### #210 — Starship scale modifiers not affecting defensive actions
- **Status:** Open 3 years, unassigned
- **Date:** 2023-07-27
- **Relevance:** Worth investigating in our codebase

---

## Feature Requests (Evaluate for inclusion)

### #251 — v13 support
- **Status:** Open, active MR !442
- **Relevance:** DONE — we skipped v13 and went straight to v14

### #250 — Add dropdown option for custom fields
- **Date:** 2025-02-10
- **Relevance:** CONSIDER — adds flexibility to the custom field system

### #236 — Banked Rolls / dice pool exchange
- **Date:** 2024-08-27
- **Description:** Allow exchanging dice between pools (e.g., trade 1D for +3 pips)
- **Relevance:** CONSIDER — interesting mechanic for advanced play

### #232 — Make wild/CP/bonus dice customizable in Dice So Nice
- **Date:** 2024-08-15
- **Assigned to:** madseumas
- **Relevance:** CONSIDER — nice cosmetic feature

### #231 — Mini d6 Static Defense option
- **Date:** 2024-07-30
- **Assigned to:** madseumas
- **Description:** Alternative defense calculation using static values
- **Relevance:** CONSIDER — optional rule support
- **Note:** Has draft MR !385 (dormant since Aug 2024)

### #220 — Species Templates in Character Creation Wizard
- **Date:** 2024-01-22
- **Assigned to:** madseumas
- **Relevance:** HIGH — would complement the Star Wars species data

### #194 — Force Power "Spell Cards"
- **Date:** 2023-03-25
- **Description:** Visual spell/power cards for Force abilities
- **Relevance:** HIGH for Star Wars D6 — no upstream progress

### #25 — Optional initiative rules from SRD
- **Date:** 2021-03-08
- **Assigned to:** madseumas
- **Label:** Core Feature
- **Relevance:** CONSIDER — SRD optional rules

---

## Open Merge Requests

### MR !442 — Draft: V13 Migration
- **Status:** Active, updated 2026-04-07
- **Relevance:** SKIP — we're already on v14

### MR !385 — Draft: Mini d6 Static Defense
- **Status:** Dormant since Aug 2024
- **Relevance:** Could cherry-pick the concept if we implement #231

---

## Evaluation Summary

| Issue | Priority for us | Action |
|-------|----------------|--------|
| #252 Cargo hold bug | CHECK | Test if we have this bug |
| #210 Scale modifiers | CHECK | Test starship defense scale |
| #250 Custom field dropdown | LOW | Nice to have |
| #236 Banked rolls | LOW | Advanced feature |
| #232 Dice So Nice customization | LOW | Cosmetic |
| #231 Static defense | MEDIUM | Optional rule |
| #220 Species templates in wizard | HIGH | Star Wars relevant |
| #194 Force power spell cards | HIGH | Star Wars relevant |
| #25 Optional initiative | MEDIUM | SRD completeness |
