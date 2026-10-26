import { useEffect, useRef, useState } from "react";
import { gallery } from "@/content/loveStory";
import { scratchRevealed } from "@/lib/journalSurprises";
import { playCelebration } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

export function ScratchNote() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const last = useRef<{ x: number; y: number } | null>(null);
  const checked = useRef(0);
  const keyboardRow = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [spark, setSpark] = useState<{ x: number; y: number } | null>(null);
  useEffect(() => {
    const el = canvas.current;
    const ctx = el?.getContext("2d", { willReadFrequently: true });
    if (!ctx || !el) return;
    const css = getComputedStyle(document.documentElement);
    const gold = css.getPropertyValue("--journal-gold").trim();
    const light = css.getPropertyValue("--foil-highlight").trim();
    const shade = css.getPropertyValue("--journal-wine").trim();
    const foil = ctx.createLinearGradient(0, 0, 400, 480);
    foil.addColorStop(0, gold);
    foil.addColorStop(0.4, light);
    foil.addColorStop(0.55, gold);
    foil.addColorStop(1, shade);
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, 400, 480);
    ctx.strokeStyle = light;
    ctx.globalAlpha = 0.18;
    for (let i = -480; i < 400; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + 480, 480);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = shade;
    ctx.textAlign = "center";
    ctx.font = "italic 30px Georgia";
    ctx.fillText("A secret, just for you", 200, 225);
    ctx.font = "20px Georgia";
    ctx.fillText("♥", 200, 265);
  }, []);
  const assess = () => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || revealed) return;
    const pixels = ctx.getImageData(0, 0, 400, 480).data;
    let cleared = 0;
    let total = 0;
    for (let i = 3; i < pixels.length; i += 64) {
      total++;
      if ((pixels[i] ?? 255) < 80) cleared++;
    }
    if (scratchRevealed(cleared, total)) {
      setRevealed(true);
      setSpark(null);
      playCelebration();
    }
  };
  const erase = (x: number, y: number, from = last.current) => {
    const ctx = canvas.current?.getContext("2d");
    if (!ctx || revealed) return;
    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 58;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from?.x ?? x, from?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();
    last.current = { x, y };
    const now = performance.now();
    if (now - checked.current > 160) {
      checked.current = now;
      setSpark({ x: x / 4, y: y / 4.8 });
      assess();
    }
  };
  const point = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * 400, y: ((e.clientY - r.top) / r.height) * 480 };
  };
  return (
    <section className="surprise-section scratch-section">
      <SectionTitle kicker="A little hidden love" title="Scratch to Reveal" />
      <div className={`scratch-keepsake ${revealed ? "is-revealed" : ""}`}>
        <div className="scratch-polaroid">
          <img src={gallery[0]?.image} alt="A treasured smile from our memories" loading="lazy" />
          <p className="script text-xl leading-relaxed text-[#5c1328] px-2 text-center mt-3">
            “In a world of billions of moving souls, my heart will only ever stop for you. You are
            the warmth in my quietest thoughts, the anchor to my dreams, and every tomorrow I could
            ever wish for.”
          </p>
        </div>
        {!revealed && (
          <canvas
            ref={canvas}
            width={400}
            height={480}
            tabIndex={0}
            role="img"
            aria-label="Gold foil secret note. Rub to uncover; keyboard Enter or Space scratches a strip."
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = point(e);
              last.current = p;
              erase(p.x, p.y);
            }}
            onPointerMove={(e) => {
              if (last.current) {
                const p = point(e);
                erase(p.x, p.y);
              }
            }}
            onPointerUp={() => {
              last.current = null;
              setSpark(null);
              assess();
            }}
            onPointerCancel={() => {
              last.current = null;
              setSpark(null);
              assess();
            }}
            onBlur={() => {
              last.current = null;
              setSpark(null);
            }}
            onKeyDown={(e) => {
              if (e.key !== "Enter" && e.key !== " ") return;
              e.preventDefault();
              const y = 25 + keyboardRow.current * 48;
              erase(400, y, { x: 0, y });
              keyboardRow.current++;
              last.current = null;
              assess();
            }}
          />
        )}
        {spark && !revealed && (
          <span
            className="scratch-sparks"
            style={{ left: `${spark.x}%`, top: `${spark.y}%` }}
            aria-hidden="true"
          >
            {Array.from({ length: 6 }, (_, i) => (
              <i key={i} style={{ "--spark-index": i } as React.CSSProperties}>
                ✦
              </i>
            ))}
          </span>
        )}
      </div>
    </section>
  );
}
