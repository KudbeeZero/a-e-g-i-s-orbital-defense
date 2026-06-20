# 02 · System Scan (Index)

Inventory of the codebase as scanned on 2026-06-20 at commit `97c15f1`. Status legend:
✅ implemented · 🟡 partial/placeholder · ⛔ empty/stub · ➖ generated/vendored.

## Repo root
| Path | Purpose | Status |
|------|---------|--------|
| `package.json` | Root pnpm-workspace scripts (build, typecheck, check, fix) | ✅ |
| `pnpm-workspace.yaml` | Workspace definition (frontend + backend) | ✅ |
| `tsconfig.json` | Root TS config (note: `HACK_BECAUSE_OF_ALLOW_JS`) | ✅ |
| `icp.yaml` | ICP project definition | ✅ |
| `build.sh` / `deploy.sh` | Build and local-deploy pipelines | ✅ |
| `Dockerfile` | Ubuntu 24.04 build container | ✅ |
| `README.md` | Caffeine export stub ("Coming Soon") | 🟡 |
| `caffeine.lock.json` | Caffeine platform lock/metadata | ➖ |
| `scripts/resize-images.js`, `scripts/prune-unused-images.js` | Asset optimization | ✅ |

## Frontend — `src/frontend/`
| Path | Purpose | Status |
|------|---------|--------|
| `src/main.tsx` | React root; React Query + Internet Identity providers | ✅ |
| `src/App.tsx` | Phase router (menu/cinematic/combat/upgrade/gameover) | ✅ |
| `src/config.ts` | Loads `env.json`; builds ICP agent + backend actor | ✅ |
| `src/assets.ts` | Asset references | ✅ |
| `index.html` | HTML entry point | ✅ |
| `vite.config.js`, `tailwind.config.js`, `biome.json` | Build/lint config | ✅ |
| `env.json` | Runtime env (canister IDs, hosts) | ✅ |
| `canister.yaml` | Frontend canister metadata | ✅ |

### State — `src/frontend/src/store/`
| Path | Purpose | Status |
|------|---------|--------|
| `gameStore.ts` | Zustand store: full game state, logic, save/load. The core. | ✅ |

### Components — `src/frontend/src/components/`
| File | Purpose | Status |
|------|---------|--------|
| `MenuScreen.tsx` | Title screen, starfield, continue/new game (reads `aegis_save`) | ✅ |
| `CinematicScreen.tsx` | Orbital intro cinematic | ✅ |
| `CombatScreen.tsx` | Main game loop driver + HUD mount | ✅ |
| `EarthScene.tsx` | Three.js Earth, threats, missiles, explosions | ✅ |
| `HUD.tsx` | 2D overlay: ammo, shield, hull, score, combo, targeting | ✅ |
| `UpgradeScreen.tsx` | Between-wave upgrade selection | ✅ |
| `ResultScreen.tsx` | End-of-chapter stats; clears save | ✅ |
| `WeaponSelector.tsx` | Weapon switch UI | ✅ |
| `RadarDisplay.tsx` | Radar overlay | ✅ |
| `components/ui/*` | 60+ Radix/shadcn UI primitives | ➖ |

### Hooks / utils — `src/frontend/src/`
| Path | Purpose | Status |
|------|---------|--------|
| `hooks/useInternetIdentity.ts` | ICP Internet Identity auth | ✅ |
| `hooks/useActor.ts` | React Query wrapper around the ICP backend actor | 🟡 (backend empty) |
| `hooks/use-mobile.tsx` | Mobile breakpoint detection | ✅ |
| `utils/StorageClient.ts` | Content-addressed blob upload/download (SHA-256, retry) | ✅ (unused by gameplay) |
| `declarations/backend.did.d.ts` | Generated IDL for backend (empty SERVICE) | ➖ |

## Backend — `src/backend/`
| Path | Purpose | Status |
|------|---------|--------|
| `main.mo` | Motoko actor — literally `actor {}` | ⛔ |
| `backend.wasm` | Pre-built wasm of the empty actor | ➖ |
| `canister.yaml` | Backend canister metadata | ✅ |

## Assets
| Path | Purpose | Status |
|------|---------|--------|
| `src/frontend/public/assets/`, `frontend/public/assets/` | Sprites, images, fonts | ✅ |

## Gameplay content (defined in `gameStore.ts`)
- **Phases (5):** menu, cinematic, combat, upgrade, gameover.
- **Threat types (6):** debris, asteroid, missile, armored, icbm, aircraft.
- **Weapon types (4):** heat-seeker, cluster, prox-burst, kinetic (each with cooldown + ammo).
- **Upgrades (3):** ammo-boost (stacking), rapid-reload (stacking), city-shield.
- **Cities (7):** New York, London, Tokyo, Sydney, Moscow, Beijing, São Paulo.
- **Scoring:** combo multiplier + near-miss bonus tracking.
