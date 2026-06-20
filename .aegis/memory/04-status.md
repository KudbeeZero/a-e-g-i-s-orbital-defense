# 04 · Status & Completeness Matrix

Scanned 2026-06-20 at commit `97c15f1`. Legend: ✅ done · 🟡 partial · ⛔ missing/stub.

## System areas
| Area | Status | Notes |
|------|:--:|-------|
| Game phase state machine | ✅ | 5 phases wired in `App.tsx` + store |
| 3D rendering (Earth, threats, missiles) | ✅ | `EarthScene.tsx` via R3F |
| Threat system (6 types) | ✅ | incl. aircraft (2-HP) — most recent work |
| Weapon system (4 types, cooldown/ammo) | ✅ | `WEAPON_COOLDOWNS`, `DEFAULT_AMMO` |
| Upgrade system (3 upgrades) | ✅ | ammo-boost, rapid-reload, city-shield |
| Cities (7, shields/destruction) | ✅ | `INITIAL_CITIES` |
| Combo + near-miss scoring | ✅ | "Phase 2" fields in store |
| HUD / radar / weapon selector | ✅ | overlay components |
| Cinematic intro | ✅ | `CinematicScreen.tsx` |
| Static preview deploy (GitHub Pages) | ✅ | `.github/workflows/deploy-pages.yml`; published on merge to `main` |
| Save / load progression | ✅ | `localStorage["aegis_save"]`, 5 fields |
| Internet Identity auth | ✅ | login works; nothing gated behind it yet |
| ICP backend logic | ⛔ | `actor {}` — no methods, no storage |
| Server-side persistence / leaderboard | ⛔ | not started |
| Automated tests | ⛔ | none in repo |
| CI/CD | 🟡 | GitHub Pages deploy workflow exists; no test/lint gate yet |
| Documentation | 🟡 | stub README; this memory layer is the first real docs |
| Audio / music / SFX | ⛔ | not observed |
| Mobile / touch controls | 🟡 | `use-mobile` exists; gameplay input is desktop-oriented |

## Health signals (for the manifest)
- `tests`: none
- `ci`: github-pages-deploy (no test/lint gate yet)
- `backend`: stub (`actor {}`)
- `docs`: stub README + this memory layer
- `persistence`: local-only (`localStorage`)

## Known rough edges / tech debt
- `tsconfig.json` carries a `HACK_BECAUSE_OF_ALLOW_JS` workaround for mixed JS/TS.
- `StorageClient` and the ICP actor are wired but unused by gameplay (reserved infra).
- README is a Caffeine export placeholder.

## Primary gaps, ranked
1. **Backend is empty** — biggest divergence between intent and reality.
2. **No CI** — nothing guards `typecheck` / Biome on push.
3. **No tests** — no safety net for refactors.
4. **No real docs** — addressed first by this memory layer.

These map directly to the top of `../BACKLOG.md`.
