import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Sparkles, Heart } from "lucide-react";
import { couple, finale } from "@/content/loveStory";
import { useReveal } from "@/hooks/useReveal";
import { say, setMood, walkTo } from "@/lib/companion";
import { playCelebration } from "@/lib/storySounds";
import { Button } from "@/components/ui/button";
import { cappedParticleCount } from "@/lib/particleBudget";
import { ProposalRing } from "./ProposalRing";

/** Celebratory shower portaled to document.body: rose petals, gold stardust, and hearts */
function CelebrationShower() {
  const count = cappedParticleCount(35);
  return createPortal(
    <div className="celebration-viewport-shower" aria-hidden="true">
      {Array.from({ length: count }, (_, i) => {
        const type = i % 3; // 0: petal, 1: stardust, 2: heart
        const left = `${(i * 19 + 7) % 96}%`;
        const delay = `${-(i * 0.38)}s`;
        const duration = `${5 + (i % 4) * 1.1}s`;

        if (type === 0) {
          // Velvet rose petal
          const isDeepRose = i % 2 === 0;
          return (
            <span
              key={i}
              className="falling-rose-petal"
              style={{
                left,
                animationDelay: delay,
                animationDuration: duration,
              }}
            >
              <svg width="22" height="26" viewBox="0 0 24 28" fill="none">
                <path
                  d="M12 2C6 6 2 13 3 19C4 24 10 27 15 25C20 23 23 17 21 11C19 6 15 3 12 2Z"
                  fill={isDeepRose ? "#9e1534" : "#e11d48"}
                  stroke="#ffd7a8"
                  strokeWidth="0.75"
                  opacity={isDeepRose ? 0.95 : 0.85}
                />
              </svg>
            </span>
          );
        }

        if (type === 1) {
          // Gold stardust
          return (
            <span
              key={i}
              className="falling-stardust text-gold-soft font-serif"
              style={{
                left,
                fontSize: `${14 + (i % 3) * 6}px`,
                animationDelay: delay,
                animationDuration: duration,
                filter: "drop-shadow(0 0 6px #ffe285)",
              }}
            >
              {i % 2 === 0 ? "✦" : "✨"}
            </span>
          );
        }

        // Floating heart
        return (
          <span
            key={i}
            className="falling-rose-petal font-serif"
            style={{
              left,
              fontSize: `${16 + (i % 3) * 8}px`,
              color: i % 2 === 0 ? "#ff4d6d" : "#ffd700",
              animationDelay: delay,
              animationDuration: duration,
              filter: "drop-shadow(0 0 8px rgba(255, 77, 109, 0.7))",
            }}
          >
            ♥
          </span>
        );
      })}
    </div>,
    document.body,
  );
}

