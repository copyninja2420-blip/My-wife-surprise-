import { lazy, Suspense, useEffect, useState } from "react";
import { Flower2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";

const HumanoidScene = lazy(() => import("./avatar/HumanoidScene"));

export function AvatarJourney({ onNext }: { onNext: () => void }) {
  const [mounted, setMounted] = useState(false);
  const [action, setAction] = useState<"idle" | "rose" | "kiss">("idle");
  const [burst, setBurst] = useState(0);
  useEffect(() => setMounted(true), []);
  const interact = () => {
    if (action === "idle") setAction("rose");
    else {
      setAction("kiss");
      setBurst((n) => n + 1);
    }
  };
  return (
    <section className="avatar-journey" aria-labelledby="avatar-title" data-avatar-action={action}>
      <header className="relative z-10 px-6 text-center">
        <p className="mb-3 font-display text-xs uppercase tracking-[0.22em] text-gold-soft/65">
          From my heart to yours
        </p>
        <h1 id="avatar-title" className="romantic text-5xl text-gold-soft">
          A Moment, Just Us
        </h1>
      </header>
      <div className="avatar-viewport self-center" aria-label="Interactive romantic 3D avatar">
        {mounted && (
          <Suspense
            fallback={
              <p className="script pt-32 text-center text-2xl text-gold-soft/60">
                A little magic is on its way…
              </p>
            }
          >
            <HumanoidScene action={action} burst={burst} onTap={interact} />
          </Suspense>
        )}
      </div>
      <div className="avatar-actions">
        <p className="script text-center text-3xl text-warm/85" aria-live="polite">
          {action === "idle"
            ? "For you, a thousand times over."
            : action === "rose"
              ? "Every petal holds a promise."
              : "A kiss, from my heart to yours."}
        </p>
        <div className="avatar-prompts">
          <Button
            variant="outline"
            onClick={() => setAction("rose")}
            className="border-gold-soft/40 bg-transparent text-gold-soft hover:bg-gold-soft/10 hover:text-gold-soft"
          >
            <Flower2 className="size-4" />A rose for you
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setAction("kiss");
              setBurst((n) => n + 1);
            }}
            className="border-gold-soft/40 bg-transparent text-gold-soft hover:bg-gold-soft/10 hover:text-gold-soft"
          >
            <Heart className="size-4" />
            Catch a kiss
          </Button>
        </div>
        <Button onClick={onNext} className="journey-gold-button w-full max-w-sm">
          Turn Page ✨
        </Button>
      </div>
    </section>
  );
}
