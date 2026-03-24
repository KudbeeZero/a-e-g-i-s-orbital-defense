import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";
import type { WeaponType } from "../store/gameStore";
import RadarDisplay from "./RadarDisplay";
import WeaponSelector from "./WeaponSelector";

const WEAPON_COLORS: Record<WeaponType, string> = {
  "heat-seeker": "#00e5ff",
  cluster: "#ffaa00",
  "prox-burst": "#aa44ff",
  kinetic: "#ffffff",
};

const TABS = ["CMD", "SCAN", "WPN", "SHIP", "LOG"];

// Bottom layout constants — all HUD elements have at least BOTTOM_MARGIN from screen edge
const BOTTOM_MARGIN = 28;
const NAV_HEIGHT = 44;
const NAV_BOTTOM = BOTTOM_MARGIN;
const CONTROLS_BOTTOM = NAV_BOTTOM + NAV_HEIGHT + 8;
const SIDE_PANELS_BOTTOM = CONTROLS_BOTTOM + 10;

function ComboDecayBar({ lastKillTime }: { lastKillTime: number }) {
  const [pct, setPct] = useState(1);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const tick = () => {
      const elapsed = Date.now() - lastKillTime;
      const remaining = Math.max(0, 1 - elapsed / 3000);
      setPct(remaining);
      if (remaining > 0) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [lastKillTime]);

  return (
    <div
      style={{
        width: "120px",
        height: "3px",
        background: "rgba(255,170,0,0.2)",
        borderRadius: "2px",
        marginTop: "4px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${pct * 100}%`,
          height: "100%",
          background:
            pct > 0.5 ? "#ffaa00" : pct > 0.25 ? "#ff6600" : "#ff3300",
          boxShadow: "0 0 4px currentColor",
          transition: "background 0.3s",
        }}
      />
    </div>
  );
}

interface NearMissCallout {
  key: number;
  bonus: number;
}

