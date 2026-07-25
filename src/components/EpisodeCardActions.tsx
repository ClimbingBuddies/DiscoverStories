"use client";

import Link from "next/link";
import { useState } from "react";
import EpisodeAudioPlayer from "@/components/EpisodeAudioPlayer";

type Props = {
  audioUrl: string | null;
  readHref: string;
  wordCount: number;
  durationMinutes: number;
};

export default function EpisodeCardActions({ audioUrl, readHref, wordCount, durationMinutes }: Props) {
  const [playerOpen, setPlayerOpen] = useState(false);

  return (
    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      {!playerOpen ? (
        <p className="text-sm text-zinc-500">
          {wordCount} words · {durationMinutes} minutes
        </p>
      ) : (
        <div />
      )}

      <div className="flex flex-wrap items-center gap-3">
        {audioUrl ? (
          <EpisodeAudioPlayer audioUrl={audioUrl} onOpenChange={setPlayerOpen} />
        ) : (
          <span className="inline-flex items-center justify-center rounded-full bg-zinc-800 px-4 py-2 text-sm font-semibold text-zinc-500">
            No audio
          </span>
        )}

        {!playerOpen ? (
          <Link
            href={readHref}
            className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950/90 px-4 py-2 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-300"
          >
            Read
          </Link>
        ) : null}
      </div>
    </div>
  );
}
