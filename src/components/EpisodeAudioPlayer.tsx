"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  audioUrl: string;
  onOpenChange?: (open: boolean) => void;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function EpisodeAudioPlayer({ audioUrl, onOpenChange }: Props) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const speed = SPEEDS[speedIndex];

  useEffect(() => {
    if (open && audioRef.current) {
      audioRef.current.play().catch(() => {});
    }
  }, [open]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, audio.duration));
  }

  function cycleSpeed() {
    const next = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(next);
    if (audioRef.current) audioRef.current.playbackRate = SPEEDS[next];
  }

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    const audio = audioRef.current;
    const track = trackRef.current;
    if (!audio || !track || !duration) return;
    const rect = track.getBoundingClientRect();
    const ratio = (e.clientX - rect.left) / rect.width;
    audio.currentTime = ratio * duration;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  const waveBars = [8, 12, 16, 10, 14, 8, 18, 11, 15, 9, 13, 17, 10, 12, 8, 16, 11, 14, 9, 13, 7, 15, 12, 18, 10];
  const wavePlayedCount = Math.round((progress / 100) * waveBars.length);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => {
          const next = !open;
          setOpen(next);
          onOpenChange?.(next);
        }}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
      >
        {open ? "Close" : "Play"}
      </button>

      {open ? (
        <div className="mt-4 basis-full overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950">
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          <div className="flex items-center gap-4 p-4">
            {/* Waveform + progress */}
            <div className="min-w-0 flex-1 space-y-2">
              {/* Waveform */}
              <div className="flex items-end gap-[3px]" aria-hidden="true">
                {waveBars.map((h, i) => (
                  <div
                    key={i}
                    style={{ height: `${h}px` }}
                    className={`w-[3px] rounded-full transition-colors ${
                      i < wavePlayedCount ? "bg-emerald-400" : "bg-zinc-700"
                    }`}
                  />
                ))}
              </div>

              {/* Progress track */}
              <div
                ref={trackRef}
                onClick={handleTrackClick}
                className="relative h-1.5 cursor-pointer rounded-full bg-zinc-800"
                role="slider"
                aria-label="Seek"
                aria-valuenow={Math.round(currentTime)}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
              >
                <div
                  className="absolute inset-y-0 left-0 rounded-full bg-emerald-400"
                  style={{ width: `${progress}%` }}
                />
                <div
                  className="absolute top-1/2 h-3.5 w-3.5 -translate-y-1/2 rounded-full bg-emerald-400 shadow"
                  style={{ left: `calc(${progress}% - 7px)` }}
                />
              </div>

              {/* Times */}
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => skip(-15)}
                title="Back 15s"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 12a9.5 9.5 0 1 1 .5 3"/>
                  <polyline points="2 7 2 12 7 12"/>
                  <text x="7.5" y="15.5" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold" textAnchor="middle">15</text>
                </svg>
              </button>

              <button
                type="button"
                onClick={togglePlay}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 transition hover:bg-emerald-300"
              >
                {isPlaying ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={() => skip(15)}
                title="Forward 15s"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21.5 12a9.5 9.5 0 1 0-.5 3"/>
                  <polyline points="22 7 22 12 17 12"/>
                  <text x="16.5" y="15.5" fontSize="6.5" fill="currentColor" stroke="none" fontWeight="bold" textAnchor="middle">15</text>
                </svg>
              </button>

              <button
                type="button"
                onClick={cycleSpeed}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-bold text-emerald-400 transition hover:border-emerald-400"
              >
                {speed === 1 ? "1×" : `${speed}×`}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
