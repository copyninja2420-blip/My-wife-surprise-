declare global {
  interface Window {
    __STORY_BG_MUSIC__?: HTMLAudioElement;
    __GLOBAL_MUSIC_PLAYER__?: HTMLAudioElement;
  }
}

/** The exact Inayae - Flute Instrumental audio file */
export const INAYAE_AUDIO_URL = "/inayae.mp3";
export const DEFAULT_MUSIC_URL = INAYAE_AUDIO_URL;

const AUDIO_SYMBOL = Symbol.for("storybook.sharedAudio");

/**
 * Returns the strictly single mounted <audio id="bg-music-player"> from the DOM.
 * NEVER creates a new Audio() in-memory instance to completely eliminate dual-stream phasing.
 */
export function getSharedAudio(): HTMLAudioElement | null {
  if (typeof window === "undefined") return null;

  const domAudio = document.getElementById("bg-music-player") as HTMLAudioElement | null;
  if (domAudio) {
    domAudio.volume = 0.5;
    window.__STORY_BG_MUSIC__ = domAudio;
    window.__GLOBAL_MUSIC_PLAYER__ = domAudio;
    (window as unknown as Record<string | symbol, HTMLAudioElement | undefined>)[AUDIO_SYMBOL] =
      domAudio;
    return domAudio;
  }

  return window.__STORY_BG_MUSIC__ || window.__GLOBAL_MUSIC_PLAYER__ || null;
}

export const getGlobalAudio = getSharedAudio;

/**
 * Bulletproof synchronous user-gesture audio unlock for the single mounted audio player.
 */
export function unlockAudio(): Promise<boolean> {
  const audio = getSharedAudio();
  if (!audio) return Promise.resolve(false);

  audio.muted = false;
  audio.volume = 0.6;

  if (!audio.paused && audio.currentTime > 0) {
    return Promise.resolve(true);
  }

  return audio
    .play()
    .then(() => {
      console.log("[Music Player] Flute audio unlocked successfully.");
      return true;
    })
    .catch((err) => {
      console.warn("[Music Player] Audio gesture needed:", err);
      return false;
    });
}

/** Legacy aliases */
export function startMusicFromGesture(): Promise<boolean> {
  return unlockAudio();
}
export function tryUnlockAudio(): Promise<boolean> {
  return unlockAudio();
}

/**
 * Capturing global touch/click listeners on window and document.
 * Automatically detaches once playback successfully starts.
 */
export function registerAudioUnlockListener(): () => void {
  if (typeof window === "undefined") return () => {};

  let active = true;

  const onGesture = () => {
    if (!active) return;
    const audio = getSharedAudio();
    if (audio && !audio.paused && audio.currentTime > 0) {
      cleanUp();
      return;
    }
    unlockAudio().then((success) => {
      if (success && active) {
        cleanUp();
      }
    });
  };

  const cleanUp = () => {
    active = false;
    window.removeEventListener("click", onGesture, true);
    window.removeEventListener("touchstart", onGesture, true);
    window.removeEventListener("pointerdown", onGesture, true);
    document.removeEventListener("click", onGesture, true);
    document.removeEventListener("touchstart", onGesture, true);
    document.removeEventListener("pointerdown", onGesture, true);
  };

  window.addEventListener("click", onGesture, { capture: true, passive: true });
  window.addEventListener("touchstart", onGesture, { capture: true, passive: true });
  window.addEventListener("pointerdown", onGesture, { capture: true, passive: true });
  document.addEventListener("click", onGesture, { capture: true, passive: true });
  document.addEventListener("touchstart", onGesture, { capture: true, passive: true });
  document.addEventListener("pointerdown", onGesture, { capture: true, passive: true });

  return cleanUp;
}
