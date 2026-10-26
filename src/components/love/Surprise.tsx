import { useEffect, useState } from "react";
import { surprise } from "@/content/loveStory";
import { useReveal } from "@/hooks/useReveal";
import { say, setMood, walkTo } from "@/lib/companion";
import { Typewriter } from "./Typewriter";

export function Surprise() {
  const { ref, shown } = useReveal(0.35);
  const [phase, setPhase] = useState<"locked" | "unlocking" | "revealed">("locked");

  useEffect(() => {
    if (phase !== "unlocking") return;
    const t = window.setTimeout(() => setPhase("revealed"), 2200);
    return () => window.clearTimeout(t);
  }, [phase]);

  const unlock = () => {
    setPhase("unlocking");
    walkTo(0.5, "walk");
    window.setTimeout(() => setMood("heart", 4000), 1100);
    say("Watch this… ✨", 3000);
  };

  return (
    <section className="relative overflow-hidden px-6 py-28">
      <div className="absolute inset-0 bg-halo" aria-hidden="true" />

      {phase === "unlocking" && (
        <div className="cinema-dim" aria-hidden="true">
          <span className="cinema-core">❤</span>
          {Array.from({ length: 24 }, (_, i) => (
            <span
              key={i}
              className="cinema-spark"
              style={{
                ["--a" as string]: `${i * 15}deg`,
                animationDelay: `${1 + (i % 6) * 0.06}s`,
              }}
            />
          ))}
        </div>
      )}

      <div
        ref={ref}
        className={`relative mx-auto max-w-sm text-center reveal ${shown ? "reveal-in" : ""}`}
      >
        <h2 className="whitespace-pre-line font-display text-[1.7rem] leading-snug tracking-[0.06em] text-warm text-glow">
          {surprise.title}
        </h2>

        {phase !== "revealed" && (
          <>
            <div className="mx-auto mt-10 grid place-items-center">
              <span className={`locked-heart ${phase === "unlocking" ? "is-unlocking" : ""}`}>
                ❤
              </span>
            </div>
            {phase === "locked" && (
              <button type="button" onClick={unlock} className="btn-love mt-10">
                <span className="btn-love-glow" />
                <span className="relative">{surprise.button}</span>
              </button>
            )}
          </>
        )}

        {phase === "revealed" && (
          <div className="glass animate-scale-in mt-10 rounded-3xl px-6 py-8">
            <p className="font-serif text-[1.02rem] leading-relaxed text-warm/85">
              <Typewriter text={surprise.reveal} speed={30} />
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
