"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import EducationReader from "@/components/EducationReader";
import type { EducationDocument } from "@/lib/education-content";
import { supabase } from "@/lib/supabase";

type PlannedEpisode = {
  episode_number: number;
  title: string;
};

type ReviewNote = {
  id: string;
  episode_number: number | null;
  parent_note_id: string | null;
  reviewer_user_id: string | null;
  reviewer_name: string;
  note_text: string;
  status: "open" | "accepted" | "rejected" | "resolved";
  author_response: string | null;
  created_at: string;
  updated_at: string;
};

type Props = {
  storyId: string;
  planningBlockId: string;
  episodeStart: number;
  episodeEnd: number;
  blockTitle: string;
  blockDescription: string;
  plannedEpisodes: PlannedEpisode[];
  readerDocument: EducationDocument;
  initialNotes: ReviewNote[];
};

const statuses: ReviewNote["status"][] = ["open", "accepted", "rejected", "resolved"];

export default function PlanningBlockReviewStudio({
  storyId,
  planningBlockId,
  episodeStart,
  episodeEnd,
  blockTitle,
  blockDescription,
  plannedEpisodes,
  readerDocument,
  initialNotes,
}: Props) {
  const [notes, setNotes] = useState(initialNotes);
  const [selectedEpisode, setSelectedEpisode] = useState<number | "block">("block");
  const [filter, setFilter] = useState<"all" | ReviewNote["status"]>("all");
  const [noteText, setNoteText] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      const user = data.user;
      setUserId(user?.id ?? null);
      if (user) {
        supabase
          .from("profiles")
          .select("display_name")
          .eq("user_id", user.id)
          .maybeSingle()
          .then(({ data: profile }) => setReviewerName(profile?.display_name || user.email || "Reviewer"));
      }
    });
  }, []);

  const visibleNotes = useMemo(
    () => notes.filter((note) => filter === "all" || note.status === filter),
    [notes, filter],
  );

  async function addNote(event: FormEvent) {
    event.preventDefault();
    if (!userId) {
      setMessage("Sign in is required before review notes can be added.");
      return;
    }
    if (!noteText.trim() || !reviewerName.trim()) return;

    setBusy(true);
    setMessage("");
    const payload = {
      story_id: storyId,
      planning_block_id: planningBlockId,
      episode_number: selectedEpisode === "block" ? null : selectedEpisode,
      reviewer_user_id: userId,
      reviewer_name: reviewerName.trim(),
      note_text: noteText.trim(),
      status: "open",
    };

    const { data, error } = await supabase
      .from("planning_block_review_notes")
      .insert(payload)
      .select("*")
      .single();

    if (error) setMessage(error.message);
    else {
      setNotes((current) => [data as ReviewNote, ...current]);
      setNoteText("");
      setMessage("Review note added.");
    }
    setBusy(false);
  }

  async function updateNote(note: ReviewNote, patch: Partial<ReviewNote>) {
    setBusy(true);
    setMessage("");
    const { data, error } = await supabase
      .from("planning_block_review_notes")
      .update(patch)
      .eq("id", note.id)
      .select("*")
      .single();

    if (error) setMessage(error.message);
    else {
      setNotes((current) => current.map((item) => (item.id === note.id ? (data as ReviewNote) : item)));
      setMessage("Review note updated.");
    }
    setBusy(false);
  }

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(360px,0.8fr)]">
      <section className="space-y-6">
        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-6">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-cyan-300">Planning block intention</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">{blockTitle}</h2>
          <p className="mt-4 leading-8 text-zinc-200">{blockDescription}</p>
        </div>
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 p-6">
          <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Reader</p>
          <EducationReader document={readerDocument} />
        </div>
      </section>

      <aside className="space-y-5 rounded-2xl border border-zinc-800 bg-zinc-900/80 p-5">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-300">Review notes</p>
          <p className="mt-2 text-sm text-zinc-400">Comments do not alter the planning block or Reader.</p>
        </div>

        <form onSubmit={addNote} className="space-y-3 rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
          <label className="block text-sm text-zinc-300">
            Comment against
            <select
              value={selectedEpisode}
              onChange={(event) => setSelectedEpisode(event.target.value === "block" ? "block" : Number(event.target.value))}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            >
              <option value="block">Whole block: Episodes {episodeStart}–{episodeEnd}</option>
              {plannedEpisodes.map((episode) => (
                <option key={episode.episode_number} value={episode.episode_number}>
                  Episode {episode.episode_number}: {episode.title}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-zinc-300">
            Reviewer name
            <input
              value={reviewerName}
              onChange={(event) => setReviewerName(event.target.value)}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
          </label>
          <label className="block text-sm text-zinc-300">
            Review comment or recommendation
            <textarea
              value={noteText}
              onChange={(event) => setNoteText(event.target.value)}
              rows={5}
              className="mt-1 w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2"
            />
          </label>
          <button
            type="submit"
            disabled={busy || !userId}
            className="w-full rounded-lg bg-emerald-500 px-4 py-2 font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Add review note
          </button>
          {!userId ? <p className="text-xs text-amber-300">Authenticated reviewer access is required to add notes.</p> : null}
        </form>

        <div className="flex flex-wrap gap-2">
          {(["all", ...statuses] as const).map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setFilter(status)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${filter === status ? "border-emerald-400 bg-emerald-400/15 text-emerald-200" : "border-zinc-700 text-zinc-400"}`}
            >
              {status}
            </button>
          ))}
        </div>

        {message ? <p className="rounded-lg bg-zinc-800 px-3 py-2 text-sm text-zinc-200">{message}</p> : null}

        <div className="space-y-3">
          {visibleNotes.length === 0 ? <p className="text-sm text-zinc-500">No review notes in this filter.</p> : null}
          {visibleNotes.map((note) => (
            <article key={note.id} className="rounded-xl border border-zinc-700 bg-zinc-950/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-white">{note.reviewer_name}</p>
                  <p className="text-xs text-zinc-500">
                    {note.episode_number ? `Episode ${note.episode_number}` : `Episodes ${episodeStart}–${episodeEnd}`}
                    {" · "}{new Date(note.created_at).toLocaleDateString("en-AU")}
                  </p>
                </div>
                <span className="rounded-full border border-zinc-600 px-2 py-1 text-xs uppercase text-zinc-300">{note.status}</span>
              </div>
              <p className="mt-3 whitespace-pre-wrap leading-6 text-zinc-200">{note.note_text}</p>
              {note.author_response ? (
                <div className="mt-3 rounded-lg border-l-2 border-cyan-400 bg-cyan-500/10 p-3 text-sm text-cyan-100">
                  <strong>Author response:</strong> {note.author_response}
                </div>
              ) : null}
              {userId ? (
                <div className="mt-4 space-y-2">
                  <select
                    value={note.status}
                    onChange={(event) => updateNote(note, { status: event.target.value as ReviewNote["status"] })}
                    className="w-full rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm"
                  >
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      const response = window.prompt("Author response", note.author_response ?? "");
                      if (response !== null) updateNote(note, { author_response: response.trim() || null });
                    }}
                    className="w-full rounded-lg border border-cyan-400/40 px-3 py-2 text-sm text-cyan-200"
                  >
                    Add or update response
                  </button>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </aside>
    </div>
  );
}
