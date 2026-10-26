import { useState } from "react";
import { ourSong } from "@/content/loveStory";
import { playMechanicalTick } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

export function CassettePlayer() {
  const [open, setOpen] = useState(false);
  return (
    <section className="surprise-section cassette-section">
      <SectionTitle kicker="Our Song" title="Press Play In Your Heart" />
      <button
        type="button"
        className={`cassette ${open ? "is-playing" : ""}`}
        onClick={() => {
          playMechanicalTick();
          setOpen((o) => !o);
        }}
        aria-pressed={open}
        aria-label={`Play our song, ${ourSong.track}`}
      >
        <span className="cassette-label">
          <span className="cassette-title script">{ourSong.track}</span>
          <span className="cassette-side">SIDE A · OUR SONG</span>
        </span>
        <span className="cassette-window">
          <span className="cassette-spool" />
          <span className="cassette-tape" />
          <span className="cassette-spool" />
        </span>
        <span className="cassette-screws" aria-hidden="true">
          <i />
          <i />
          <i />
          <i />
        </span>
      </button>
      <div className={`cassette-lyric-slot ${open ? "is-open" : ""}`} aria-live="polite">
        {open && (
          <article className="cassette-lyric">
            <p className="cassette-track">♪ {ourSong.track}</p>
            <p className="script">“{ourSong.lyric}”</p>
          </article>
        )}
      </div>
    </section>
  );
}
