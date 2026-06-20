# 06 · Glossary

Domain terms used throughout AEGIS Orbital Defense. Source of truth: `gameStore.ts`.

## Game phases (`GamePhase`)
- **menu** — title screen; start new game or continue from `aegis_save`.
- **cinematic** — orbital intro sequence.
- **combat** — core gameplay; defend the cities.
- **upgrade** — between-wave screen to spend/pick upgrades.
- **gameover** — run ended; shows results, clears save.

## Threat types (`Threat.type`)
- **debris** — basic incoming object.
- **asteroid** — larger natural threat.
- **missile** — guided man-made threat.
- **armored** — tougher threat (more HP).
- **icbm** — high-priority ballistic threat targeting a city.
- **aircraft** — enemy aircraft with a 2-HP mechanic (most recent addition).

## Weapon types (`WeaponType`) + cooldowns
- **heat-seeker** — fast cooldown (1500 ms), ammo 12.
- **cluster** — splits into children (3000 ms), ammo 8.
- **prox-burst** — area/proximity (4000 ms), ammo 6.
- **kinetic** — direct hit (2000 ms), ammo 10.

## Upgrades (`upgrades[]` strings)
- **ammo-boost** — stacking; increases ammo.
- **rapid-reload** — stacking; reduces reload time.
- **city-shield** — adds shields to cities.

## Cities (`INITIAL_CITIES`)
New York, London, Tokyo, Sydney, Moscow, Beijing, São Paulo — each with real lat/lon,
`shields`, and destruction/burn-mark state.

## Scoring terms
- **combo** — consecutive-kill multiplier; `maxCombo` is the run best.
- **near-miss** — threat destroyed close to a city/the player; tracked in `nearMisses`.

## Platform terms
- **ICP** — Internet Computer; the target deployment platform.
- **Motoko** — ICP's smart-contract language; the backend `actor {}` is written in it.
- **Internet Identity** — ICP's auth system; used for login.
- **canister** — an ICP deployable unit (this repo has a frontend + a backend canister).
- **Caffeine** — the platform this project was originally built/exported from.
