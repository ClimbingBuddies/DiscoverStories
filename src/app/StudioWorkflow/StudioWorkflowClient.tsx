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

type DomainId = "story" | "image" | "canon" | "wiki" | "security";

type WorkflowDomain = {
  id: DomainId;
  label: string;
  description: string;
  stages: Stage[];
};

const domains: WorkflowDomain[] = [
  {
    id: "story",
    label: "Story Creation",
    description: "Narrative design, episode planning, drafting and publishing.",
    stages: [
      {
        number: 1,
        label: "Private",
        eyebrow: "Story • Private",
        title: "Private Story Foundations",
        status: "Internal planning",
        introduction: "Define concept, season shape, and episode intent before broader review.",
        cards: [
          { title: "Set story brief", text: "Capture premise, audience, and desired tone." },
          { title: "Outline arc", text: "Map season arc and episode-level progression." },
          { title: "Track dependencies", text: "Link canon assumptions and unresolved questions." },
          { title: "Prepare draft scope", text: "Choose what moves into the creative stage." },
        ],
        exitGate: "The story concept and scope are clear enough to draft.",
      },
      {
        number: 2,
        label: "Creative",
        eyebrow: "Story • Creative",
        title: "Creative Story Development",
        status: "Drafting in progress",
        introduction: "Write, revise and structure narrative content with explicit scope control.",
        cards: [
          { title: "Draft chapters", text: "Produce narrative draft content for selected episodes." },
          { title: "Refine voice", text: "Adjust pacing, tone and dialogue consistency." },
          { title: "Evaluate quality", text: "Run editorial checks before review packaging." },
          { title: "Bundle review version", text: "Prepare a fixed candidate for review." },
        ],
        exitGate: "A review-ready narrative version has been locked.",
      },
      {
        number: 3,
        label: "Review",
        eyebrow: "Story • Review",
        title: "Story Review",
        status: "Decision point",
        introduction: "Assess the fixed story version and determine approve or return changes.",
        cards: [
          { title: "Read as audience", text: "Validate clarity, momentum and emotional coherence." },
          { title: "Check continuity", text: "Confirm canon and timeline consistency." },
          { title: "Record feedback", text: "Document exact changes instead of broad notes." },
          { title: "Approve or return", text: "Move forward or reopen a defined creative scope." },
        ],
        exitGate: "Story version is explicitly approved for publication.",
      },
      {
        number: 4,
        label: "Public",
        eyebrow: "Story • Public",
        title: "Story Publication",
        status: "Released output",
        introduction: "Publish only approved story records and verify the visible output.",
        cards: [
          { title: "Confirm payload", text: "Publish only records tied to the approved version." },
          { title: "Protect private notes", text: "Keep internal planning and drafts hidden." },
          { title: "Release", text: "Promote approved records to the live environment." },
          { title: "Validate", text: "Confirm the public reader shows the intended version." },
        ],
        exitGate: "The correct public story experience is verified live.",
      },
    ],
  },
  {
    id: "image",
    label: "Image Creation",
    description: "Cover, banner and episode artwork generation and release.",
    stages: [
      {
        number: 1,
        label: "Private",
        eyebrow: "Image • Private",
        title: "Private Image Brief",
        status: "Reference setup",
        introduction: "Define visual intent, references and constraints before generation.",
        cards: [
          { title: "Set style direction", text: "Pick reference language and quality target." },
          { title: "Collect canon cues", text: "Lock character, location and object constraints." },
          { title: "Plan asset list", text: "Define cover, banner and episode image needs." },
          { title: "Approve prompt scope", text: "Confirm what enters creative production." },
        ],
        exitGate: "Visual brief is approved for artwork generation.",
      },
      {
        number: 2,
        label: "Creative",
        eyebrow: "Image • Creative",
        title: "Creative Image Production",
        status: "Generation cycle",
        introduction: "Generate options, iterate and curate toward production quality.",
        cards: [
          { title: "Generate variants", text: "Produce candidate assets for required slots." },
          { title: "Refine composition", text: "Adjust framing, readability and focal hierarchy." },
          { title: "Run quality checks", text: "Screen for artifacts and consistency issues." },
          { title: "Prepare review set", text: "Package selected assets with notes." },
        ],
        exitGate: "Final candidate set is ready for formal review.",
      },
      {
        number: 3,
        label: "Review",
        eyebrow: "Image • Review",
        title: "Image Review",
        status: "Selection and sign-off",
        introduction: "Review selected assets against story intent and canon accuracy.",
        cards: [
          { title: "Assess fit", text: "Validate story alignment and recognizability." },
          { title: "Check consistency", text: "Compare across episodes and format sizes." },
          { title: "Capture fixes", text: "Return precise edit requests where needed." },
          { title: "Approve set", text: "Mark final assets for release." },
        ],
        exitGate: "Approved artwork set is frozen for publication.",
      },
      {
        number: 4,
        label: "Public",
        eyebrow: "Image • Public",
        title: "Image Publication",
        status: "Live media",
        introduction: "Publish approved image assets and verify delivery in the experience.",
        cards: [
          { title: "Attach media links", text: "Bind approved assets to story and episode records." },
          { title: "Publish assets", text: "Promote approved files to public visibility." },
          { title: "Verify rendering", text: "Confirm correct images appear in UI contexts." },
          { title: "Archive alternates", text: "Retain non-selected variants as internal references." },
        ],
        exitGate: "Public image delivery is accurate and complete.",
      },
    ],
  },
  {
    id: "canon",
    label: "Canon Creation",
    description: "Private continuity design and controlled synchronization.",
    stages: [
      {
        number: 1,
        label: "Private",
        eyebrow: "Canon • Private",
        title: "Private Canon Foundations",
        status: "Internal source of truth",
        introduction: "Define people, places, rules and timeline anchors privately.",
        cards: [
          { title: "Create entities", text: "Add foundational canon records and relationships." },
          { title: "Set constraints", text: "Capture immutable rules and exclusions." },
          { title: "Version decisions", text: "Record proposal and approval history." },
          { title: "Scope sync", text: "Choose canon records for downstream use." },
        ],
        exitGate: "Canon scope is consistent and ready for controlled use.",
      },
      {
        number: 2,
        label: "Creative",
        eyebrow: "Canon • Creative",
        title: "Creative Canon Expansion",
        status: "Iterative modeling",
        introduction: "Expand and refine canon as story and artwork needs evolve.",
        cards: [
          { title: "Add depth", text: "Extend biographies, history and location context." },
          { title: "Resolve conflicts", text: "Consolidate contradictory or duplicate records." },
          { title: "Link references", text: "Attach visual and narrative anchors." },
          { title: "Freeze candidate", text: "Prepare a reviewable canon slice." },
        ],
        exitGate: "Canon candidate is coherent for review.",
      },
      {
        number: 3,
        label: "Review",
        eyebrow: "Canon • Review",
        title: "Canon Review",
        status: "Governance checkpoint",
        introduction: "Review canon candidate for continuity reliability and downstream safety.",
        cards: [
          { title: "Continuity audit", text: "Check timeline and relationship consistency." },
          { title: "Impact review", text: "Identify affected story and media records." },
          { title: "Request amendments", text: "Capture changes as explicit actions." },
          { title: "Approve slice", text: "Mark records ready for controlled release." },
        ],
        exitGate: "Approved canon slice is ready for controlled publication.",
      },
      {
        number: 4,
        label: "Public",
        eyebrow: "Canon • Public",
        title: "Canon Publication",
        status: "Selective exposure",
        introduction: "Publish only canon records intended for external consumption.",
        cards: [
          { title: "Filter for public", text: "Exclude private-only canon details and spoilers." },
          { title: "Sync approved records", text: "Promote selected canon to public-facing systems." },
          { title: "Validate references", text: "Ensure links resolve for story and wiki pages." },
          { title: "Monitor drift", text: "Track divergence between private and public canon." },
        ],
        exitGate: "Public canon slice is consistent and intentionally limited.",
      },
    ],
  },
  {
    id: "wiki",
    label: "Wiki",
    description: "Audience-facing knowledge pages with spoiler and lifecycle controls.",
    stages: [
      {
        number: 1,
        label: "Private",
        eyebrow: "Wiki • Private",
        title: "Private Wiki Drafting",
        status: "Unpublished entries",
        introduction: "Draft and structure entries before public release decisions.",
        cards: [
          { title: "Create entries", text: "Draft pages for characters, places and concepts." },
          { title: "Assign spoiler levels", text: "Tag visibility boundaries by story progress." },
          { title: "Link sources", text: "Reference canon and approved story records." },
          { title: "Prepare review batch", text: "Group entries for editorial review." },
        ],
        exitGate: "Wiki draft batch is ready for review.",
      },
      {
        number: 2,
        label: "Creative",
        eyebrow: "Wiki • Creative",
        title: "Creative Wiki Refinement",
        status: "Editorial shaping",
        introduction: "Improve readability, structure and cross-linking quality.",
        cards: [
          { title: "Refine copy", text: "Improve clarity and tone for the target audience." },
          { title: "Strengthen links", text: "Add and validate internal navigation paths." },
          { title: "Align terminology", text: "Normalize terms across related pages." },
          { title: "Lock candidate", text: "Freeze a reviewable wiki set." },
        ],
        exitGate: "Wiki candidate set is stable for review.",
      },
      {
        number: 3,
        label: "Review",
        eyebrow: "Wiki • Review",
        title: "Wiki Review",
        status: "Editorial sign-off",
        introduction: "Review wiki entries for accuracy, spoilers and navigation quality.",
        cards: [
          { title: "Accuracy check", text: "Validate facts against approved canon and story." },
          { title: "Spoiler check", text: "Ensure release-safe visibility settings." },
          { title: "Usability check", text: "Test discoverability and cross-page flow." },
          { title: "Approve entries", text: "Sign off selected pages for publication." },
        ],
        exitGate: "Approved wiki entries are publication-ready.",
      },
      {
        number: 4,
        label: "Public",
        eyebrow: "Wiki • Public",
        title: "Wiki Publication",
        status: "Live knowledge",
        introduction: "Publish approved entries and validate public navigation and safety.",
        cards: [
          { title: "Publish entries", text: "Release selected entries to public visibility." },
          { title: "Verify spoiler controls", text: "Confirm hidden details remain protected." },
          { title: "Validate links", text: "Check internal and story references on live pages." },
          { title: "Observe usage", text: "Monitor readership and correction feedback." },
        ],
        exitGate: "Wiki release is accurate, navigable and safe.",
      },
    ],
  },
  {
    id: "security",
    label: "Security",
    description: "Access, policy resolution, and version governance across workflows.",
    stages: [
      {
        number: 1,
        label: "Private",
        eyebrow: "Security • Private",
        title: "Private Security Baseline",
        status: "Policy definition",
        introduction: "Define roles, scopes and default policy behavior for internal workflows.",
        cards: [
          { title: "Define roles", text: "Specify owner, editor, reviewer and reader powers." },
          { title: "Set boundaries", text: "Mark private-only objects and restricted paths." },
          { title: "Design audits", text: "Define event logging and traceability expectations." },
          { title: "Prepare controls", text: "Select controls to validate in creative stages." },
        ],
        exitGate: "Security baseline is approved for operational use.",
      },
      {
        number: 2,
        label: "Creative",
        eyebrow: "Security • Creative",
        title: "Security Control Development",
        status: "Control implementation",
        introduction: "Implement and refine policy checks with explicit environment scoping.",
        cards: [
          { title: "Implement checks", text: "Apply membership, role and visibility constraints." },
          { title: "Test enforcement", text: "Simulate requests across role matrices." },
          { title: "Review audit paths", text: "Confirm events include needed forensic data." },
          { title: "Package candidate", text: "Prepare control set for security review." },
        ],
        exitGate: "Security candidate controls pass internal validation.",
      },
      {
        number: 3,
        label: "Review",
        eyebrow: "Security • Review",
        title: "Security Review",
        status: "Risk checkpoint",
        introduction: "Review controls for principle-of-least-privilege and policy correctness.",
        cards: [
          { title: "Privilege audit", text: "Check over-permissive access paths." },
          { title: "Policy verification", text: "Validate expected deny and allow outcomes." },
          { title: "Fix findings", text: "Return exact remediation tasks where needed." },
          { title: "Approve release", text: "Authorize control set for deployment." },
        ],
        exitGate: "Security controls are approved for production exposure.",
      },
      {
        number: 4,
        label: "Public",
        eyebrow: "Security • Public",
        title: "Security Rollout",
        status: "Live enforcement",
        introduction: "Release approved controls and verify live enforcement and observability.",
        cards: [
          { title: "Deploy controls", text: "Promote approved policy set to live runtime." },
          { title: "Run verification", text: "Execute post-release access validation checks." },
          { title: "Monitor events", text: "Observe logs for unexpected deny/allow behavior." },
          { title: "Stabilize", text: "Apply rapid fixes for any verified policy gaps." },
        ],
        exitGate: "Production security behavior is validated and stable.",
      },
    ],
  },
];

