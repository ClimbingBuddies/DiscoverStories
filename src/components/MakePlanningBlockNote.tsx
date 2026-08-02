"use client";

import { FormEvent, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type PlannedEpisode = {
  episode_number: number;
  title: string;
};

type Props = {
  storyId: string;
  planningBlockId: string;
  episodeStart: number;
  episodeEnd: number;
  plannedEpisodes: PlannedEpisode[];
};

export default function MakePlanningBlockNote({
  storyId,
  planningBlockId,
  episodeStart,
  episodeEnd,
  plannedEpisodes,
}: Props) {
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<number | "block">("block");
  const [reviewerName, setReviewerName] = useState("");
  const [noteText, setNoteText] = useState("");
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedName = window.localStorage.getItem("discover-stories-note-name");
    if (savedName) setReviewerName(savedName);
  }, []);

  function closeModal() {
    if (saving) return;
    setOpen(false);
    setMessage("");
  }

  async function saveNote(event: FormEvent) {
    event.preventDefault();
    const cleanName = reviewerName.trim();
    const cleanNote = noteText.trim();
    if (!cleanName || !cleanNote) {
      setMessage("Please enter your name and a note.");
      return;
    }

    setSaving(true);
    setMessage("");
    const { error } = await supabase.from("planning_block_review_notes").insert({
      story_id: storyId,
      planning_block_id: planningBlockId,
      episode_number: target === "block" ? null : target,
      reviewer_user_id: null,
      reviewer_name: cleanName,
      note_text: cleanNote,
      status: "open",
    });

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    window.localStorage.setItem("discover-stories-note-name", cleanName);
    setNoteText("");
    setSaving(false);
    setOpen(false);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex-1 rounded-lg border border-cyan-400/50 bg-cyan-500/10 px-4 py-3 text-center font-medium text-cyan-200 transition-colors hover:bg-cyan-400/15"
      >
        Make Notes
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="make-note-title"
          onMouseDown={(event) => {
            if (event.currentTarget === event.target) closeModal();
          }}
        >
          <form
            onSubmit={saveNote}
            className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-950 p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Studio note</p>
                <h2 id="make-note-title" className="mt-1 text-2xl font-semibold text-white">Make Notes</h2>
                <p className="mt-2 text-sm text-zinc-400">
                  Save a comment against the whole planning block or one planned episode. This does not change the Reader.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-zinc-300 hover:bg-zinc-800"
                aria-label="Close notes"
              >
                ×
              </button>
            </div>

            <div className="mt-6 space-y-4">
              <label className="block text-sm font-medium text-zinc-300">
                Note relates to
                <select
                  value={target}
                  onChange={(event) => setTarget(event.target.value === "block" ? "block" : Number(event.target.value))}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white"
                >
                  <option value="block">Whole block: Episodes {episodeStart}–{episodeEnd}</option>
                  {plannedEpisodes.map((episode) => (
                    <option key={episode.episode_number} value={episode.episode_number}>
                      Episode {episode.episode_number}: {episode.title}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-zinc-300">
                Your name
                <input
                  value={reviewerName}
                  onChange={(event) => setReviewerName(event.target.value)}
                  maxLength={100}
                  className="mt-2 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white"
                  placeholder="Reviewer name"
                />
              </label>

              <label className="block text-sm font-medium text-zinc-300">
                Note or recommendation
                <textarea
                  value={noteText}
                  onChange={(event) => setNoteText(event.target.value)}
                  maxLength={5000}
                  rows={7}
                  className="mt-2 w-full resize-y rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-3 text-white"
                  placeholder="What should be checked, clarified or reconsidered?"
                  autoFocus
                />
              </label>
            </div>

            {message ? <p className="mt-4 rounded-lg bg-amber-500/10 px-3 py-2 text-sm text-amber-200">{message}</p> : null}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="flex-1 rounded-lg border border-zinc-700 px-4 py-3 font-medium text-zinc-300 hover:bg-zinc-800 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex-1 rounded-lg bg-emerald-500 px-4 py-3 font-semibold text-zinc-950 hover:bg-emerald-400 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save Note"}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </>
  );
}
