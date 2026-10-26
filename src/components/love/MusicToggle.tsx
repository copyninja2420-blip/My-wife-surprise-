import { useEffect, useMemo, useRef, useState } from "react";
import { ListMusic, Plus, Trash2, Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { playlist as bundledPlaylist, type Track } from "@/content/loveStory";
import {
  addStoredTracks,
  listStoredTracks,
  removeStoredTrack,
  type StoredTrack,
} from "@/lib/musicLibrary";
import { DEFAULT_MUSIC_URL, getSharedAudio, unlockAudio } from "@/lib/musicUnlock";

type UserTrack = Track & { id: string };

export function MusicToggle({ autoplay }: { autoplay: boolean }) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [index, setIndex] = useState(0);
  const [userTracks, setUserTracks] = useState<UserTrack[]>([]);
  const [manage, setManage] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const objectUrls = useRef(new Set<string>());

  // Sync state with singleton audio element
  useEffect(() => {
    const audio = getSharedAudio();
    if (!audio) return;

    audio.volume = 0.5;
    setPlaying(!audio.paused);
    setMuted(audio.muted);

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onVolumeChange = () => setMuted(audio.muted);

    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);
    audio.addEventListener("volumechange", onVolumeChange);

    return () => {
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
      audio.removeEventListener("volumechange", onVolumeChange);
    };
  }, []);

  // Autoplay trigger once book opens (stage !== "closed")
  useEffect(() => {
    if (!autoplay) return;
    const audio = getSharedAudio();
    if (!audio) return;

    if (audio.paused) {
      audio.muted = false;
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => {
          // Browser gesture requirement will be fulfilled on next tap
        });
    }
  }, [autoplay]);

  const toUserTrack = (t: StoredTrack): UserTrack => {
    const src = URL.createObjectURL(t.blob);
    objectUrls.current.add(src);
    return { id: t.id, title: t.title, src };
  };

  // Load any stored device-local tracks from IndexedDB
  useEffect(() => {
    let cancelled = false;
    const urls = objectUrls.current;
    listStoredTracks()
      .then((stored) => {
        if (!cancelled && stored.length > 0) {
          const tracks = stored.map(toUserTrack);
          setUserTracks(tracks);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
      urls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const playlist = useMemo<Track[]>(() => [...bundledPlaylist, ...userTracks], [userTracks]);

  // Handle track switches if user adds or changes their own tracks
  const selectTrack = (trackIndex: number) => {
    const selected = playlist[trackIndex];
    if (!selected) return;
    setIndex(trackIndex);
    const audio = getSharedAudio();
    if (!audio) return;
    audio.src = selected.src;
    audio.load();
    audio.muted = false;
    audio.play().catch(() => {});
  };

  // Connect directly to toggle #bg-music-player.play() and #bg-music-player.pause()
  const toggleMusic = () => {
    const el = (document.getElementById("bg-music-player") as HTMLAudioElement) || getSharedAudio();
    if (!el) return;

    if (el.paused) {
      el.muted = false;
      el.volume = 0.6;
      el.play()
        .then(() => setPlaying(true))
        .catch((err) => console.error("Audio playback error:", err));
    } else {
      el.pause();
      setPlaying(false);
    }
  };

  const onFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const audioFiles = Array.from(files).filter(
      (f) => f.type.startsWith("audio/") || /\.(mp3|m4a|wav|ogg)$/i.test(f.name),
    );
    if (audioFiles.length === 0) {
      setUploadError("Choose an audio file.");
      return;
    }
    if (audioFiles.some((file) => file.size > 20 * 1024 * 1024)) {
      setUploadError("Please choose songs under 20 MB.");
      return;
    }
    try {
      const added = await addStoredTracks(audioFiles);
      const converted = added.map(toUserTrack);
      setUserTracks((prev) => [...prev, ...converted]);
      setUploadError("");

      // Switch to newly uploaded track and play
      const audio = getSharedAudio();
      if (audio && converted[0]) {
        audio.src = converted[0].src;
        audio.load();
        audio.muted = false;
        audio.play().catch(() => {});
      }
    } catch {
      setUploadError("This song couldn’t be saved. Please try again.");
    }
    if (fileRef.current) fileRef.current.value = "";
  };

  const remove = async (id: string) => {
    await removeStoredTrack(id);
    const removed = userTracks.find((t) => t.id === id);
    if (removed) {
      URL.revokeObjectURL(removed.src);
      objectUrls.current.delete(removed.src);
    }
    setUserTracks((prev) => {
      const list = prev.filter((t) => t.id !== id);
      if (list.length === 0) {
        // Fall back to default romantic soundtrack
        const audio = getSharedAudio();
        if (audio) {
          audio.src = DEFAULT_MUSIC_URL;
          audio.load();
          if (autoplay) audio.play().catch(() => {});
        }
      }
      return list;
    });
  };

  const isAudible = playing && !muted;

  return (
    <>
      <input
        ref={fileRef}
        type="file"
        accept="audio/*"
        multiple
        className="hidden"
        onChange={(e) => void onFiles(e.target.files)}
      />

      {/* Sleek, minimalist top-right gold-bordered music pill */}
      <aside
        aria-label="Storybook background music"
        className="music-toggle-pill fixed right-3 top-3 z-50 flex items-center gap-1.5 rounded-full border border-gold-soft/50 bg-[#1a040e]/90 px-2.5 py-1 text-gold-soft shadow-[0_4px_22px_rgba(0,0,0,0.65)] backdrop-blur-md"
      >
        <Button
          type="button"
          onClick={toggleMusic}
          aria-label={isAudible ? "Pause background music" : "Play background music"}
          title={isAudible ? "Pause background music" : "Play background music"}
          variant="ghost"
          size="icon"
          className="size-7 shrink-0 text-gold-soft hover:bg-gold-soft/10 hover:text-warm transition-transform active:scale-95"
        >
          {isAudible ? (
            <Volume2 className="size-4 text-gold-soft animate-pulse" />
          ) : (
            <VolumeX className="size-4 text-gold-soft/50" />
          )}
        </Button>

        <Button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Add your own songs"
          title="Add your own songs"
          variant="ghost"
          size="icon"
          className="size-6 shrink-0 text-gold-soft/70 hover:bg-gold-soft/10 hover:text-gold-soft"
        >
          <Plus className="size-3.5" />
        </Button>

        {userTracks.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            type="button"
            onClick={() => setManage(true)}
            aria-label="Open music library"
            title="Open music library"
            className="size-6 shrink-0 text-gold-soft/70 hover:bg-gold-soft/10 hover:text-gold-soft"
          >
            <ListMusic className="size-3.5" />
          </Button>
        )}
      </aside>

      {/* Explicitly opened dialog for user tracks — preserves no dropdown rule */}
      {userTracks.length > 0 && (
        <Dialog open={manage} onOpenChange={setManage}>
          <DialogContent className="music-library-dialog border-gold-soft/40 bg-background text-gold-soft">
            <DialogTitle>Your Songs</DialogTitle>
            <DialogDescription>Your private device-local audio library.</DialogDescription>
            <ul className="max-h-64 overflow-y-auto pr-1">
              {userTracks.map((t, i) => (
                <li key={t.id} className="flex items-center gap-1 py-1">
                  <Button
                    variant="ghost"
                    type="button"
                    onClick={() => {
                      selectTrack(bundledPlaylist.length + i);
                      setManage(false);
                    }}
                    className={`h-7 flex-1 justify-start truncate text-left text-xs ${
                      i + bundledPlaylist.length === index
                        ? "text-warm opacity-100 font-semibold"
                        : "opacity-70"
                    }`}
                  >
                    {t.title}
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    type="button"
                    aria-label={`Remove ${t.title}`}
                    onClick={() => void remove(t.id)}
                    className="size-7 opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </li>
              ))}
            </ul>
          </DialogContent>
        </Dialog>
      )}

      {uploadError && (
        <div
          role="alert"
          className="fixed right-3 top-14 z-50 rounded bg-[#1a040d]/90 px-3 py-1.5 text-xs text-rose-glow border border-rose-glow/30 shadow-lg"
        >
          {uploadError}
        </div>
      )}
    </>
  );
}
