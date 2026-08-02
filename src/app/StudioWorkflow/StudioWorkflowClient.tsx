"use client";

import Link from "next/link";
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

type ArchitectureView = "storage" | "access" | "lifecycle";

const architectureViews: {
  id: ArchitectureView;
  label: string;
  description: string;
}[] = [
  {
    id: "storage",
    label: "Storage structure",
    description: "The single physical hierarchy used to organise every story asset.",
  },
  {
    id: "access",
    label: "Access resolution",
    description: "The permission layer applied over the same physical file path.",
  },
  {
    id: "lifecycle",
    label: "Asset lifecycle",
    description: "The controlled path from upload through publication and archive.",
  },
];

const storageBranches = [
  {
    id: "story-assets",
    label: "Story assets",
    path: "story/",
    children: ["cover/", "banner/", "references/"],
  },
  {
    id: "canon",
    label: "Private Canon",
    path: "canon/",
    children: ["characters/", "locations/", "objects/", "visual-tests/"],
  },
  {
    id: "wiki",
    label: "Wiki",
    path: "wiki/",
    children: ["characters/", "locations/", "concepts/"],
  },
  {
    id: "seasons",
    label: "Seasons",
    path: "seasons/{season_id}/",
    children: [
      "season/cover/",
      "season/references/",
      "episodes/{episode_id}/artwork/",
      "episodes/{episode_id}/reader/",
      "episodes/{episode_id}/audio/",
      "episodes/{episode_id}/attachments/",
    ],
  },
];

const accessRules = [
  { role: "Owner / administrator", result: "Full access", tone: "emerald" },
  { role: "Editor", result: "Read, create and update", tone: "cyan" },
  { role: "Reviewer", result: "Read draft and approved assets", tone: "violet" },
  { role: "Reader", result: "Approved assets only", tone: "amber" },
  { role: "No membership", result: "Published assets or access denied", tone: "zinc" },
];

const lifecycleSteps = ["Upload", "Draft", "Review", "Approved", "Published", "Archived"];

