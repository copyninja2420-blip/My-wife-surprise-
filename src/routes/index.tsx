import { createFileRoute } from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import PasswordGate from "@/PasswordGate";
import { journal } from "@/content/loveStory";
import { Atmosphere } from "@/components/love/Atmosphere";
import { LoveMeterScreen } from "@/components/love/LoveMeterScreen";
import { Finale } from "@/components/love/Finale";
import { ScratchGallery } from "@/components/love/ScratchGallery";
import { HeartTap } from "@/components/love/HeartTap";
import { LoveLetter } from "@/components/love/LoveLetter";
import { MusicToggle } from "@/components/love/MusicToggle";
import { BirthdayCake } from "@/components/love/BirthdayCake";
import { SecretGateway } from "@/components/love/SecretGateway";
import { WhatsAppReaction } from "@/components/love/WhatsAppReaction";
import { AvatarJourney } from "@/components/love/AvatarJourney";
import { DestinyEntry, type DestinyNames } from "@/components/love/DestinyEntry";
import { ClosedCover } from "@/components/love/ClosedCover";
import { Timeline } from "@/components/love/Timeline";
import { Reasons } from "@/components/love/Reasons";
import { Prologue } from "@/components/love/Prologue";
import { GiftVault } from "@/components/love/GiftVault";
import { LoveTimer } from "@/components/love/LoveTimer";
import { DestinyNotebook } from "@/components/love/DestinyNotebook";
import { playPageTurn, preloadStorySounds } from "@/lib/storySounds";
import { getGlobalAudio, registerAudioUnlockListener, tryUnlockAudio } from "@/lib/musicUnlock";
import { RomanticKeepsakes } from "@/components/love/RomanticKeepsakes";
import { ScratchNote } from "@/components/love/ScratchNote";
import { LoveCoupons } from "@/components/love/LoveCoupons";
import { TimeCapsule } from "@/components/love/TimeCapsule";
import { MemoryCompass } from "@/components/love/MemoryCompass";
import { JourneySecret, SecretCrest } from "@/components/love/SecretCrest";
import { TwoHearts } from "@/components/love/TwoHearts";
import { CassettePlayer } from "@/components/love/CassettePlayer";
import { WishingJar } from "@/components/love/WishingJar";
import { FoggyMirror } from "@/components/love/FoggyMirror";
import { InstantHug } from "@/components/love/InstantHug";
import { useWakeLock } from "@/hooks/useWakeLock";

const PageCurl = lazy(() => import("@/components/love/PageCurl"));

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Our Love Journey — A Private Diary" },
      {
        name: "description",
        content: "A private, cinematic birthday love letter.",
      },
      { property: "og:title", content: "Our Love Journey" },
      {
        property: "og:description",
        content: "A romantic interactive birthday surprise.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: LoveStoryPage,
});

type Stage =
  "closed" | "cover" | "cake" | "avatar" | "scanner" | "names" | "notebook" | "prologue" | "story";
const CHAPTERS: { stage: Stage; label: string }[] = [
  { stage: "cover", label: "I · Our Story" },
  { stage: "cake", label: "II · Wish" },
  { stage: "scanner", label: "III · Hearts" },
  { stage: "names", label: "IV · Names" },
  { stage: "notebook", label: "V · Destiny" },
  { stage: "avatar", label: "VI · Us" },
  { stage: "prologue", label: "VII · For You" },
  { stage: "story", label: "VIII · Memories" },
];

