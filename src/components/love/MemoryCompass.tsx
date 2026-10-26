import { useState } from "react";
import { Button } from "@/components/ui/button";
import { playMechanicalTick } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

const PLACES = [
  {
    point: "North",
    symbol: "N",
    title: "Our School — Where It All Began",
    note: "The unforgettable place where our eyes first met, and where the first chapter of our forever quietly started.",
  },
  {
    point: "East",
    symbol: "E",
    title: "Malaikottai (Rockfort) — Our Very First Date",
    note: "High above the city breeze, standing together for our first date, where my heart knew you were my home.",
  },
  {
    point: "South",
    symbol: "S",
    title: "LA Cinemas — Our First Movie Date",
    note: "Side by side in the dark theatre, our hands finding each other for the first time amidst the movie scenes.",
  },
  {
    point: "West",
    symbol: "W",
    title: "Kallanai Dam — Our Distant Journey",
    note: "The scenic long drive across the river waters — our first distant escape together where time simply stood still.",
  },
];
export function MemoryCompass() {
  const [active, setActive] = useState<number | null>(null);
  const [rotation, setRotation] = useState(0);
  return (
    <section className="surprise-section">
      <SectionTitle kicker="Every road leads to you" title="Our Special Places" />
      <div className="memory-compass">
        <div className="compass-ticks" aria-hidden="true" />
        <svg
          className="compass-dial"
          viewBox="0 0 240 240"
          style={{ transform: `rotate(${rotation}deg)` }}
          aria-hidden="true"
        >
          <circle cx="120" cy="120" r="87" />
          <path d="M120 20L138 102L220 120L138 138L120 220L102 138L20 120L102 102Z" />
          <path
            className="compass-shade"
            d="M120 20V120L138 102ZM220 120H120L138 138ZM120 220V120L102 138ZM20 120H120L102 102Z"
          />
          <circle className="compass-pivot" cx="120" cy="120" r="9" />
        </svg>
        {PLACES.map((p, i) => (
          <Button
            variant="ghost"
            key={p.point}
            className={`compass-point point-${i}`}
            aria-label={`${p.point}: ${p.title}`}
            aria-pressed={active === i}
            onClick={() => {
              const previous = ((rotation % 360) + 360) % 360;
              let change = i * 90 - previous;
              if (change > 180) change -= 360;
              if (change < -180) change += 360;
              setRotation(rotation + change);
              setActive(i);
              playMechanicalTick();
            }}
          >
            {p.symbol}
          </Button>
        ))}
      </div>
      <div className="compass-plaque-slot" aria-live="polite">
        {active !== null && (
          <article key={active} className="compass-plaque">
            <h3 className="script">{PLACES[active]?.title}</h3>
            <p>{PLACES[active]?.note}</p>
          </article>
        )}
      </div>
    </section>
  );
}
