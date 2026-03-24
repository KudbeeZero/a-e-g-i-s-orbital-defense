import { create } from "zustand";

export type GamePhase =
  | "menu"
  | "cinematic"
  | "combat"
  | "upgrade"
  | "gameover";
export type WeaponType = "heat-seeker" | "cluster" | "prox-burst" | "kinetic";

export const WEAPON_COOLDOWNS: Record<WeaponType, number> = {
  "heat-seeker": 1500,
  cluster: 3000,
  "prox-burst": 4000,
  kinetic: 2000,
};

export interface City {
  id: string;
  name: string;
  lat: number;
  lon: number;
  isDestroyed: boolean;
  hasBurnMark: boolean;
  shields: number;
}

export interface Threat {
  id: string;
  position: [number, number, number];
  velocity: [number, number, number];
  type: "debris" | "asteroid" | "missile" | "armored" | "icbm" | "aircraft";
  speed: number;
  hp: number;
  maxHp: number;
  targetCityId?: string;
}

export interface Missile {
  id: string;
  weaponType: WeaponType;
  startPos: [number, number, number];
  targetId: string;
  targetPos: [number, number, number];
  progress: number;
  split?: boolean;
  childIds?: string[];
}

export interface Explosion {
  id: string;
  position: [number, number, number];
  startTime: number;
  color: string;
}

