import { useEffect, useRef, useState } from "react";
import { Fingerprint } from "lucide-react";
import { playCelebration } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

const DURATION = 2600;

export function TwoHearts() {
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const left = useRef(false);
  const right = useRef(false);
  const frame = useRef<number | null>(null);
  const began = useRef(0);
  const shown = useRef(-1);

  const stop = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    if (!done) setProgress(0);
  };
  const maybeStart = () => {
    if (done || frame.current !== null || !left.current || !right.current) return;
    began.current = performance.now();
    shown.current = -1;
    let pulse = 0;
    const tick = (now: number) => {
      if (!left.current || !right.current) {
        stop();
        return;
      }
      const percent = Math.min(100, Math.floor(((now - began.current) / DURATION) * 100));
      if (percent !== shown.current) {
        shown.current = percent;
        setProgress(percent);
      }
      if (now - pulse > 420) {
        pulse = now;
        navigator.vibrate?.(20);
      }
      if (percent === 100) {
        frame.current = null;
        setDone(true);
        playCelebration();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  useEffect(
    () => () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    },
    [],
  );

  const pad = (side: "left" | "right") => ({
    onPointerDown: (e: React.PointerEvent<HTMLButtonElement>) => {
      e.currentTarget.setPointerCapture(e.pointerId);
      (side === "left" ? left : right).current = true;
      maybeStart();
    },
    onPointerUp: () => {
      (side === "left" ? left : right).current = false;
      stop();
    },
    onPointerCancel: () => {
      (side === "left" ? left : right).current = false;
      stop();
    },
    onLostPointerCapture: () => {
      (side === "left" ? left : right).current = false;
      stop();
    },
    onContextMenu: (e: React.MouseEvent) => e.preventDefault(),
  });

  const holding = left.current && right.current;
  return (
    <section className="surprise-section two-hearts-section">
      <SectionTitle kicker="Two Hearts, One Touch" title="Hold Both Hands With Me" />
      <div className={`two-hearts ${done ? "is-done" : ""}`}>
        <button type="button" className="heart-pad" aria-label="Hold left hand" {...pad("left")}>
          <Fingerprint className="size-12" />
        </button>
        <svg className="infinity-link" viewBox="0 0 200 100" aria-hidden="true">
          <path
            className="infinity-path"
            pathLength="100"
            d="M100 50 C100 20 60 20 50 50 C60 80 100 80 100 50 C100 20 140 20 150 50 C140 80 100 80 100 50 Z"
            style={{ strokeDashoffset: 100 - progress }}
          />
        </svg>
        <button type="button" className="heart-pad" aria-label="Hold right hand" {...pad("right")}>
          <Fingerprint className="size-12" />
        </button>
      </div>
      <p className="script mt-6 text-center text-xl text-gold-soft" aria-live="polite">
        {done
          ? "Even through a screen, my hands will always search for yours. ❤️"
          : holding
            ? "Our hearts are finding each other..."
            : "Place a finger on each pad and hold..."}
      </p>
    </section>
  );
}
