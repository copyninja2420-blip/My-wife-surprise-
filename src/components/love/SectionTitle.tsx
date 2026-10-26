import { useReveal } from "@/hooks/useReveal";

export function SectionTitle({ kicker, title }: { kicker?: string; title: string }) {
  const { ref, shown } = useReveal();
  return (
    <div ref={ref} className={`text-center reveal ${shown ? "reveal-in" : ""}`}>
      {kicker && <p className="script text-lg text-gold-soft/90">{kicker}</p>}
      <h2 className="mt-2 font-display text-[1.75rem] leading-snug tracking-wide text-warm">
        {title}
      </h2>
      <span className="mx-auto mt-4 block h-px w-16 bg-linear-to-r from-transparent via-gold-soft to-transparent" />
    </div>
  );
}
