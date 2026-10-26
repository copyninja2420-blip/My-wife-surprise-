import { useState } from "react";
import { createPortal } from "react-dom";
import { instantHug, whatsappReaction } from "@/content/loveStory";
import { cappedParticleCount } from "@/lib/particleBudget";

export function InstantHug() {
  const [hearts, setHearts] = useState(0);
  const href = `https://wa.me/${whatsappReaction.phoneNumber}?text=${encodeURIComponent(instantHug.message)}`;
  return (
    <div className="instant-hug-wrap">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="instant-hug"
        onClick={() => setHearts((h) => h + 1)}
      >
        {instantHug.label}
      </a>
      {hearts > 0 &&
        createPortal(
          <div key={hearts} className="hug-hearts" aria-hidden="true">
            {Array.from({ length: cappedParticleCount(14) }, (_, i) => (
              <i
                key={i}
                style={{
                  left: `${8 + ((i * 61) % 84)}%`,
                  animationDelay: `${(i % 7) * 0.18}s`,
                  fontSize: `${14 + (i % 3) * 8}px`,
                }}
              >
                {i % 3 === 2 ? "✦" : "❤"}
              </i>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
}
