"use client";

import { useEffect, useRef, useState } from "react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { getStorageImageUrl } from "@/lib/supabase-storage";
import { STUDIO_MODE_COOKIE, STUDIO_MODE_STORAGE_KEY } from "@/lib/studio-mode-constants";

type Episode = {
  id: string;
  episode_number: number;
  season_number: number | null;
  title: string;
  summary: string | null;
  audio_url: string | null;
  artwork_path: string | null;
  word_count: number | null;
  duration_seconds: number | null;
  script_text: string | null;
};

type Story = {
  id: string;
  slug: string;
  title: string;
};

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

export default function ListenPage() {
  const params = useParams();
  const slug = params.slug as string;
  const episodeNumber = parseInt(params.episodeNumber as string);

  const audioRef = useRef<HTMLAudioElement>(null);

  const [story, setStory] = useState<Story | null>(null);
  const [episode, setEpisode] = useState<Episode | null>(null);
  const [nextEpisode, setNextEpisode] = useState<{ episode_number: number } | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [speedIndex, setSpeedIndex] = useState(1);
  const [volume, setVolume] = useState(1);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    async function fetchData() {
      try {
        const localStorageValue = window.localStorage.getItem(STUDIO_MODE_STORAGE_KEY);
        const cookieValue = document.cookie
          .split("; ")
          .find((item) => item.startsWith(`${STUDIO_MODE_COOKIE}=`))
          ?.split("=")[1];
        const studioModeEnabled = localStorageValue === "true" || cookieValue === "true";

        // Fetch story
        let storyQuery = supabase
          .from("stories")
          .select("id, slug, title")
          .eq("slug", slug);

        if (!studioModeEnabled) {
          storyQuery = storyQuery.eq("content_status", "published");
        }

        const { data: storyData } = await storyQuery.single();

        if (!storyData) {
          notFound();
        }

        setStory(storyData);

        // Fetch episode
        let episodeQuery = supabase
          .from("episodes")
          .select(
            "id, episode_number, season_number, title, summary, audio_url, artwork_path, word_count, duration_seconds, script_text"
          )
          .eq("story_id", storyData.id)
          .eq("episode_number", episodeNumber);

        if (!studioModeEnabled) {
          episodeQuery = episodeQuery.eq("episode_status", "published");
        }

        const { data: episodeData } = await episodeQuery.single();

        if (!episodeData) {
          notFound();
        }

        setEpisode(episodeData);

        // Fetch next episode
        let nextEpisodeQuery = supabase
          .from("episodes")
          .select("episode_number")
          .eq("story_id", storyData.id)
          .gt("episode_number", episodeNumber)
          .order("episode_number", { ascending: true })
          .limit(1);

        if (!studioModeEnabled) {
          nextEpisodeQuery = nextEpisodeQuery.eq("episode_status", "published");
        }

        const { data: nextEpisodeData } = await nextEpisodeQuery.single();

        if (nextEpisodeData) {
          setNextEpisode(nextEpisodeData);
        }
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [slug, episodeNumber]);

  // Audio handlers
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", updateTime);
    audio.addEventListener("loadedmetadata", updateDuration);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", updateTime);
      audio.removeEventListener("loadedmetadata", updateDuration);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, []);

  // Auto-play on load
  useEffect(() => {
    if (episode?.audio_url && audioRef.current) {
      audioRef.current.play().catch(() => {
        // Auto-play may be blocked by browser
      });
    }
  }, [episode?.audio_url]);

  const formatTime = (seconds: number) => {
    if (!seconds || !isFinite(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  const skip = (seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime + seconds);
    }
  };

  const cycleSpeed = () => {
    const nextIndex = (speedIndex + 1) % SPEEDS.length;
    setSpeedIndex(nextIndex);
    if (audioRef.current) {
      audioRef.current.playbackRate = SPEEDS[nextIndex];
    }
  };

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    if (audioRef.current) {
      audioRef.current.currentTime = percent * duration;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  if (loading || !story || !episode) {
    return (
      <div className="flex h-screen items-center justify-center bg-zinc-950">
        <p className="text-zinc-400">Loading...</p>
      </div>
    );
  }

  if (!episode.audio_url) {
    return (
      <div className="flex h-screen flex-col bg-zinc-950">
        <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
          <Link href={`/stories/${slug}`} className="text-emerald-400 hover:text-emerald-300">
            ← Back to Episodes
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-zinc-100">{episode.title}</h1>
        </header>
        <div className="flex flex-1 items-center justify-center">
          <p className="text-zinc-400">No audio available for this episode.</p>
        </div>
        <footer className="border-t border-zinc-800 bg-zinc-900 px-6 py-4">
          <div className="flex gap-4">
            <Link
              href={`/stories/${slug}`}
              className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
            >
              ← Back
            </Link>
            {episode.script_text && (
              <Link
                href={`/stories/${slug}/episodes/${episode.episode_number}/read`}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
              >
                📖 Read
              </Link>
            )}
            {nextEpisode ? (
              <Link
                href={`/stories/${slug}/episodes/${nextEpisode.episode_number}/listen`}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
              >
                Next →
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center text-zinc-600 cursor-not-allowed text-sm"
              >
                Next →
              </button>
            )}
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-zinc-950 text-zinc-100">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <Link href={`/stories/${slug}`} className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 mb-3">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
          Back to Episodes
        </Link>
        <h1 className="text-2xl font-bold">{episode.title}</h1>
        <p className="text-sm text-zinc-400 mt-1">{story.title}</p>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto px-6 py-8 sm:px-8">
        <div className="max-w-2xl mx-auto">
          {/* Artwork Hero */}
          <div className="mb-8 rounded-3xl overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900 relative h-64 sm:h-80">
            {episode.artwork_path ? (
              <Image
                src={getStorageImageUrl(episode.artwork_path)}
                alt={episode.title}
                fill
                sizes="(max-width: 640px) 100vw, 500px"
                className="object-cover"
              />
            ) : null}
            {/* Fallback */}
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <rect x="3" y="3" width="18" height="18" rx="2" />
                <circle cx="8.5" cy="8.5" r="1.5" />
                <path d="M21 15l-5-5L5 21" />
              </svg>
            </div>
          </div>

          {/* Episode Info */}
          <div className="mb-8">
            <p className="text-sm text-emerald-400 uppercase tracking-wide">Episode {episode.episode_number}</p>
            <h2 className="text-3xl font-bold mb-4">{episode.title}</h2>
            {episode.summary && (
              <p className="text-zinc-300 leading-relaxed text-lg">{episode.summary}</p>
            )}
          </div>
        </div>
      </main>

      {/* Audio Player at Bottom */}
      <footer className="border-t border-zinc-800 bg-zinc-900 p-4 sm:p-6">
        <audio ref={audioRef} src={episode.audio_url} />

        <div className="max-w-2xl mx-auto space-y-4">
          {/* Progress Bar */}
          <div>
            <div
              onClick={handleTrackClick}
              className="h-1 bg-zinc-800 rounded-full cursor-pointer hover:h-2 transition-all group"
            >
              <div
                className="h-full bg-emerald-400 rounded-full transition-all"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {/* Volume */}
              <button className="text-zinc-400 hover:text-zinc-200 transition-colors p-2">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.26 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                </svg>
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={volume}
                onChange={handleVolumeChange}
                className="w-24 h-1 bg-zinc-800 rounded-full appearance-none cursor-pointer accent-emerald-400"
              />
            </div>

            {/* Main Controls */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => skip(-15)}
                className="text-zinc-400 hover:text-emerald-400 transition-colors p-2"
                title="Rewind 15s"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M11 5V1l-5 5 5 5v-4c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L4.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v4l5-5-5-5v4z" />
                </svg>
              </button>

              <button
                onClick={togglePlay}
                className="rounded-full bg-emerald-400 text-zinc-950 p-4 hover:bg-emerald-300 transition-colors"
              >
                {isPlaying ? (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                  </svg>
                ) : (
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              <button
                onClick={() => skip(15)}
                className="text-zinc-400 hover:text-emerald-400 transition-colors p-2"
                title="Forward 15s"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 19v4l5-5-5-5v4c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8zm0-14c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8v-4l-5 5 5 5v-4z" />
                </svg>
              </button>

              <button
                onClick={cycleSpeed}
                className={`rounded-lg px-3 py-1 text-sm font-medium transition-colors ${
                  speedIndex === 1
                    ? "text-zinc-400 hover:text-zinc-200 bg-transparent"
                    : "bg-emerald-900 text-emerald-300 hover:bg-emerald-800"
                }`}
              >
                {SPEEDS[speedIndex]}x
              </button>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 pt-4 border-t border-zinc-800">
            <Link
              href={`/stories/${slug}`}
              className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
            >
              ← Back
            </Link>
            {episode.script_text && (
              <Link
                href={`/stories/${slug}/episodes/${episode.episode_number}/read`}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
              >
                📖 Read
              </Link>
            )}
            {nextEpisode ? (
              <Link
                href={`/stories/${slug}/episodes/${nextEpisode.episode_number}/listen`}
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center hover:bg-zinc-700 transition-colors font-medium text-sm"
              >
                Next →
              </Link>
            ) : (
              <button
                disabled
                className="flex-1 rounded-lg bg-zinc-800 px-4 py-2 text-center text-zinc-600 cursor-not-allowed text-sm"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </footer>
    </div>
  );
}
