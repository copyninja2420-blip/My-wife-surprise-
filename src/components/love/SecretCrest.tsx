import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { journal } from "@/content/loveStory";
import { rapidCrestTaps } from "@/lib/journalSurprises";
import { playCelebration } from "@/lib/storySounds";

export function SecretCrest({ className = "story-secret-crest" }: { className?: string }) {
  return (
    <Button
      variant="ghost"
      className={className}
      aria-label="Our S monogram"
      onClick={() => window.dispatchEvent(new Event("journal-crest-tap"))}
    >
      <span className="romantic">{journal.crest}</span>
    </Button>
  );
}
export function JourneySecret() {
  const [open, setOpen] = useState(false);
  const taps = useRef<number[]>([]);
  useEffect(() => {
    const tap = () => {
      taps.current = rapidCrestTaps(taps.current, performance.now());
      if (taps.current.length === 3) {
        taps.current = [];
        setOpen(true);
        playCelebration();
      }
    };
    window.addEventListener("journal-crest-tap", tap);
    return () => window.removeEventListener("journal-crest-tap", tap);
  }, []);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {open &&
        createPortal(
          <div className="secret-rose-shower" aria-hidden="true">
            {Array.from({ length: 22 }, (_, i) => (
              <i
                key={i}
                style={
                  {
                    left: `${(i * 37) % 100}%`,
                    animationDelay: `${-i * 0.43}s`,
                    animationDuration: `${10 + (i % 3) * 2}s`,
                    "--petal-wind": `${i % 2 ? 45 : -35}px`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>,
          document.body,
        )}
      <DialogContent className="secret-story-modal">
        <span className="romantic secret-modal-crest" aria-hidden="true">
          S
        </span>
        <DialogTitle className="script">You found the secret key...</DialogTitle>
        <DialogDescription className="secret-story-message">
          No matter how many pages we write in this life, you will always be my favorite story.
        </DialogDescription>
        <p className="script secret-story-signature">Forever yours, Sriharan ❤️</p>
      </DialogContent>
    </Dialog>
  );
}
