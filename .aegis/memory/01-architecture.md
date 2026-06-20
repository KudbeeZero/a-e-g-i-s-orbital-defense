# 01 · Architecture

## High-level shape
A client-heavy single-page app. Effectively all game logic lives in the browser; ICP is
present for auth and a future backend, but the game does not depend on it to run.

```
Browser (React 19 SPA)
│
├─ main.tsx ........... React root; React Query + Internet Identity providers
├─ App.tsx ........... phase router (state machine, not URL routing for gameplay)
│   ├─ MenuScreen ......... title, starfield, continue/new game
│   ├─ CinematicScreen .... orbital intro cinematic
│   ├─ CombatScreen ....... main game loop driver + HUD overlay
│   │     └─ EarthScene ... Three.js canvas: Earth, threats, missiles, explosions
│   ├─ UpgradeScreen ...... pick upgrades between waves
│   └─ ResultScreen ....... end-of-chapter stats; clears save
│
├─ store/gameStore.ts ... Zustand store: ALL runtime state + game logic + save/load
│
├─ hooks/ .............. useInternetIdentity (auth), useActor (ICP canister), use-mobile
├─ utils/StorageClient.ts ... content-addressed blob upload/download (SHA-256 + retry)
├─ config.ts ........... loads env.json, builds ICP agent + backend actor
│
└─ ICP backend (Motoko: src/backend/main.mo) ... empty actor {} (reserved)
```

## Control flow (the game loop)
1. `App.tsx` renders one screen based on `gameStore.phase`
   (`menu → cinematic → combat → upgrade → gameover`).
2. `CombatScreen.tsx` drives the per-frame loop: spawns threats, advances missile
   trajectories, runs collision/scoring, and triggers camera shake / explosions.
3. `EarthScene.tsx` renders the 3D world from store state (threats, missiles, explosions,
   cities) inside a React Three Fiber `<Canvas>`.
4. `HUD.tsx` is a 2D overlay (ammo, shield, hull, score, combo, targeting).
5. On wave clear → `UpgradeScreen`; on hull loss → `gameover` → `ResultScreen`.

## Data flow
- **Single source of runtime truth:** the Zustand store (`gameStore.ts`). Components read
  state and call actions; there is no prop-drilling of game state.
- **Persistence:** `saveToStorage()` / `loadFromStorage()` write a small subset
  (`chapter, score, upgrades, maxCombo, nearMisses`) to `localStorage["aegis_save"]`.
- **Rendering:** store arrays (`threats`, `missiles`, `explosions`, `cities`) → Three.js
  meshes each frame.

## Build & deploy topology
- **Monorepo:** pnpm workspaces — `src/frontend` (Vite) + `src/backend` (Motoko).
- **Build:** `build.sh` → `vite build` + `moc` compile to `backend.wasm`, plus image
  optimization scripts in `scripts/`.
- **Deploy:** `deploy.sh` → local ICP network + canister create/deploy. Container defined
  in `Dockerfile` (Ubuntu 24.04).

## Notable architectural facts
- The backend is intentionally empty; the architecture is ready for server-side features
  (leaderboards, profiles) but none exist yet.
- No router-based navigation for gameplay — navigation is the `phase` state machine.
- `StorageClient` points at a Caffeine blob gateway by default (see `03-state-and-data.md`).