export default function HUD() {
  const chapter = useGameStore((s) => s.chapter);
  const score = useGameStore((s) => s.score);
  const shield = useGameStore((s) => s.shield);
  const hull = useGameStore((s) => s.hull);
  const targetLockId = useGameStore((s) => s.targetLockId);
  const threats = useGameStore((s) => s.threats);
  const selectedWeapon = useGameStore((s) => s.selectedWeapon);
  const ammo = useGameStore((s) => s.ammo);
  const cooldowns = useGameStore((s) => s.cooldowns);
  const activeTab = useGameStore((s) => s.activeTab);
  const setActiveTab = useGameStore((s) => s.setActiveTab);
  const attemptFire = useGameStore((s) => s.attemptFire);
  const setTargetLock = useGameStore((s) => s.setTargetLock);
  const setPhase = useGameStore((s) => s.setPhase);
  const threatsDestroyed = useGameStore((s) => s.threatsDestroyed);
  const wave = useGameStore((s) => s.wave);
  const slowMoActive = useGameStore((s) => s.slowMoActive);
  const cities = useGameStore((s) => s.cities);
  const combo = useGameStore((s) => s.combo);
  const lastKillTime = useGameStore((s) => s.lastKillTime);
  const nearMisses = useGameStore((s) => s.nearMisses);

  const multiplier = Math.min(5, 1 + combo * 0.5);

  const [now, setNow] = useState(Date.now());
  const [heading] = useState(() => Math.floor(Math.random() * 360));
  const rafRef = useRef<number>(0);
  const [lockFlash, setLockFlash] = useState(false);
  const prevLockRef = useRef<string | null>(null);
  const [nearMissCallout, setNearMissCallout] =
    useState<NearMissCallout | null>(null);
  const prevNearMissesRef = useRef(nearMisses);

  useEffect(() => {
    const tick = () => {
      setNow(Date.now());
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, []);

  useEffect(() => {
    if (targetLockId !== null && prevLockRef.current === null) {
      setLockFlash(true);
      const t = setTimeout(() => setLockFlash(false), 400);
      return () => clearTimeout(t);
    }
    prevLockRef.current = targetLockId;
  }, [targetLockId]);

  useEffect(() => {
    if (hull <= 0) setPhase("gameover");
  }, [hull, setPhase]);

  useEffect(() => {
    if (nearMisses > prevNearMissesRef.current) {
      const bonus = Math.round(150 * Math.min(5, 1 + combo * 0.5));
      setNearMissCallout({ key: Date.now(), bonus });
      const t = setTimeout(() => setNearMissCallout(null), 1500);
      prevNearMissesRef.current = nearMisses;
      return () => clearTimeout(t);
    }
    prevNearMissesRef.current = nearMisses;
  }, [nearMisses, combo]);

  const canFire =
    targetLockId !== null &&
    ammo[selectedWeapon] > 0 &&
    cooldowns[selectedWeapon] <= now;

  const handleLaunch = () => {
    if (!targetLockId) return;
    // If no target lock but fire button pressed, try anyway
    attemptFire();
    // If not ready (cooldown/ammo), clear lock so user can retarget
    if (!canFire) setTargetLock(null);
  };

  const threatLevel =
    threats.length === 0
      ? "NOMINAL"
      : threats.length <= 3
        ? "ELEVATED"
        : "CRITICAL";
  const threatColor =
    threatLevel === "NOMINAL"
      ? "#00ff88"
      : threatLevel === "ELEVATED"
        ? "#ffaa00"
        : "#ff3333";

  const cooldownReady = cooldowns[selectedWeapon] <= now;
  const cooldownLeft = Math.max(0, (cooldowns[selectedWeapon] - now) / 1000);
  const weaponColor = WEAPON_COLORS[selectedWeapon];
  const citiesIntact = cities.filter((c) => !c.isDestroyed).length;
  const citiesShielded = cities.filter((c) => !c.isDestroyed && c.shields > 0).length;

  return (
    <div
      className="absolute inset-0 pointer-events-none select-none"
      style={{ fontFamily: "'JetBrains Mono', monospace" }}
    >
      {/* Slow-mo overlay */}
      {slowMoActive && (
        <>
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "radial-gradient(ellipse at center, transparent 30%, rgba(0,0,0,0.75) 100%)",
              pointerEvents: "none",
              zIndex: 50,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              fontFamily: "inherit",
              fontSize: "28px",
              fontWeight: 900,
              letterSpacing: "0.35em",
              color: "#ff4400",
              textShadow:
                "0 0 20px #ff4400, 0 0 40px rgba(255,68,0,0.6), 0 0 60px rgba(255,68,0,0.3)",
              animation: "interceptFlash 0.5s ease-in-out infinite alternate",
              pointerEvents: "none",
              zIndex: 51,
              whiteSpace: "nowrap",
            }}
          >
            ⚡ INTERCEPT WINDOW
          </div>
          <style>{`
            @keyframes interceptFlash {
              0% { opacity: 1; }
              100% { opacity: 0.3; }
            }
          `}</style>
        </>
      )}

      {/* Scanline overlay */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.012) 3px, rgba(0,229,255,0.012) 4px)",
          pointerEvents: "none",
        }}
      />

      {/* Combo counter — top center */}
      {combo >= 2 && (
        <div
          data-ocid="combo.panel"
          style={{
            position: "absolute",
            top: "10px",
            left: "50%",
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(0,5,15,0.85)",
            border: "1px solid rgba(255,170,0,0.6)",
            padding: "6px 16px",
            boxShadow:
              "0 0 16px rgba(255,170,0,0.35), 0 0 32px rgba(255,170,0,0.15)",
            minWidth: "140px",
          }}
        >
          <div
            style={{
              color: "#ffaa00",
              fontSize: "28px",
              fontWeight: 900,
              lineHeight: 1,
              textShadow: "0 0 20px #ffaa00, 0 0 40px rgba(255,170,0,0.5)",
              letterSpacing: "0.1em",
            }}
          >
            x{combo} COMBO
          </div>
          <div
            style={{
              color: "rgba(255,255,255,0.7)",
              fontSize: "11px",
              marginTop: "2px",
              letterSpacing: "0.15em",
            }}
          >
            {multiplier.toFixed(1)}x SCORE
          </div>
          <ComboDecayBar lastKillTime={lastKillTime} />
        </div>
      )}

      {/* Near-miss callout */}
      {nearMissCallout && (
        <div
          key={nearMissCallout.key}
          data-ocid="combo.toast"
          style={{
            position: "absolute",
            top: "38%",
            left: "50%",
            transform: "translateX(-50%)",
            fontFamily: "inherit",
            fontSize: "20px",
            fontWeight: 900,
            letterSpacing: "0.25em",
            color: "#cc88ff",
            textShadow: "0 0 16px #aa44ff, 0 0 32px rgba(170,68,255,0.5)",
            animation: "nearMissFloat 1.5s ease-out forwards",
            pointerEvents: "none",
            whiteSpace: "nowrap",
            zIndex: 60,
          }}
        >
          +{nearMissCallout.bonus} NEAR MISS!
        </div>
      )}
      <style>{`
        @keyframes nearMissFloat {
          0% { opacity: 0; transform: translateX(-50%) translateY(0px); }
          15% { opacity: 1; }
          70% { opacity: 1; transform: translateX(-50%) translateY(-30px); }
          100% { opacity: 0; transform: translateX(-50%) translateY(-50px); }
        }
      `}</style>

      {threats.length > 0 && (
        <div
          className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 py-1.5"
          style={{
            background: "rgba(255,170,0,0.85)",
            borderBottom: "1px solid #ffaa00",
            boxShadow: "0 2px 12px rgba(255,170,0,0.4)",
          }}
        >
          <span
            className="text-xs font-bold tracking-widest"
            style={{ color: "#000", fontFamily: "inherit" }}
          >
            ⚠ A.E.G.I.S — INCOMING OBJECT
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: "#000", fontFamily: "inherit" }}
          >
            {threats.length} OBJECT{threats.length !== 1 ? "S" : ""} TRACKED
          </span>
        </div>
      )}

      {/* Target lock panel */}
      <div
        className="absolute border px-3 py-2 transition-all duration-150"
        style={{
          top: threats.length > 0 ? "36px" : "10px",
          left: "10px",
          background: "rgba(0,10,20,0.8)",
          borderColor: "#00e5ff",
          boxShadow: lockFlash
            ? "0 0 20px #00e5ff, 0 0 40px rgba(0,229,255,0.4)"
            : "0 0 6px rgba(0,229,255,0.3)",
          minWidth: "160px",
        }}
      >
        <div
          className="text-xs tracking-widest mb-1"
          style={{ color: "#00e5ff", opacity: 0.7 }}
        >
          ► TARGET LOCK
        </div>
        <div
          className="text-xs font-bold"
          style={{ color: targetLockId ? "#00e5ff" : "rgba(255,255,255,0.35)" }}
        >
          {targetLockId
            ? `LOCKED: ${targetLockId.slice(-6).toUpperCase()}`
            : "— NO TARGET —"}
        </div>
      </div>

      {/* Top-right: sector info + wave counter + score */}
      <div
        className="absolute border px-3 py-2 text-right"
        style={{
          top: threats.length > 0 ? "36px" : "10px",
          right: "10px",
          background: "rgba(0,10,20,0.8)",
          borderColor: "rgba(0,229,255,0.4)",
        }}
      >
        <div
          className="text-xs"
          style={{ color: "rgba(0,229,255,0.6)", letterSpacing: "0.1em" }}
        >
          SECTOR ALPHA-{chapter}
        </div>
        <div
          className="text-xs font-bold mt-0.5"
          style={{ color: threatColor }}
        >
          THREAT: {threatLevel}
        </div>
        <div
          className="text-xs font-bold mt-1"
          style={{
            color: "#00e5ff",
            fontSize: "11px",
            letterSpacing: "0.15em",
            textShadow: "0 0 8px rgba(0,229,255,0.6)",
          }}
        >
          WAVE {String(wave).padStart(2, "0")}
        </div>
        <div
          className="text-xs"
          style={{
            color: "rgba(0,229,255,0.4)",
            fontSize: "9px",
            marginTop: "2px",
          }}
        >
          TACTICAL OVERLAY v2.4
        </div>
        <div className="text-xs" style={{ color: "#00ff88", fontSize: "9px" }}>
          SYS: ONLINE
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "#ffaa00", fontSize: "9px" }}
        >
          SCORE: {score.toLocaleString()}
          {combo >= 2 ? ` [${multiplier.toFixed(1)}x]` : ""}
        </div>
      </div>

      {/* Left panel: shields + kills + cities */}
      <div
        className="absolute border px-3 py-3 flex flex-col gap-2"
        style={{
          top: "50%",
          left: "10px",
          transform: "translateY(-50%)",
          background: "rgba(0,10,20,0.8)",
          borderColor: "rgba(0,229,255,0.3)",
          minWidth: "140px",
        }}
      >
        <div>
          <div
            className="flex justify-between text-xs mb-1"
            style={{ color: "#00e5ff", fontSize: "9px" }}
          >
            <span>SHD</span>
            <span>{shield}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden"
            style={{ background: "rgba(0,229,255,0.15)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${shield}%`,
                background: "#00e5ff",
                boxShadow: "0 0 4px #00e5ff",
              }}
            />
          </div>
        </div>
        <div>
          <div
            className="flex justify-between text-xs mb-1"
            style={{
              color: hull < 30 ? "#ff3333" : "#00ff88",
              fontSize: "9px",
            }}
          >
            <span>HUL</span>
            <span>{hull}%</span>
          </div>
          <div
            className="h-1.5 overflow-hidden"
            style={{ background: "rgba(0,255,100,0.1)" }}
          >
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${hull}%`,
                background: hull < 30 ? "#ff3333" : "#00ff88",
                boxShadow: `0 0 4px ${hull < 30 ? "#ff3333" : "#00ff88"}`,
              }}
            />
          </div>
        </div>
        <div
          className="mt-1 pt-1"
          style={{ borderTop: "1px solid rgba(0,229,255,0.15)" }}
        >
          <div
            className="text-xs"
            style={{ color: "rgba(0,229,255,0.5)", fontSize: "8px" }}
          >
            INTERCEPTED
          </div>
          <div
            className="text-xs font-bold"
            style={{ color: "#00ff88", fontSize: "11px" }}
          >
            {threatsDestroyed} KILLS
          </div>
        </div>
        <div
          className="pt-1"
          style={{ borderTop: "1px solid rgba(255,150,0,0.2)" }}
        >
          <div
            className="text-xs"
            style={{ color: "rgba(255,150,0,0.6)", fontSize: "8px" }}
          >
            CITIES ONLINE
          </div>
          <div
            className="text-xs font-bold"
            style={{
              color: citiesIntact > 3 ? "#ffaa00" : "#ff3333",
              fontSize: "11px",
            }}
          >
            {citiesIntact}/7
          </div>
          {citiesShielded > 0 && (
            <div
              className="text-xs"
              style={{ color: "#aa44ff", fontSize: "9px", marginTop: "2px" }}
            >
              {citiesShielded} SHIELDED
            </div>
          )}
        </div>
        {nearMisses > 0 && (
          <div
            className="pt-1"
            style={{ borderTop: "1px solid rgba(170,68,255,0.2)" }}
          >
            <div
              className="text-xs"
              style={{ color: "rgba(170,68,255,0.6)", fontSize: "8px" }}
            >
              NEAR MISSES
            </div>
            <div
              className="text-xs font-bold"
              style={{ color: "#cc88ff", fontSize: "11px" }}
            >
              {nearMisses}
            </div>
          </div>
        )}
      </div>

      {/* Bottom-left: velocity/heading — raised with SIDE_PANELS_BOTTOM margin */}
      <div
        className="absolute border px-3 py-2 pointer-events-auto"
        style={{
          bottom: `${SIDE_PANELS_BOTTOM}px`,
          left: "10px",
          background: "rgba(0,10,20,0.8)",
          borderColor: "rgba(0,229,255,0.3)",
        }}
      >
        <div
          className="text-xs"
          style={{ color: "rgba(0,229,255,0.5)", fontSize: "9px" }}
        >
          VEL
        </div>
        <div
          className="text-xs font-bold"
          style={{ color: "#00e5ff", fontSize: "10px" }}
        >
          ↑ {Math.floor(7.8 + Math.sin(now / 3000) * 0.3)} KM/S
        </div>
        <div
          className="text-xs mt-1"
          style={{ color: "rgba(0,229,255,0.5)", fontSize: "9px" }}
        >
          HDG
        </div>
        <div
          className="text-xs font-bold"
          style={{ color: "#00e5ff", fontSize: "10px" }}
        >
          {heading}° N{(heading + 20) % 360}b
        </div>
      </div>

      {/* Radar — raised with SIDE_PANELS_BOTTOM margin */}
      <div
        className="absolute pointer-events-auto"
        style={{ bottom: `${SIDE_PANELS_BOTTOM}px`, right: "10px" }}
      >
        <RadarDisplay />
      </div>

      {/* Weapon selector + launch button — raised above nav bar */}
      <div
        className="absolute left-1/2 pointer-events-auto flex flex-col items-center gap-2"
        style={{
          bottom: `${CONTROLS_BOTTOM}px`,
          transform: "translateX(-50%)",
        }}
      >
        <WeaponSelector />
        {/* Large, thumb-friendly fire button */}
        <button
          type="button"
          data-ocid="combat.primary_button"
          onClick={handleLaunch}
          disabled={!targetLockId}
          className="font-bold tracking-[0.2em] border-2 transition-all duration-150"
          style={{
            fontFamily: "inherit",
            fontSize: "16px",
            letterSpacing: "0.25em",
            padding: "16px 48px",
            minWidth: "220px",
            background: canFire ? `${weaponColor}22` : "rgba(50,50,50,0.3)",
            borderColor: canFire ? weaponColor : "rgba(100,100,100,0.3)",
            color: canFire ? weaponColor : "rgba(100,100,100,0.5)",
            boxShadow: canFire
              ? `0 0 20px ${weaponColor}80, 0 0 40px ${weaponColor}40`
              : "none",
            animation:
              canFire && targetLockId
                ? "amber-pulse 1.5s ease-in-out infinite"
                : "none",
            cursor: targetLockId ? "pointer" : "not-allowed",
            borderRadius: "2px",
          }}
        >
          {!targetLockId
            ? "— TAP TARGET TO FIRE —"
            : !cooldownReady
              ? `⟳ RELOADING ${cooldownLeft.toFixed(1)}s`
              : ammo[selectedWeapon] <= 0
                ? "— AMMO DEPLETED —"
                : "⚡ FIRE"}
        </button>
      </div>

      {/* Keyboard shortcuts hint — desktop only (hidden on touch devices) */}
      <div
        style={{
          position: "absolute",
          top: "12px",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "10px",
          alignItems: "center",
          pointerEvents: "none",
          opacity: 0.55,
        }}
        className="hidden sm:flex"
      >
        {(
          [
            ["1", "HSK"],
            ["2", "CLU"],
            ["3", "PRX"],
            ["4", "KIN"],
            ["TAB", "TARGET"],
            ["SPC", "FIRE"],
            ["ESC", "CLEAR"],
            ["P", "PAUSE"],
          ] as [string, string][]
        ).map(([key, label]) => (
          <div
            key={key}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "2px",
            }}
          >
            <div
              style={{
                background: "rgba(0,229,255,0.12)",
                border: "1px solid rgba(0,229,255,0.35)",
                borderRadius: "3px",
                padding: "1px 5px",
                fontSize: "9px",
                fontWeight: 700,
                letterSpacing: "0.05em",
                color: "#00e5ff",
                minWidth: "26px",
                textAlign: "center",
              }}
            >
              {key}
            </div>
            <div
              style={{
                fontSize: "7px",
                letterSpacing: "0.08em",
                color: "rgba(0,229,255,0.6)",
              }}
            >
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* Bottom nav tabs — raised BOTTOM_MARGIN from screen edge */}
      <div
        className="absolute left-0 right-0 flex pointer-events-auto"
        style={{
          bottom: `${NAV_BOTTOM}px`,
          background: "rgba(0,5,15,0.92)",
          borderTop: "1px solid rgba(0,229,255,0.2)",
          borderBottom: "1px solid rgba(0,229,255,0.1)",
          height: `${NAV_HEIGHT}px`,
        }}
      >
        {TABS.map((tab) => (
          <button
            type="button"
            key={tab}
            data-ocid={`nav.${tab.toLowerCase()}.tab`}
            onClick={() => setActiveTab(tab)}
            className="flex-1 flex flex-col items-center justify-center gap-0.5 transition-all"
            style={{
              fontFamily: "inherit",
              color: activeTab === tab ? "#00e5ff" : "rgba(0,229,255,0.35)",
              background:
                activeTab === tab ? "rgba(0,229,255,0.06)" : "transparent",
              borderTop:
                activeTab === tab
                  ? "2px solid #00e5ff"
                  : "2px solid transparent",
              fontSize: "9px",
              letterSpacing: "0.15em",
              fontWeight: activeTab === tab ? 700 : 400,
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
}
