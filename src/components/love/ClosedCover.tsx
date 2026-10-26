import { useEffect, useRef, useState } from "react";
import { journal } from "@/content/loveStory";
import { Button } from "@/components/ui/button";
import { playPageTurn } from "@/lib/storySounds";
import { getGlobalAudio, tryUnlockAudio } from "@/lib/musicUnlock";
import leather from "@/assets/wine-leather.jpg";

/** Closed vintage burgundy leather diary cover — tapping crest opens book or unlocks easter egg on 3 rapid taps. */
export function ClosedCover({ onOpen }: { onOpen: () => void }) {
  const [opening, setOpening] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crestTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const crestTaps = useRef(0);

  // One-time capturing event on window to trigger playback on first screen interaction if Tap to Open is missed
  useEffect(() => {
    const onFirstTouch = () => {
      const el = document.getElementById("bg-music-player") as HTMLAudioElement;
      if (el && el.paused) {
        el.volume = 0.6;
        el.play().catch((e) => console.error("Audio gesture required:", e));
      }
    };
    window.addEventListener("touchstart", onFirstTouch, { capture: true, once: true });
    window.addEventListener("pointerdown", onFirstTouch, { capture: true, once: true });
    return () => {
      window.removeEventListener("touchstart", onFirstTouch, true);
      window.removeEventListener("pointerdown", onFirstTouch, true);
      if (timer.current) clearTimeout(timer.current);
      if (crestTimer.current) clearTimeout(crestTimer.current);
    };
  }, []);

  const open = () => {
    if (opening) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setOpening(true);
    playPageTurn();
    timer.current = setTimeout(onOpen, reduced ? 0 : 1250);
  };

  const handleOpen = () => {
    const el = document.getElementById("bg-music-player") as HTMLAudioElement;
    if (el) {
      el.volume = 0.6;
      el.play().catch((e) => console.error("Audio gesture required:", e));
    }
    open();
  };

  const tapCrest = () => {
    const el = document.getElementById("bg-music-player") as HTMLAudioElement;
    if (el) {
      el.volume = 0.6;
      el.play().catch((e) => console.error("Audio gesture required:", e));
    }
    window.dispatchEvent(new Event("journal-crest-tap"));
    crestTaps.current++;
    if (crestTimer.current) clearTimeout(crestTimer.current);
    if (crestTaps.current >= 3) {
      crestTaps.current = 0;
      return;
    }
    crestTimer.current = setTimeout(() => {
      crestTaps.current = 0;
      handleOpen();
    }, 750);
  };

  return (
    <section className="closed-cover-stage" aria-label="Closed diary cover">
      {/* Visible stacked parchment paper block on the right edge */}
      <div className="book-paper-stack" aria-hidden="true" />

      <div className={`closed-cover ${opening ? "is-opening" : ""}`}>
        <div className="book-leather-spine" aria-hidden="true">
          <span>OUR LOVE JOURNEY</span>
        </div>

        <div className="closed-cover-face">
          <img
            src={leather}
            className="cover-leather-texture"
            width={1024}
            height={1024}
            alt=""
            aria-hidden="true"
            fetchPriority="high"
          />

          {/* Gold-embossed corner filigree */}
          {["tl", "tr", "bl", "br"].map((c) => (
            <span key={c} className={`filigree filigree-${c}`} aria-hidden="true">
              ❦
            </span>
          ))}

          <p className="cover-edition tracking-[0.35em]">A PRIVATE DIARY · VOLUME I</p>
          <h1 className="romantic closed-cover-title">{journal.title}</h1>

          {/* Raised circular medal with strictly centered cursive gold "S" monogram */}
          <Button
            variant="ghost"
            type="button"
            onClick={tapCrest}
            onPointerDown={() => void tryUnlockAudio()}
            disabled={opening}
            className="lock-medallion"
            aria-label="Tap crest to open our diary"
          >
            <span className="romantic lock-monogram">{journal.crest}</span>
          </Button>

          <Button
            variant="ghost"
            type="button"
            onClick={handleOpen}
            onPointerDown={handleOpen}
            disabled={opening}
            className="cover-open-label hover:scale-105 transition-transform"
          >
            <span className="script text-2xl">Tap to Open ❧</span>
          </Button>
        </div>

        <div className="closed-cover-back" aria-hidden="true" />
      </div>
    </section>
  );
}
