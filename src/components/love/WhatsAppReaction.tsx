import { whatsappReaction } from "@/content/loveStory";

export function WhatsAppReaction() {
  const href = `https://wa.me/${whatsappReaction.phoneNumber}?text=${encodeURIComponent(whatsappReaction.message)}`;
  return (
    <div className="mx-auto flex max-w-xs flex-col items-stretch gap-2 px-6 pt-4 pb-6 text-center">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex w-full items-center gap-2 whitespace-normal justify-center rounded-full border border-rose-soft/40 bg-gradient-to-r from-rose-glow/80 via-primary to-rose-glow/80 px-7 py-3 font-display text-base text-primary-foreground shadow-[0_0_24px_oklch(0.76_0.14_12/40%)] transition-transform active:scale-95"
      >
        {whatsappReaction.label}
      </a>
      <p className="font-display text-xs text-warm/60 italic">{whatsappReaction.subtext}</p>
    </div>
  );
}