export default function StudioWorkflowClient() {
  const [selectedDomain, setSelectedDomain] = useState<DomainId>("story");
  const [selectedStage, setSelectedStage] = useState<number | null>(1);
  const [topLayerExpanded, setTopLayerExpanded] = useState(false);
  const activeDomain =
    domains.find((domain) => domain.id === selectedDomain) ?? domains[0];
  const selected = activeDomain.stages.find((stage) => stage.number === selectedStage);

  function selectDomain(domainId: DomainId) {
    setSelectedDomain(domainId);
    setSelectedStage(domainId === "story" ? 1 : null);
    setTopLayerExpanded(domainId !== "story");
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

        <section className={`mb-8 rounded-2xl border p-4 lg:mb-10 lg:p-5 transition-all duration-300 ${
          selectedDomain === "story"
            ? "border-zinc-800 bg-zinc-900/35 opacity-70"
            : "border-zinc-800 bg-zinc-900/60"
        }`}>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">
            Top Layer
          </p>
          {selectedDomain === "story" && !topLayerExpanded ? (
            <div className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-zinc-950/55 px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-emerald-200">Story Creation active</p>
                <p className="text-xs text-zinc-400">The story stages are open below. Expand to switch domains.</p>
              </div>
              <button
                type="button"
                onClick={() => setTopLayerExpanded(true)}
                className="rounded-full border border-zinc-700 px-3 py-1.5 text-xs font-medium text-zinc-200 transition hover:border-zinc-500 hover:bg-zinc-950/70"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-5">
                {domains.map((domain) => {
                  const active = domain.id === selectedDomain;
                  return (
                    <button
                      key={domain.id}
                      type="button"
                      aria-pressed={active}
                      onClick={() => selectDomain(domain.id)}
                      className={`rounded-xl border px-4 py-3 text-left transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                        active
                          ? "border-emerald-400 bg-emerald-400/10 text-emerald-200"
                          : "border-zinc-800 bg-zinc-950/50 text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <span className="block font-semibold">{domain.label}</span>
                    </button>
                  );
                })}
              </div>
              <p className="mt-3 text-sm text-zinc-400">{activeDomain.description}</p>
            </>
          )}
        </section>

        {selectedDomain === "story" ? (
          <section aria-label="Studio production workflow" className="rounded-2xl border border-emerald-500/20 bg-zinc-900/80 p-4 shadow-[0_0_0_1px_rgba(16,185,129,0.08)] lg:p-6">
            <div className="grid gap-2 md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-center">
              {activeDomain.stages.map((stage, index) => {
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
                      onClick={() => setSelectedStage(active ? null : stage.number)}
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
                      <span className="font-semibold leading-5 lg:text-lg lg:leading-6 xl:text-xl">
                        {stage.label}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>

            {selected && (
              <article
                id="workflow-stage-panel"
                className="mt-3 rounded-2xl border border-emerald-500/25 bg-zinc-950/90 p-4 shadow-2xl shadow-black/25 sm:p-5 lg:mt-5 lg:p-8 xl:p-10"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between lg:gap-8">
                  <div>
                    <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">
                      {selected.eyebrow}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold text-emerald-400 lg:text-3xl">
                      {selected.title}
                    </h2>
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
        ) : (
          <section className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-400">
            <p className="text-sm">
              Stage details open when <span className="font-semibold text-zinc-200">Story Creation</span> is selected.
            </p>
          </section>
        )}

        <section className="mt-8 rounded-2xl border border-zinc-800 bg-zinc-900 p-5 lg:mt-10 lg:p-8">
          <h2 className="font-semibold lg:text-xl">Two deliberate loops</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="font-medium text-violet-400">Creative loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Explore, develop and assess as often as needed before approving a scope for review.
              </p>
            </div>
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4">
              <p className="font-medium text-amber-400">Review loop</p>
              <p className="mt-1 text-sm leading-6 text-zinc-400">
                Requested changes return to Creative Development and require a new explicit Draft Sync.
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
