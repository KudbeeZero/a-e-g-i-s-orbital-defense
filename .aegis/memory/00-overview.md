# 00 · Overview

## Identity
- **Name:** AEGIS Orbital Defense
- **Slug:** `aegis-orbital-defense`
- **Repo:** KudbeeZero/a-e-g-i-s-orbital-defense
- **Type:** Browser-based 3D orbital-defense game
- **License:** MIT (2026)
- **Origin:** Exported from the Caffeine platform (caffeine.ai)

## One-paragraph summary
AEGIS Orbital Defense is a single-player, browser-based 3D game where the player defends
Earth's cities from incoming orbital threats. The player orbits a procedurally rendered
Earth, locks onto threats (debris, asteroids, missiles, armored craft, ICBMs, aircraft),
and fires one of four weapon types to destroy them before they hit one of seven global
cities. Progression runs through chapters/waves with an upgrade system between waves and a
combo + near-miss scoring system. It's built as a React + Three.js front end targeting an
Internet Computer (ICP) deployment, with an Internet Identity login and a (currently empty)
Motoko backend canister reserved for future server-side features.

## Status at a glance
- **Phase:** Playable client-side prototype, unfinished.
- **Front end:** Substantially implemented (~11k LOC of TS/TSX).
- **Backend:** Empty placeholder (`actor {}`) — no server logic yet.
- **Persistence:** `localStorage` only (`aegis_save`).
- **Tests:** None.
- **CI/CD:** GitHub Pages deploy workflow (preview link); no test/lint gate yet.
- **Docs:** Stub README only (this memory layer is the first real documentation).

See `04-status.md` for the full completeness matrix.

## Tech stack (short)
React 19 · TypeScript · Vite · Three.js / React Three Fiber + Cannon · Zustand ·
Radix/shadcn UI + Tailwind · TanStack Router/Query · ICP (Motoko + Internet Identity) ·
pnpm workspaces · Docker.

## Links
- **Playable preview (GitHub Pages):** https://kudbeezero.github.io/a-e-g-i-s-orbital-defense/ _(live after first merge to `main`)_
- **Notion memory + dashboard:** _(to be populated — see `05-decisions.md` D-003)_
- **GitHub universal memory layer:** _(planned — see `../BACKLOG.md`)_
- **Backlog:** `../BACKLOG.md`
- **Manifest:** `../project.manifest.json`
