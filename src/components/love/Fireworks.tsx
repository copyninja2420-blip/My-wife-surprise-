import { useMemo } from "react";

const rnd = (seed: number) => {
  const x = Math.sin(seed * 3571 + 1013) * 43758.5453;
  return x - Math.floor(x);
};

const HUES = ["#ffd79a", "#ff8fb1", "#ff5f8f", "#ffe7c2", "#ff9ce0", "#c8a2ff"];

/** Pure-CSS fireworks: rocket trail → flash → radial spark burst.
 *  Only transform/opacity animate, so it stays smooth on mobile. */
export function Fireworks({ bursts = 5, sparks = 12 }: { bursts?: number; sparks?: number }) {
  const shows = useMemo(
    () =>
      Array.from({ length: bursts }, (_, b) => {
        const top = 10 + rnd(b + 31) * 40;
        return {
          left: 10 + rnd(b + 3) * 80,
          top,
          rise: 100 - top,
          delay: rnd(b + 61) * 4.5,
          dur: 2.6 + rnd(b + 91) * 1.6,
          color: HUES[b % HUES.length],
          sparks: Array.from({ length: sparks }, (_, s) => {
            const angle = (s / sparks) * Math.PI * 2 + rnd(b * 31 + s) * 0.35;
            const dist = 46 + rnd(b * 17 + s + 5) * 62;
            return { tx: Math.cos(angle) * dist, ty: Math.sin(angle) * dist };
          }),
        };
      }),
    [bursts, sparks],
  );

  return (
    <div className="fireworks" aria-hidden="true">
      {shows.map((f, i) => {
        const timing = {
          animationDelay: `${f.delay}s`,
          animationDuration: `${f.dur}s`,
        } as const;
        return (
          <span key={i} className="firework" style={{ left: `${f.left}%`, top: `${f.top}%` }}>
            <span
              className="rocket"
              style={{
                ...timing,
                background: `linear-gradient(to top, transparent, ${f.color})`,
                boxShadow: `0 0 8px 1px ${f.color}`,
                ["--rise" as string]: `${f.rise}vh`,
              }}
            />
            <span
              className="flash"
              style={{
                ...timing,
                background: `radial-gradient(circle, #fff 0%, ${f.color} 45%, transparent 70%)`,
              }}
            />
            {f.sparks.map((s, j) => (
              <span
                key={j}
                className="spark"
                style={{
                  ...timing,
                  background: f.color,
                  boxShadow: `0 0 10px 2px ${f.color}`,
                  ["--tx" as string]: `${s.tx}px`,
                  ["--ty" as string]: `${s.ty}px`,
                }}
              />
            ))}
          </span>
        );
      })}
    </div>
  );
}