export function Finale() {
  const { ref, shown } = useReveal(0.3);
  const [chosen, setChosen] = useState(false);
  const [beat, setBeat] = useState(0);
  const [boxOpen, setBoxOpen] = useState(false);
  const [proposalAnswer, setProposalAnswer] = useState<string | null>(null);
  const [celebrating, setCelebrating] = useState(false);

  // Progressive story reveal beats
  useEffect(() => {
    if (!chosen) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers = finale.beats.map((_, i) =>
      setTimeout(() => setBeat(i + 1), reduced ? 0 : 900 * (i + 1)),
    );
    const mood = setTimeout(() => setMood("present"), 1200);
    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(mood);
    };
  }, [chosen]);

  const handleOpenBox = () => {
    setBoxOpen(true);
    playCelebration();
    setMood("heart");
    say("My whole heart is waiting for you... 💍", 5000);
  };

  const handleProposalAnswer = (answer: string) => {
    setProposalAnswer(answer);
    setCelebrating(true);
    playCelebration();
    setMood("present");
    say("Forever and always, my love! ❤️💍", 8000);
  };

  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-5 pb-28 pt-24 text-center">
      <div className="absolute inset-0 bg-halo" aria-hidden="true" />

      {/* Viewport celebratory shower portaled to document.body */}
      {celebrating && <CelebrationShower />}

      <div
        ref={ref}
        className={`finale-content relative w-full max-w-xl mx-auto reveal ${
          shown ? "reveal-in" : ""
        }`}
      >
        {/* Prelude to the Finale */}
        <p className="script text-2xl md:text-3xl text-gold-soft">{finale.question}</p>

        <div className="finale-answer-slot mt-6 min-h-[140px]" aria-live="polite">
          {!chosen && (
            <Button
              onClick={() => {
                setChosen(true);
                walkTo(0.5, "walk");
              }}
              className="btn-love finale-reveal-button"
            >
              <span className="btn-love-glow" />
              <span className="relative">Reveal my answer ❤️</span>
            </Button>
          )}

          {chosen && (
            <div className="animate-fade-in">
              <div className="answer-glow" aria-hidden="true" />
              <p className="foil-line font-display text-2xl md:text-3xl leading-snug">
                {finale.answer}
              </p>
              <div className="mt-4 space-y-1.5">
                {finale.beats.map((b, i) => (
                  <p
                    key={b}
                    className={`font-serif text-lg md:text-xl transition-all duration-700 ${
                      beat > i ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                    }`}
                    style={{ color: "#f7e5b2" }}
                  >
                    {b}
                  </p>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            GRAND FINALE: ULTRA-LUXURIOUS 3D RING BOX PROPOSAL
            ══════════════════════════════════════════════════════════════════ */}
        <div className="mt-10 mb-8 pt-8 border-t border-gold-soft/20 w-full">
          <p className="text-xs uppercase tracking-[0.35em] text-gold-soft/80 font-sans mb-6">
            The Crowning Promise
          </p>

          {/* 3D Perspective Stage for Velvet Ring Box */}
          <div className="ring-box-perspective relative mx-auto w-full max-w-[310px] sm:max-w-[340px] py-4">
            {/* Soft ambient candlelight glow underneath */}
            <div
              className="proposal-candlelight-glow absolute inset-x-6 top-8 bottom-4 rounded-[28px] pointer-events-none -z-10"
              aria-hidden="true"
            />

            {/* The Royal Crimson/Burgundy Velvet Ring Box */}
            <div
              className={`relative mx-auto w-[270px] sm:w-[300px] rounded-2xl border-2 border-gold-soft/75 bg-gradient-to-b from-[#6e0d22] via-[#430614] to-[#200208] p-4 shadow-[0_22px_55px_rgba(0,0,0,0.92)] transition-all duration-700 ${
                boxOpen ? "ring-2 ring-gold-soft/50" : "cursor-pointer"
              }`}
              onClick={() => {
                if (!boxOpen) handleOpenBox();
              }}
            >
              {/* Outer Golden Filigree Corner Florets */}
              <div
                className="pointer-events-none absolute inset-2 rounded-xl border border-gold-soft/35"
                aria-hidden="true"
              >
                <span className="absolute -top-1.5 -left-1.5 text-xs text-gold-soft">✤</span>
                <span className="absolute -top-1.5 -right-1.5 text-xs text-gold-soft">✤</span>
                <span className="absolute -bottom-1.5 -left-1.5 text-xs text-gold-soft">✤</span>
                <span className="absolute -bottom-1.5 -right-1.5 text-xs text-gold-soft">✤</span>
              </div>

              {/* Box Top / Lid with 3D Flip Hinge Effect */}
              <div
                className={`ring-box-lid absolute inset-0 z-30 rounded-2xl border-2 border-gold-soft/80 bg-gradient-to-b from-[#7a1027] via-[#52091a] to-[#2b030c] shadow-[inset_0_2px_8px_rgba(255,255,255,0.2),inset_0_-4px_14px_rgba(0,0,0,0.7)] ${
                  boxOpen ? "is-open pointer-events-none" : "hover:brightness-105"
                }`}
              >
                {/* Filigree Crest on Closed Lid */}
                <div className="flex h-full flex-col items-center justify-center p-6 text-center select-none">
                  <div className="size-14 rounded-full border border-gold-soft/60 bg-[#3a0612]/90 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.4)]">
                    <span className="font-serif text-2xl text-gold-soft">💍</span>
                  </div>
                  <p className="mt-3 font-display text-xs tracking-[0.25em] uppercase text-gold-soft font-semibold">
                    Royal Keepsake
                  </p>
                  <p className="mt-1 font-serif text-[0.8rem] italic text-warm/75">
                    For my soulmate
                  </p>
                </div>
              </div>

              {/* Box Interior: Cushioned Velvet Bed */}
              <div className="relative z-10 flex min-h-[220px] flex-col items-center justify-center rounded-xl bg-gradient-to-b from-[#1c0208] via-[#100104] to-[#25030b] p-4 shadow-[inset_0_4px_22px_rgba(0,0,0,0.98)] overflow-hidden">
                {/* Velvet cushion fold lines */}
                <div
                  className="pointer-events-none absolute inset-x-4 top-1/2 -translate-y-1/2 h-14 rounded-full bg-gradient-to-b from-[#0a0003] via-[#1e020a] to-[#0a0003] shadow-[inset_0_3px_8px_rgba(0,0,0,0.9)] opacity-90"
                  aria-hidden="true"
                />

                {/* Celestial light rays radiating behind diamond */}
                {boxOpen && (
                  <div
                    className="pointer-events-none absolute inset-0 flex items-center justify-center animate-fade-in"
                    aria-hidden="true"
                  >
                    <div className="size-48 rounded-full bg-radial from-amber-200/25 via-rose-500/10 to-transparent blur-xl animate-pulse" />
                  </div>
                )}

                {/* 3D Rotatable Solitaire Diamond Ring */}
                <ProposalRing isOpen={boxOpen} />
              </div>
            </div>

            {/* Interactive Prompt When Closed */}
            {!boxOpen && (
              <div className="mt-6 flex flex-col items-center">
                <Button
                  onClick={handleOpenBox}
                  className="btn-love px-7 py-3 text-base shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:scale-105 transition-all duration-300"
                >
                  <span className="btn-love-glow" />
                  <span className="relative flex items-center gap-2">
                    Tap to open my whole heart 💍
                  </span>
                </Button>
                <p className="mt-2 text-xs font-serif italic text-warm/65">
                  A question only you can answer
                </p>
              </div>
            )}
          </div>

          {/* ══════════════════════════════════════════════════════════════════
              EMOTIONAL COPY & REVEAL SEQUENCE (AFTER RING BOX OPENS)
              ══════════════════════════════════════════════════════════════════ */}
          {boxOpen && (
            <div className="animate-fade-in mt-8 space-y-6 max-w-lg mx-auto">
              {/* Emotional Quote in Elegant Serif Typography */}
              <blockquote className="font-serif text-lg sm:text-xl md:text-2xl italic leading-relaxed text-[#fbf0b9] px-4 py-2 drop-shadow-[0_2px_12px_rgba(0,0,0,0.85)]">
                “Every path I have walked, every quiet prayer my heart has whispered, has led me
                straight to this one undeniable truth: my life was only ever waiting for you.”
              </blockquote>

              {/* Gold-Foil Calligraphic Proposal */}
              <div className="pt-2 pb-3">
                <p className="font-display font-bold text-3xl sm:text-4xl md:text-5xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#ffd778] via-[#fff4cc] to-[#dfab35] drop-shadow-[0_0_20px_rgba(212,175,55,0.6)]">
                  Will you marry me?
                </p>
                <span className="inline-block mt-2 text-xl text-gold-soft">💍 ✨ ❤️</span>
              </div>

              {/* Proposal Responses */}
              {!proposalAnswer ? (
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Button
                    onClick={() => handleProposalAnswer("Yes, a thousand times yes! 💍✨")}
                    className="w-full sm:w-auto h-auto px-6 py-3.5 rounded-full border-2 border-gold-soft bg-gradient-to-r from-[#851229] via-[#9e1534] to-[#690d20] text-gold-soft text-base font-serif font-semibold shadow-[0_0_25px_rgba(212,175,55,0.5)] hover:scale-105 hover:brightness-110 transition-all duration-300"
                  >
                    Yes, a thousand times yes! 💍✨
                  </Button>

                  <Button
                    onClick={() => handleProposalAnswer("Forever and always yours ❤️")}
                    className="w-full sm:w-auto h-auto px-6 py-3.5 rounded-full border-2 border-gold-soft/80 bg-gradient-to-r from-[#590a1b] via-[#751025] to-[#450513] text-warm text-base font-serif font-semibold shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:scale-105 hover:brightness-110 transition-all duration-300"
                  >
                    Forever and always yours ❤️
                  </Button>
                </div>
              ) : (
                /* Warm Confirmation Message */
                <div className="animate-scale-in rounded-2xl border-2 border-gold-soft/70 bg-[#2b050f]/90 p-6 shadow-[0_0_35px_rgba(212,175,55,0.4)] text-center">
                  <div className="inline-flex size-12 items-center justify-center rounded-full bg-gold-soft/20 text-gold-soft mb-3">
                    <Heart className="size-6 fill-gold-soft" />
                  </div>
                  <h3 className="font-display text-2xl text-gold-soft font-semibold">
                    {proposalAnswer}
                  </h3>
                  <p className="mt-3 font-serif text-base sm:text-lg leading-relaxed text-[#fdf2d0]">
                    You have made me the happiest person in every lifetime. My heart, my soul, and
                    all my tomorrows belong to you. I love you beyond words.
                  </p>
                  <p className="mt-5 font-display text-xs tracking-[0.25em] uppercase text-gold-soft/80">
                    Sealed into Eternity ❤️💍
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Final Husband Sign-Off */}
        <div className="mt-12 pt-6">
          <p className="romantic name-shimmer text-2xl sm:text-3xl tracking-wide">
            {couple.husbandName}
          </p>
          <p className="mt-2 text-xs tracking-widest uppercase text-gold-soft/60 font-sans">
            Our Love Story · Forever &amp; Always
          </p>
        </div>
      </div>
    </section>
  );
}
