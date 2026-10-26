import { useEffect, useMemo, useState } from "react";
import { cappedParticleCount, MAX_ACTIVE_PARTICLES } from "@/lib/particleBudget";

const rand = (seed: number) => {
  const x = Math.sin(seed * 9301 + 49297) * 233280;
  return Number((x - Math.floor(x)).toFixed(4));
};

/** Fireflies / glowing particles + softly floating hearts. Pure CSS motion. */
export function Atmosphere({
  particles = 34,
  hearts = 12,
}: {
  particles?: number;
  hearts?: number;
}) {
  const [active, setActive] = useState(false);
  const [mobile, setMobile] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(max-width: 640px)");
    const updateMobile = () => setMobile(media.matches);
    const updateVisibility = () => setActive(!document.hidden);
    updateMobile();
    updateVisibility();
    media.addEventListener("change", updateMobile);
    document.addEventListener("visibilitychange", updateVisibility);
    return () => {
      media.removeEventListener("change", updateMobile);
      document.removeEventListener("visibilitychange", updateVisibility);
    };
  }, []);

  const particleCount = cappedParticleCount(mobile ? Math.min(particles, 14) : particles);
  const heartCount = Math.min(
    MAX_ACTIVE_PARTICLES - particleCount,
    cappedParticleCount(mobile ? Math.min(hearts, 5) : hearts),
  );
  const dust = useMemo(
    () =>
      Array.from({ length: particleCount }, (_, i) => ({
        left: rand(i + 1) * 100,
        top: rand(i + 21) * 100,
        size: 1.5 + rand(i + 41) * 3.5,
        dur: 6 + rand(i + 61) * 10,
        delay: rand(i + 81) * 8,
        drift: (rand(i + 101) - 0.5) * 60,
      })),
    [particleCount],
  );

  const petals = useMemo(
    () =>
      Array.from({ length: heartCount }, (_, i) => ({
        left: rand(i + 7) * 100,
        size: 10 + rand(i + 27) * 16,
        dur: 14 + rand(i + 47) * 16,
        delay: rand(i + 67) * 14,
        sway: (rand(i + 87) - 0.5) * 80,
      })),
    [heartCount],
  );

  if (!active) return null;

  return (
    <div className="atmosphere" aria-hidden="true">
      {dust.map((d, i) => (
        <span
          key={`d${i}`}
          className="firefly"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            animationDuration: `${d.dur}s`,
            animationDelay: `${d.delay}s`,
            ["--drift" as string]: `${d.drift}px`,
          }}
        />
      ))}
      {petals.map((p, i) => (
        <span
          key={`h${i}`}
          className="float-heart"
          style={{
            left: `${p.left}%`,
            fontSize: p.size,
            animationDuration: `${p.dur}s`,
            animationDelay: `${p.delay}s`,
            ["--sway" as string]: `${p.sway}px`,
          }}
        >
          ❤
        </span>
      ))}
    </div>
  );
}
