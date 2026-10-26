import { useEffect, useRef, useState } from "react";
import { X, Sparkles, Heart } from "lucide-react";
import { scratchMemories } from "@/content/loveStory";
import { dissolveRevealed } from "@/lib/journalSurprises";
import { playCelebration } from "@/lib/storySounds";
import { useReveal } from "@/hooks/useReveal";
import { SectionTitle } from "./SectionTitle";

const W = 400;
const H = 480;

type SparkleParticle = { id: number; x: number; y: number; size: number };

function ScratchCard({ index, onOpen }: { index: number; onOpen: () => void }) {
  const memory = scratchMemories[index]!;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);
  const checkedAt = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const [dissolving, setDissolving] = useState(false);
  const [sparks, setSparks] = useState<SparkleParticle[]>([]);
  const sparkIdCounter = useRef(0);
  const { ref, shown } = useReveal(0.15);

  // Initialize photorealistic gold foil canvas with filigree and embossed wax seal
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;

    // 1. Rich multi-stop metallic gold foil gradient
    const foil = ctx.createLinearGradient(0, 0, W, H);
    foil.addColorStop(0, "#c59e38");
    foil.addColorStop(0.2, "#fbf0b9");
    foil.addColorStop(0.4, "#d4af37");
    foil.addColorStop(0.65, "#f5df8b");
    foil.addColorStop(0.85, "#aa7d28");
    foil.addColorStop(1, "#66182c");
    ctx.fillStyle = foil;
    ctx.fillRect(0, 0, W, H);

    // 2. Subtle brushed metal cross-hatch texture
    ctx.strokeStyle = "#fff2be";
    ctx.globalAlpha = 0.14;
    ctx.lineWidth = 1;
    for (let i = -H; i < W + H; i += 7) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + H, H);
      ctx.stroke();
    }
    for (let i = -H; i < W + H; i += 11) {
      ctx.beginPath();
      ctx.moveTo(i + H, 0);
      ctx.lineTo(i, H);
      ctx.stroke();
    }

    // 3. Vintage engraved border filigree
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = "#4a0e1c";
    ctx.lineWidth = 3;
    ctx.strokeRect(14, 14, W - 28, H - 28);
    ctx.strokeStyle = "#fef2b8";
    ctx.lineWidth = 1;
    ctx.strokeRect(18, 18, W - 36, H - 36);
    ctx.strokeStyle = "#4a0e1c";
    ctx.strokeRect(22, 22, W - 44, H - 44);

    // Corner rosettes
    const drawCornerFlourish = (cx: number, cy: number) => {
      ctx.fillStyle = "#4a0e1c";
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef2b8";
      ctx.beginPath();
      ctx.arc(cx, cy, 2, 0, Math.PI * 2);
      ctx.fill();
    };
    drawCornerFlourish(22, 22);
    drawCornerFlourish(W - 22, 22);
    drawCornerFlourish(22, H - 22);
    drawCornerFlourish(W - 22, H - 22);

    // 4. Embossed wax seal in the center
    const centerX = W / 2;
    const centerY = H / 2 - 10;
    const sealRadius = 66;

    // Outer shadow / glow
    const sealGlow = ctx.createRadialGradient(
      centerX,
      centerY,
      40,
      centerX,
      centerY,
      sealRadius + 12,
    );
    sealGlow.addColorStop(0, "rgba(74, 14, 28, 0.4)");
    sealGlow.addColorStop(1, "transparent");
    ctx.fillStyle = sealGlow;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sealRadius + 12, 0, Math.PI * 2);
    ctx.fill();

    // Wax seal base with rich crimson-burgundy gradient
    const wax = ctx.createRadialGradient(
      centerX - 15,
      centerY - 15,
      10,
      centerX,
      centerY,
      sealRadius,
    );
    wax.addColorStop(0, "#991b35");
    wax.addColorStop(0.5, "#6b0f23");
    wax.addColorStop(1, "#360611");
    ctx.fillStyle = wax;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sealRadius, 0, Math.PI * 2);
    ctx.fill();

    // Gold rim on seal
    ctx.strokeStyle = "#e8c868";
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, sealRadius - 4, 0, Math.PI * 2);
    ctx.stroke();

    // Embossed text on seal
    ctx.fillStyle = "#fdf0ba";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "italic 600 17px Georgia, serif";
    ctx.shadowColor = "rgba(0, 0, 0, 0.7)";
    ctx.shadowBlur = 4;
    ctx.shadowOffsetY = 1;
    ctx.fillText("Scratch to Reveal", centerX, centerY - 14);
    ctx.font = "italic 600 16px Georgia, serif";
    ctx.fillText("Our Memory ✨", centerX, centerY + 12);
    ctx.font = "18px Georgia, serif";
    ctx.fillText("♥", centerX, centerY + 34);

    // Subtitle prompt below seal
    ctx.shadowBlur = 0;
    ctx.shadowOffsetY = 0;
    ctx.font = "500 12px sans-serif";
    ctx.letterSpacing = "2px";
    ctx.fillStyle = "#3a0914";
    ctx.fillText("RUB GENTLY WITH FINGER", centerX, H - 54);
  }, []);

  // Measure scratched pixel percentage
  const assess = () => {
    const canvas = canvasRef.current;
    if (!canvas || revealed || dissolving) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pixels = ctx.getImageData(0, 0, W, H).data;
    let cleared = 0;
    let total = 0;
    // Sample every 48th pixel for fast 60fps calculation
    for (let i = 3; i < pixels.length; i += 48) {
      total++;
      if ((pixels[i] ?? 255) < 90) cleared++;
    }
    // 50% Auto-dissolve threshold
    if (dissolveRevealed(cleared, total)) {
      setDissolving(true);
      playCelebration();
      setTimeout(() => {
        setRevealed(true);
        setSparks([]);
      }, 700);
    }
  };

  const emitSparks = (clientX: number, clientY: number, containerRect: DOMRect) => {
    const x = clientX - containerRect.left;
    const y = clientY - containerRect.top;
    const newSparks: SparkleParticle[] = Array.from({ length: 4 }, () => ({
      id: ++sparkIdCounter.current,
      x: x + (Math.random() - 0.5) * 36,
      y: y + (Math.random() - 0.5) * 36,
      size: 8 + Math.random() * 8,
    }));
    setSparks((prev) => [...prev.slice(-12), ...newSparks]);
    setTimeout(() => {
      setSparks((prev) => prev.filter((p) => !newSparks.some((ns) => ns.id === p.id)));
    }, 450);
  };

  const erase = (x: number, y: number, from = lastPoint.current) => {
    const canvas = canvasRef.current;
    if (!canvas || revealed || dissolving) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.globalCompositeOperation = "destination-out";
    ctx.lineWidth = 60;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(from?.x ?? x, from?.y ?? y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPoint.current = { x, y };

    const now = performance.now();
    if (now - checkedAt.current > 120) {
      checkedAt.current = now;
      assess();
    }
  };

  const getCanvasCoords = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return {
      x: ((e.clientX - r.left) / r.width) * W,
      y: ((e.clientY - r.top) / r.height) * H,
      rect: r,
    };
  };

  return (
    <div
      ref={ref as React.Ref<HTMLDivElement>}
      className={`scratch-memory reveal ${shown ? "reveal-in" : ""}`}
      style={{ transitionDelay: `${index * 110}ms` }}
    >
      {/* Card subtitle badge on top */}
      <div className="mb-2.5 flex items-center justify-center gap-1.5 text-center">
        <span className="scratch-memory-badge text-gold-soft font-display text-xs tracking-widest uppercase">
          Memory {memory.numeral} · Hidden Keepsake
        </span>
      </div>

      <div
        className={`scratch-memory-frame relative overflow-hidden rounded-xl border-2 border-gold-soft/50 shadow-[0_18px_45px_rgba(0,0,0,0.85)] bg-[#1a040d] transition-all duration-700 ${
          revealed
            ? "is-revealed ring-2 ring-gold-soft/60 shadow-[0_0_30px_rgba(212,175,55,0.45)] cursor-pointer"
            : ""
        }`}
        onClick={() => {
          if (revealed) onOpen();
        }}
      >
        {/* Underlying photograph with vintage polaroid backing */}
        <div className="scratch-polaroid-inner p-2.5 pb-4 bg-[#fbf6e8] text-[#2b1016]">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md bg-[#120308]">
            {memory.image ? (
              <img
                src={memory.image}
                alt="Our sacred memory"
                loading="lazy"
                className="size-full object-cover object-center"
              />
            ) : (
              <span className="grid size-full place-items-center text-xs tracking-widest text-[#3a0914]/50">
                [ Our Memory ]
              </span>
            )}
          </div>

          {/* Revealed quote text only — no subheadings, place names, dates, or card labels */}
          <div className="pt-3.5 px-2 text-center">
            <p className="script text-xl md:text-2xl leading-relaxed text-[#4a0e1c]">
              “{memory.caption}”
            </p>
          </div>
        </div>

        {/* HTML5 Scratch Canvas positioned directly over photo with touch-action: none */}
        {!revealed && (
          <canvas
            ref={canvasRef}
            width={W}
            height={H}
            className={`scratch-memory-foil absolute inset-0 size-full cursor-crosshair transition-opacity duration-700 ${
              dissolving ? "opacity-0 scale-105 pointer-events-none" : "opacity-100"
            }`}
            style={{ touchAction: "none" }}
            role="img"
            aria-label={`Gold foil covering memory ${memory.numeral}. Scratch to reveal.`}
            onPointerDown={(e) => {
              e.currentTarget.setPointerCapture(e.pointerId);
              const p = getCanvasCoords(e);
              lastPoint.current = { x: p.x, y: p.y };
              erase(p.x, p.y);
              emitSparks(e.clientX, e.clientY, p.rect);
            }}
            onPointerMove={(e) => {
              if (lastPoint.current) {
                const p = getCanvasCoords(e);
                erase(p.x, p.y);
                emitSparks(e.clientX, e.clientY, p.rect);
              }
            }}
            onPointerUp={() => {
              lastPoint.current = null;
              assess();
            }}
            onPointerCancel={() => {
              lastPoint.current = null;
              assess();
            }}
          />
        )}

        {/* Golden stardust spark particles while actively dragging */}
        {sparks.map((s) => (
          <span
            key={s.id}
            className="pointer-events-none absolute text-gold-soft animate-ping"
            style={{
              left: `${s.x}px`,
              top: `${s.y}px`,
              fontSize: `${s.size}px`,
              filter: "drop-shadow(0 0 6px #ffe285)",
            }}
            aria-hidden="true"
          >
            ✦
          </span>
        ))}

        {/* Revealed badge and celebratory sparkle overlay */}
        {revealed && (
          <>
            <span className="scratch-revealed-badge absolute top-3 right-3 rounded-full bg-burgundy-deep/90 border border-gold-soft/70 px-2.5 py-0.5 text-[0.7rem] font-sans font-semibold text-gold-soft shadow-lg animate-fade-in flex items-center gap-1">
              <Sparkles className="size-3 text-gold-soft" /> Revealed ❤️
            </span>

            <span
              className="scratch-burst pointer-events-none absolute inset-0 overflow-hidden"
              aria-hidden="true"
            >
              {Array.from({ length: 12 }, (_, i) => (
                <i
                  key={i}
                  className="absolute text-gold-soft animate-bounce"
                  style={{
                    left: `${(i * 31) % 100}%`,
                    top: `${(i * 43) % 100}%`,
                    animationDelay: `${(i % 5) * 0.15}s`,
                    fontSize: `${12 + (i % 3) * 6}px`,
                  }}
                >
                  {i % 2 === 0 ? "♥" : "✦"}
                </i>
              ))}
            </span>
          </>
        )}
      </div>

      {revealed && (
        <p
          className="mt-2 text-center font-sans text-xs text-gold-soft/70 cursor-pointer"
          onClick={onOpen}
        >
          Tap to view keepsake ✨
        </p>
      )}
    </div>
  );
}

