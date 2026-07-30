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
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-white sm:px-8 sm:py-14">
      <div className="mx-auto max-w-5xl lg:max-w-7xl xl:max-w-[90rem]">
        <header className="mb-8 lg:mb-12">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">
            Audio Platform
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Studio Workflow
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400 sm:text-base lg:max-w-4xl lg:text-lg lg:leading-8">
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
                      className="hidden text-center text-zinc-600 md:block"
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
                    className={`flex min-h-16 w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors lg:min-h-24 lg:gap-4 lg:px-6 lg:py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                      active
                        ? "border-emerald-400 bg-emerald-400 text-zinc-950 shadow-[0_0_0_1px_rgba(52,211,153,0.15)]"
                        : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800"
                    }`}
                  >
                    <span
                      className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border text-sm lg:h-11 lg:w-11 lg:text-base ${
                        active
                          ? "border-zinc-950/70 text-zinc-950"
                          : "border-zinc-600 text-zinc-300"
                      }`}
                    >
                      {stage.number}
                    </span>
                    <span className="font-semibold leading-5 lg:text-lg lg:leading-6 xl:text-xl">{stage.label}</span>
                  </button>
                </div>
              );
            })}
          </div>

          {selected && (
            <article
              id="workflow-stage-panel"
              className="mt-3 rounded-2xl border border-zinc-800 bg-zinc-900 p-4 shadow-2xl shadow-black/20 sm:p-5 lg:mt-5 lg:p-8 xl:p-10"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:gap-8">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                    {selected.eyebrow}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-emerald-400 lg:text-3xl">{selected.title}</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-zinc-400 lg:max-w-5xl lg:text-base lg:leading-7">
                    {selected.introduction}
                  </p>
                </div>
                <span className="w-fit shrink-0 rounded-full border border-emerald-900 bg-emerald-950 px-4 py-2 text-sm text-emerald-300 lg:px-5 lg:py-2.5 lg:text-base">
                  {selected.status}
                </span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:mt-7 lg:gap-5">
                {selected.cards.map((card) => (
                  <section
                    key={card.title}
                    className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 lg:p-6"
                  >
                    <h3 className="font-semibold lg:text-lg">{card.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-zinc-400 lg:text-base lg:leading-7">
                      {card.text}
                    </p>
                  </section>
                ))}
              </div>

              <div className="mt-4 flex flex-col gap-1 border-t border-zinc-800 pt-4 text-sm sm:flex-row sm:gap-5 lg:mt-7 lg:pt-6 lg:text-base">
                <strong>Exit gate</strong>
                <p className="text-zinc-400">{selected.exitGate}</p>
              </div>
            </article>
          )}

          {!selected && (
            <p className="mt-4 text-center text-sm text-zinc-500">
              Select a stage to view its details.
            </p>
          )}
        </section>

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:mt-10 lg:p-8">
          <h2 className="font-semibold lg:text-xl">Two deliberate loops</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="font-medium text-violet-400">Creative loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Explore, develop and assess as often as needed before approving
                a scope for review.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="font-medium text-amber-400">Review loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
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
