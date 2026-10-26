import { useState } from "react";
import { jarReasons } from "@/content/loveStory";
import { pickJarReason } from "@/lib/journalSurprises";
import { playMechanicalTick } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

export function WishingJar() {
  const [drawn, setDrawn] = useState<string | null>(null);
  const [last, setLast] = useState(-1);
  const pull = () => {
    playMechanicalTick();
    let next = Math.floor(Math.random() * jarReasons.length);
    if (jarReasons.length > 1 && next === last) next = (next + 1) % jarReasons.length;
    setLast(next);
    setDrawn(pickJarReason(jarReasons, next));
  };
  return (
    <section className="surprise-section jar-section">
      <SectionTitle kicker="A Reason For Every Day" title="The Wishing Jar" />
      <div className="wishing-jar">
        <button
          type="button"
          className="jar-cork"
          onClick={pull}
          aria-label="Pull a scroll from the wishing jar"
        />
        <div className="jar-glass" aria-hidden="true">
          {Array.from({ length: 9 }, (_, i) => (
            <span
              key={i}
              className="jar-scroll"
              style={
                {
                  left: `${8 + ((i * 37) % 80)}%`,
                  bottom: `${6 + ((i * 23) % 38)}%`,
                  "--scroll-rot": `${((i * 53) % 40) - 20}deg`,
                  animationDelay: `${(i % 5) * 0.45}s`,
                  animationDuration: `${2.8 + (i % 3) * 0.5}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>
      </div>
      <div className="jar-scroll-slot" aria-live="polite">
        {drawn && (
          <article key={drawn} className="jar-paper">
            <p className="script">{drawn}</p>
          </article>
        )}
      </div>
    </section>
  );
}