const INITIAL_CITIES: City[] = [
  {
    id: "city_ny",
    name: "NEW YORK",
    lat: 40.7,
    lon: -74.0,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_ld",
    name: "LONDON",
    lat: 51.5,
    lon: -0.1,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_tk",
    name: "TOKYO",
    lat: 35.7,
    lon: 139.7,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_sy",
    name: "SYDNEY",
    lat: -33.9,
    lon: 151.2,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_mc",
    name: "MOSCOW",
    lat: 55.8,
    lon: 37.6,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_bj",
    name: "BEIJING",
    lat: 39.9,
    lon: 116.4,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
  {
    id: "city_sp",
    name: "SAO PAULO",
    lat: -23.6,
    lon: -46.6,
    isDestroyed: false,
    hasBurnMark: false,
    shields: 0,
  },
];

export interface GameState {
  phase: GamePhase;
  chapter: number;
  score: number;
  shield: number;
  hull: number;
  selectedWeapon: WeaponType;
  targetLockId: string | null;
  threats: Threat[];
  missiles: Missile[];
  explosions: Explosion[];
  upgrades: string[];
  ammo: Record<WeaponType, number>;
  cooldowns: Record<WeaponType, number>;
  threatCount: number;
  threatsDestroyed: number;
  activeTab: string;
  cameraShake: number;
  cities: City[];
  wave: number;
  timeScale: number;
  slowMoActive: boolean;
  paused: boolean;
  // Phase 2: combo + near-miss
  combo: number;
  maxCombo: number;
  nearMisses: number;
  lastKillTime: number;
  // actions
  setPhase: (phase: GamePhase) => void;
  setChapter: (n: number) => void;
  addScore: (n: number) => void;
  takeDamage: (shield: number, hull: number) => void;
  setTargetLock: (id: string | null) => void;
  setSelectedWeapon: (w: WeaponType) => void;
  spawnThreat: (threat: Threat) => void;
  removeThreat: (id: string) => void;
  fireMissile: (missile: Missile) => void;
  removeMissile: (id: string) => void;
  addExplosion: (exp: Explosion) => void;
  removeExplosion: (id: string) => void;
  addUpgrade: (u: string) => void;
  resetCombat: () => void;
  setActiveTab: (tab: string) => void;
  setCameraShake: (v: number) => void;
  setThreatCount: (n: number) => void;
  incrementDestroyed: () => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
  setAmmo: (weapon: WeaponType, amount: number) => void;
  setCooldown: (weapon: WeaponType, readyAt: number) => void;
  destroyCity: (id: string) => void;
  damageCity: (id: string) => void;
  damageThreat: (id: string) => void;
  setWave: (n: number) => void;
  setTimeScale: (v: number) => void;
  setSlowMo: (v: boolean) => void;
  setPaused: (v: boolean) => void;
  incrementCombo: () => void;
  resetCombo: () => void;
  addNearMiss: () => void;
  attemptFire: () => boolean;
}

const DEFAULT_AMMO: Record<WeaponType, number> = {
  "heat-seeker": 12,
  cluster: 8,
  "prox-burst": 6,
  kinetic: 10,
};

const DEFAULT_COOLDOWN: Record<WeaponType, number> = {
  "heat-seeker": 0,
  cluster: 0,
  "prox-burst": 0,
  kinetic: 0,
};

export const useGameStore = create<GameState>((set, get) => ({
  phase: "menu",
  chapter: 1,
  score: 0,
  shield: 100,
  hull: 100,
  selectedWeapon: "heat-seeker",
  targetLockId: null,
  threats: [],
  missiles: [],
  explosions: [],
  upgrades: [],
  ammo: { ...DEFAULT_AMMO },
  cooldowns: { ...DEFAULT_COOLDOWN },
  threatCount: 3,
  threatsDestroyed: 0,
  activeTab: "WPN",
  cameraShake: 0,
  cities: INITIAL_CITIES.map((c) => ({ ...c })),
  wave: 1,
  timeScale: 1.0,
  slowMoActive: false,
  paused: false,
  combo: 0,
  maxCombo: 0,
  nearMisses: 0,
  lastKillTime: 0,

  setPhase: (phase) => set({ phase }),
  setChapter: (chapter) => set({ chapter }),
  addScore: (n) => set((s) => ({ score: s.score + n })),
  takeDamage: (shieldDmg, hullDmg) =>
    set((s) => ({
      shield: Math.max(0, s.shield - shieldDmg),
      hull: Math.max(0, s.hull - hullDmg),
    })),
  setTargetLock: (id) => set({ targetLockId: id }),
  setSelectedWeapon: (w) => set({ selectedWeapon: w }),
  spawnThreat: (threat) => set((s) => ({ threats: [...s.threats, threat] })),
  removeThreat: (id) =>
    set((s) => ({ threats: s.threats.filter((t) => t.id !== id) })),
  fireMissile: (missile) =>
    set((s) => ({ missiles: [...s.missiles, missile] })),
  removeMissile: (id) =>
    set((s) => ({ missiles: s.missiles.filter((m) => m.id !== id) })),
  addExplosion: (exp) => set((s) => ({ explosions: [...s.explosions, exp] })),
  removeExplosion: (id) =>
    set((s) => ({ explosions: s.explosions.filter((e) => e.id !== id) })),
  addUpgrade: (u) => set((s) => ({ upgrades: [...s.upgrades, u] })),
  resetCombat: () => {
    const { upgrades } = get();
    const ammoBoostCount = upgrades.filter((u) => u === "ammo-boost").length;
    const ammoBonus = ammoBoostCount * 3;
    const hasCityShield = upgrades.includes("city-shield");
    set({
      threats: [],
      missiles: [],
      explosions: [],
      shield: 100,
      hull: 100,
      targetLockId: null,
      ammo: {
        "heat-seeker": DEFAULT_AMMO["heat-seeker"] + ammoBonus,
        cluster: DEFAULT_AMMO.cluster + ammoBonus,
        "prox-burst": DEFAULT_AMMO["prox-burst"] + ammoBonus,
        kinetic: DEFAULT_AMMO.kinetic + ammoBonus,
      },
      cooldowns: { ...DEFAULT_COOLDOWN },
      threatsDestroyed: 0,
      cameraShake: 0,
      cities: INITIAL_CITIES.map((c) => ({
        ...c,
        shields: hasCityShield ? 1 : 0,
      })),
      wave: 1,
      timeScale: 1.0,
      slowMoActive: false,
      paused: false,
      combo: 0,
      nearMisses: 0,
      lastKillTime: 0,
    });
  },
  setActiveTab: (tab) => set({ activeTab: tab }),
  setCameraShake: (v) => set({ cameraShake: v }),
  setThreatCount: (n) => set({ threatCount: n }),
  incrementDestroyed: () =>
    set((s) => ({ threatsDestroyed: s.threatsDestroyed + 1 })),
  loadFromStorage: () => {
    try {
      const raw = localStorage.getItem("aegis_save");
      if (raw) {
        const data = JSON.parse(raw);
        set({
          chapter: data.chapter ?? 1,
          score: data.score ?? 0,
          upgrades: data.upgrades ?? [],
          maxCombo: data.maxCombo ?? 0,
          nearMisses: data.nearMisses ?? 0,
        });
      }
    } catch (_) {
      // ignore
    }
  },
  saveToStorage: () => {
    const { chapter, score, upgrades, maxCombo, nearMisses } = get();
    localStorage.setItem(
      "aegis_save",
      JSON.stringify({ chapter, score, upgrades, maxCombo, nearMisses }),
    );
  },
  setAmmo: (weapon, amount) =>
    set((s) => ({ ammo: { ...s.ammo, [weapon]: amount } })),
  setCooldown: (weapon, readyAt) =>
    set((s) => ({ cooldowns: { ...s.cooldowns, [weapon]: readyAt } })),
  damageThreat: (id) =>
    set((s) => ({
      threats: s.threats
        .map((t) =>
          t.id === id ? { ...t, hp: t.hp - 1 } : t,
        )
        .filter((t) => t.hp > 0) as typeof s.threats,
    })),
  destroyCity: (id) =>
    set((s) => ({
      cities: s.cities.map((c) =>
        c.id === id ? { ...c, isDestroyed: true, hasBurnMark: true } : c,
      ),
    })),
  damageCity: (id) =>
    set((s) => ({
      cities: s.cities.map((c) => {
        if (c.id !== id) return c;
        if (c.shields > 0) return { ...c, shields: c.shields - 1 };
        return { ...c, isDestroyed: true, hasBurnMark: true };
      }),
    })),
  setWave: (n) => set({ wave: n }),
  setTimeScale: (v) => set({ timeScale: v }),
  setSlowMo: (v) => set({ slowMoActive: v }),
  setPaused: (v) => set({ paused: v }),

  incrementCombo: () =>
    set((s) => {
      const newCombo = s.combo + 1;
      return {
        combo: newCombo,
        maxCombo: Math.max(s.maxCombo, newCombo),
        lastKillTime: Date.now(),
      };
    }),

  resetCombo: () => set({ combo: 0, lastKillTime: 0 }),

  addNearMiss: () =>
    set((s) => {
      const multiplier = Math.min(5, 1 + s.combo * 0.5);
      const bonus = Math.round(150 * multiplier);
      return {
        nearMisses: s.nearMisses + 1,
        score: s.score + bonus,
      };
    }),

  attemptFire: () => {
    const state = get();
    const { targetLockId, threats, selectedWeapon, ammo, cooldowns } = state;
    const now = Date.now();
    if (!targetLockId) return false;
    if (ammo[selectedWeapon] <= 0) return false;
    if (cooldowns[selectedWeapon] > now) return false;
    const target = threats.find((t) => t.id === targetLockId);
    if (!target) return false;

    state.fireMissile({
      id: `m_${Date.now()}`,
      weaponType: selectedWeapon,
      startPos: [0, 0, 4],
      targetId: targetLockId,
      targetPos: [...target.position] as [number, number, number],
      progress: 0,
    });
    state.setAmmo(selectedWeapon, ammo[selectedWeapon] - 1);
    const reloadCount = state.upgrades.filter((u) => u === "rapid-reload").length;
    const reloadMult = 0.7 ** reloadCount;
    state.setCooldown(selectedWeapon, now + WEAPON_COOLDOWNS[selectedWeapon] * reloadMult);
    state.setCameraShake(3);
    state.setTargetLock(null);
    return true;
  },
}));
