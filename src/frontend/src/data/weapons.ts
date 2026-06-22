import type { WeaponType } from "../store/gameStore";

// Single source of truth for every weapon in the game. Stash, HUD selector,
// menu armory, and combat all read from this catalog so weapon data lives in
// exactly one place.

export type WeaponBehavior =
  | "track" // homing missile (heat-seeker)
  | "ballistic" // curved flight to target (cluster, prox-burst, kinetic)
  | "rail" // fast straight-ish shot (railgun)
  | "spread" // fires several projectiles at once (flak)
  | "pulse"; // large-radius area burst that slows survivors (emp)

export interface WeaponDef {
  id: WeaponType;
  name: string;
  icon: string;
  color: string;
  desc: string;
  baseAmmo: number;
  cooldownMs: number;
  /** Credit cost to unlock from the stash. 0 for starter weapons. */
  unlockCost: number;
  /** Owned (and in the default loadout) from a fresh save. */
  unlockedByDefault: boolean;
  behavior: WeaponBehavior;
  /** Ballistic flight speed (progress per frame). Ignored when behavior is "track". */
  missileSpeed: number;
  /** Multiplies the base explosion hit radius. */
  hitRadiusMult: number;
  /** Number of projectiles spawned per shot (>1 for spread/flak). */
  projectiles: number;
  /** Whether surviving threats in the blast are slowed (emp). */
  slows: boolean;
}

// Credit economy — tuned to make new weapons reachable after a chapter or two.
export const CREDITS_PER_KILL = 25;
export const CHAPTER_COMPLETE_CREDITS = 300;

// Maximum weapons carried into combat (matches HUD selector + number keys 1-4).
export const MAX_LOADOUT = 4;

export const WEAPONS: Record<WeaponType, WeaponDef> = {
  "heat-seeker": {
    id: "heat-seeker",
    name: "HEAT-SEEKER",
    icon: "🎯",
    color: "#00e5ff",
    desc: "Auto-tracks a single target, curving mid-flight. Reliable all-rounder.",
    baseAmmo: 12,
    cooldownMs: 1500,
    unlockCost: 0,
    unlockedByDefault: true,
    behavior: "track",
    missileSpeed: 0.018,
    hitRadiusMult: 1,
    projectiles: 1,
    slows: false,
  },
  cluster: {
    id: "cluster",
    name: "CLUSTER",
    icon: "💥",
    color: "#ffaa00",
    desc: "Splits into multiple warheads mid-flight. Good against tight groups.",
    baseAmmo: 8,
    cooldownMs: 3000,
    unlockCost: 0,
    unlockedByDefault: true,
    behavior: "ballistic",
    missileSpeed: 0.018,
    hitRadiusMult: 1,
    projectiles: 1,
    slows: false,
  },
  "prox-burst": {
    id: "prox-burst",
    name: "PROX-BURST",
    icon: "⚡",
    color: "#aa44ff",
    desc: "Proximity detonation for wide area damage. Heavy but slow to cycle.",
    baseAmmo: 6,
    cooldownMs: 4000,
    unlockCost: 0,
    unlockedByDefault: true,
    behavior: "ballistic",
    missileSpeed: 0.018,
    hitRadiusMult: 1,
    projectiles: 1,
    slows: false,
  },
  kinetic: {
    id: "kinetic",
    name: "KINETIC",
    icon: "⬡",
    color: "#ffffff",
    desc: "High-velocity precision strike. No tracking — aim true.",
    baseAmmo: 10,
    cooldownMs: 2000,
    unlockCost: 0,
    unlockedByDefault: true,
    behavior: "ballistic",
    missileSpeed: 0.025,
    hitRadiusMult: 1,
    projectiles: 1,
    slows: false,
  },
  railgun: {
    id: "railgun",
    name: "RAILGUN",
    icon: "🔆",
    color: "#ff2d6b",
    desc: "Hyper-velocity slug. Near-instant straight shot, long recharge.",
    baseAmmo: 6,
    cooldownMs: 2800,
    unlockCost: 1500,
    unlockedByDefault: false,
    behavior: "rail",
    missileSpeed: 0.055,
    hitRadiusMult: 0.85,
    projectiles: 1,
    slows: false,
  },
  emp: {
    id: "emp",
    name: "EMP PULSE",
    icon: "🌀",
    color: "#33e0ff",
    desc: "Wide ionic burst. Large blast radius and slows surviving threats.",
    baseAmmo: 5,
    cooldownMs: 4500,
    unlockCost: 2500,
    unlockedByDefault: false,
    behavior: "pulse",
    missileSpeed: 0.018,
    hitRadiusMult: 1.8,
    projectiles: 1,
    slows: true,
  },
  flak: {
    id: "flak",
    name: "FLAK SPREAD",
    icon: "✳️",
    color: "#ffd000",
    desc: "Fires a fan of pellets in one volley. Excellent against clusters.",
    baseAmmo: 8,
    cooldownMs: 3200,
    unlockCost: 1000,
    unlockedByDefault: false,
    behavior: "spread",
    missileSpeed: 0.02,
    hitRadiusMult: 0.7,
    projectiles: 4,
    slows: false,
  },
};

/** All weapon ids in canonical display order. */
export const WEAPON_ORDER: WeaponType[] = [
  "heat-seeker",
  "cluster",
  "prox-burst",
  "kinetic",
  "railgun",
  "emp",
  "flak",
];

export const WEAPON_LIST: WeaponDef[] = WEAPON_ORDER.map((id) => WEAPONS[id]);

export const DEFAULT_OWNED_WEAPONS: WeaponType[] = WEAPON_ORDER.filter(
  (id) => WEAPONS[id].unlockedByDefault,
);

/** Default loadout — the starter weapons, capped at MAX_LOADOUT. */
export const DEFAULT_LOADOUT: WeaponType[] = DEFAULT_OWNED_WEAPONS.slice(
  0,
  MAX_LOADOUT,
);
