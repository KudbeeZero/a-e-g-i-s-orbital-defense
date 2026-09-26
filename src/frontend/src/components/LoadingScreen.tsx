// Progressive loading screen with performance metrics
import { useEffect, useState } from "react";

export default function LoadingScreen() {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("Initializing...");

  useEffect(() => {
    // Simulate asset loading with realistic progress curve
    const interval = setInterval(() => {
      setProgress((p) => {
        const increment = Math.random() * 25;
        const next = Math.min(p + increment, 90); // Never reach 100 until ready
        // Update status based on progress
        if (next < 30) setStatus("Loading assets...");
        else if (next < 60) setStatus("Initializing 3D scene...");
        else if (next < 85) setStatus("Caching resources...");
        else setStatus("Ready!");
        return next;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="w-screen h-screen flex flex-col items-center justify-center"
      style={{ background: "#000010" }}
    >
      <div className="text-center mb-8">
        <h1
          className="font-display font-black text-5xl tracking-tighter"
          style={{
            color: "#00e5ff",
            textShadow: "0 0 20px #00e5ff",
          }}
        >
          A.E.G.I.S
        </h1>
        <p
          className="font-hud text-sm tracking-[0.15em] mt-3"
          style={{ color: "rgba(0,229,255,0.6)" }}
        >
          ORBITAL DEFENSE NETWORK
        </p>
      </div>

      {/* Progress bar */}
      <div
        className="w-64 h-1 bg-opacity-20 rounded-full overflow-hidden"
        style={{ background: "rgba(0,229,255,0.1)" }}
      >
        <div
          className="h-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: "linear-gradient(90deg, #00e5ff, #00ff88)",
            boxShadow: "0 0 10px #00e5ff",
          }}
        />
      </div>

      <p
        className="font-hud text-xs tracking-[0.1em] mt-6"
        style={{ color: "rgba(0,229,255,0.5)" }}
      >
        {status}
      </p>
      <p
        className="font-hud text-xs mt-2"
        style={{ color: "rgba(0,229,255,0.3)" }}
      >
        {Math.round(progress)}%
      </p>
    </div>
  );
}
