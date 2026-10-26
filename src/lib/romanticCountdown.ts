/** November 4, 2027 at midnight in the couple's local time (India). */
export const ROMANTIC_TARGET_DATE = "2027-11-04T00:00:00+05:30";

export function romanticCountdown(now: number) {
  const total = Math.max(0, Math.ceil((Date.parse(ROMANTIC_TARGET_DATE) - now) / 1000));
  return [
    Math.floor(total / 86400),
    Math.floor((total % 86400) / 3600),
    Math.floor((total % 3600) / 60),
    total % 60,
  ] as const;
}
