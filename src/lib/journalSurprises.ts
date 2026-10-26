import { ROMANTIC_TARGET_DATE } from "./romanticCountdown";

export const SCRATCH_REVEAL_RATIO = 0.6;
export const SCRATCH_DISSOLVE_RATIO = 0.5;
export const COUPONS = [
  "One Long Midnight Drive With No Destination",
  "Instant Win In Any Argument (No Questions Asked)",
  "A Tight 5-Minute Hug When You Are Stressed",
  "Your Favorite Meal Cooked & Served By Me",
] as const;
export function scratchRevealed(cleared: number, total: number) {
  return total > 0 && cleared / total >= SCRATCH_REVEAL_RATIO;
}
export function dissolveRevealed(cleared: number, total: number) {
  return total > 0 && cleared / total >= SCRATCH_DISSOLVE_RATIO;
}
export function pickJarReason(pool: readonly string[], index: number) {
  return pool[((index % pool.length) + pool.length) % pool.length] ?? "";
}
export function capsuleUnlocked(now: number) {
  return now >= Date.parse(ROMANTIC_TARGET_DATE);
}
export function couponWhatsAppUrl(phone: string, name: string) {
  return `https://wa.me/${phone.replace(/\D/g, "")}?text=${encodeURIComponent(`I just redeemed my coupon for: ${name}! ❤️`)}`;
}
export function rapidCrestTaps(previous: number[], now: number) {
  return [...previous.filter((t) => now - t <= 900), now].slice(-3);
}
