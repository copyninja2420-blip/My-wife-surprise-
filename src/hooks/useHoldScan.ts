import { useCallback, useEffect, useRef, useState } from "react";

export function useHoldScan(duration: number, onComplete: () => void) {
  const [progress, setProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [done, setDone] = useState(false);
  const frame = useRef<number | null>(null);
  const completed = useRef(false);
  const callback = useRef(onComplete);
  callback.current = onComplete;
  const stop = useCallback(() => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    frame.current = null;
    setHolding(false);
    if (!completed.current) setProgress(0);
  }, []);
  useEffect(() => {
    const cancelHidden = () => {
      if (document.hidden) stop();
    };
    document.addEventListener("visibilitychange", cancelHidden);
    return () => {
      document.removeEventListener("visibilitychange", cancelHidden);
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [stop]);
  const start = () => {
    if (completed.current || frame.current !== null) return;
    setHolding(true);
    const began = performance.now();
    let pulse = 0;
    let shown = -1;
    const tick = (now: number) => {
      const percent = Math.min(100, Math.floor(((now - began) / duration) * 100));
      if (percent !== shown) {
        shown = percent;
        setProgress(percent);
      }
      if (now - pulse > 420) {
        pulse = now;
        navigator.vibrate?.(20);
      }
      if (percent === 100) {
        frame.current = null;
        completed.current = true;
        setDone(true);
        setHolding(false);
        callback.current();
        return;
      }
      frame.current = requestAnimationFrame(tick);
    };
    frame.current = requestAnimationFrame(tick);
  };
  return { progress, holding, done, start, stop };
}
