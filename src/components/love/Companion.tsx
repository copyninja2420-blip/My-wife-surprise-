import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { say, setMood, setPointer, tapCompanion, useCompanion } from "@/lib/companion";

const CompanionScene = lazy(() => import("./companion/CompanionScene"));

function webglOk() {
  try {
    const c = document.createElement("canvas");
    return !!(c.getContext("webgl2") || c.getContext("webgl"));
  } catch {
    return false;
  }
}

export function Companion() {
  const { x, message } = useCompanion();
  const [enabled, setEnabled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [nearby, setNearby] = useState(false);
  const slotRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!webglOk()) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = window.setTimeout(() => setEnabled(true), 400);
    return () => window.clearTimeout(id);
  }, []);

  /* look at the cursor / touch */
  useEffect(() => {
    const move = (e: PointerEvent) =>
      setPointer(e.clientX / window.innerWidth, e.clientY / window.innerHeight);
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const slot = slotRef.current;
    if (!slot) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        const visible = Boolean(entry?.isIntersecting) && !document.hidden;
        setNearby(visible);
        if (visible) {
          setMood("heart");
          say("Happy Birthday, My Love ❤️", 4200);
        }
      },
      { rootMargin: "240px 0px", threshold: 0.01 },
    );
    io.observe(slot);
    const onVisibility = () =>
      setNearby(!document.hidden && slot.getBoundingClientRect().top < window.innerHeight + 240);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [enabled]);

  if (!enabled || hidden) return null;

  return (
    <aside
      ref={slotRef}
      className="relative z-10 mx-auto mt-2 w-full max-w-2xl select-none overflow-hidden px-4 pb-10"
      aria-label="Your romantic companion"
    >
      <div className="relative min-h-[24rem] overflow-hidden rounded-2xl border border-gold-soft/15 bg-burgundy-deep/25">
        {message && (
          <div
            className="pointer-events-none absolute top-5 z-30 -translate-x-1/2 transition-[left] duration-700 ease-out"
            style={{ left: `${Math.min(88, Math.max(12, x * 100))}%` }}
          >
            <div className="glass max-w-[13rem] rounded-xl px-4 py-2 text-center font-serif text-[0.78rem] leading-snug text-warm shadow-lg animate-rise">
              {message}
            </div>
          </div>
        )}

        <div className="relative h-[24rem] w-full">
          <Suspense fallback={null}>
            <CompanionScene active={nearby} />
          </Suspense>

          {/* tap target that follows him */}
          <button
            type="button"
            aria-label="Say hello to him"
            onClick={tapCompanion}
            className="pointer-events-auto absolute bottom-2 size-24 -translate-x-1/2 rounded-full transition-[left] duration-700 ease-out focus-visible:outline-2 focus-visible:outline-gold-soft"
            style={{ left: `${Math.min(94, Math.max(6, x * 100))}%` }}
          />
        </div>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          aria-label="Hide companion"
          onClick={() => setHidden(true)}
          className="pointer-events-auto absolute right-3 top-3 z-40 size-8 rounded-full border border-gold-soft/25 bg-burgundy-deep/90 text-warm/70 hover:bg-burgundy hover:text-warm"
        >
          <X className="size-3.5" />
        </Button>
      </div>
      <p className="mt-4 text-center font-serif text-xs tracking-[0.12em] text-warm/55">
        Here with you, all the way to forever.
      </p>
    </aside>
  );
}
