import { useEffect, useRef, useState } from "react";
import { useGameStore } from "../store/gameStore";

export default function MenuScreen() {
  const setPhase = useGameStore((s) => s.setPhase);
  const setChapter = useGameStore((s) => s.setChapter);
  const resetCombat = useGameStore((s) => s.resetCombat);
  const loadFromStorage = useGameStore((s) => s.loadFromStorage);
  const chapter = useGameStore((s) => s.chapter);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSave, setHasSave] = useState(false);
  const [showArmory, setShowArmory] = useState(false);

  useEffect(() => {
    const save = localStorage.getItem("aegis_save");
    if (save) {
      try {
        const data = JSON.parse(save);
        if (data.chapter > 1) setHasSave(true);
      } catch (_) {}
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = Array.from({ length: 400 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.05,
      alpha: Math.random() * 0.7 + 0.3,
      twinkle: Math.random() * Math.PI * 2,
    }));

    let animId: number;
    const draw = () => {
      ctx.fillStyle = "rgba(0, 2, 20, 0.85)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.twinkle += 0.02;
        const alpha = s.alpha * (0.6 + 0.4 * Math.sin(s.twinkle));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${alpha})`;
        ctx.fill();
        s.x -= s.speed * 0.3;
        if (s.x < -2) s.x = canvas.width + 2;
      }
      const cx = canvas.width * 0.5;
      const cy = canvas.height * 0.55;
      const grad = ctx.createRadialGradient(cx, cy, 60, cx, cy, 280);
      grad.addColorStop(0, "rgba(0, 80, 180, 0.35)");
      grad.addColorStop(0.4, "rgba(0, 150, 120, 0.15)");
      grad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(cx, cy, 280, 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();
      const earthGrad = ctx.createRadialGradient(
        cx - 40,
        cy - 40,
        20,
        cx,
        cy,
        160,
      );
      earthGrad.addColorStop(0, "#1a5fa0");
      earthGrad.addColorStop(0.3, "#1d7a4a");
      earthGrad.addColorStop(0.6, "#1558a0");
      earthGrad.addColorStop(0.85, "#0a2a6e");
      earthGrad.addColorStop(1, "#020820");
      ctx.beginPath();
      ctx.arc(cx, cy, 160, 0, Math.PI * 2);
      ctx.fillStyle = earthGrad;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(cx, cy, 168, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 180, 255, 0.25)";
      ctx.lineWidth = 14;
      ctx.stroke();
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleLaunch = () => {
    resetCombat();
    setChapter(1);
    setPhase("cinematic");
  };

  const handleContinue = () => {
    loadFromStorage();
    resetCombat();
    setPhase("cinematic");
  };

  return (
    <div
      className="relative w-screen h-screen overflow-hidden"
      style={{ background: "#000214" }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />

      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,229,255,0.015) 3px, rgba(0,229,255,0.015) 4px)",
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center h-full gap-6 px-6">
        <div
          className="text-xs font-hud tracking-[0.3em] mb-2"
          style={{ color: "#00e5ff", opacity: 0.7 }}
        >
          CLASSIFIED - ORBITAL DEFENSE NETWORK
        </div>

        <div className="text-center">
          <h1
            className="font-display font-black text-7xl sm:text-8xl md:text-9xl tracking-tighter leading-none"
            style={{
              color: "#00e5ff",
              textShadow:
                "0 0 30px #00e5ff, 0 0 60px rgba(0,229,255,0.5), 0 0 100px rgba(0,229,255,0.2)",
            }}
          >
            A.E.G.I.S
          </h1>
          <p
            className="font-hud text-xs sm:text-sm tracking-[0.2em] mt-2"
            style={{ color: "rgba(0,229,255,0.7)" }}
          >
            ADAPTIVE EARTH GLOBAL INTERCEPT SYSTEM
          </p>
        </div>

        <div
          className="flex gap-6 text-xs font-hud"
          style={{ color: "rgba(0,229,255,0.5)" }}
        >
          <span>
            SYS: <span style={{ color: "#00ff88" }}>ONLINE</span>
          </span>
          <span>
            PLATFORM: <span style={{ color: "#00ff88" }}>READY</span>
          </span>
          <span>
            THREAT LEVEL: <span style={{ color: "#ffaa00" }}>ELEVATED</span>
          </span>
        </div>

        <div className="flex flex-col gap-3 w-full max-w-sm mt-4">
          <button
            type="button"
            data-ocid="menu.primary_button"
            onClick={handleLaunch}
            className="w-full py-4 font-hud font-bold text-lg tracking-[0.15em] border-2 transition-all duration-200"
            style={{
              background: "rgba(0,229,255,0.1)",
              borderColor: "#00e5ff",
              color: "#00e5ff",
              boxShadow:
                "0 0 12px rgba(0,229,255,0.3), inset 0 0 12px rgba(0,229,255,0.05)",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(0,229,255,0.2)";
              e.currentTarget.style.boxShadow =
                "0 0 24px rgba(0,229,255,0.5), inset 0 0 16px rgba(0,229,255,0.1)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "rgba(0,229,255,0.1)";
              e.currentTarget.style.boxShadow =
                "0 0 12px rgba(0,229,255,0.3), inset 0 0 12px rgba(0,229,255,0.05)";
            }}
          >
            ⚡ LAUNCH CAMPAIGN
          </button>

          {hasSave && (
            <button
              type="button"
              data-ocid="menu.secondary_button"
              onClick={handleContinue}
              className="w-full py-3 font-hud font-bold text-base tracking-[0.15em] border transition-all duration-200"
              style={{
                background: "rgba(255,170,0,0.08)",
                borderColor: "#ffaa00",
                color: "#ffaa00",
                boxShadow: "0 0 8px rgba(255,170,0,0.2)",
              }}
            >
              ► CONTINUE CH.{chapter}
            </button>
          )}

          <button
            type="button"
            data-ocid="menu.toggle"
            onClick={() => setShowArmory(!showArmory)}
            className="w-full py-3 font-hud text-sm tracking-[0.12em] border transition-all"
            style={{
              background: "rgba(0,229,255,0.03)",
              borderColor: "rgba(0,229,255,0.3)",
              color: "rgba(0,229,255,0.6)",
            }}
          >
            ⬡ ARMORY
          </button>
        </div>

        {showArmory && (
          <div
            className="w-full max-w-sm border p-4 font-hud text-xs"
            style={{
              background: "rgba(0,10,20,0.9)",
              borderColor: "rgba(0,229,255,0.3)",
              color: "rgba(0,229,255,0.8)",
            }}
          >
            <div
              className="text-center mb-3 tracking-widest"
              style={{ color: "#00e5ff" }}
            >
              MISSILE ARSENAL
            </div>
            {[
              {
                name: "HEAT-SEEKER",
                icon: "🎯",
                desc: "Auto-tracks single target. 12 rounds.",
                color: "#00e5ff",
              },
              {
                name: "CLUSTER",
                icon: "💥",
                desc: "Splits into 3 warheads mid-flight. 8 rounds.",
                color: "#ffaa00",
              },
              {
                name: "PROX-BURST",
                icon: "⚡",
                desc: "Area detonation for clusters. 6 rounds.",
                color: "#aa44ff",
              },
              {
                name: "KINETIC",
                icon: "⬡",
                desc: "High-velocity precision strike. 10 rounds.",
                color: "#ffffff",
              },
            ].map((w) => (
              <div
                key={w.name}
                className="flex gap-3 items-start py-2 border-b"
                style={{ borderColor: "rgba(0,229,255,0.1)" }}
              >
                <span className="text-lg">{w.icon}</span>
                <div>
                  <div className="font-bold" style={{ color: w.color }}>
                    {w.name}
                  </div>
                  <div
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: "10px" }}
                  >
                    {w.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        className="absolute top-4 left-4 font-hud text-xs"
        style={{ color: "rgba(0,229,255,0.35)" }}
      >
        v2.4.1
      </div>
      <div
        className="absolute top-4 right-4 font-hud text-xs"
        style={{ color: "rgba(0,229,255,0.35)" }}
      >
        NODE: ALPHA-7
      </div>
      <div
        className="absolute bottom-6 left-0 right-0 text-center font-hud text-xs"
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
