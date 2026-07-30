"use client";

import { useState } from "react";

type Stage = {
  number: number;
  label: string;
  eyebrow: string;
  title: string;
  status: string;
  introduction: string;
  cards: { title: string; text: string }[];
  exitGate: string;
};

const stages: Stage[] = [
  {
    number: 1,
    label: "Initial Draft",
    eyebrow: "Stage 1",
    title: "Initial Draft",
    status: "Working material",
    introduction:
      "Create the coherent starting package that gives Creative Development something substantial to improve.",
    cards: [
      {
        title: "Story foundation",
        text: "Premise, audience, dramatic question and stable story identity.",
      },
      {
        title: "Opening material",
        text: "Episodes 1–10 at the agreed initial-draft depth.",
      },
      {
        title: "Long-range plan",
        text: "Roadmap blocks for Episodes 11–100.",
      },
      {
        title: "Creative foundations",
        text: "Characters, world, art direction and initial canon.",
      },
    ],
    exitGate:
      "Initial package is complete enough for deliberate development.",
  },
  {
    number: 2,
    label: "Creative Development",
    eyebrow: "Stage 2",
    title: "Creative Development",
    status: "Repeatable cycle",
    introduction:
      "Improve selected material through focused, repeatable creative operations without automatically changing the review version.",
    cards: [
      {
        title: "Explore and discuss",
        text: "Test ideas, alternatives, story problems and character choices.",
      },
      {
        title: "Assess quality",
        text: "Run a targeted Story Quality Index diagnostic.",
      },
      {
        title: "Develop selected scope",
        text: "Expand or rewrite episodes, roadmap blocks, arcs and artwork briefs.",
      },
      {
        title: "Maintain story truth",
        text: "Update Private Canon during development and periodically prepare Wiki changes.",
      },
    ],
    exitGate:
      "The exact scope is approved for Supabase Draft Sync and Studio review.",
  },
  {
    number: 3,
    label: "Studio Review",
    eyebrow: "Stage 3",
    title: "Studio Review",
    status: "Fixed review version",
    introduction:
      "Assess a verified Supabase version without silently changing the material being reviewed.",
    cards: [
      {
        title: "Draft sync",
        text: "Load only the approved scope as Draft or Review.",
      },
      {
        title: "Verify visibility",
        text: "Confirm the records exist and the Studio website can display them.",
      },
      {
        title: "Review together",
        text: "Assess episodes, roadmap, Wiki, Private Canon and artwork.",
      },
      {
        title: "Make the decision",
        text: "Approve the version or return a defined scope to Creative Development.",
      },
    ],
    exitGate:
      "The fixed review version is explicitly approved for publication.",
  },
  {
    number: 4,
    label: "Publish",
    eyebrow: "Stage 4",
    title: "Publish",
    status: "Public release",
    introduction:
      "Release only the approved public content while keeping internal planning and Private Canon protected.",
    cards: [
      {
        title: "Readiness check",
        text: "Confirm the reviewed version, artwork links and publication requirements.",
      },
      {
        title: "Visibility check",
        text: "Keep roadmap-only content non-playable and Private Canon Studio-only.",
      },
      {
        title: "Publish approved records",
        text: "Change only the explicitly approved public records.",
      },
      {
        title: "Verify the release",
        text: "Confirm the public website displays the correct version.",
      },
    ],
    exitGate:
      "The intended public release has been checked and verified.",
  },
];

export default function StudioWorkflowClient() {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);
  const selected = stages.find((stage) => stage.number === selectedStage);

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-zinc-900 sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Audio Platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Studio Workflow
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600 sm:text-base">
            The production path from the first complete draft to publication.
            Select a stage to open its tasks, output and exit decision.
          </p>
        </header>

        <section aria-label="Studio production workflow">
          <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
            {stages.map((stage, index) => {
              const active = selectedStage === stage.number;
              return (
                <div key={stage.number} className="contents">
                  {index > 0 && (
                    <span
                      className="hidden text-center text-zinc-400 md:block"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  )}
                  <button
                    type="button"
                    aria-expanded={active}
                    aria-controls="workflow-stage-panel"
                    onClick={() =>
                      setSelectedStage(active ? null : stage.number)
                    }
                    className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${
                      active
                        ? "border-blue-500 bg-blue-500 text-white"
                        : "border-zinc-300 bg-zinc-100 text-zinc-900 hover:border-zinc-400 hover:bg-zinc-200"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm ${
                        active
                          ? "border-white text-white"
                          : "border-zinc-700 text-zinc-900"
                      }`}
                    >
                      {stage.number}
                    </span>
                    <span className="font-semibold leading-5">{stage.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {selected && (
            <article
              id="workflow-stage-panel"
              className="mt-2 rounded-2xl border border-zinc-300 bg-zinc-100 p-4 sm:p-5"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    {selected.eyebrow}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold">{selected.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-600">
                    {selected.introduction}
                  </p>
                </div>
                <span className="w-fit shrink-0 rounded-full bg-blue-100 px-4 py-2 text-sm text-zinc-700">
                  {selected.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {selected.cards.map((card) => (
                  <section
                    key={card.title}
                    className="rounded-xl border border-zinc-300 bg-zinc-200/70 p-4"
                  >
                    <h3 className="font-semibold">{card.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-500">
                      {card.text}
                    </p>
                  </section>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-zinc-300 pt-4 text-sm sm:flex-row sm:gap-5">
                <strong>Exit gate</strong>
                <p className="text-zinc-700">{selected.exitGate}</p>
              </div>
            </article>
          )}

          {!selected && (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Select a stage to view its details.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-300 bg-zinc-50 p-5">
          <h2 className="font-semibold">Two deliberate loops</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="font-medium text-violet-700">Creative loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Explore, develop and assess as often as needed before approving
                a scope for review.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-100 p-4">
              <p className="font-medium text-amber-700">Review loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-600">
                Requested changes return to Creative Development and require a
                new explicit Draft Sync.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
