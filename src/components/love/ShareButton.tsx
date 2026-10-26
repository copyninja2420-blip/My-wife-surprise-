import { useState } from "react";

export function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.clipboard && url) {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      // fallback silently
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <button
      type="button"
      onClick={handleShare}
      className="btn-love px-6 py-2.5 text-[0.82rem]"
      aria-label="Copy link to this surprise"
    >
      <span className="btn-love-glow" />
      <span className="relative">{copied ? "Link copied! ✨" : "Share this surprise 💌"}</span>
    </button>
  );
}
