import { useState } from "react";
import { Button } from "@/components/ui/button";

/** Standalone transitional page between the destiny reveal and the memory archive. */
export function Prologue({ onEnter }: { onEnter: () => void }) {
  const [leaving, setLeaving] = useState(false);
  return (
    <section className="prologue-stage" aria-labelledby="prologue-title">
      <div className="prologue-bokeh" aria-hidden="true">
        {Array.from({ length: 18 }, (_, i) => (
          <span
            key={i}
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
              width: 10 + (i % 5) * 9,
              height: 10 + (i % 5) * 9,
              animationDelay: `${(i % 6) * 0.7}s`,
            }}
          />
        ))}
      </div>
      <div className="relative z-10 isolate flex min-h-[100svh] flex-col items-center justify-center px-7 py-24 text-center">
        <div className="prologue-burst" aria-hidden="true" />
        <p className="prologue-ornament" aria-hidden="true">
          ❦
        </p>
        <h1
          id="prologue-title"
          className="romantic text-5xl leading-tight text-gold-soft sm:text-6xl"
        >
          Hey, My Love... 🤍
        </h1>
        <p className="mt-6 font-display text-xl text-warm">I made something special for you.</p>
        <p className="mt-4 max-w-xs font-serif text-base leading-relaxed text-warm/75">
          Because you deserve more than just a birthday wish.
        </p>
        <Button
          type="button"
          disabled={leaving}
          onClick={() => {
            setLeaving(true);
            onEnter();
          }}
          className="prologue-btn mt-12"
        >
          ENTER OUR STORY ❤️
        </Button>
        <p className="mt-14 text-[0.7rem] uppercase tracking-[0.4em] text-warm/45">
          Made only for you
        </p>
      </div>
    </section>
  );
}