export function ScratchGallery() {
  const [active, setActive] = useState<number | null>(null);
  const memory = active === null ? null : scratchMemories[active]!;

  return (
    <section className="relative px-5 py-20">
      <SectionTitle kicker="Chapter VII · Moments in Time" title="Scratch to Reveal Our Memories" />

      <p className="text-center font-display text-sm text-warm/75 max-w-md mx-auto -mt-6 mb-10">
        Rub the gilded foil gently with your finger to unlock the sacred memories of where our story
        began.
      </p>

      {/* 5 Scratch Cards */}
      <div className="mx-auto grid max-w-2xl grid-cols-1 gap-8 sm:grid-cols-2">
        {scratchMemories.map((m, i) => (
          <div
            key={m.numeral}
            className={i === 4 ? "sm:col-span-2 sm:max-w-sm sm:mx-auto w-full" : "w-full"}
          >
            <ScratchCard index={i} onOpen={() => setActive(i)} />
          </div>
        ))}
      </div>

      {/* Full-Screen Keepsake Modal */}
      {memory && (
        <div
          className="lightbox fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md animate-fade-in"
          role="dialog"
          aria-modal="true"
          onClick={() => setActive(null)}
        >
          <button
            type="button"
            aria-label="Close keepsake"
            className="absolute right-5 top-5 rounded-full border border-gold-soft/40 bg-burgundy-deep/80 p-2.5 text-gold-soft transition hover:scale-110"
            onClick={() => setActive(null)}
          >
            <X className="size-5" />
          </button>

          <div
            className="animate-scale-in max-w-md w-full rounded-2xl border-2 border-gold-soft/60 bg-[#fbf6e8] p-5 text-center text-[#2b1016] shadow-[0_20px_60px_rgba(0,0,0,0.9)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="overflow-hidden rounded-xl border border-gold-soft/30 bg-black aspect-[4/3] max-h-[50vh]">
              {memory.image ? (
                <img
                  src={memory.image}
                  alt="Our sacred memory"
                  className="size-full object-cover object-center"
                />
              ) : (
                <span className="grid size-full place-items-center text-xs text-warm/40">
                  [ Memory Photo ]
                </span>
              )}
            </div>

            {/* Revealed quote only — no subheadings, place names, dates, or card labels */}
            <p className="script mt-5 text-2xl leading-relaxed text-[#4a0e1c]">
              “{memory.caption}”
            </p>

            <button
              type="button"
              onClick={() => setActive(null)}
              className="mt-6 inline-flex items-center gap-1.5 rounded-full bg-[#5c1328] px-6 py-2 text-sm font-sans text-gold-soft shadow-md hover:bg-[#7a1835]"
            >
              <Heart className="size-3.5 fill-gold-soft" /> Return to Story
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
