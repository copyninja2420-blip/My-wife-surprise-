import { useEffect } from "react";

/** Keeps the screen awake while `active` (Chapter 7 reading). No-ops where unsupported. */
export function useWakeLock(active: boolean) {
  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !("wakeLock" in navigator)) return;
    let sentinel: { release: () => Promise<void> } | null = null;
    let released = false;
    const request = () => {
      if (released || document.hidden) return;
      void (
        navigator as Navigator & {
          wakeLock: { request: (t: "screen") => Promise<{ release: () => Promise<void> }> };
        }
      ).wakeLock
        .request("screen")
        .then((s) => {
          if (released) void s.release();
          else sentinel = s;
        })
        .catch(() => {
          /* Wake lock is optional. */
        });
    };
    const onVisible = () => {
      if (!document.hidden) request();
    };
    request();
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      released = true;
      document.removeEventListener("visibilitychange", onVisible);
      if (sentinel)
        void sentinel.release().catch(() => {
          /* optional */
        });
    };
  }, [active]);
}
