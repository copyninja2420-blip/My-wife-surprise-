import { useState } from "react";
import { createPortal } from "react-dom";
import { extraSurprises } from "@/content/loveStory";
import { Typewriter } from "./Typewriter";
import { Button } from "@/components/ui/button";
import { cappedParticleCount } from "@/lib/particleBudget";

/** Three little hidden reveals that appear once the letter is opened. */
export function MoreSurprises() {
  const [open, setOpen] = useState<number[]>([]);
  const [rain, setRain] = useState(false);

  const reveal = (i: number) => {
    setOpen((o) => (o.includes(i) ? o : [...o, i]));
    if (extraSurprises[i]?.hearts) {
      setRain(true);
    }
  };

  return (
    <div className="mx-auto mt-12 grid max-w-sm gap-4">
      {rain &&
        createPortal(
          <div
            className="heart-shower fixed inset-0 w-screen h-screen pointer-events-none z-50"
            aria-hidden="true"
          >
            {Array.from({ length: cappedParticleCount(84) }, (_, i) => (
              <span
                key={i}
                style={
                  {
                    left: `${(i * 23) % 100}%`,
                    fontSize: [12, 22, 34][i % 3],
                    "--heart-wind": `${i % 2 ? 26 : -32}px`,
                    "--heart-depth-opacity": [0.45, 0.7, 0.9][i % 3],
                    animationDelay: `${-i * 0.31}s`,
                    animationDuration: `${4.5 + (i % 5) * 0.8}s`,
                  } as React.CSSProperties
                }
              >
                {i % 5 === 0 ? "✦" : "♥"}
              </span>
            ))}
          </div>,
          document.body,
        )}

      {extraSurprises.map((s, i) => (
        <div key={s.title} className="glass rounded-3xl px-5 py-5 text-center">
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-gold-soft/70">{s.kicker}</p>
          <p className="script mt-2 text-xl text-warm">{s.title}</p>

          {open.includes(i) ? (
            <p className="mt-3 whitespace-pre-line font-serif text-[0.92rem] leading-relaxed text-warm/85">
              <Typewriter text={s.text} speed={30} />
            </p>
          ) : (
            <Button
              variant="ghost"
              type="button"
              onClick={() => reveal(i)}
              className="btn-love mt-4 scale-90"
            >
              <span className="btn-love-glow" />
              <span className="relative">{s.button}</span>
            </Button>
          )}
        </div>
      ))}
    </div>
  );
}
