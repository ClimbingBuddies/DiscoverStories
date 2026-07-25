"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { getStorageImageUrl } from "@/lib/supabase-storage";

type Props = {
  audioUrl: string;
  title: string;
  description: string;
  storyTitle: string;
  episodeNumber: number;
  seasonNumber: number;
  artworkPath: string | null;
  wordCount: number;
  durationSeconds: number;
  onOpenChange?: (open: boolean) => void;
};

function formatTime(seconds: number): string {
  if (!isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function EpisodeAudioPlayer({
  audioUrl,
  title,
  description,
  storyTitle,
  episodeNumber,
  seasonNumber,
  artworkPath,
  wordCount,
  durationSeconds,
  onOpenChange,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const speed = SPEEDS[speedIndex];
  const durationMinutes = Math.round((durationSeconds ?? 0) / 60);

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

  function handleVolumeChange(e: React.ChangeEvent<HTMLInputElement>) {
    const vol = parseFloat(e.target.value);
    setVolume(vol);
    if (audioRef.current) audioRef.current.volume = vol;
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

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
        <div className="mt-4 basis-full space-y-4 overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
          {/* Artwork Hero */}
          <div className="relative -mx-5 -mt-5 overflow-hidden rounded-t-3xl sm:-mx-6 sm:-mt-6">
            <div className="relative h-64 w-full bg-zinc-950">
              <Image
                src={getStorageImageUrl(artworkPath)}
                alt={title}
                fill
                sizes="100vw"
                className="object-cover"
              />
              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-zinc-900" />
            </div>
          </div>

          {/* Episode Info */}
          <div className="space-y-2">
            <p className="text-sm uppercase tracking-widest text-emerald-400">
              Episode {episodeNumber}
            </p>
            <h2 className="text-3xl font-bold text-white">{title}</h2>
            <p className="text-sm text-zinc-400">{description}</p>
            <p className="text-xs text-zinc-500">
              {wordCount} words · {durationMinutes} minutes
            </p>
          </div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            src={audioUrl}
            onTimeUpdate={(e) => setCurrentTime((e.target as HTMLAudioElement).currentTime)}
            onLoadedMetadata={(e) => setDuration((e.target as HTMLAudioElement).duration)}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => setIsPlaying(false)}
          />

          {/* Player Controls */}
          <div className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            {/* Progress track */}
            <div className="space-y-2">
              <div
                ref={trackRef}
                onClick={handleTrackClick}
                className="relative h-2 cursor-pointer rounded-full bg-zinc-800"
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
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full bg-emerald-400 shadow"
                  style={{ left: `calc(${progress}% - 8px)` }}
                />
              </div>

              {/* Times */}
              <div className="flex justify-between text-xs text-zinc-500">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            {/* Main controls row */}
            <div className="flex items-center justify-between gap-3">
              {/* Skip back */}
              <button
                type="button"
                onClick={() => skip(-15)}
                title="Back 15s"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 7v6h6M21 17a9 9 0 00-9-9 9 9 0 00-9 9"/>
                </svg>
              </button>

              {/* Play/Pause - large central button */}
              <button
                type="button"
                onClick={togglePlay}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-400 text-zinc-950 transition hover:bg-emerald-300"
              >
                {isPlaying ? (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1"/>
                    <rect x="14" y="4" width="4" height="16" rx="1"/>
                  </svg>
                ) : (
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5,3 19,12 5,21"/>
                  </svg>
                )}
              </button>

              {/* Skip forward */}
              <button
                type="button"
                onClick={() => skip(15)}
                title="Forward 15s"
                className="flex h-10 w-10 items-center justify-center rounded-full border border-zinc-700 text-zinc-400 transition hover:border-zinc-500 hover:text-white"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 7v6h-6M3 17a9 9 0 019-9 9 9 0 019 9"/>
                </svg>
              </button>

              {/* Volume control */}
              <div className="flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-zinc-400">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                </svg>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-16 cursor-pointer rounded-full bg-zinc-700 accent-emerald-400"
                />
              </div>

              {/* Speed control */}
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

