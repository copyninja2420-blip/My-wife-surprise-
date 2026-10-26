import { useEffect, useMemo, useRef, useState } from "react";
import { Heart, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  birthdayWish,
  handHold,
  openWhenLetters,
  proposalMilestone,
  starMap,
} from "@/content/loveStory";
import { SectionTitle } from "./SectionTitle";

type Elapsed = { days: number; hours: number; minutes: number; seconds: number };

function elapsedSince(date: string): Elapsed {
  const difference = Math.max(0, Date.now() - new Date(date).getTime());
  const totalSeconds = Math.floor(difference / 1000);
  return {
    days: Math.floor(totalSeconds / 86400),
    hours: Math.floor((totalSeconds % 86400) / 3600),
    minutes: Math.floor((totalSeconds % 3600) / 60),
    seconds: totalSeconds % 60,
  };
}

function ProposalCounter() {
  const [elapsed, setElapsed] = useState<Elapsed>(() => elapsedSince(proposalMilestone.date));

  useEffect(() => {
    const update = () => setElapsed(elapsedSince(proposalMilestone.date));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const values = [
    [elapsed.days, "Days"],
    [elapsed.hours, "Hours"],
    [elapsed.minutes, "Minutes"],
    [elapsed.seconds, "Seconds"],
  ] as const;

  return (
    <div className="romantic-panel px-4 py-7 text-center sm:px-7">
      <p className="script text-xl text-gold-soft">{proposalMilestone.title}</p>
      <p className="mt-2 font-serif text-sm text-warm/70">{proposalMilestone.subtitle}</p>
      <div className="mt-6 grid grid-cols-4 gap-2" aria-live="off">
        {values.map(([value, label]) => (
          <div key={label} className="milestone-counter py-3">
            <strong className="block font-display text-[clamp(1.25rem,6vw,2rem)] leading-none text-warm">
              {String(value).padStart(2, "0")}
            </strong>
            <span className="mt-2 block text-[0.55rem] uppercase tracking-[0.1em] text-gold-soft/75">
              {label}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-6 font-serif text-sm italic text-warm/80">{proposalMilestone.caption}</p>
    </div>
  );
}

function CandleWish() {
  const [blown, setBlown] = useState(false);

  return (
    <div className="romantic-panel relative min-h-80 overflow-hidden px-5 py-8 text-center">
      <p className="script text-2xl text-gold-soft">{birthdayWish.title}</p>
      <Button
        type="button"
        variant="ghost"
        aria-label={blown ? "Birthday candle extinguished" : "Blow out the birthday candle"}
        aria-pressed={blown}
        onClick={() => setBlown(true)}
        className="group mx-auto mt-8 h-36 w-24 touch-manipulation flex-col gap-0 bg-transparent hover:bg-transparent"
      >
        <span className={`candle-flame ${blown ? "is-out" : ""}`} />
        <span className="candle-wick" />
        <span className="candle-body" />
      </Button>
      {!blown ? (
        <p className="mt-3 text-xs uppercase tracking-[0.18em] text-warm/55">Tap the flame</p>
      ) : (
        <div className="animate-rise mt-4">
          <div className="celebration-burst" aria-hidden="true">
            {Array.from({ length: 12 }, (_, i) => (
              <i key={i} style={{ ["--i" as string]: i }} />
            ))}
          </div>
          <p className="font-serif text-base leading-relaxed text-warm">{birthdayWish.revealed}</p>
        </div>
      )}
    </div>
  );
}

function HoldMyHand() {
  const [progress, setProgress] = useState(0);
  const [complete, setComplete] = useState(false);
  const frame = useRef<number | null>(null);
  const started = useRef(0);
  const duration = 2700;

  const stop = () => {
    if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    frame.current = null;
    if (!complete) setProgress(0);
  };

  const begin = () => {
    if (complete) return;
    started.current = performance.now();
    const tick = (now: number) => {
      const next = Math.min(1, (now - started.current) / duration);
      setProgress(next);
      if (next >= 1) {
        frame.current = null;
        setComplete(true);
        navigator.vibrate?.([60, 40, 90]);
        return;
      }
      frame.current = window.requestAnimationFrame(tick);
    };
    frame.current = window.requestAnimationFrame(tick);
  };

  useEffect(
    () => () => {
      if (frame.current !== null) window.cancelAnimationFrame(frame.current);
    },
    [],
  );

  const circumference = 2 * Math.PI * 46;

  return (
    <div className="romantic-panel min-h-80 px-5 py-8 text-center">
      <p className="script text-2xl text-gold-soft">{handHold.title}</p>
      <p className="mt-2 font-serif text-sm text-warm/65">{handHold.instruction}</p>
      <Button
        type="button"
        variant="ghost"
        onPointerDown={begin}
        onPointerUp={stop}
        onPointerCancel={stop}
        onPointerLeave={stop}
        className="relative mx-auto mt-7 size-32 touch-none select-none rounded-full bg-burgundy-deep/70 p-0 text-rose-glow hover:bg-burgundy-deep"
        aria-label="Press and hold my hand"
      >
        <svg
          className="absolute inset-0 size-full -rotate-90"
          viewBox="0 0 104 104"
          aria-hidden="true"
        >
          <circle
            cx="52"
            cy="52"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.16"
            strokeWidth="3"
          />
          <circle
            cx="52"
            cy="52"
            r="46"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - progress)}
          />
        </svg>
        <Heart className={`size-9 ${complete ? "fill-current" : "heart-beat"}`} />
      </Button>
      {complete && (
        <p className="animate-rise mt-5 font-serif text-base leading-relaxed text-warm">
          {handHold.revealed}
        </p>
      )}
    </div>
  );
}

function OpenWhenLetters() {
  return (
    <div className="mt-6 grid gap-3 sm:grid-cols-3">
      {openWhenLetters.map((letter) => (
        <Dialog key={letter.title}>
          <DialogTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              className="romantic-panel h-auto min-h-32 w-full flex-col whitespace-normal px-4 py-5 text-center text-warm hover:text-warm"
            >
              <Mail className="size-7 text-rose-glow" />
              <span className="font-serif text-sm leading-snug">{letter.title}</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="letter-dialog top-[calc(50%+2rem)] w-[calc(100%-2rem)] max-w-md border-0 px-6 pb-8 pt-20 text-ink">
            <DialogHeader>
              <DialogTitle className="script text-3xl font-normal leading-snug text-signature-ink">
                {letter.title}
              </DialogTitle>
              <DialogDescription className="mt-4 whitespace-pre-line font-serif text-base leading-relaxed text-ink/80">
                {letter.message}
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}

function StarMap() {
  const stars = useMemo(
    () =>
      Array.from({ length: 30 }, (_, i) => ({
        left: `${(i * 37 + 11) % 96}%`,
        top: `${(i * 53 + 7) % 94}%`,
        size: 1 + (i % 3),
        delay: `${(i % 7) * 0.35}s`,
      })),
    [],
  );

  return (
    <div className="star-map mx-auto mt-10 aspect-square w-full max-w-sm overflow-hidden rounded-full border border-gold-soft/20 text-center">
      {stars.map((star, i) => (
        <i
          key={i}
          style={{
            left: star.left,
            top: star.top,
            width: star.size,
            height: star.size,
            animationDelay: star.delay,
          }}
        />
      ))}
      <div className="constellation-lines" aria-hidden="true" />
      <div className="relative z-10 flex size-full flex-col items-center justify-center px-10">
        <p className="script text-3xl text-gold-soft">{starMap.title}</p>
        <p className="mt-5 font-serif text-base leading-relaxed text-warm/85">{starMap.quote}</p>
      </div>
    </div>
  );
}

export function RomanticMilestones() {
  return (
    <section className="relative px-4 py-24 sm:px-6">
      <SectionTitle kicker="Still choosing you" title="Every second, every wish, every star" />
      <div className="mx-auto mt-12 max-w-3xl space-y-6">
        <ProposalCounter />
        <div className="grid gap-6 sm:grid-cols-2">
          <CandleWish />
          <HoldMyHand />
        </div>
        <div className="pt-7 text-center">
          <p className="script text-2xl text-gold-soft">Open When…</p>
          <OpenWhenLetters />
        </div>
        <StarMap />
      </div>
    </section>
  );
}
