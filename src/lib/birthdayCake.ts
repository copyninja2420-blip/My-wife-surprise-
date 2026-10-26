export type CakePhase = "lit" | "blown" | "cut";
export function nextCakePhase(phase: CakePhase, action: "blow" | "cut"): CakePhase {
  if (phase === "lit" && action === "blow") return "blown";
  if (phase === "blown" && action === "cut") return "cut";
  return phase;
}
export function canEnterStory(phase: CakePhase) {
  return phase === "cut";
}
