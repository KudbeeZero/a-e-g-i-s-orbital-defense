import { Canvas } from "@react-three/fiber";
import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { useGameStore } from "../store/gameStore";
import type { Threat, WeaponType } from "../store/gameStore";
import EarthScene from "./EarthScene";
import HUD from "./HUD";

function generateThreatId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
}

function randomUnitSpherePoint(minR = 6, maxR = 8): [number, number, number] {
  const r = minR + Math.random() * (maxR - minR);
  const theta = Math.random() * Math.PI * 2;
  const phi = Math.acos(2 * Math.random() - 1);
  return [
    r * Math.sin(phi) * Math.cos(theta),
    r * Math.sin(phi) * Math.sin(theta),
    r * Math.cos(phi),
  ];
}

// Reduced base speed by ~35% for better reaction time
function createThreat(
  chapter: number,
  speedMultiplier = 1.0,
  cityId?: string,
): Threat {
  const pos = randomUnitSpherePoint(6, 9);
  const types: Threat["type"][] =
    chapter >= 4
      ? ["armored", "debris", "asteroid"]
      : chapter === 1
        ? ["debris"]
        : ["debris", "asteroid"];
  const type = types[Math.floor(Math.random() * types.length)];
  return {
    id: generateThreatId(),
    position: pos,
    velocity: [0, 0, 0],
    type,
    speed:
      (type === "armored"
        ? 0.95
        : type === "asteroid"
          ? 0.55 + Math.random() * 0.3
          : 0.42 + Math.random() * chapter * 0.12) * speedMultiplier,
    hp: type === "armored" ? 3 : 1,
    maxHp: type === "armored" ? 3 : 1,
    targetCityId: cityId,
  };
}

// ICBM threats spawn near the camera/front of screen and fly toward the globe
function createIcbmThreat(chapter: number, speedMultiplier = 1.0, cityId?: string): Threat {
  const x = (Math.random() - 0.5) * 5.0;
  const y = (Math.random() - 0.5) * 3.0;
  const z = 3.5 + Math.random() * 1.5;
  return {
    id: generateThreatId(),
    position: [x, y, z],
    velocity: [0, 0, 0],
    type: "icbm",
    speed: (0.45 + chapter * 0.04) * speedMultiplier,
    hp: 1,
    maxHp: 1,
    targetCityId: cityId,
  };
}

interface LockRing {
  x: number;
  y: number;
  key: number;
}

interface EdgeIndicator {
  id: string;
  x: number;
  y: number;
  angle: number;
}

const TOTAL_WAVES = 5;
const CITY_IDS = [
  "city_ny",
  "city_ld",
  "city_tk",
  "city_sy",
  "city_mc",
  "city_bj",
  "city_sp",
];

