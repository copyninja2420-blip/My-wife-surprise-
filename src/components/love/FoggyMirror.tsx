import { useEffect, useRef, useState } from "react";
import { gallery } from "@/content/loveStory";
import { dissolveRevealed } from "@/lib/journalSurprises";
import { playCelebration } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

const W = 400;
const H = 480;

export function FoggyMirror() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const checked = useRef(0);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const ctx = canvas.current?.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const fog = ctx.createLinearGradient(0, 0, 0, H);
    fog.addColorStop(0, "oklch(0.92 0.02 90 / 0.97)");
    fog.addColorStop(1, "oklch(0.82 0.03 80 / 0.97)");
    ctx.fillStyle = fog;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "oklch(0.98 0.01 90 / 0.5)";
    for (let i = 0; i < 90; i++) {
      const x = (i * 67) % W;
      const y = (i * 131) % H;
      ctx.beginPath();
      ctx.arc(x, y, 2 + (i % 4), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.strokeStyle = "oklch(0.75 0.03 80 / 0.5)";
    ctx.lineWidth = 1.5;
    for (let i = 0; i < 14; i++) {
      const x = (i * 97) % W;
      ctx.beginPath();
      ctx.moveTo(x, (i * 41) % 120);
      ctx.quadraticCurveTo(x + 6, 200, x - 3, 300 + (i % 5) * 30);
      ctx.stroke();
    }
    ctx.fillStyle = "oklch(0.45 0.05 30 / 0.8)";
    ctx.textAlign = "center";
    ctx.font = "italic 26px Georgia";
    ctx.fillText("Wipe the mirror, my love...", W / 2, H / 2);
  }, []);

  const assess = () => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || revealed) return;
    const pixels = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 64) {
      total++;
      if ((pixels[i] ?? 255) < 80) cleared++;
    }
    if (dissolveRevealed(cleared, total)) {
      setRevealed(true);
      playCelebration();
    }
  };
  const wipe = (x: number, y: number, from = last.current) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || revealed) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 64;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from?.x ?? x, from?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
    const now = performance.now();
    if (now - checked.current > 160) {
      checked.current = now;
      assess();
    }
  };
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * W, y: ((e.clientY - r.top) / r.height) * H };
  };

  return (
    <section className="surprise-section mirror-section">
      <SectionTitle kicker="Through The Steam" title="Wipe the Foggy Mirror" />
      <div className={`foggy-mirror ${revealed ? "is-revealed" : ""}`}>
        <div className="mirror-photo">
          {gallery[1]?.image ? (
            <img src={gallery[1].image} alt="A candid photo of us" loading="lazy" />
          ) : (
            <span className="text-xs tracking-widest text-warm/40">[ add photo ]</span>
          )}
          <p className="script">Clearly, purely, endlessly in love with you.</p>
        </div>
        {!revealed && (
          <canvas
            ref={canvas}
            width={W}
            height={H}
            className="mirror-fog"
            role="img"
            aria-label="Foggy mirror. Rub to wipe the steam away."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = point(e);
              last.current = p;
              wipe(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (last.current) {
                const p = point(e);
                wipe(p.x, p.y);
              }
            }}
            onPointerUp={() => {
              last.current = null;
              assess();
            }}
            onPointerCancel={() => {
              last.current = null;
              assess();
            }}
          />
        )}
      </div>
    </section>
  );
}
