export const MAX_ACTIVE_PARTICLES = 35;
export function cappedParticleCount(requested: number) {
  return Math.max(0, Math.min(MAX_ACTIVE_PARTICLES, Math.floor(requested)));
}
