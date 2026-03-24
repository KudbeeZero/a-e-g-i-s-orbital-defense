import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";

const CHAPTERS = [
  {
    number: 1,
    title: "FIRST CONTACT",
    briefing: "Unknown debris signatures detected in geosynchronous orbit.",
    sub: "Deploy heat-seeker missiles. Eliminate all 3 incoming objects before impact.",
    threat: "NOMINAL",
    threatCount: 3,
    color: "#00e5ff",
  },
  {
    number: 2,
    title: "SWARM PROTOCOL",
    briefing:
      "Multiple fast-moving contacts. Tracking 6 simultaneous signatures.",
    sub: "Cluster missiles deployed. Each warhead splits into 3 independent interceptors.",
    threat: "ELEVATED",
    threatCount: 6,
    color: "#ffaa00",
  },
  {
    number: 3,
    title: "BOMBARDMENT",
    briefing:
      "Coordinated asteroid cluster inbound. 8 objects in tight formation.",
    sub: "Proximity burst effective against packed formations. Clear the orbital lane.",
    threat: "ELEVATED",
    threatCount: 8,
    color: "#ffaa00",
  },
  {
    number: 4,
    title: "PRECISION STRIKE",
    briefing: "Armor-plated objects detected. Standard munitions insufficient.",
    sub: "Kinetic interceptors required. 5 hardened targets. Aim true.",
    threat: "CRITICAL",
    threatCount: 5,
    color: "#ff3333",
  },
  {
    number: 5,
    title: "FINAL WAVE",
    briefing:
      "MAXIMUM THREAT LEVEL. 12 mixed objects inbound. Earth is counting on you.",
    sub: "All weapon systems authorized. This is what we trained for. DEFEND EARTH.",
    threat: "CRITICAL",
    threatCount: 12,
    color: "#ff3333",
  },
];

// Pre-generated stable star data
const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: `star-${i}`,
  left: (i * 73.1 + 17.3) % 97.3,
  top: (i * 41.7 + 5.9) % 98.1,
  w: (i % 3) + 1,
  opacity: 0.2 + (i % 7) * 0.08,
}));

export default function CinematicScreen() {
  const chapter = useGameStore((s) => s.chapter);
  const setPhase = useGameStore((s) => s.setPhase);
  const resetCombat = useGameStore((s) => s.resetCombat);
  const setThreatCount = useGameStore((s) => s.setThreatCount);
  const [progress, setProgress] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const chapterData = CHAPTERS[Math.min(chapter - 1, CHAPTERS.length - 1)];

  useEffect(() => {
    resetCombat();
    setThreatCount(chapterData.threatCount);
    const t = setTimeout(() => setVisible(true), 200);
    return () => clearTimeout(t);
  }, [resetCombat, setThreatCount, chapterData.threatCount]);

  const handleStart = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setPhase("combat");
  };

  useEffect(() => {
    const DURATION = 15000;
    const start = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - start;
      const p = Math.min(elapsed / DURATION, 1);
      setProgress(p);
      if (p >= 1) {
        clearInterval(timerRef.current!);
        setPhase("combat");
      }
    }, 100);
    return () => clearInterval(timerRef.current!);
  }, [setPhase]);

  return (
    <div
      className="relative w-screen h-screen flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "#000214" }}
    >
      {/* Stars */}
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

      {/* Alert stripe */}
      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: chapterData.color,
          boxShadow: `0 0 20px ${chapterData.color}`,
        }}
      />

      {/* Content */}
      <div
        className="relative z-10 text-center px-8 max-w-2xl transition-all duration-700"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(30px)",
        }}
      >
        <div
          className="font-hud text-xs tracking-[0.4em] mb-4"
          style={{ color: chapterData.color, opacity: 0.8 }}
        >
          CHAPTER {chapterData.number} OF 5
        </div>

        <h1
          className="font-display font-black text-5xl sm:text-7xl leading-none tracking-tight mb-6"
          style={{
            color: chapterData.color,
            textShadow: `0 0 30px ${chapterData.color}, 0 0 60px ${chapterData.color}40`,
          }}
        >
          {chapterData.title}
        </h1>

        <div className="flex items-center gap-4 mb-6">
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to right, transparent, ${chapterData.color}80)`,
            }}
          />
          <div
            className="font-hud text-xs tracking-widest"
            style={{ color: `${chapterData.color}80` }}
          >
            MISSION BRIEFING
          </div>
          <div
            className="flex-1 h-px"
            style={{
              background: `linear-gradient(to left, transparent, ${chapterData.color}80)`,
            }}
          />
        </div>

        <p
          className="font-hud text-base mb-3"
          style={{ color: "rgba(255,255,255,0.85)" }}
        >
          {chapterData.briefing}
        </p>
        <p
          className="font-hud text-sm"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {chapterData.sub}
        </p>

        <div className="mt-6 flex items-center justify-center gap-4">
          <span
            className="font-hud text-xs"
            style={{ color: "rgba(0,229,255,0.6)" }}
          >
            THREAT LEVEL:
          </span>
          <span
            className="font-hud text-sm font-bold px-3 py-1 border"
            style={{
              color: chapterData.color,
              borderColor: chapterData.color,
              boxShadow: `0 0 8px ${chapterData.color}60`,
            }}
          >
            {chapterData.threat}
          </span>
          <span
            className="font-hud text-xs"
            style={{ color: "rgba(0,229,255,0.6)" }}
          >
            OBJECTS: {chapterData.threatCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-24 left-0 right-0 px-12">
        <div
          className="h-0.5 rounded-full overflow-hidden"
          style={{ background: "rgba(0,229,255,0.15)" }}
        >
          <div
            className="h-full transition-all duration-100"
            style={{
              width: `${progress * 100}%`,
              background: chapterData.color,
              boxShadow: `0 0 6px ${chapterData.color}`,
            }}
          />
        </div>
        <div
          className="flex justify-between mt-1 font-hud text-xs"
          style={{ color: "rgba(255,255,255,0.3)" }}
        >
          <span>AUTO-ADVANCE: {Math.round((1 - progress) * 15)}s</span>
          <span>INITIALIZING COMBAT SYSTEMS...</span>
        </div>
      </div>

      <button
        type="button"
        data-ocid="cinematic.primary_button"
        onClick={handleStart}
        className="absolute bottom-8 right-8 font-hud text-sm px-6 py-2 border tracking-widest transition-all"
        style={{
          background: "rgba(0,229,255,0.1)",
          borderColor: "rgba(0,229,255,0.4)",
          color: "rgba(0,229,255,0.7)",
        }}
      >
        SKIP ▶▶
      </button>
    </div>
  );
}
