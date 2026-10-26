import { useEffect, useRef, useState } from "react";
import { calculateFlames, DESTINY, type FlamesResult } from "@/lib/flames";

const FLAMES = ["F", "L", "A", "M", "E", "S"] as const;
const pencil = { fontFamily: "'Caveat', cursive", color: "#3b3b3f" };

export function NotebookFlames() {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [res, setRes] = useState<FlamesResult | null>(null);
  const [struck, setStruck] = useState(0);
  const [gone, setGone] = useState(0);
  const [done, setDone] = useState(false);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const run = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    const r = calculateFlames(a, b);
    if (!r.a.length || !r.b.length) return;
    setRes(r);
    setStruck(0);
    setGone(0);
    setDone(false);
    let t = 400;
    r.strikes.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setStruck(i + 1), t));
      t += 550;
    });
    t += 600;
    r.eliminated.forEach((_, i) => {
      timers.current.push(window.setTimeout(() => setGone(i + 1), t));
      t += 900;
    });
    timers.current.push(window.setTimeout(() => setDone(true), t + 200));
  };

  const isStruck = (side: 0 | 1, idx: number) =>
    !!res && res.strikes.slice(0, struck).some((p) => p[side] === idx);
  const removed = res ? res.eliminated.slice(0, gone) : [];
  const counting = res && struck >= res.strikes.length;

  const Name = ({ letters, side }: { letters: string[]; side: 0 | 1 }) => (
    <div className="flex flex-wrap justify-center gap-1 text-4xl md:text-5xl">
      {letters.map((ch, i) => (
        <span key={i} className="relative inline-block px-0.5">
          {ch}
          <span
            className="absolute left-[-10%] top-1/2 h-[3px] -rotate-12 rounded bg-[#2b2b30] transition-all duration-500"
            style={{ width: isStruck(side, i) ? "120%" : "0%" }}
          />
        </span>
      ))}
    </div>
  );

  return (
    <section className="px-4 py-20">
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&display=swap"
        precedence="default"
      />
      <div
        className="relative mx-auto max-w-xl rounded-md px-8 pb-12 pt-10 shadow-[0_20px_60px_rgba(0,0,0,0.5)] md:pl-20"
        style={{
          ...pencil,
          backgroundColor: "#f4ecd6",
          backgroundImage:
            "linear-gradient(90deg, transparent 52px, rgba(200,60,60,0.45) 52px, rgba(200,60,60,0.45) 54px, transparent 54px), repeating-linear-gradient(180deg, transparent 0 31px, rgba(80,120,190,0.35) 31px 32px), radial-gradient(circle at 30% 20%, rgba(255,255,255,0.4), transparent 60%)",
        }}
      >
        <h2 className="mb-1 text-center text-5xl font-bold">F · L · A · M · E · S</h2>
        <p className="mb-8 text-center text-2xl opacity-70">the notebook never lies…</p>

        <div className="grid gap-5">
          {[
            [a, setA, "Your name"],
            [b, setB, "My name"],
          ].map(([v, set, ph], i) => (
            <input
              key={i}
              value={v as string}
              onChange={(e) => (set as (s: string) => void)(e.target.value)}
              placeholder={ph as string}
              maxLength={24}
              className="w-full rounded-lg border-2 border-[#e8b4c0] bg-white/50 px-4 py-2 text-3xl outline-none transition focus:border-[#e0567a] focus:shadow-[0_0_22px_rgba(224,86,122,0.55)]"
              style={{ ...pencil, boxShadow: "0 0 14px rgba(224,86,122,0.3)" }}
            />
          ))}
          <button
            type="button"
            onClick={run}
            className="mx-auto mt-2 rounded-full bg-[#5a0f22] px-8 py-2 text-3xl text-[#f6e2b3] shadow-[0_0_20px_rgba(212,175,106,0.45)] transition hover:scale-105"
            style={{ fontFamily: pencil.fontFamily }}
          >
            Calculate Destiny ✎
          </button>
        </div>

        {res && (
          <div className="mt-10 space-y-6 text-center">
            <Name letters={res.a} side={0} />
            <Name letters={res.b} side={1} />
            {counting && (
              <p className="animate-fade-in text-3xl">
                {res.remaining} letters left — count {res.remaining} around…
              </p>
            )}
            {counting && (
              <div className="flex justify-center gap-4 text-6xl font-bold">
                {FLAMES.map((L) => {
                  const out = removed.includes(L);
                  const win = done && L === res.destiny;
                  return (
                    <span key={L} className="relative inline-block w-12">
                      <span style={{ opacity: out ? 0.35 : 1 }}>{L}</span>
                      {out && (
                        <span className="absolute left-0 top-1/2 h-[3px] w-full rotate-[-20deg] bg-[#2b2b30]" />
                      )}
                      {win && (
                        <svg
                          className="pointer-events-none absolute -inset-3"
                          viewBox="0 0 100 100"
                        >
                          <ellipse
                            cx="50"
                            cy="52"
                            rx="44"
                            ry="40"
                            fill="none"
                            stroke="#d1224a"
                            strokeWidth="4"
                            pathLength={1}
                            strokeDasharray="1"
                            className="flames-circle"
                          />
                        </svg>
                      )}
                    </span>
                  );
                })}
              </div>
            )}
            {done && (
              <div className="animate-fade-in">
                <p className="text-5xl font-bold text-[#b0173e]">{DESTINY[res.destiny].word}!</p>
                <p className="mx-auto mt-3 max-w-sm text-2xl leading-snug">
                  {DESTINY[res.destiny].message}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
      <style>{`.flames-circle{stroke-dashoffset:1;animation:flamesDraw 1.1s ease-out forwards}@keyframes flamesDraw{to{stroke-dashoffset:0}}`}</style>
    </section>
  );
}
