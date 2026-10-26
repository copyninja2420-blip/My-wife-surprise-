import { useEffect, useState } from "react";

type Pop = { id: number; x: number; y: number; emoji: string };

const EMOJIS = ["❤️", "💖", "💕", "💗", "🌹"];

/** Tapping anywhere blooms a little heart — a hidden surprise. */
export function HeartTap() {
  const [pops, setPops] = useState<Pop[]>([]);

  useEffect(() => {
    let id = 0;
    const timers = new Set<number>();
    const onTap = (e: PointerEvent) => {
      if (timers.size >= 15 || document.querySelector(".heart-shower")) return;
      const pop: Pop = {
        id: id++,
        x: e.clientX,
        y: e.clientY,
        emoji: EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? "❤️",
      };
      setPops((p) => [...p.slice(-14), pop]);
      const timer = window.setTimeout(() => {
        timers.delete(timer);
        setPops((p) => p.filter((x) => x.id !== pop.id));
      }, 1200);
      timers.add(timer);
    };
    window.addEventListener("pointerdown", onTap);
    return () => {
      window.removeEventListener("pointerdown", onTap);
      timers.forEach(clearTimeout);
    };
  }, []);

  return (
    <div className="tap-layer" aria-hidden="true">
      {pops.map((p) => (
        <span key={p.id} className="tap-heart" style={{ left: p.x, top: p.y }}>
          {p.emoji}
        </span>
      ))}
    </div>
  );
}
