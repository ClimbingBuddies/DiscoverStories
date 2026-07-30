import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Studio Workflow | Discover Stories",
  description:
    "The expandable Audio Platform workflow from initial draft through publication.",
};

const stages = [
  {
    number: "01",
    title: "Initial Draft",
    subtitle: "Build the complete starting package",
    accent: "border-sky-400/60",
    numberStyle: "bg-sky-400/10 text-sky-300 ring-sky-400/30",
    tasks: [
      "Define the story concept, premise, audience and central dramatic question.",
      "Establish the major characters, setting and world foundations.",
      "Draft Episodes 1–10 and map roadmap blocks for Episodes 11–100.",
      "Prepare the initial Wiki material, Private Canon and artwork direction.",
      "Run the first Story Quality Index assessment.",
    ],
    output: "A coherent starting package ready for deliberate creative development.",
    gate: "Is the initial package complete enough to develop?",
  },
  {
    number: "02",
    title: "Creative Development",
    subtitle: "Improve selected material through repeatable tasks",
    accent: "border-violet-400/60",
    numberStyle: "bg-violet-400/10 text-violet-300 ring-violet-400/30",
    tasks: [
      "Explore and discuss story ideas, alternatives and problems.",
      "Run a targeted Story Quality Index diagnostic.",
      "Expand or rewrite selected episodes and roadmap blocks.",
      "Develop character arcs, continuity and artwork briefs.",
      "Record authoritative story rules, secrets and future revelations in Private Canon.",
      "Periodically update reader-facing Wiki entries from approved canon.",
      "Approve a clearly defined scope for Supabase Draft Sync.",
    ],
    output:
      "An approved content scope. Private Canon controls story truth; the Wiki controls how that truth is presented.",
    gate: "Is this exact scope approved for Draft Sync and Studio review?",
  },
  {
    number: "03",
    title: "Studio Review",
    subtitle: "Assess a fixed Supabase version",
    accent: "border-amber-400/60",
    numberStyle: "bg-amber-400/10 text-amber-300 ring-amber-400/30",
    tasks: [
      "Sync only the approved scope to Supabase as Draft or Review.",
      "Verify the records and confirm the website can display them.",
      "Review episodes, roadmap blocks, Wiki, Private Canon and artwork in Studio mode.",
      "Collect feedback without silently changing the reviewed version.",
      "Approve the version or return a defined scope to Creative Development.",
    ],
    output: "A reviewed version with a clear approval or revision decision.",
    gate: "Has the fixed review version been approved for publication?",
  },
  {
    number: "04",
    title: "Publish",
    subtitle: "Release only approved public content",
    accent: "border-emerald-400/60",
    numberStyle: "bg-emerald-400/10 text-emerald-300 ring-emerald-400/30",
    tasks: [
      "Confirm the reviewed version, artwork links and publication requirements.",
      "Keep roadmap-only records non-playable.",
      "Check Wiki reveal rules and ensure Private Canon remains Studio-only.",
      "Publish only the explicitly approved records.",
      "Verify the public website after release.",
    ],
    output:
      "Published episodes and approved public Wiki content. Private Canon remains private.",
    gate: "Has the public release been verified?",
  },
];

export default function StudioWorkflowPage() {
  return (
    <main className="min-h-screen bg-zinc-950 px-5 py-12 text-white sm:px-8 sm:py-16">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.24em] text-emerald-400">
            Audio Platform
          </p>
          <h1 className="max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">
            Studio Workflow
          </h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-zinc-400 sm:text-lg">
            The production path from the first complete draft to publication.
            Select a stage to see its tasks, output and exit decision.
          </p>
        </header>

        <section aria-label="Studio production workflow">
          <div className="grid gap-3 lg:grid-cols-4">
            {stages.map((stage, index) => (
              <div key={stage.number} className="flex items-center gap-3 lg:contents">
                <div
                  className={`hidden h-px bg-zinc-700 lg:block ${
                    index === 0 ? "lg:hidden" : ""
                  }`}
                  aria-hidden="true"
                />
                <span
                  className={`grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-bold ring-1 lg:hidden ${stage.numberStyle}`}
                  aria-hidden="true"
                >
                  {stage.number}
                </span>
                <div className="min-w-0 flex-1 rounded-xl border border-zinc-800 bg-zinc-900/70 px-4 py-3">
                  <p className="font-semibold text-zinc-100">{stage.title}</p>
                  <p className="mt-1 text-xs leading-5 text-zinc-500">{stage.subtitle}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="my-8 hidden h-px bg-gradient-to-r from-sky-400/40 via-violet-400/40 to-emerald-400/40 lg:block" />

          <div className="space-y-4">
            {stages.map((stage) => (
              <details
                key={stage.number}
                className={`group overflow-hidden rounded-2xl border bg-zinc-900/60 transition-colors open:bg-zinc-900 ${stage.accent}`}
              >
                <summary className="flex cursor-pointer list-none items-center gap-4 px-5 py-5 outline-none marker:hidden sm:px-6 [&::-webkit-details-marker]:hidden">
                  <span
                    className={`grid h-11 w-11 shrink-0 place-items-center rounded-full text-sm font-bold ring-1 ${stage.numberStyle}`}
                  >
                    {stage.number}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-lg font-semibold text-zinc-100">
                      {stage.title}
                    </span>
                    <span className="mt-1 block text-sm text-zinc-400">
                      {stage.subtitle}
                    </span>
                  </span>
                  <span
                    className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-zinc-700 text-xl text-zinc-400 transition-transform group-open:rotate-45 group-open:border-emerald-400/50 group-open:text-emerald-300"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </summary>

                <div className="border-t border-zinc-800 px-5 py-6 sm:px-6">
                  <div className="grid gap-7 lg:grid-cols-[1.35fr_0.65fr]">
                    <div>
                      <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-zinc-500">
                        Tasks
                      </h2>
                      <ol className="mt-4 space-y-3">
                        {stage.tasks.map((task, taskIndex) => (
                          <li key={task} className="flex gap-3 text-sm leading-6 text-zinc-300">
                            <span className="mt-0.5 text-xs font-semibold text-zinc-600">
                              {String(taskIndex + 1).padStart(2, "0")}
                            </span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <aside className="space-y-4">
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-400">
                          Output
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">{stage.output}</p>
                      </div>
                      <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-4">
                        <h2 className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
                          Exit gate
                        </h2>
                        <p className="mt-2 text-sm leading-6 text-zinc-300">{stage.gate}</p>
                      </div>
                    </aside>
                  </div>
                </div>
              </details>
            ))}
          </div>
        </section>

        <section className="mt-10 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-zinc-100">Two deliberate loops</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl bg-zinc-950/60 p-4">
              <p className="font-medium text-violet-300">Creative loop</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Explore, develop and assess as often as needed before approving a scope for review.
              </p>
            </div>
            <div className="rounded-xl bg-zinc-950/60 p-4">
              <p className="font-medium text-amber-300">Review loop</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                Requested changes return to Creative Development and require a new explicit Draft Sync.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