function LoveStoryPage() {
  const [stage, setStageRaw] = useState<Stage>("closed");
  const [reached, setReached] = useState(0);
  const [turning, setTurning] = useState<string | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const turnLock = useRef(false);
  const [names, setNames] = useState<DestinyNames>({ yourName: "", partnerName: "" });
  const setStage = useCallback(
    (next: Stage) => {
      if (turnLock.current || next === stage) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      turnLock.current = true;
      playPageTurn();
      const i = CHAPTERS.findIndex((c) => c.stage === next);
      setReached((r) => Math.max(r, i));
      timers.current.push(setTimeout(() => setStageRaw(next), reduced ? 0 : 420));
      timers.current.push(
        setTimeout(
          () => {
            setTurning(null);
            turnLock.current = false;
          },
          reduced ? 20 : 1350,
        ),
      );
      setTurning(
        reduced
          ? null
          : (journal.chapters[CHAPTERS.findIndex((c) => c.stage === stage)] ?? journal.title),
      );
    },
    [stage],
  );
  const toNames = useCallback(() => setStage("names"), [setStage]);
  useEffect(() => {
    preloadStorySounds();
    const cleanUpAudioUnlock = registerAudioUnlockListener();

    // One-time capturing event on window to trigger playback on first screen interaction if missed
    const onFirstInteraction = () => {
      const el =
        (document.getElementById("bg-music-player") as HTMLAudioElement) || getGlobalAudio();
      if (el && el.paused) {
        el.volume = 0.6;
        el.play().catch((e) => console.error("Audio gesture required:", e));
      }
    };
    window.addEventListener("touchstart", onFirstInteraction, { capture: true, once: true });
    window.addEventListener("pointerdown", onFirstInteraction, { capture: true, once: true });

    void import("@/components/love/PageCurl");
    void import("@/components/love/CrystalHeart").then((module) => module.preloadCrystalHeart());
    void import("@/components/love/avatar/HumanoidScene");
    void import("@/components/love/companion/CompanionScene");
    return () => {
      cleanUpAudioUnlock();
      window.removeEventListener("touchstart", onFirstInteraction, true);
      window.removeEventListener("pointerdown", onFirstInteraction, true);
      timers.current.forEach(clearTimeout);
    };
  }, []);
  useEffect(() => {
    if (!turning) return;
    const failsafe = setTimeout(() => {
      setTurning(null);
      turnLock.current = false;
    }, 1450);
    return () => clearTimeout(failsafe);
  }, [turning]);
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "instant" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [stage]);
  useWakeLock(stage === "story");

  return (
    <main
      className="diary-book relative min-h-[100svh] overflow-x-hidden bg-background text-foreground"
      data-journey={stage}
    >
      {/* Persistent audio element in root */}
      <audio
        id="bg-music-player"
        loop
        preload="auto"
        src="/inayae.mp3"
        ref={(el) => {
          if (el && typeof window !== "undefined") {
            el.volume = 0.6;
            window.__STORY_BG_MUSIC__ = el;
            window.__GLOBAL_MUSIC_PLAYER__ = el;
            (window as unknown as Record<string | symbol, HTMLAudioElement | undefined>)[
              Symbol.for("storybook.sharedAudio")
            ] = el;
          }
        }}
      />

      {/* One music player for the whole visit — starts only after opening the book */}
      <MusicToggle autoplay={stage !== "closed"} />
      <JourneySecret />
      {stage !== "story" && <Atmosphere particles={8} hearts={3} />}
      <div className="journal-corners" aria-hidden="true">
        <span>❧</span>
        <span>❧</span>
        <span>❧</span>
        <span>❧</span>
      </div>

      <div key={stage} className={stage === "cover" ? "diary-page cover-reveal" : "diary-page"}>
        {stage === "closed" && (
          <ClosedCover
            onOpen={() => {
              void tryUnlockAudio();
              setStageRaw("cover");
            }}
          />
        )}
        {stage === "cover" && (
          <PasswordGate
            onUnlock={() => {
              void tryUnlockAudio();
              setStage("cake");
            }}
          />
        )}
        {stage === "cake" && (
          <BirthdayCake
            onEnter={() => {
              void tryUnlockAudio();
              setStage("scanner");
            }}
          />
        )}
        {stage === "avatar" && <AvatarJourney onNext={() => setStage("prologue")} />}
        {stage === "scanner" && <LoveMeterScreen onContinue={toNames} />}
        {stage === "names" && (
          <DestinyEntry
            onCalculate={(value) => {
              setNames(value);
              setStage("notebook");
            }}
          />
        )}
        {stage === "notebook" && (
          <DestinyNotebook names={names} onReveal={() => setStage("avatar")} />
        )}
        {stage === "prologue" && <Prologue onEnter={() => setStage("story")} />}

        {stage === "story" && (
          <div className="diary-memories">
            <HeartTap />
            <div className="relative z-10">
              <LoveTimer />
              <Timeline />
              <Reasons />
              <ScratchGallery />
              <ScratchNote />
              <GiftVault />
              <LoveCoupons />
              <TimeCapsule />
              <MemoryCompass />
              <RomanticKeepsakes />
              <CassettePlayer />
              <WishingJar />
              <FoggyMirror />
              <TwoHearts />
              <LoveLetter />
              <Finale />
              <div className="story-crest-slot">
                <SecretCrest />
              </div>
              <SecretGateway />
              <WhatsAppReaction />
              <InstantHug />
            </div>
          </div>
        )}
      </div>
      {turning && (
        <Suspense fallback={<div className="page-turn-fallback" aria-hidden="true" />}>
          <PageCurl title={turning} />
        </Suspense>
      )}
    </main>
  );
}
