import { useState } from "react";
import { ChevronDown, Heart } from "lucide-react";
import { story } from "@/content/loveStory";
import { useReveal } from "@/hooks/useReveal";
import { SectionTitle } from "./SectionTitle";

function Chapter({ index }: { index: number }) {
  const chapter = story[index]!;
  const { ref, shown } = useReveal<HTMLLIElement>(0.25);
  const [open, setOpen] = useState(index === 0);

  return (
    <li
      ref={ref}
      className={`relative pb-10 pl-11 reveal sm:pl-12 ${shown ? "reveal-in" : ""}`}
      style={{ transitionDelay: `${index * 90}ms` }}
    >
      <span className="timeline-node">
        <Heart className="size-3" />
      </span>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="glass w-full overflow-hidden rounded-xl px-4 py-4 text-left transition active:scale-[0.99] sm:px-5"
        aria-expanded={open}
      >
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3">
          <div className="min-w-0">
            <p className="inline-flex rounded-full border border-gold-soft/20 bg-burgundy-deep/45 px-2.5 py-1 text-[0.62rem] uppercase tracking-[0.18em] text-gold-soft">
              {chapter.date}
            </p>
            <h3 className="mt-2 font-display text-xl leading-tight text-warm">{chapter.label}</h3>
            <p className="script mt-1 text-base text-rose-glow/90">{chapter.caption}</p>
          </div>
          <ChevronDown
            className={`mt-1 size-4 shrink-0 text-warm/50 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </div>

        <div
          className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}
        >
          <div className="overflow-hidden">
            <div className="photo-slot mt-4">
              {chapter.image ? (
                <img
                  src={chapter.image}
                  alt={chapter.label}
                  loading="lazy"
                  className="size-full object-cover"
                />
              ) : (
                <span className="font-serif italic text-warm/70">Our sacred memory ❤️</span>
              )}
            </div>
            <p className="mt-4 text-sm leading-relaxed text-warm/70">{chapter.body}</p>
          </div>
        </div>
      </button>
    </li>
  );
}

export function Timeline() {
  return (
    <section className="relative px-6 py-24">
      <SectionTitle kicker="Our Love Story" title="From the first look to forever" />
      <ol className="relative mx-auto mt-12 max-w-md">
        <span className="timeline-spine" aria-hidden="true" />
        {story.map((c, i) => (
          <Chapter key={c.label} index={i} />
        ))}
      </ol>
    </section>
  );
}
