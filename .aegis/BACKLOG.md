# AEGIS Orbital Defense — Backlog

Ranked, actionable backlog. Each item has a **goal**, an **acceptance** line, and a
**bigger & better** stretch (one step up). Priorities: **P0** = foundation/now,
**P1** = next, **P2** = later/vision. This file is the seed; GitHub Issues become the
live tracker (see decision D-004).

> Working agreement: items are set ready-for-review; Tomi merges and grants permission.

---

## ✅ Recently shipped

### Weapon Stash + loadout (with unlocks)
- A real **Armory** screen (own → unlock → equip) replaces the old static
  weapon list on the menu. Players earn **credits** (per kill + a per-chapter
  bonus), **unlock** new weapons, and pick a **loadout** (max 4) carried into
  combat. Three new weapon types added: **RAILGUN**, **EMP PULSE**, **FLAK
  SPREAD**.
- All weapon data now lives in one catalog: `src/frontend/src/data/weapons.ts`
  (was duplicated across the store, HUD selector, and menu). Stash state
  (`credits`, `ownedWeapons`, `loadout`) persists in the `aegis_save` schema.
- **Follow-up (P2):** bespoke per-weapon flight/explosion FX — the new types
  currently reuse existing missile/blast visuals tinted by catalog color.

---

## P0 — Foundations (do first)

### P0-1 · Add CI quality gate (GitHub Actions)
- **Status:** 🟡 partial — a **GitHub Pages deploy** workflow now exists
  (`.github/workflows/deploy-pages.yml`); the **quality gate is still TODO**.
- **Goal:** On every push/PR, run `pnpm typecheck` and Biome `pnpm check`; fail on errors.
- **Acceptance:** A green/red check appears on PRs; broken types or lint fail the build.
- **Bigger & better:** Per-PR **preview deploys** (Vercel/Netlify) on top of the Pages URL.
- **Labels:** `infra`, `ci`. **Why:** nothing guards quality on push today.

### P0-2 · Seed the backlog into GitHub Issues
- **Goal:** Turn this file's items into labeled Issues with milestones.
- **Acceptance:** Each item below exists as an Issue with priority + area labels.
- **Bigger & better:** A GitHub Project board grouping by P0/P1/P2.
- **Labels:** `infra`, `process`.

### P0-3 · Implement the Motoko backend (first real method)
- **Goal:** Replace `actor {}` with a minimal canister: store + return a global high-score.
- **Acceptance:** Front end can submit a score (gated by Internet Identity) and read top N.
- **Bigger & better:** Per-identity player profiles persisting the full `aegis_save` schema
  on-chain (chapter, score, upgrades, maxCombo, nearMisses).
- **Labels:** `backend`, `web3`. **Why:** biggest gap between intent and reality.

---

### P0-4 · Restore real fonts + untrack stale `dist/`
- **Goal:** The repo's `assets/fonts/*.woff2` are ≤214-byte stubs (no real fonts anywhere),
  so the UI falls back to system fonts. Source/commit the real display fonts. Separately,
  `src/frontend/dist/` is a tracked, stale build artifact (degraded base64 assets) — untrack
  it and add to `.gitignore`.
- **Acceptance:** Custom fonts render on the live site; `dist/` no longer tracked.
- **Bigger & better:** Self-host fonts via a tiny `@font-face` manifest checked in CI.
- **Labels:** `assets`, `infra`. **Why:** found during the asset-wiring fix.

## P1 — Next

### P1-1 · Test harness + first tests
- **Goal:** Add Vitest; cover `gameStore` logic (scoring, combo, save/load, damage).
- **Acceptance:** `pnpm test` runs in CI; store reducers have unit tests.
- **Bigger & better:** Playwright smoke test that boots the game to `combat`.
- **Labels:** `testing`.

### P1-2 · Real README + contributor docs
- **Goal:** Replace the Caffeine stub with run/build/deploy/architecture docs (link `.aegis/`).
- **Acceptance:** A new dev can clone, install, and run locally from the README alone.
- **Local-dev quickstart to document** (verified working): `pnpm install` at the
  repo root, then `cd src/frontend && pnpm dev` and open the printed
  `localhost:5173`. No backend or accounts required — the game is fully
  client-side. Build with `pnpm build`; quality gates are `pnpm typecheck` and
  `pnpm check` (Biome).