export default function CombatScreen() {
  const chapter = useGameStore((s) => s.chapter);
  const threats = useGameStore((s) => s.threats);
  const spawnThreat = useGameStore((s) => s.spawnThreat);
  const setTargetLock = useGameStore((s) => s.setTargetLock);
  const targetLockId = useGameStore((s) => s.targetLockId);
  const attemptFire = useGameStore((s) => s.attemptFire);
  const setPhase = useGameStore((s) => s.setPhase);
  const saveToStorage = useGameStore((s) => s.saveToStorage);
  const setWave = useGameStore((s) => s.setWave);
  const wave = useGameStore((s) => s.wave);
  const resetCombo = useGameStore((s) => s.resetCombo);
  const setSelectedWeapon = useGameStore((s) => s.setSelectedWeapon);
  const setTimeScale = useGameStore((s) => s.setTimeScale);
  const setSlowMo = useGameStore((s) => s.setSlowMo);

  const canvasRef = useRef<HTMLDivElement>(null);
  const [lockRing, setLockRing] = useState<LockRing | null>(null);
  const [edgeIndicators, setEdgeIndicators] = useState<EdgeIndicator[]>([]);
  const [isPortrait, setIsPortrait] = useState(
    () => window.innerWidth < window.innerHeight,
  );
  const [waveClearing, setWaveClearing] = useState(false);

  const waveRef = useRef(1);
  const waveActiveRef = useRef(false);
  const nextWaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const threatsRef = useRef(threats);

  useEffect(() => {
    threatsRef.current = threats;
  }, [threats]);

  useEffect(() => {
    const check = () => setIsPortrait(window.innerWidth < window.innerHeight);
    window.addEventListener("resize", check);
    window.addEventListener("orientationchange", check);
    return () => {
      window.removeEventListener("resize", check);
      window.removeEventListener("orientationchange", check);
    };
  }, []);

  const spawnWave = useCallback(
    (waveIndex: number) => {
      const count = 3 + Math.min(waveIndex, 2);
      // Speed multiplier grows more slowly to keep game playable
      const speedMult = 1.07 ** waveIndex;
      for (let i = 0; i < count; i++) {
        const cityId = CITY_IDS[Math.floor(Math.random() * CITY_IDS.length)];
        spawnThreat(createThreat(chapter, speedMult, cityId));
      }
      // Chapter 2+: spawn ICBM threats from the front (near camera)
      if (chapter >= 2) {
        const icbmCount = chapter >= 3 ? 2 + Math.min(waveIndex, 1) : 1;
        for (let i = 0; i < icbmCount; i++) {
          const cityId = CITY_IDS[Math.floor(Math.random() * CITY_IDS.length)];
          spawnThreat(createIcbmThreat(chapter, speedMult, cityId));
        }
      }
      // Reset slow-mo state at the start of each new wave so any lingering
      // slow-mo from the previous wave doesn't carry over
      setTimeScale(1.0);
      setSlowMo(false);
      setWave(waveIndex + 1);
      waveActiveRef.current = true;
      setWaveClearing(false);
    },
    [chapter, spawnThreat, setWave, setTimeScale, setSlowMo],
  );

  const spawnWaveRef = useRef(spawnWave);
  useEffect(() => {
    spawnWaveRef.current = spawnWave;
  }, [spawnWave]);

  const hasSpawnedRef = useRef(false);
  useEffect(() => {
    if (hasSpawnedRef.current) return;
    hasSpawnedRef.current = true;
    waveRef.current = 0;
    waveActiveRef.current = false;
    spawnWaveRef.current(0);
    return () => {
      if (nextWaveTimerRef.current) clearTimeout(nextWaveTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!waveActiveRef.current) return;
    if (threats.length > 0) return;

    waveActiveRef.current = false;
    const completedWave = waveRef.current;
    resetCombo();

    if (completedWave >= TOTAL_WAVES - 1) {
      saveToStorage();
      setTimeout(() => setPhase("upgrade"), 1500);
      return;
    }

    setWaveClearing(true);
    const nextWaveIndex = completedWave + 1;
    waveRef.current = nextWaveIndex;
    // Increased to 5s gap between waves for breathing room
    nextWaveTimerRef.current = setTimeout(() => {
      spawnWave(nextWaveIndex);
    }, 5000);
  }, [threats.length, spawnWave, saveToStorage, setPhase, resetCombo]);

  // Edge indicator projection loop — shows ALL threats for early warning
  useEffect(() => {
    let rafId: number;
    const cam = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    cam.position.set(0, 0, 5.5);
    cam.lookAt(0, 0, 0);

    const update = () => {
      const container = canvasRef.current;
      if (!container) {
        rafId = requestAnimationFrame(update);
        return;
      }
      const { width, height } = container.getBoundingClientRect();
      cam.aspect = width / height;
      cam.updateProjectionMatrix();

      const margin = 36;
      const newIndicators: EdgeIndicator[] = [];

      for (const threat of threatsRef.current) {
        const pos = new THREE.Vector3(...threat.position);
        // Show edge indicators for ALL threats regardless of distance (early warning)
        // Only skip if extremely far (basically impossible)
        if (pos.length() > 14) continue;

        const projected = pos.clone().project(cam);
        const sx = (projected.x * 0.5 + 0.5) * width;
        const sy = (1 - (projected.y * 0.5 + 0.5)) * height;

        if (
          sx >= margin &&
          sx <= width - margin &&
          sy >= margin &&
          sy <= height - margin
        )
          continue;

        const cx = width / 2;
        const cy = height / 2;
        const dx = sx - cx;
        const dy = sy - cy;
        const angle = Math.atan2(dy, dx);

        const halfW = width / 2 - margin;
        const halfH = height / 2 - margin;
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);
        let ex: number;
        let ey: number;
        if (absX / halfW > absY / halfH) {
          const sign = dx > 0 ? 1 : -1;
          ex = cx + sign * halfW;
          ey = absX > 0 ? cy + (dy * halfW) / absX : cy;
        } else {
          const sign = dy > 0 ? 1 : -1;
          ey = cy + sign * halfH;
          ex = absY > 0 ? cx + (dx * halfH) / absY : cx;
        }

        newIndicators.push({ id: threat.id, x: ex, y: ey, angle });
      }

      setEdgeIndicators(newIndicators);
      rafId = requestAnimationFrame(update);
    };

    rafId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(rafId);
  }, []);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const container = canvasRef.current;
      if (!container) return;
      const rect = container.getBoundingClientRect();
      let clientX: number;
      let clientY: number;
      if ("changedTouches" in e) {
        const touch = e.changedTouches[0];
        clientX = touch.clientX;
        clientY = touch.clientY;
      } else {
        clientX = (e as React.MouseEvent).clientX;
        clientY = (e as React.MouseEvent).clientY;
      }
      const nx = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ny = -((clientY - rect.top) / rect.height) * 2 + 1;

      setLockRing({ x: clientX, y: clientY, key: Date.now() });
      setTimeout(() => setLockRing(null), 700);

      const camera = new THREE.PerspectiveCamera(
        75,
        rect.width / rect.height,
        0.1,
        1000,
      );
      camera.position.set(0, 0, 5.5);
      camera.lookAt(0, 0, 0);
      camera.updateProjectionMatrix();

      let closest: string | null = null;
      let minDist = 0.15;

      for (const t of threats) {
        const wp = new THREE.Vector3(...t.position);
        const projected = wp.clone().project(camera);
        const dist = Math.sqrt(
          (projected.x - nx) ** 2 + (projected.y - ny) ** 2,
        );
        if (dist < minDist) {
          minDist = dist;
          closest = t.id;
        }
      }

      if (closest) {
        // Lock on and immediately attempt to fire — no two-step flow
        setTargetLock(closest);
        // Small delay so the lock is registered in store before attemptFire reads it
        setTimeout(() => attemptFire(), 0);
      } else {
        setTargetLock(null);
      }
    },
    [threats, setTargetLock, attemptFire],
  );

  // Tappable edge indicator handler
  const handleEdgeTap = useCallback(
    (threatId: string, e: React.MouseEvent | React.TouchEvent) => {
      e.stopPropagation();
      setTargetLock(threatId);
      setTimeout(() => attemptFire(), 0);
    },
    [setTargetLock, attemptFire],
  );

  // Cycle to next threat — sorted closest-to-player first
  const cycleTarget = useCallback(() => {
    if (threatsRef.current.length === 0) return;
    const sorted = [...threatsRef.current].sort((a, b) => {
      const da = Math.hypot(a.position[0], a.position[1], a.position[2] - 4);
      const db = Math.hypot(b.position[0], b.position[1], b.position[2] - 4);
      return da - db;
    });
    const currentId = useGameStore.getState().targetLockId;
    const currentIdx = sorted.findIndex((t) => t.id === currentId);
    const nextIdx = (currentIdx + 1) % sorted.length;
    setTargetLock(sorted[nextIdx].id);
  }, [setTargetLock]);

  const cycleTargetRef = useRef(cycleTarget);
  useEffect(() => { cycleTargetRef.current = cycleTarget; }, [cycleTarget]);

  // Global keyboard handler — active regardless of focus
  useEffect(() => {
    const WEAPON_KEYS: Record<string, WeaponType> = {
      "1": "heat-seeker",
      "2": "cluster",
      "3": "prox-burst",
      "4": "kinetic",
    };
    const onKey = (e: KeyboardEvent) => {
      if (WEAPON_KEYS[e.key]) {
        setSelectedWeapon(WEAPON_KEYS[e.key]);
        return;
      }
      switch (e.key) {
        case "Tab":
          e.preventDefault();
          cycleTargetRef.current();
          break;
        case " ":
          e.preventDefault();
          if (useGameStore.getState().targetLockId) attemptFire();
          break;
        case "Escape":
          setTargetLock(null);
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setTargetLock, attemptFire, setSelectedWeapon]);

  if (isPortrait) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "24px",
          fontFamily: "'JetBrains Mono', monospace",
          zIndex: 9999,
        }}
      >
        <style>{`
          @keyframes rotateDevice {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-90deg); }
            75% { transform: rotate(-90deg); }
            100% { transform: rotate(0deg); }
          }
          @keyframes aegisGlow {
            0%, 100% { text-shadow: 0 0 12px #00e5ff, 0 0 30px rgba(0,229,255,0.5); }
            50% { text-shadow: 0 0 24px #00e5ff, 0 0 60px rgba(0,229,255,0.8), 0 0 80px rgba(0,229,255,0.3); }
          }
        `}</style>
        <div
          style={{
            fontSize: "36px",
            fontWeight: 900,
            letterSpacing: "0.3em",
            color: "#00e5ff",
            animation: "aegisGlow 2s ease-in-out infinite",
          }}
        >
          A.E.G.I.S
        </div>
        <div
          style={{
            fontSize: "48px",
            animation: "rotateDevice 2s ease-in-out infinite",
            display: "inline-block",
          }}
        >
          📱
        </div>
        <div
          style={{
            color: "#00e5ff",
            fontSize: "13px",
            letterSpacing: "0.2em",
            textAlign: "center",
          }}
        >
          A.E.G.I.S REQUIRES LANDSCAPE MODE
        </div>
        <div
          style={{
            color: "rgba(0,229,255,0.5)",
            fontSize: "11px",
            letterSpacing: "0.15em",
          }}
        >
          ROTATE YOUR DEVICE TO CONTINUE
        </div>
      </div>
    );
  }

  return (
    <div
      ref={canvasRef}
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#000010", cursor: "crosshair" }}
      onClick={handleCanvasClick}
      onTouchEnd={handleCanvasClick}
    >
      <style>{`
        @keyframes lockRingAnim {
          0% { transform: translate(-50%, -50%) scale(2.2); opacity: 1; border-width: 3px; }
          40% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.9; border-width: 2px; }
          100% { transform: translate(-50%, -50%) scale(0.5); opacity: 0; border-width: 1px; }
        }
        @keyframes lockRingInner {
          0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
          30% { opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
        @keyframes lockCorners {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.5); }
          20% { opacity: 1; }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
        @keyframes edgePulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes edgeGlow {
          0%, 100% { filter: drop-shadow(0 0 6px #ff3333) drop-shadow(0 0 12px rgba(255,50,50,0.8)); }
          50% { filter: drop-shadow(0 0 10px #ff6600) drop-shadow(0 0 20px rgba(255,100,0,0.9)); }
        }
        @keyframes waveIn {
          0% { opacity: 0; transform: translateX(-50%) scale(0.7); }
          40% { opacity: 1; transform: translateX(-50%) scale(1.05); }
          80% { opacity: 1; }
          100% { opacity: 0; transform: translateX(-50%) scale(1); }
        }
        @keyframes amber-pulse {
          0%, 100% { box-shadow: 0 0 12px currentColor; }
          50% { box-shadow: 0 0 24px currentColor, 0 0 40px currentColor; }
        }
      `}</style>

      <Canvas
        camera={{ position: [0, 0, 5.5], fov: 75 }}
        style={{ width: "100%", height: "100%" }}
        gl={{ antialias: true, alpha: false }}
      >
        <Suspense fallback={null}>
          <EarthScene onThreatClick={setTargetLock} />
        </Suspense>
      </Canvas>

      {waveClearing && (
        <div
          key={`wave_clear_${wave}`}
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: "22px",
            fontWeight: 900,
            letterSpacing: "0.35em",
            color: "#00ff88",
            textShadow: "0 0 20px #00ff88, 0 0 40px rgba(0,255,136,0.5)",
            animation: "waveIn 2s ease-out forwards",
            pointerEvents: "none",
            whiteSpace: "nowrap",
          }}
        >
          WAVE {wave} CLEARED
        </div>
      )}

      {/* Tappable edge indicators — large hit area for behind-globe threats */}
      {edgeIndicators.map((ind) => (
        <button
          key={ind.id}
          type="button"
          aria-label="Target threat"
          onClick={(e) => handleEdgeTap(ind.id, e)}
          onTouchEnd={(e) => handleEdgeTap(ind.id, e)}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ")
              handleEdgeTap(ind.id, e as unknown as React.MouseEvent);
          }}
          style={{
            position: "absolute",
            left: ind.x,
            top: ind.y,
            width: 0,
            height: 0,
            // Large transparent tap area centered on the arrow
            padding: "24px",
            margin: "-24px",
            cursor: "crosshair",
            pointerEvents: "auto",
            zIndex: 20,
            animation: "edgePulse 0.8s ease-in-out infinite",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%) rotate(${ind.angle}rad)`,
              width: 0,
              height: 0,
              borderTop: "10px solid transparent",
              borderBottom: "10px solid transparent",
              borderLeft: "20px solid #ff3333",
              animation: "edgeGlow 0.8s ease-in-out infinite",
              pointerEvents: "none",
            }}
          />
          {/* Secondary outer ring to indicate tappability */}
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              width: "36px",
              height: "36px",
              border: "1px solid rgba(255,50,50,0.4)",
              borderRadius: "50%",
              pointerEvents: "none",
            }}
          />
        </button>
      ))}

      {lockRing && (
        <div
          key={lockRing.key}
          style={{
            position: "absolute",
            left: lockRing.x,
            top: lockRing.y,
            width: 60,
            height: 60,
            pointerEvents: "none",
          }}
        >
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 60,
              height: 60,
              border: "2px solid #00e5ff",
              borderRadius: "50%",
              boxShadow: "0 0 14px #00e5ff, inset 0 0 8px rgba(0,229,255,0.3)",
              animation: "lockRingAnim 0.65s ease-out forwards",
            }}
          />
          <div
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              width: 20,
              height: 20,
              border: "1px solid rgba(0,229,255,0.7)",
              borderRadius: "50%",
              animation: "lockRingInner 0.65s ease-out forwards",
            }}
          />
          {["topleft", "topright", "bottomleft", "bottomright"].map(
            (corner) => (
              <div
                key={corner}
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "50%",
                  width: 14,
                  height: 14,
                  animation: "lockCorners 0.65s ease-out forwards",
                  borderColor: "#00e5ff",
                  borderStyle: "solid",
                  borderWidth: 0,
                  borderTopWidth: corner.startsWith("top") ? 2 : 0,
                  borderBottomWidth: corner.startsWith("bottom") ? 2 : 0,
                  borderLeftWidth: corner.endsWith("left") ? 2 : 0,
                  borderRightWidth: corner.endsWith("right") ? 2 : 0,
                  transform: `translate(
                  calc(-50% + ${corner.endsWith("right") ? 18 : -18}px),
                  calc(-50% + ${corner.startsWith("bottom") ? 18 : -18}px)
                )`,
                  boxShadow: "0 0 6px #00e5ff",
                }}
              />
            ),
          )}
        </div>
      )}

      <HUD />
    </div>
  );
}
