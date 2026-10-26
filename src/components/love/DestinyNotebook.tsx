import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { calculateRomanticDestiny, type FlamesLetter } from "@/lib/flames";
import type { DestinyNames } from "./DestinyEntry";
import paper from "@/assets/destiny-paper.jpg";

const LETTERS: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];

export function DestinyNotebook({
  names,
  onReveal,
}: {
  names: DestinyNames;
  onReveal: () => void;
}) {
  const result = useMemo(
    () => calculateRomanticDestiny(names.yourName, names.partnerName),
    [names],
  );
  const [struck, setStruck] = useState(0);
  const [gone, setGone] = useState(0);
  const [counting, setCounting] = useState(false);
  const [done, setDone] = useState(false);
  const [active, setActive] = useState<FlamesLetter | null>(null);
  const [written, setWritten] = useState(0);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const schedule = (fn: () => void, time: number) =>
      timers.push(setTimeout(fn, reduced ? 0 : time));

    // Fast, zero-lag handwriting and striking sequence
    let time = 250;
    const length = result.a.length + result.b.length;
    for (let i = 0; i < length; i++) {
      schedule(() => setWritten(i + 1), time);
      time += 60;
    }
    time += 300;
    result.strikes.forEach((_, index) => {
      schedule(() => setStruck(index + 1), time);
      time += 320;
    });
    time += 450;
    schedule(() => setCounting(true), time);

    let live = [...LETTERS];
    let cursor = 0;
    result.eliminated.forEach((letter, index) => {
      const target = live.indexOf(letter);
      const steps = ((target - cursor + live.length) % live.length) + 1;
      for (let n = 0; n < steps; n++) {
        const current = live[(cursor + n) % live.length];
        schedule(() => setActive(current ?? null), time);
        time += 160;
      }
      schedule(() => {
        setGone(index + 1);
        setActive(null);
      }, time + 160);
      time += 420;
      live = live.filter((item) => item !== letter);
      cursor = target % live.length;
    });

    schedule(() => {
      setActive("M");
      setDone(true);
    }, time + 300);

    return () => timers.forEach(clearTimeout);
  }, [result]);

  const isStruck = (side: 0 | 1, index: number) =>
    result.strikes.slice(0, struck).some((pair) => pair[side] === index);

  return (
    <section className="destiny-notebook journey-screen" aria-labelledby="notebook-title">
      <img
        src={paper}
        alt=""
        aria-hidden="true"
        className="notebook-texture"
        width={1024}
        height={1536}
      />
      <div className="notebook-content relative z-10 mx-auto w-full max-w-2xl text-center px-4">
        <p className="notebook-eyebrow">Chapter V · Written in the Stars</p>
        <h1 id="notebook-title" className="mb-8 text-4xl sm:text-5xl font-display tracking-widest">
          F • L • A • M • E • S
        </h1>

        <div className="space-y-3">
          {[result.a, result.b].map((letters, side) => (
            <div
              key={side}
              className="notebook-name"
              aria-label={side === 0 ? names.yourName : names.partnerName}
            >
              {letters.map((letter, index) => {
                const visible = written > index + (side === 1 ? result.a.length : 0);
                const crossed = isStruck(side as 0 | 1, index);
                const lastStrike = result.strikes[struck - 1];
                return (
                  <span
                    key={index}
                    className={`pencil-letter handwriting-letter ${visible ? "letter-written" : ""} ${crossed ? "pencil-crossed" : ""}`}
                  >
                    {index === 0 ? letter.toUpperCase() : letter.toLowerCase()}
                    <i aria-hidden="true" />
                    {lastStrike?.[side] === index && (
                      <span className="graphite-pencil" aria-hidden="true">
                        <b />
                      </span>
                    )}
                  </span>
                );
              })}
            </div>
          ))}
        </div>

        <div className="notebook-calculation" aria-live="polite">
          <p className={counting ? "opacity-100" : "opacity-0"}>
            {result.remaining} letters remain — counting across the stars…
          </p>

          <div className={`notebook-flames ${counting ? "opacity-100" : "opacity-0"}`}>
            {LETTERS.map((letter) => {
              const isEliminated = result.eliminated.slice(0, gone).includes(letter);
              const isActive = active === letter;
              const isWinner = done && letter === "M";

              if (isWinner) {
                return (
                  <span
                    key={letter}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border-2 border-red-500 text-red-500 font-bold leading-none select-none relative"
                  >
                    {letter}
                  </span>
                );
              }

              return (
                <span
                  key={letter}
                  className={`pencil-letter relative inline-flex items-center justify-center ${isEliminated ? "pencil-crossed" : ""} ${isActive ? "pencil-active" : ""}`}
                >
                  {letter}
                  <i aria-hidden="true" />
                </span>
              );
            })}
          </div>
        </div>

        <div className="notebook-result" aria-live="polite">
          {done && (
            <div className="animate-fade-in mt-6">
              <h2 className="text-4xl sm:text-5xl font-bold text-[var(--notebook-red,#d1224a)] drop-shadow-sm">
                Marriage — Written in the Stars 💍
              </h2>
              <p className="mt-4 text-2xl font-script text-ink/80">
                Every letter led me back to you.
              </p>
              <Button
                onClick={onReveal}
                className="journey-gold-button mt-8 w-full sm:w-auto text-lg px-8 py-3"
              >
                Continue Our Story ❤️
              </Button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
