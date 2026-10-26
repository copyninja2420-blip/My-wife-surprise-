import { useEffect, useRef, useState } from "react";
import { Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "./Atmosphere";
import { birthdayCake } from "@/content/loveStory";
import { canEnterStory, nextCakePhase, type CakePhase } from "@/lib/birthdayCake";
import cakeImage from "@/assets/birthday-cake.png";
import { playCelebration } from "@/lib/storySounds";
import { tryUnlockAudio } from "@/lib/musicUnlock";

export function BirthdayCake({ onEnter }: { onEnter: () => void }) {
  const [phase, setPhase] = useState<CakePhase>("lit");
  const [leaving, setLeaving] = useState(false);
  const [mounted, setMounted] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setMounted(true);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  const blow = () => {
    void tryUnlockAudio();
    setPhase((current) => nextCakePhase(current, "blow"));
  };
  const enter = () => {
    if (!canEnterStory(phase) || leaving) return;
    void tryUnlockAudio();
    setLeaving(true);
    onEnter();
  };

  const handleCut = () => {
    void tryUnlockAudio();
    playCelebration();
    setPhase((current) => nextCakePhase(current, "cut"));
  };

  return (
    <section
      aria-labelledby="cake-title"
      className={`birthday-welcome ${leaving ? "birthday-leaving" : ""}`}
    >
      {mounted && phase !== "cut" && <Atmosphere particles={6} hearts={2} />}

      {phase === "cut" && (
        <div className="cake-celebration" aria-hidden="true">
          {Array.from({ length: 18 }, (_, i) => (
            <span
              key={i}
              className={i % 3 === 0 ? "cake-heart" : "cake-confetti"}
              style={
                {
                  left: `${(i * 31) % 100}%`,
                  animationDelay: `${(i % 6) * 0.15}s`,
                  "--confetti-drift": `${(i % 2 ? 1 : -1) * (25 + i * 2)}px`,
                } as React.CSSProperties
              }
            >
              {i % 3 === 0 ? "♥" : ""}
            </span>
          ))}
        </div>
      )}

      <div className="cake-welcome-content">
        <header className="text-center">
          <p className="mb-2 font-display text-xs tracking-widest uppercase text-gold-soft/75">
            Chapter II · A Birthday Wish
          </p>
          <h1
            id="cake-title"
            className="romantic text-5xl leading-[1.15] text-gold-soft sm:text-6xl"
          >
            {birthdayCake.title}
          </h1>
          <p className="mx-auto mt-4 max-w-sm font-display text-lg leading-relaxed text-warm/85">
            {birthdayCake.subtitle}
          </p>
        </header>

        <div className={`birthday-cake-stage ${phase === "cut" ? "cake-is-cut" : ""}`}>
          <div className="cake-half cake-half-left">
            <img
              src={cakeImage}
              alt="Strawberry cream birthday cake with roses and gold leaf"
              width={1024}
              height={1024}
              fetchPriority="high"
              className="birthday-cake-image"
            />
          </div>

          <div className="cake-half cake-half-right" aria-hidden="true">
            <img
              src={cakeImage}
              alt=""
              width={1024}
              height={1024}
              className="birthday-cake-image"
            />
          </div>

          {/* Parting cream layer revealed between tiers when cut */}
          {phase === "cut" && <div className="cake-cream-seam" aria-hidden="true" />}

          {/* Golden ceremonial knife gliding smoothly through both tiers */}
          {phase === "cut" && (
            <div className="cake-cutting-knife" aria-hidden="true">
              <span className="golden-knife-blade" />
              <span className="golden-knife-handle" />
            </div>
          )}

          {phase !== "cut" && (
            <div
              className={`birthday-candle transition-opacity duration-300 ${
                phase === "cut" ? "opacity-0 pointer-events-none" : ""
              }`}
            >
              <span className="birthday-candle-wick" />
              <span className="birthday-candle-body" />
              {phase === "lit" ? (
                <Button
                  variant="ghost"
                  aria-label="Blow out candle flame"
                  onClick={blow}
                  className="birthday-flame-target"
                >
                  <span className="birthday-flame" />
                </Button>
              ) : (
                <>
                  {/* Rising candle smoke */}
                  <span className="birthday-smoke" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  {/* Glowing sparks */}
                  <span className="birthday-sparks" aria-hidden="true">
                    {Array.from({ length: 12 }, (_, i) => (
                      <i
                        key={i}
                        style={{ "--spark-angle": `${i * 30}deg` } as React.CSSProperties}
                      />
                    ))}
                  </span>
                </>
              )}
            </div>
          )}

          {phase === "cut" && (
            <>
              <div className="birthday-cut-mark" aria-hidden="true" />
              {/* Subtle crumb particles */}
              {Array.from({ length: 12 }, (_, i) => (
                <span
                  key={i}
                  className="cake-crumb"
                  aria-hidden="true"
                  style={
                    {
                      top: `${28 + i * 4.5}%`,
                      animationDelay: `${0.2 + i * 0.07}s`,
                      "--crumb-x": `${(i % 2 ? 1 : -1) * (8 + i * 3)}px`,
                    } as React.CSSProperties
                  }
                />
              ))}
            </>
          )}
        </div>

        <div className="birthday-cake-actions">
          <div aria-live="polite" className="cake-wish-message">
            {phase === "cut" ? (
              <p className="romantic text-3xl text-gold-soft">{birthdayCake.message}</p>
            ) : phase === "blown" ? (
              <p className="script text-2xl text-gold-soft">{birthdayCake.wish}</p>
            ) : (
              <span className="font-display text-sm italic text-warm/60">
                Close your eyes. One candle. A thousand wishes.
              </span>
            )}
          </div>

          {phase === "lit" ? (
            <Button onClick={blow} className="btn-love h-auto w-auto whitespace-normal px-7 py-4">
              {birthdayCake.blow}
            </Button>
          ) : phase === "blown" ? (
            <Button
              onClick={handleCut}
              className="btn-love h-auto w-auto whitespace-normal px-8 py-4 gap-2 text-gold-soft"
              aria-label="Cut cake with golden ceremonial knife"
            >
              <Utensils className="size-4" />
              <span>{birthdayCake.cut}</span>
            </Button>
          ) : (
            <Button
              onClick={enter}
              disabled={leaving}
              className="btn-love h-auto w-auto whitespace-normal px-8 py-4"
            >
              Turn Page ✨
            </Button>
          )}
        </div>
      </div>
    </section>
  );
}
