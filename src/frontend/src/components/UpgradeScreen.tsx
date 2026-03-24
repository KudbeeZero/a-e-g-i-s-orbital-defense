import { useState } from "react";
import { useGameStore } from "../store/gameStore";

const UPGRADES = [
  {
    id: "bigger-bang",
    name: "BIGGER BANG",
    icon: "💥",
    desc: "+50% explosion radius. Collateral damage increases dramatically.",
    color: "#ff4400",
  },
  {
    id: "trail-blazer",
    name: "TRAIL BLAZER",
    icon: "🔥",
    desc: "Missile contrails become brilliant plasma streams. +10% tracking speed.",
    color: "#ffaa00",
  },
  {
    id: "rapid-reload",
    name: "RAPID RELOAD",
    icon: "⚡",
    desc: "-30% cooldown on all weapon systems. Sustained fire capability.",
    color: "#00e5ff",
  },
];

const STARS = Array.from({ length: 150 }, (_, i) => ({
  id: `up-${i}`,
  left: (i * 17.3) % 100,
  top: (i * 13.7) % 100,
  w: (i % 3) + 1,
  opacity: 0.2 + (i % 5) * 0.1,
}));

export default function UpgradeScreen() {
  const chapter = useGameStore((s) => s.chapter);
  const score = useGameStore((s) => s.score);
  const threatsDestroyed = useGameStore((s) => s.threatsDestroyed);
  const threatCount = useGameStore((s) => s.threatCount);
  const addUpgrade = useGameStore((s) => s.addUpgrade);
  const setChapter = useGameStore((s) => s.setChapter);
  const setPhase = useGameStore((s) => s.setPhase);
  const existingUpgrades = useGameStore((s) => s.upgrades);
  const saveToStorage = useGameStore((s) => s.saveToStorage);

  const [selected, setSelected] = useState<string | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const accuracy =
    threatCount > 0 ? Math.round((threatsDestroyed / threatCount) * 100) : 0;

  const availableUpgrades = UPGRADES.filter(
    (u) => !existingUpgrades.includes(u.id),
  );
  const displayUpgrades = availableUpgrades.slice(0, 3);

  const handleConfirm = () => {
    if (!selected) return;
    addUpgrade(selected);
    setConfirmed(true);
    const nextChapter = chapter + 1;
    if (nextChapter > 5) {
      saveToStorage();
      setTimeout(() => setPhase("gameover"), 1000);
    } else {
      setChapter(nextChapter);
      saveToStorage();
      setTimeout(() => setPhase("cinematic"), 1000);
    }
  };

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden px-6"
      style={{ background: "#000214" }}
    >
      <div className="absolute inset-0 overflow-hidden">
        {STARS.map((s) => (
          <div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.left}%`,
              top: `${s.top}%`,
              width: `${s.w}px`,
              height: `${s.w}px`,
              background: "white",
              opacity: s.opacity,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-2xl">
        <div className="text-center mb-6">
          <div
            className="font-hud text-xs tracking-[0.4em] mb-2"
            style={{ color: "#00ff88", opacity: 0.8 }}
          >
            CHAPTER {chapter} COMPLETE
          </div>
          <h1
            className="font-display font-black text-4xl sm:text-5xl tracking-tight"
            style={{
              color: "#00e5ff",
              textShadow: "0 0 20px rgba(0,229,255,0.5)",
            }}
          >
            MISSION DEBRIEF
          </h1>
        </div>

        <div className="flex gap-4 justify-center mb-8 flex-wrap">
          {[
            { label: "SCORE", value: score.toLocaleString(), color: "#ffaa00" },
            {
              label: "DESTROYED",
              value: `${threatsDestroyed}/${threatCount}`,
              color: "#00ff88",
            },
            { label: "ACCURACY", value: `${accuracy}%`, color: "#00e5ff" },
          ].map((stat) => (
            <div
              key={stat.label}
              className="border px-5 py-3 text-center"
              style={{
                background: "rgba(0,10,20,0.8)",
                borderColor: `${stat.color}50`,
              }}
            >
              <div
                className="font-hud text-xs"
                style={{ color: `${stat.color}80`, letterSpacing: "0.2em" }}
              >
                {stat.label}
              </div>
              <div
                className="font-hud font-bold text-2xl"
                style={{ color: stat.color }}
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {displayUpgrades.length > 0 ? (
          <>
            <div
              className="font-hud text-xs text-center mb-4 tracking-widest"
              style={{ color: "rgba(0,229,255,0.5)" }}
            >
              SELECT UPGRADE MODULE
            </div>
            <div className="flex gap-3 flex-wrap justify-center mb-6">
              {displayUpgrades.map((u, i) => (
                <button
                  type="button"
                  key={u.id}
                  data-ocid={`upgrade.card.${i + 1}`}
                  onClick={() => setSelected(u.id)}
                  className="flex-1 min-w-[160px] max-w-[200px] p-4 border-2 text-left transition-all"
                  style={{
                    background:
                      selected === u.id ? `${u.color}15` : "rgba(0,5,20,0.8)",
                    borderColor:
                      selected === u.id ? u.color : "rgba(255,255,255,0.1)",
                    boxShadow:
                      selected === u.id ? `0 0 16px ${u.color}50` : "none",
                  }}
                >
                  <div className="text-2xl mb-2">{u.icon}</div>
                  <div
                    className="font-hud font-bold text-xs mb-1"
                    style={{ color: u.color, letterSpacing: "0.1em" }}
                  >
                    {u.name}
                  </div>
                  <div
                    className="font-hud text-xs"
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}
                  >
                    {u.desc}
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <div
            className="text-center mb-6 font-hud text-sm"
            style={{ color: "rgba(0,229,255,0.5)" }}
          >
            ALL UPGRADES INSTALLED
          </div>
        )}

        <div className="flex justify-center">
          <button
            type="button"
            data-ocid="upgrade.primary_button"
            onClick={handleConfirm}
            disabled={confirmed || (displayUpgrades.length > 0 && !selected)}
            className="px-12 py-4 font-hud font-bold text-base tracking-[0.2em] border-2 transition-all"
            style={{
              background: confirmed
                ? "rgba(0,255,100,0.1)"
                : selected || displayUpgrades.length === 0
                  ? "rgba(0,229,255,0.1)"
                  : "rgba(50,50,50,0.3)",
              borderColor: confirmed
                ? "#00ff88"
                : selected || displayUpgrades.length === 0
                  ? "#00e5ff"
                  : "rgba(100,100,100,0.3)",
              color: confirmed
                ? "#00ff88"
                : selected || displayUpgrades.length === 0
                  ? "#00e5ff"
                  : "rgba(100,100,100,0.4)",
              cursor:
                confirmed || (displayUpgrades.length > 0 && !selected)
                  ? "not-allowed"
                  : "pointer",
            }}
          >
            {confirmed
              ? "► ADVANCING..."
              : chapter >= 5
                ? "► FINAL MISSION"
                : `► CHAPTER ${chapter + 1}`}
          </button>
        </div>
      </div>
    </div>
  );
}
