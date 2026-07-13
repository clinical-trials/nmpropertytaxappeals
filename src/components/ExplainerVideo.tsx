"use client";

import { useRef, useState } from "react";

// Explainer video: autoplays muted + loops (browser policy = starts silent).
// A discrete button toggles looping background music on/off.
export function ExplainerVideo({
  videoSrc,
  musicSrc,
}: {
  videoSrc: string;
  musicSrc?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [musicOn, setMusicOn] = useState(false);

  function toggleMusic() {
    const a = audioRef.current;
    if (!a) return;
    if (musicOn) {
      a.pause();
      setMusicOn(false);
    } else {
      a.loop = true;
      a.volume = 0.55;
      a.play()
        .then(() => setMusicOn(true))
        .catch(() => setMusicOn(false));
    }
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-ink/10 bg-black/5 shadow-sm">
      <video
        className="block h-auto w-full"
        autoPlay
        loop
        muted
        playsInline
        preload="metadata"
      >
        <source src={videoSrc} type="video/mp4" />
      </video>
      {musicSrc && (
        <>
          <audio ref={audioRef} src={musicSrc} loop preload="none" />
          <button
            type="button"
            onClick={toggleMusic}
            aria-pressed={musicOn}
            className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur transition hover:bg-ink"
          >
            {musicOn ? "🔊 Music on" : "🔇 Play music"}
          </button>
        </>
      )}
    </div>
  );
}
