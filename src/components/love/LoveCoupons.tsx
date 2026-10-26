import { useState } from "react";
import { Heart, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { whatsappReaction } from "@/content/loveStory";
import { COUPONS, couponWhatsAppUrl } from "@/lib/journalSurprises";
import { playMechanicalTick } from "@/lib/storySounds";
import { SectionTitle } from "./SectionTitle";

export function LoveCoupons() {
  const [claimed, setClaimed] = useState<number[]>([]);
  return (
    <section className="surprise-section">
      <SectionTitle kicker="Redeem Anytime" title="Little Promises, Just Yours" />
      <div className="coupon-grid">
        {COUPONS.map((name, i) => (
          <article className={`love-coupon ${claimed.includes(i) ? "is-claimed" : ""}`} key={name}>
            <span className="coupon-number">LOVE NOTE · 0{i + 1}</span>
            <Heart aria-hidden="true" className="coupon-heart" />
            <h3>{name}</h3>
            <div className="coupon-stub">
              {claimed.includes(i) ? (
                <>
                  <span className="coupon-stamp">CLAIMED ❤️</span>
                  <Button asChild variant="ghost" className="coupon-redeem">
                    <a
                      href={couponWhatsAppUrl(whatsappReaction.phoneNumber, name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <MessageCircle /> Send to Sriharan
                    </a>
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  className="coupon-redeem"
                  onClick={() => {
                    playMechanicalTick();
                    setClaimed((c) => [...c, i]);
                  }}
                >
                  Redeem <Heart />
                </Button>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