const stages: Stage[] = [
  {
    number: 1,
    label: "Private Canon",
    eyebrow: "Stage 1",
    title: "Private Canon — Starting Point",
    status: "Independent foundations",
    introduction:
      "Begin with Private Canon. It is the independent source for characters, places, rules, continuity, visual references and proposed decisions. A Concept Draft may follow, or be developed alongside it.",
    cards: [
      {
        title: "Open the Canon workspace",
        text: "Review or extend the private workspace before story, episode or Wiki content is written. Canon can exist first and remain independently reviewable.",
      },
      {
        title: "Create the Concept Draft",
        text: "Develop the story foundation, Episodes 1–10 and their initial images when the creative direction is ready.",
      },
      {
        title: "Plan Episodes 11–100",
        text: "Store the long-range plan in roadmap blocks without turning planned ranges into playable episodes.",
      },
      {
        title: "Consult Canon for artwork",
        text: "Artwork reads relevant confirmed Canon, approved visual identity and the exact episode context. It never silently establishes new Canon.",
      },
    ],
    exitGate:
      "The selected Canon and Concept Draft foundations are coherent enough for deliberate development.",
  },
  {
    number: 2,
    label: "Creative Development",
    eyebrow: "Stage 2",
    title: "Creative Development",
    status: "Repeatable cycle",
    introduction:
      "Develop Story, Private Canon, Wiki and Artwork as separately owned objects. Each may read the others, but no operation silently rewrites another object.",
    cards: [
      {
        title: "Explore and assess",
        text: "Test ideas, alternatives and story problems, then run a targeted Story Quality Index diagnostic when useful.",
      },
      {
        title: "Develop the selected object",
        text: "Expand or revise only the approved Story, episode, roadmap, Canon, Wiki or artwork scope.",
      },
      {
        title: "Sync independently",
        text: "Private Canon Sync, Story Draft Sync and Wiki Load are separate operations that may run one after another or independently.",
      },
      {
        title: "Reconcile deliberately",
        text: "Report conflicts and downstream effects for approval. Canon changes do not silently publish Wiki content or rewrite episodes.",
      },
    ],
    exitGate:
      "Each approved object has an explicit sync scope and is ready for Studio review.",
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
        text: "Assess episodes, roadmap, Wiki, Private Canon and artwork as separate reviewable objects.",
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
  const [architectureView, setArchitectureView] =
    useState<ArchitectureView>("storage");
  const [expandedStorage, setExpandedStorage] = useState<string[]>(["seasons"]);
  const selected = stages.find((stage) => stage.number === selectedStage);

  function toggleStorageBranch(id: string) {
    setExpandedStorage((current) =>
      current.includes(id)
        ? current.filter((branchId) => branchId !== id)
        : [...current, id],
    );
  }

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
            The production path from Canon-first foundations and Concept Draft through review to publication.
            Select a stage to open its tasks, output and exit decision.
          </p>
          <Link
            href="/StudioCanon"
            className="mt-5 inline-flex items-center justify-center rounded-full border border-violet-400/50 bg-violet-400/10 px-5 py-3 text-sm font-semibold text-violet-200 transition hover:border-violet-300 hover:bg-violet-400/20"
          >
            Open Private Canon Library
          </Link>
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

        <section className="mt-8 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 lg:mt-10">
          <div className="border-b border-zinc-800 p-5 lg:p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-400">
              Platform architecture
            </p>
            <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <h2 className="text-2xl font-semibold tracking-tight lg:text-3xl">
                  Story Storage Architecture
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400 lg:text-base lg:leading-7">
                  Explore how a single private bucket is organised by Story, Season and Episode,
                  then see how access and publishing rules are applied without changing the file path.
                </p>
              </div>
              <span className="w-fit rounded-full border border-emerald-900 bg-emerald-950 px-4 py-2 text-sm font-medium text-emerald-300">
                Private bucket: stories
              </span>
            </div>
          </div>

          <div className="grid lg:grid-cols-[18rem_1fr]">
            <nav className="border-b border-zinc-800 p-3 lg:border-b-0 lg:border-r lg:p-4" aria-label="Storage architecture views">
              <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
                {architectureViews.map((view) => {
                  const active = architectureView === view.id;
                  return (
                    <button
                      key={view.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setArchitectureView(view.id)}
                      className={`rounded-xl border p-4 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                        active
                          ? "border-emerald-500/60 bg-emerald-400/10"
                          : "border-transparent bg-zinc-950/40 hover:border-zinc-700 hover:bg-zinc-950/70"
                      }`}
                    >
                      <span className={`block font-semibold ${active ? "text-emerald-300" : "text-zinc-200"}`}>
                        {view.label}
                      </span>
                      <span className="mt-1 hidden text-xs leading-5 text-zinc-500 lg:block">
                        {view.description}
                      </span>
                    </button>
                  );
                })}
              </div>
            </nav>

            <div className="min-h-[34rem] bg-zinc-950/45 p-4 sm:p-6 lg:p-8">
              {architectureView === "storage" && (
                <div>
                  <div className="mb-6">
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Physical hierarchy</p>
                    <h3 className="mt-1 text-xl font-semibold">Bucket → Story → Season → Episode</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">
                      Select a branch to reveal its folders. Access roles do not create additional folders.
                    </p>
                  </div>

                  <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-zinc-950 p-4 sm:p-6">
                    <div className="rounded-xl border border-emerald-500/50 bg-emerald-400/10 p-4">
                      <span className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-400">Private bucket</span>
                      <p className="mt-1 font-mono text-lg font-semibold text-emerald-200">stories</p>
                    </div>
                    <div className="ml-5 border-l border-zinc-700 py-4 pl-5 sm:ml-8 sm:pl-8">
                      <div className="rounded-xl border border-violet-500/40 bg-violet-400/10 p-4">
                        <span className="text-xs uppercase tracking-[0.14em] text-violet-300">Story ownership boundary</span>
                        <p className="mt-1 font-mono font-semibold text-violet-100">{"{story_id}"}/</p>
                      </div>
                      <div className="mt-3 grid gap-2">
                        {storageBranches.map((branch) => {
                          const open = expandedStorage.includes(branch.id);
                          return (
                            <div key={branch.id} className="rounded-xl border border-zinc-800 bg-zinc-900/80">
                              <button
                                type="button"
                                aria-expanded={open}
                                onClick={() => toggleStorageBranch(branch.id)}
                                className="flex w-full items-center justify-between gap-4 p-4 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-emerald-400"
                              >
                                <span>
                                  <span className="block font-semibold text-zinc-100">{branch.label}</span>
                                  <span className="mt-0.5 block font-mono text-xs text-zinc-500">{branch.path}</span>
                                </span>
                                <span className={`text-xl text-zinc-500 transition-transform ${open ? "rotate-45" : ""}`} aria-hidden="true">+</span>
                              </button>
                              {open && (
                                <div className="border-t border-zinc-800 px-4 py-3">
                                  <div className="grid gap-2 sm:grid-cols-2">
                                    {branch.children.map((child) => (
                                      <div key={child} className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 font-mono text-xs text-zinc-300">
                                        {child}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {architectureView === "access" && (
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Security overlay</p>
                  <h3 className="mt-1 text-xl font-semibold">Access is resolved from the story</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    The application reads the story identifier from the object path, then checks ownership,
                    membership, asset status and story visibility. The object remains in the same location.
                  </p>

                  <div className="mt-7 grid gap-4 xl:grid-cols-[1fr_auto_1fr] xl:items-center">
                    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
                      <p className="text-xs uppercase tracking-[0.15em] text-zinc-500">Requested object</p>
                      <p className="mt-3 break-all font-mono text-sm leading-6 text-emerald-300">
                        {"{story_id}"}/seasons/{"{season_id}"}/episodes/{"{episode_id}"}/artwork/scene-01.jpg
                      </p>
                    </div>
                    <div className="hidden text-2xl text-zinc-600 xl:block" aria-hidden="true">→</div>
                    <div className="rounded-2xl border border-violet-500/30 bg-violet-400/10 p-5">
                      <p className="text-xs uppercase tracking-[0.15em] text-violet-300">Policy decision</p>
                      <p className="mt-2 font-semibold">Check story membership and asset status</p>
                    </div>
                  </div>

                  <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {accessRules.map((rule) => (
                      <div key={rule.role} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                        <p className="text-sm font-semibold text-zinc-200">{rule.role}</p>
                        <p className="mt-2 text-xs leading-5 text-zinc-500">{rule.result}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-xl border border-amber-500/25 bg-amber-400/5 p-4 text-sm leading-6 text-amber-100/80">
                    Public, shared and private are database visibility states—not additional storage folders.
                  </div>
                </div>
              )}

              {architectureView === "lifecycle" && (
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Controlled publishing</p>
                  <h3 className="mt-1 text-xl font-semibold">One asset, changing workflow status</h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
                    Workflow state belongs to the media record. Progressing an asset does not require moving it
                    between Private, Public or ToBeFiled folders.
                  </p>

                  <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6 xl:items-center">
                    {lifecycleSteps.map((step, index) => (
                      <div key={step} className="relative">
                        <div className={`rounded-xl border p-4 text-center ${
                          step === "Published"
                            ? "border-emerald-500/50 bg-emerald-400/10 text-emerald-200"
                            : "border-zinc-800 bg-zinc-950 text-zinc-200"
                        }`}>
                          <span className="text-xs text-zinc-500">{index + 1}</span>
                          <p className="mt-1 font-semibold">{step}</p>
                        </div>
                        {index < lifecycleSteps.length - 1 && (
                          <span className="absolute -right-3 top-1/2 z-10 hidden -translate-y-1/2 text-zinc-600 xl:block" aria-hidden="true">→</span>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="font-semibold">Storage path</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">Remains stable throughout the lifecycle.</p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="font-semibold">Media record</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">Stores workflow status, role and approval.</p>
                    </div>
                    <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                      <p className="font-semibold">Reader resolution</p>
                      <p className="mt-1 text-sm leading-6 text-zinc-500">Displays only the permitted approved version.</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
