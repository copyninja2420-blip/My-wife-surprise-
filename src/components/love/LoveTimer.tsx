import { useEffect, useState } from "react";
import { romanticCountdown } from "@/lib/romanticCountdown";

/** Gold plaque counting down to our official romantic date. */
export function LoveTimer() {
  const [now, setNow] = useState<number | null>(null);
  useEffect(() => {
    setNow(Date.now());
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);
  const remaining = now === null ? [0, 0, 0, 0] : romanticCountdown(now);
  const parts = [
    [remaining[0], "Days"],
    [remaining[1], "Hours"],
    [remaining[2], "Minutes"],
    [remaining[3], "Seconds"],
  ] as const;
  return (
    <div className="love-timer-plaque mx-auto mb-14 mt-6 max-w-lg px-5 py-8 text-center">
      <p className="script text-2xl text-gold-soft">Counting down to our forever...</p>
      <p className="mt-2 text-xs text-gold-soft/75">Sealed until our sacred day...</p>
      <div className="flip-clock mt-6" aria-live="off">
        {parts.map(([v, l], i) => (
          <div key={l} className="flip-clock-unit">
            <div className="flip-clock-face">
              <strong key={v} className="flip-clock-number">
                {now === null ? "—" : String(v).padStart(2, "0")}
              </strong>
              <i />
            </div>
            <span>{l}</span>
            {i < 3 && (
              <b className="flip-clock-colon" aria-hidden="true">
                :
              </b>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
