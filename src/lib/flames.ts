export type FlamesLetter = "F" | "L" | "A" | "M" | "E" | "S";

export interface FlamesResult {
  a: string[];
  b: string[];
  /** pairs of [indexInA, indexInB] that cancel, in strike order */
  strikes: [number, number][];
  remaining: number;
  /** letters eliminated in order */
  eliminated: FlamesLetter[];
  destiny: FlamesLetter;
}

const clean = (s: string) =>
  s
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .split("");

export function calculateFlames(nameA: string, nameB: string): FlamesResult {
  const a = clean(nameA);
  const b = clean(nameB);
  const usedB = new Set<number>();
  const strikes: [number, number][] = [];
  a.forEach((ch, i) => {
    const j = b.findIndex((c, k) => c === ch && !usedB.has(k));
    if (j >= 0) {
      usedB.add(j);
      strikes.push([i, j]);
    }
  });
  const remaining = a.length + b.length - strikes.length * 2;
  const list: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];
  const eliminated: FlamesLetter[] = [];
  let idx = 0;
  const n = Math.max(remaining, 1);
  while (list.length > 1) {
    idx = (idx + n - 1) % list.length;
    const removed = list.splice(idx, 1)[0];
    if (removed) eliminated.push(removed);
  }
  return { a, b, strikes, remaining, eliminated, destiny: list[0] ?? "M" };
}

/** A deliberately romantic edition: matching letters count normally, M is protected. */
export function calculateRomanticDestiny(nameA: string, nameB: string): FlamesResult {
  const result = calculateFlames(nameA, nameB);
  const letters: FlamesLetter[] = ["F", "L", "A", "M", "E", "S"];
  const eliminated: FlamesLetter[] = [];
  let index = 0;
  while (letters.length > 1) {
    index = (index + Math.max(result.remaining, 1) - 1) % letters.length;
    if (letters[index] === "M") index = (index + 1) % letters.length;
    const removed = letters.splice(index, 1)[0];
    if (removed) eliminated.push(removed);
  }
  return { ...result, eliminated, destiny: "M" };
}

export const DESTINY: Record<FlamesLetter, { word: string; message: string }> = {
  F: {
    word: "Friends",
    message: "Best friends first — and the paper says forever. But my heart says so much more. 💛",
  },
  L: {
    word: "Lovers",
    message: "Written in pencil, sealed in my heart — we were always meant to be lovers. ❤️",
  },
  A: {
    word: "Affection",
    message: "Endless affection — every letter of your name was made to be cherished by me. 🌹",
  },
  M: {
    word: "Marriage",
    message: "Marriage! Even the notebook knows — one day I'll ask you properly. 💍",
  },
  E: {
    word: "Enemies",
    message:
      "Enemies?! This notebook is clearly broken — I'm crossing it out and writing 'Forever' instead. 😘",
  },
  S: {
    word: "Soulmates",
    message: "Soulmates — the rarest letter, just like you. My soul found its home. ✨",
  },
};
