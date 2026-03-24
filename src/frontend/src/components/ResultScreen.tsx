import { useGameStore } from "../store/gameStore";

const STARS = Array.from({ length: 200 }, (_, i) => ({
  id: `rs-${i}`,
  left: (i * 17.3) % 100,
  top: (i * 13.7) % 100,
  w: (i % 3) + 1,
  opacity: 0.15 + (i % 6) * 0.08,
}));

export default function ResultScreen() {
  const chapter = useGameStore((s) => s.chapter);
  const score = useGameStore((s) => s.score);
  const hull = useGameStore((s) => s.hull);
  const setPhase = useGameStore((s) => s.setPhase);
  const setChapter = useGameStore((s) => s.setChapter);
  const resetCombat = useGameStore((s) => s.resetCombat);

  const isVictory = chapter >= 5 && hull > 0;
  const accentColor = isVictory ? "#00ff88" : "#ff3333";
  const title = isVictory ? "EARTH DEFENDED" : "PLATFORM DESTROYED";
  const subtitle = isVictory
    ? "All threats neutralized. Earth is safe. For now."
    : "The A.E.G.I.S platform has been compromised. Earth is unprotected.";

  const handlePlayAgain = () => {
    resetCombat();
    setChapter(1);
    localStorage.removeItem("aegis_save");
    setPhase("cinematic");
  };

  const handleReturnToBase = () => {
    resetCombat();
    setPhase("menu");
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

      <div
        className="absolute top-0 left-0 right-0 h-1"
        style={{
          background: accentColor,
          boxShadow: `0 0 20px ${accentColor}`,
        }}
      />

      <div className="relative z-10 text-center max-w-lg">
        {isVictory && <div className="text-5xl mb-4">🌍</div>}

        <div
          className="font-hud text-xs tracking-[0.4em] mb-3"
          style={{ color: `${accentColor}90` }}
        >
          {isVictory ? "MISSION COMPLETE" : "MISSION FAILED"}
        </div>

        <h1
          className="font-display font-black text-5xl sm:text-6xl leading-tight tracking-tight mb-4"
          style={{
            color: accentColor,
            textShadow: `0 0 30px ${accentColor}, 0 0 60px ${accentColor}40`,
          }}
        >
          {title}
        </h1>

        <p
          className="font-hud text-sm mb-8"
          style={{ color: "rgba(255,255,255,0.55)" }}
        >
          {subtitle}
        </p>

        <div className="flex gap-4 justify-center mb-10 flex-wrap">
          {[
            {
              label: "FINAL SCORE",
              value: score.toLocaleString(),
              color: "#ffaa00",
            },
            { label: "CHAPTER", value: `${chapter}/5`, color: "#00e5ff" },
          ].map((s) => (
            <div
              key={s.label}
              className="border px-6 py-3"
              style={{
                background: "rgba(0,10,20,0.8)",
                borderColor: `${s.color}50`,
              }}
            >
              <div
                className="font-hud text-xs tracking-widest"
                style={{ color: `${s.color}70` }}
              >
                {s.label}
              </div>
              <div
                className="font-hud font-bold text-2xl"
                style={{ color: s.color }}
              >
                {s.value}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-3 max-w-xs mx-auto">
          <button
            type="button"
            data-ocid="result.primary_button"
            onClick={handlePlayAgain}
            className="w-full py-4 font-hud font-bold tracking-[0.2em] border-2 transition-all"
            style={{
              background: `${accentColor}15`,
              borderColor: accentColor,
              color: accentColor,
              boxShadow: `0 0 12px ${accentColor}40`,
            }}
          >
            ⚡ PLAY AGAIN
          </button>
          <button
            type="button"
            data-ocid="result.secondary_button"
            onClick={handleReturnToBase}
            className="w-full py-3 font-hud tracking-[0.15em] border transition-all"
            style={{
              background: "rgba(0,229,255,0.05)",
              borderColor: "rgba(0,229,255,0.3)",
              color: "rgba(0,229,255,0.6)",
            }}
          >
            ► RETURN TO BASE
          </button>
        </div>
      </div>

      <div
        className="absolute bottom-6 font-hud text-xs"
        style={{ color: "rgba(0,229,255,0.25)" }}
      >
        © {new Date().getFullYear()}. Built with love using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: "rgba(0,229,255,0.45)", textDecoration: "underline" }}
        >
          caffeine.ai
        </a>
      </div>
    </div>
  );
}
