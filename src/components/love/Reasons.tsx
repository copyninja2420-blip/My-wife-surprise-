import { useState } from "react";
import { reasons } from "@/content/loveStory";
import { useReveal } from "@/hooks/useReveal";
import { SectionTitle } from "./SectionTitle";
import { Button } from "@/components/ui/button";

function ReasonCard({ index }: { index: number }) {
  const [flipped, setFlipped] = useState(false);
  const { ref, shown } = useReveal(0.15);

  return (
    <Button
      variant="ghost"
      ref={ref as React.Ref<HTMLButtonElement>}
      type="button"
      onClick={() => setFlipped((f) => !f)}
      className={`flip-card reason-card reveal ${shown ? "reveal-in" : ""}`}
      style={{ transitionDelay: `${(index % 6) * 70}ms` }}
      aria-pressed={flipped}
    >
      <span className={`flip-inner ${flipped ? "is-flipped" : ""}`}>
        <span className="flip-face flip-front">
          <span className="text-2xl text-rose-glow">❤</span>
          <span className="mt-1 text-[0.6rem] uppercase tracking-[0.25em] text-warm/50">
            No. {index + 1}
          </span>
        </span>
        <span className="flip-face flip-back">
          <span className="font-serif text-sm font-semibold leading-snug text-warm">
            {reasons[index]}
          </span>
        </span>
      </span>
    </Button>
  );
}

export function Reasons() {
  return (
    <section className="relative px-4 py-24 sm:px-6">
      <SectionTitle kicker={`${reasons.length} reasons`} title="Why I love you — tap each heart" />
      <div className="mx-auto mt-12 grid w-full max-w-md grid-cols-3 gap-2.5 [perspective:900px] sm:gap-3.5">
        {reasons.map((r, i) => (
          <ReasonCard key={r} index={i} />
        ))}
      </div>
    </section>
  );
}
