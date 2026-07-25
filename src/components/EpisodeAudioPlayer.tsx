"use client";

import { useState } from "react";

export default function EpisodeAudioPlayer({ audioUrl }: { audioUrl: string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-4 py-2 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
      >
        {open ? "Close" : "Play"}
      </button>

      {open ? (
        <audio
          controls
          autoPlay
          src={audioUrl}
          className="w-full rounded-xl"
        >
          Your browser does not support the audio element.
        </audio>
      ) : null}
    </div>
  );
}
