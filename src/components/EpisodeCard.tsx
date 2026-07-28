"use client";

import Image from "next/image";
import Link from "next/link";
import { getStorageImageUrl } from "@/lib/supabase-storage";

type Episode = {
  id: string;
  episode_number: number;
  episode_end_number: number | null;
  season_number: number | null;
  title: string;
  summary: string | null;
  word_count: number | null;
  duration_seconds: number | null;
  audio_url: string | null;
  artwork_path: string | null;
};

type Props = {
  episode: Episode;
  storySlug: string;
  storyTitle: string;
};

export default function EpisodeCard({ episode, storySlug }: Props) {
  const durationMinutes = episode.duration_seconds ? Math.round(episode.duration_seconds / 60) : 0;
  const wordCount = episode.word_count ?? 0;
  const episodeLabel = episode.episode_end_number
    ? `Episodes ${episode.episode_number}–${episode.episode_end_number}`
    : `Episode ${episode.episode_number}`;

  return (
    <article className="rounded-3xl border border-zinc-800 bg-zinc-900 p-5 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-[320px_minmax(0,1fr)]">
        <div className="relative overflow-hidden rounded-3xl bg-zinc-950">
          <div className="aspect-[4/3] sm:aspect-[5/4]">
            {episode.artwork_path ? (
              <Image
                src={getStorageImageUrl(episode.artwork_path)}
                alt={episode.title}
                fill
                sizes="(max-width: 640px) 100vw, 320px"
                className="z-10 object-cover"
                onError={(e) => {
                  const img = e.currentTarget as HTMLImageElement;
                  img.style.display = "none";
                }}
              />
            ) : null}
            <div className="absolute inset-0 z-0 flex items-center justify-center bg-gradient-to-br from-zinc-800 to-zinc-900 text-zinc-600">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <circle cx="8.5" cy="8.5" r="1.5"/>
                <path d="M21 15l-5-5L5 21"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-emerald-400">
              {episodeLabel}
            </p>
            <h3 className="mt-2 text-xl font-semibold text-white">{episode.title}</h3>
            {episode.summary && <p className="mt-3 text-zinc-400">{episode.summary}</p>}
          </div>

          <div className="mt-4 space-y-3">
            <p className="text-sm text-zinc-500">
              {wordCount > 0 && `${wordCount} words`}
              {wordCount > 0 && durationMinutes > 0 && " · "}
              {durationMinutes > 0 && `${durationMinutes} minutes`}
            </p>

            <div className="flex flex-wrap gap-3">
              {episode.audio_url ? (
                <Link
                  href={`/stories/${storySlug}/episodes/${episode.episode_number}/listen`}
                  className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
                >
                  Play
                </Link>
              ) : (
                <span className="inline-flex items-center justify-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-500">
                  No audio
                </span>
              )}

              <Link
                href={`/stories/${storySlug}/episodes/${episode.episode_number}/read`}
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/90 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-300"
              >
                Read
              </Link>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
