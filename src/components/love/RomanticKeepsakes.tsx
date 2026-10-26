import { useEffect, useRef, useState } from "react";
import { Fingerprint, Mic, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { playCelebration } from "@/lib/storySounds";
import { useHoldScan } from "@/hooks/useHoldScan";

const stars = [
  [50, 82],
  [31, 66],
  [17, 43],
  [22, 24],
  [38, 20],
  [50, 34],
  [62, 20],
  [78, 24],
  [83, 43],
  [69, 66],
];
export function RomanticKeepsakes() {
  const { progress, holding, done, start, stop } = useHoldScan(2800, playCelebration);
  const [recording, setRecording] = useState<string | null>(null);
  const [name, setName] = useState("A moment, in your voice");
  const input = useRef<HTMLInputElement>(null);
  const url = useRef<string | null>(null);
  useEffect(
    () => () => {
      if (url.current) URL.revokeObjectURL(url.current);
    },
    [],
  );
  return (
    <section className="romantic-keepsakes mx-auto max-w-2xl px-5 py-16">
      <div className="constellation-keepsake">
        <p className="script text-3xl text-gold-soft">Constellation of Us</p>
        <div className={`constellation-sky ${done ? "is-revealed" : ""}`}>
          {done ? (
            <div className="constellation-reveal" aria-label="Connected heart constellation">
              <div className="constellation-dust" aria-hidden="true">
                {Array.from({ length: 20 }, (_, i) => (
                  <i
                    key={i}
                    style={{
                      left: `${(i * 37 + 3) % 100}%`,
                      top: `${(i * 61 + 9) % 100}%`,
                      animationDelay: `${i % 7}s`,
                    }}
                  />
                ))}
              </div>
              <svg viewBox="0 0 100 100" aria-hidden="true">
                {stars.map(([x, y], i) => {
                  const next = stars[(i + 1) % stars.length];
                  return next ? (
                    <line
                      className="constellation-auto-line"
                      pathLength="1"
                      key={i}
                      x1={x}
                      y1={y}
                      x2={next[0]}
                      y2={next[1]}
                      style={{ animationDelay: `${0.3 + i * 0.22}s` }}
                    />
                  ) : null;
                })}
              </svg>
              {stars.map(([x, y], i) => (
                <span
                  key={i}
                  className="constellation-star constellation-auto-star"
                  style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${0.25 + i * 0.22}s` }}
                  aria-hidden="true"
                >
                  ✦
                </span>
              ))}
            </div>
          ) : (
            <div className="constellation-scan">
              <div className="constellation-fingerprint-stage">
                <span className="constellation-energy-ring" />
                <span className="constellation-energy-ring ring-delayed" />
                <Button
                  variant="ghost"
                  className={`constellation-fingerprint ${holding ? "is-scanning" : ""}`}
                  aria-label="Touch and hold to connect our stars"
                  onPointerDown={(e) => {
                    e.currentTarget.setPointerCapture(e.pointerId);
                    start();
                  }}
                  onPointerUp={stop}
                  onPointerCancel={stop}
                  onLostPointerCapture={stop}
                  onBlur={stop}
                  onContextMenu={(e) => e.preventDefault()}
                  onKeyDown={(e) => {
                    if ((e.key === " " || e.key === "Enter") && !e.repeat) {
                      e.preventDefault();
                      start();
                    }
                  }}
                  onKeyUp={(e) => {
                    if (e.key === " " || e.key === "Enter") {
                      e.preventDefault();
                      stop();
                    }
                  }}
                >
                  <Fingerprint className="size-16" />
                  {holding && <span className="constellation-scan-line" />}
                  <svg className="scanner-progress" viewBox="0 0 100 100" aria-hidden="true">
                    <circle
                      cx="50"
                      cy="50"
                      r="46"
                      pathLength="100"
                      style={{ strokeDashoffset: 100 - progress }}
                    />
                  </svg>
                </Button>
              </div>
              <p className="script text-xl text-gold-soft">
                Touch &amp; hold to connect our stars...
              </p>
              <p className="constellation-percent text-xs text-gold-soft/75" aria-live="off">
                {progress}%
              </p>
            </div>
          )}
        </div>
        <p className="script text-2xl text-warm" aria-live="polite">
          {done ? "Even the stars spell us." : "Under the same sky, always."}
        </p>
      </div>
      <div className="voice-keepsake mt-12">
        <Mic className="size-6 text-gold-soft" />
        <h2 className="script text-3xl text-gold-soft">A Whisper, Just for You</h2>
        <p className="mt-2 font-serif text-sm text-warm/70">{name}</p>
        {recording && <audio controls src={recording} className="voice-player mt-5" />}
        <input
          ref={input}
          type="file"
          accept="audio/*"
          aria-label="Choose a voice moment"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (url.current) URL.revokeObjectURL(url.current);
            url.current = URL.createObjectURL(file);
            setRecording(url.current);
            setName(file.name.replace(/\.[^.]+$/, ""));
          }}
        />
        <Button
          variant="outline"
          onClick={() => input.current?.click()}
          className="mt-5 border-gold-soft/40 bg-transparent text-gold-soft hover:bg-gold-soft/10"
        >
          <Plus className="size-4" />
          {recording ? "Replace voice moment" : "Add a voice moment"}
        </Button>
      </div>
    </section>
  );
}
