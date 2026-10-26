import { useEffect, useState } from "react";
import { Atmosphere } from "./Atmosphere";
import { Fireworks } from "./Fireworks";
import { Typewriter } from "./Typewriter";
import { opening } from "@/content/loveStory";

export function Opening({ onOpen }: { onOpen: () => void }) {
  const [bursting, setBursting] = useState(false);
  const [stage, setStage] = useState(0); // 0 greeting, 1 first line, 2 second line, 3 button

  useEffect(() => {
    const t1 = window.setTimeout(() => setStage(1), 900);
    return () => window.clearTimeout(t1);
  }, []);

  const handle = () => {
    setBursting(true);
    window.setTimeout(onOpen, 700);
  };

  return (
    <div className={`curtain ${bursting ? "curtain-lift" : ""}`}>
      <Atmosphere particles={18} hearts={8} />
      <Fireworks bursts={5} sparks={12} />
      <div className="relative z-10 flex min-h-[100svh] flex-col items-center justify-center px-7 pb-10 pt-24 text-center">
        <p className="script animate-fade-in text-3xl text-gold-soft/90">❦</p>

        <h1 className="romantic name-shimmer mt-4 text-4xl leading-tight">{opening.greeting}</h1>

        <p className="mt-7 min-h-[3.4rem] max-w-sm font-display text-[1.45rem] leading-snug tracking-wide text-warm">
          {stage >= 1 && (
            <Typewriter
              text={opening.whisper}
              speed={32}
              onDone={() => window.setTimeout(() => setStage(2), 900)}
            />
          )}
        </p>

        <p className="mt-5 min-h-[3rem] max-w-sm font-serif text-[0.98rem] leading-relaxed text-warm/70">
          {stage >= 2 && <Typewriter text={opening.second} speed={26} onDone={() => setStage(3)} />}
        </p>

        <div
          className={`mt-12 transition-all duration-700 ${stage >= 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-3 opacity-0"} ${bursting ? "heart-burst" : ""}`}
        >
          <button type="button" onClick={handle} className="btn-love" disabled={bursting}>
            <span className="btn-love-glow" />
            <span className="relative">{opening.button}</span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStage(3)}
          className={`mt-8 text-[0.6rem] uppercase tracking-[0.35em] text-warm/35 transition-opacity ${stage >= 3 ? "pointer-events-none opacity-0" : "opacity-100"}`}
        >
          Skip
        </button>

        <p className="mt-6 text-[0.7rem] uppercase tracking-[0.35em] text-warm/40">
          Made only for you
        </p>
      </div>
    </div>
  );
}
