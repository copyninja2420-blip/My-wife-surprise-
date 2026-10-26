import { useEffect, useState } from "react";
import { LockKeyhole, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { letter } from "@/content/loveStory";
import { capsuleUnlocked } from "@/lib/journalSurprises";
import { romanticCountdown } from "@/lib/romanticCountdown";
import { playMechanicalTick } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

export function TimeCapsule() {
  const [now, setNow] = useState<number | null>(null);
  const [touched, setTouched] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    setNow(Date.now());
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  const unlocked = now !== null && capsuleUnlocked(now);
  const remaining = now === null ? null : romanticCountdown(now);
  return (
    <section className="surprise-section capsule-section">
      <SectionTitle kicker="A promise to tomorrow" title="A Letter To Our Future" />
      <p className="capsule-subtitle">Sealed until our sacred day...</p>
      <Button
        variant="ghost"
        className={`capsule-chest ${open ? "is-open" : ""}`}
        aria-label={unlocked ? "Open our future letter" : "Try the locked time capsule"}
        aria-describedby="capsule-hint"
        onClick={() => {
          playMechanicalTick();
          setTouched(true);
          if (capsuleUnlocked(Date.now())) setOpen(true);
        }}
      >
        <span className="capsule-lid" />
        <span className="capsule-band band-left" />
        <span className="capsule-band band-right" />
        <span className="capsule-lock">{unlocked ? <Mail /> : <LockKeyhole />}</span>
        <span className="capsule-engraving">S · FOREVER · N</span>
      </Button>
      <div className="capsule-countdown" aria-label="Time until the capsule opens">
        {["Days", "Hours", "Minutes", "Seconds"].map((label, i) => (
          <span key={label}>
            <b>{remaining ? String(remaining[i]).padStart(2, "0") : "—"}</b>
            <small>{label}</small>
          </span>
        ))}
      </div>
      <p id="capsule-hint" className="capsule-hint" role="status">
        {touched && !unlocked
          ? "Patience, my love... This memory opens on our sacred day ⏳💍"
          : unlocked
            ? "Our special day is here, my love ❤️"
            : ""}
      </p>
      {open && (
        <article className="capsule-letter">
          <h3 className="script">{letter.greeting}</h3>
          <p>{letter.body}</p>
          <p className="script">{letter.signature}</p>
        </article>
      )}
    </section>
  );
}
