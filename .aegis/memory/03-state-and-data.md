# 03 · State & Data

All runtime state lives in one Zustand store: `src/frontend/src/store/gameStore.ts`.

## Store shape (`GameState`)
Runtime fields:
- **Session:** `phase`, `chapter`, `wave`, `score`, `shield`, `hull`, `paused`.
- **Combat:** `threats[]`, `missiles[]`, `explosions[]`, `cities[]`, `selectedWeapon`,
  `targetLockId`, `ammo` (per weapon), `cooldowns` (per weapon), `threatCount`,
  `threatsDestroyed`.
- **Feel:** `cameraShake`, `timeScale`, `slowMoActive`, `activeTab`.
- **Scoring (Phase 2):** `combo`, `maxCombo`, `nearMisses`, `lastKillTime`.

Key entity types:
- `Threat { id, position[3], velocity[3], type, speed, hp, maxHp, targetCityId? }`
- `Missile { id, weaponType, startPos[3], targetId, targetPos[3], progress, split?, childIds? }`
- `Explosion { id, position[3], startTime, color }`
- `City { id, name, lat, lon, isDestroyed, hasBurnMark, shields }`

## Constants (in `gameStore.ts`)
- `WEAPON_COOLDOWNS` (ms): heat-seeker 1500, cluster 3000, prox-burst 4000, kinetic 2000.
- `DEFAULT_AMMO`: heat-seeker 12, cluster 8, prox-burst 6, kinetic 10.
- `INITIAL_CITIES`: the 7 cities with real lat/lon and `shields: 0`.

## Persistence — `localStorage`
- **Key:** `aegis_save`
- **Saved fields (only):** `chapter`, `score`, `upgrades`, `maxCombo`, `nearMisses`
- **Written by:** `saveToStorage()`; **read by:** `loadFromStorage()`.
- **Touch points:** `MenuScreen.tsx` (detects an existing save → "Continue"),
  `ResultScreen.tsx` (clears the save at end of chapter).
- **Not persisted:** live combat state (threats/missiles/etc.) is session-only.

> ⚠️ This is the canonical save schema. Any backend persistence or universal-memory sync
> should treat these five fields as the player's durable progression record.

## ICP / Web3 layer
- `config.ts` loads `env.json` and constructs an ICP agent + backend actor.
- `useInternetIdentity.ts` handles login; `useActor.ts` exposes the backend actor via
  React Query — but the backend is `actor {}`, so there are no callable methods yet.
- `utils/StorageClient.ts` is a content-addressed (SHA-256) blob client with exponential
  backoff, defaulting to a Caffeine blob gateway (`https://blob.caffeine.ai`). It is **not
  used by gameplay** today — reserved infrastructure.

## Implications for the memory layer / dashboard
- The durable player record is tiny and client-side — moving it on-chain (Motoko) or to a
  profile service is the natural backend backlog item.
- The manifest's `persistence` field records this so the dashboard can flag "local-only
  save" as a risk/status signal.
