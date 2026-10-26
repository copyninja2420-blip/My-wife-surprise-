import { useSyncExternalStore } from "react";

export type Mood =
  | "wave"
  | "walk"
  | "run"
  | "idle"
  | "sit"
  | "read"
  | "jump"
  | "kiss"
  | "heart"
  | "point"
  | "peek"
  | "kneel"
  | "present";

export type CompanionState = {
  /** what he is doing right now */
  mood: Mood;
  /** horizontal position on screen, 0 = left edge, 1 = right edge */
  x: number;
  /** where he is walking to (0..1) */
  targetX: number;
  /** speech bubble text, empty = hidden */
  message: string;
  /** normalized pointer position, for the "look at you" behaviour */
  pointer: { x: number; y: number };
};

const state: CompanionState = {
  mood: "wave",
  x: 0.18,
  targetX: 0.18,
  message: "",
  pointer: { x: 0.5, y: 0.4 },
};

const listeners = new Set<() => void>();
let snapshot: CompanionState = { ...state };

function emit() {
  snapshot = { ...state, pointer: { ...state.pointer } };
  listeners.forEach((l) => l());
}

function subscribe(l: () => void) {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useCompanion(): CompanionState {
  return useSyncExternalStore(
    subscribe,
    () => snapshot,
    () => snapshot,
  );
}

export function getCompanion() {
  return state;
}

let moodTimer: number | undefined;
let messageTimer: number | undefined;

/** Set his behaviour. `hold` = ms before he drifts back to wandering. */
export function setMood(mood: Mood, hold?: number) {
  state.mood = mood;
  if (typeof window !== "undefined") {
    window.clearTimeout(moodTimer);
    if (hold) {
      moodTimer = window.setTimeout(() => {
        state.mood = "idle";
        emit();
      }, hold);
    }
  }
  emit();
}

/** Ask him to stroll to a horizontal spot (0..1). */
export function walkTo(x: number, mood: Mood = "walk") {
  state.targetX = Math.min(0.92, Math.max(0.08, x));
  state.mood = mood;
  emit();
}

export function say(message: string, ms = 3600) {
  state.message = message;
  emit();
  if (typeof window !== "undefined") {
    window.clearTimeout(messageTimer);
    messageTimer = window.setTimeout(() => {
      state.message = "";
      emit();
    }, ms);
  }
}

/** called from the render loop — cheap, no re-render storm */
let lastPublishedX = state.x;
export function reportX(x: number) {
  state.x = x;
  if (Math.abs(x - lastPublishedX) > 0.004) {
    lastPublishedX = x;
    emit();
  }
}

export function setPointer(x: number, y: number) {
  state.pointer.x = x;
  state.pointer.y = y;
}

export const romanticLines = [
  "I made all of this just for you ❤️",
  "Keep going, my love…",
  "There is another surprise ahead 👀",
  "You are my favorite person ❤️",
  "I love you forever.",
  "Every day with you is my birthday 🎂",
  "You are loved more than you know.",
];

export function tapCompanion() {
  const line = romanticLines[Math.floor(Math.random() * romanticLines.length)]!;
  say(line);
  setMood(Math.random() > 0.5 ? "kiss" : "wave", 2600);
}