- **Bigger & better:** Animated GIF/short clip of gameplay in the README.
- **Labels:** `docs`.

### P1-5 · Adobe Firefly art generation pass
- **Goal:** Use Adobe Firefly to generate higher-fidelity game art and commit it
  into the repo: missile/explosion sprites (replace the `/assets/generated/*`
  placeholders) and a real Earth surface/night texture to replace the
  procedural canvas art in `EarthScene.tsx`.
- **Acceptance:** New sprites/textures render in-game via the existing
  `assets.ts` path constants; no external runtime fetch (assets are bundled).
- **Bigger & better:** A small, repeatable "art kit" prompt set so new weapon
  types (railgun/emp/flak) and threats can get matching bespoke sprites.
- **Labels:** `assets`, `art`.

### P1-3 · Audio: music + SFX
- **Goal:** Add background score + fire/explosion/impact SFX with a mute toggle.
- **Acceptance:** Sound plays in combat; setting persists.
- **Bigger & better:** Dynamic music that intensifies with wave/combo.
- **Labels:** `gameplay`, `audio`.

### P1-4 · Mobile / touch controls
- **Goal:** Tap-to-lock + tap-to-fire; responsive HUD using existing `use-mobile`.
- **Acceptance:** Playable on a phone in portrait + landscape.
- **Bigger & better:** Installable PWA.
- **Labels:** `gameplay`, `mobile`.

---

## P2 — Later / vision

### P2-1 · Boss waves & more content
- More threat/weapon types; scripted boss encounters at chapter ends.
- **Bigger & better:** A "campaign" with narrative beats between chapters.
- **Labels:** `gameplay`.

### P2-2 · Daily seeded challenge
- Deterministic daily wave seed; compare scores on the leaderboard (needs P0-3).
- **Bigger & better:** Weekly tournaments with on-chain rewards.
- **Labels:** `gameplay`, `web3`.

### P2-3 · Difficulty tuning pass
- Curve threat speed/HP/spawn rate per chapter; add an easy/normal/hard select.
- **Labels:** `gameplay`, `balance`.

### P2-4 · Telemetry / analytics
- Opt-in anonymous gameplay metrics to inform balance.
- **Bigger & better:** A live ops dashboard fed from the same Notion pipeline.
- **Labels:** `infra`, `analytics`.

### P2-5 · Bespoke new-weapon FX
- **Goal:** Give RAILGUN / EMP PULSE / FLAK SPREAD their own flight paths and
  explosion visuals in `EarthScene.tsx` (they currently reuse existing
  missile/blast art tinted by catalog color). E.g. a straight tracer beam for
  railgun, an expanding ion ring for EMP, a pellet burst for flak.
- **Acceptance:** Each new weapon is visually distinct in combat.
- **Labels:** `gameplay`, `art`. **Why:** follow-up from the weapon-stash ship.

---

## Memory-layer infrastructure (this initiative)

### MEM-1 · Sync repo memory → Notion
- **Goal:** Push `.aegis/memory/*` + `project.manifest.json` into the Notion memory DB and
  the projects dashboard card.
- **Acceptance:** Notion shows the AEGIS card with live status, stack, backlog counts.
- **Bigger & better:** Two-way sync (edit in Notion → PR back to repo).
- **Labels:** `infra`, `memory`.

### MEM-2 · GitHub universal memory layer linkage
- **Goal:** Standardize `project.manifest.json` so multiple repos roll up into one cross-repo
  memory index.
- **Acceptance:** A second project adopting the same manifest schema appears in the rollup.
- **Bigger & better:** An agent that auto-generates the memory layer for any new repo.
- **Labels:** `infra`, `memory`, `platform`.

### MEM-3 · Auto-refresh on merge
- **Goal:** GitHub Action regenerates `index.json` / manifest and syncs to Notion on merge to `main`.
- **Acceptance:** Merging a PR updates `lastScanned` and the Notion card without manual steps.
- **Labels:** `infra`, `ci`, `memory`.
