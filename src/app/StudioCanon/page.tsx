import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";

type CanonWorkspace = {
  id: string;
  slug: string;
  title: string;
  content_status: string;
  record_count: number;
  confirmed_count: number;
  proposed_count: number;
  linked_story: {
    slug: string;
    title: string;
  } | null;
  updated_at: string;
};

export const dynamic = "force-dynamic";

export default async function StudioCanonPage() {
  const studioModeEnabled = await isStudioModeEnabled();

  if (!studioModeEnabled) {
    notFound();
  }

  const { data, error } = await supabase.rpc("list_studio_private_canon", {
    p_studio_mode: true,
  });

  if (error) {
    throw new Error(error.message);
  }

  const workspaces = (data ?? []) as CanonWorkspace[];

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-[2rem] border border-violet-400/20 bg-zinc-900 p-8 sm:p-12">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
            Studio only
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl">Private Canon</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
                Canon workspaces are independent from Story, Episodes and Wiki.
                A workspace may be created and loaded before its Concept Draft,
                then linked to the story later.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/StudioWorkflow"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-300"
              >
                Studio Workflow
              </Link>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-full bg-violet-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-violet-200"
              >
                Story library
              </Link>
            </div>
          </div>
        </header>

        {workspaces.length > 0 ? (
          <section
            aria-label="Private Canon workspaces"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          >
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/StudioCanon/${workspace.slug}`}
                className="rounded-2xl border border-zinc-800 bg-zinc-900 p-6 transition hover:border-violet-300/60 hover:bg-zinc-800"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-violet-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-violet-200">
                    {workspace.content_status}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs ${
                      workspace.linked_story
                        ? "bg-emerald-400/15 text-emerald-300"
                        : "bg-amber-400/15 text-amber-300"
                    }`}
                  >
                    {workspace.linked_story
                      ? "Story linked"
                      : "Canon first · no story yet"}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl font-semibold">
                  {workspace.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-400">
                  {workspace.record_count}{" "}
                  {workspace.record_count === 1 ? "record" : "records"} ·{" "}
                  {workspace.confirmed_count} confirmed ·{" "}
                  {workspace.proposed_count} proposed
                </p>
                {workspace.linked_story ? (
                  <p className="mt-4 text-sm text-zinc-500">
                    Linked to {workspace.linked_story.title}
                  </p>
                ) : null}
              </Link>
            ))}
          </section>
        ) : (
          <p className="rounded-2xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-400">
            No Private Canon workspaces have been loaded.
          </p>
        )}
      </div>
    </main>
  );
}
