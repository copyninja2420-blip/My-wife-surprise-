import { useState } from "react";
import { Heart, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Atmosphere } from "./Atmosphere";

export type DestinyNames = { yourName: string; partnerName: string };

export function DestinyEntry({ onCalculate }: { onCalculate: (names: DestinyNames) => void }) {
  const [yourName, setYourName] = useState("");
  const [partnerName, setPartnerName] = useState("");
  return (
    <section className="destiny-entry journey-screen" aria-labelledby="destiny-title">
      <Atmosphere particles={24} hearts={0} />
      <div className="relative z-10 mx-auto w-full max-w-md text-center">
        <div className="destiny-ornament" aria-hidden="true">
          <span />
          <Heart className="size-6" />
          <span />
        </div>
        <p className="mb-5 font-display text-xs uppercase tracking-[0.25em] text-gold-soft/70">
          Two names. One forever.
        </p>
        <h1 id="destiny-title" className="romantic text-5xl text-gold-soft sm:text-6xl">
          Our Destiny
        </h1>
        <p className="script mt-4 text-3xl text-warm/80">Some things are written in the stars.</p>
        <form
          className="mt-12 space-y-7 text-left"
          onSubmit={(event) => {
            event.preventDefault();
            if (!/[a-z]/i.test(yourName) || !/[a-z]/i.test(partnerName)) return;
            onCalculate({ yourName: yourName.trim(), partnerName: partnerName.trim() });
          }}
        >
          <label className="block font-display text-sm text-gold-soft">
            Your Name
            <input
              className="destiny-input mt-2"
              aria-label="Your Name"
              value={yourName}
              onChange={(e) => setYourName(e.target.value)}
              maxLength={24}
              required
              pattern=".*[a-zA-Z].*"
              autoComplete="given-name"
              placeholder="Your Name"
            />
          </label>
          <label className="block font-display text-sm text-gold-soft">
            Partner's Name
            <input
              className="destiny-input mt-2"
              aria-label="Partner's Name"
              value={partnerName}
              onChange={(e) => setPartnerName(e.target.value)}
              maxLength={24}
              required
              pattern=".*[a-zA-Z].*"
              autoComplete="off"
              placeholder="Partner's Name"
            />
          </label>
          <Button type="submit" className="journey-gold-button w-full">
            <Sparkles className="size-4" />
            Calculate Our Destiny ✨
          </Button>
        </form>
        <p className="script mt-10 text-2xl text-gold-soft/60">You & me, in every lifetime.</p>
      </div>
    </section>
  );
}
