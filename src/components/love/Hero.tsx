import bokeh from "@/assets/bokeh.jpg";
import { couple, hero } from "@/content/loveStory";
import { Typewriter } from "./Typewriter";

export function Hero() {
  return (
    <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-7 text-center">
      <img
        src={bokeh}
        alt=""
        width={1280}
        height={1920}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 size-full object-cover opacity-40 mix-blend-screen"
      />
      <div className="absolute inset-0 bg-vignette" aria-hidden="true" />

      <div className="relative z-10 animate-rise">
        <p className="script text-xl text-gold-soft">{couple.birthday}</p>

        <div className="mx-auto mt-6 grid place-items-center">
          <span className="heart-beat text-5xl text-rose-glow drop-shadow-[0_0_28px_rgba(255,120,150,0.55)]">
            ❤
          </span>
        </div>

        <h1 className="mt-6 font-display text-[2.35rem] leading-[1.15] tracking-wide text-warm text-glow">
          Happy Birthday,
          <br />
          <span className="romantic text-5xl leading-[1.1] text-gradient-love">
            {couple.wifeName} ❤️
          </span>
        </h1>

        <p className="mx-auto mt-7 max-w-sm whitespace-pre-line text-[0.98rem] leading-relaxed text-warm/70">
          <Typewriter text={hero.line} speed={32} delay={700} />
        </p>

        <div className="mt-12 flex flex-col items-center gap-2 text-warm/45">
          <span className="text-[0.65rem] uppercase tracking-[0.4em]">Scroll</span>
          <span className="scroll-line" />
        </div>
      </div>
    </section>
  );
}
