import { useEffect, useRef } from "react";
import { useGameStore } from "../store/gameStore";

export default function RadarDisplay() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const threats = useGameStore((s) => s.threats);

  useEffect(() => {
    let animId: number;
    const loop = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      const W = canvas.width;
      const H = canvas.height;
      const cx = W / 2;
      const cy = H / 2;
      const r = W / 2 - 4;

      ctx.clearRect(0, 0, W, H);
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      bg.addColorStop(0, "#001a0a");
      bg.addColorStop(1, "#000a04");
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = bg;
      ctx.fill();

      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        ctx.arc(cx, cy, (r * i) / 3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(0,255,100,0.2)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(0,255,100,0.15)";
      ctx.lineWidth = 0.5;
      const lines: [number, number, number, number][] = [
        [cx, cy - r, cx, cy + r],
        [cx - r, cy, cx + r, cy],
      ];
      for (const [x1, y1, x2, y2] of lines) {
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      const angle = (Date.now() / 1500) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      const sweep = ctx.createLinearGradient(0, 0, r, 0);
      sweep.addColorStop(0, "rgba(0,255,100,0.5)");
      sweep.addColorStop(1, "rgba(0,255,100,0)");
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(r, 0);
      ctx.strokeStyle = sweep;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();

      for (const t of threats) {
        const scale = r / 8;
        const px = cx + t.position[0] * scale;
        const py = cy - t.position[1] * scale;
        const dist = Math.sqrt((px - cx) ** 2 + (py - cy) ** 2);
        if (dist < r - 3) {
          ctx.beginPath();
          ctx.arc(px, py, 2.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ff3333";
          ctx.shadowBlur = 5;
          ctx.shadowColor = "#ff3333";
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = "#00e5ff";
      ctx.shadowBlur = 6;
      ctx.shadowColor = "#00e5ff";
      ctx.fill();
      ctx.shadowBlur = 0;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0,255,100,0.4)";
      ctx.lineWidth = 1;
      ctx.stroke();

      animId = requestAnimationFrame(loop);
    };
    loop();
    return () => cancelAnimationFrame(animId);
  }, [threats]);

  return (
    <div
      className="flex flex-col items-center"
      style={{
        background: "rgba(0,5,0,0.7)",
        border: "1px solid rgba(0,255,100,0.3)",
        padding: "4px",
      }}
    >
      <canvas ref={canvasRef} width={110} height={110} className="block" />
      <div
        className="font-hud text-xs mt-1 tracking-widest"
        style={{ color: "rgba(0,255,100,0.7)", fontSize: "9px" }}
      >
        E-RADAR
      </div>
    </div>
  );
}
