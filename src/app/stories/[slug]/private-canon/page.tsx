import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";

type CanonRecord = {
  id: string;
  canon_key: string;
  title: string;
  category: string;
  rule: string;
  importance: string;
  canon_state: "proposed" | "confirmed";
  content_status: string;
  spoiler_level: number;
  updated_at: string;
};

type PrivateCanonResponse = {
  story: {
    slug: string;
    title: string;
  };
  records: CanonRecord[];
};

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default async function PrivateCanonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const studioModeEnabled = await isStudioModeEnabled();

  if (!studioModeEnabled) {
    notFound();
  }

  const { slug } = await params;
  const { data, error } = await supabase.rpc("get_studio_private_canon", {
    p_story_slug: slug,
    p_studio_mode: true,
  });

  if (error || !data) {
    notFound();
  }

  const canon = data as PrivateCanonResponse;
  const groups = canon.records.reduce(
    (result, record) => {
      result[record.category] ??= [];
      result[record.category].push(record);
      return result;
    },
    {} as Record<string, CanonRecord[]>
  );

  return (
    <main className="min-h-screen bg-zinc-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-6xl space-y-10">
        <header className="rounded-[2rem] border border-violet-400/20 bg-zinc-900 p-8 sm:p-12">
          <p className="text-sm uppercase tracking-[0.24em] text-violet-300">
            Studio only · Private Canon
          </p>
          <div className="mt-3 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold sm:text-5xl">{canon.story.title}</h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
                Authoritative story truths, constraints, secrets and proposed decisions.
                Private Canon is maintained independently from episodes and the reader-facing Wiki.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href={`/stories/${canon.story.slug}/wiki`}
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold hover:border-emerald-400 hover:text-emerald-300"
              >
                Wiki
              </Link>
              <Link
                href={`/stories/${canon.story.slug}`}
                className="inline-flex items-center justify-center rounded-full bg-violet-300 px-5 py-3 text-sm font-semibold text-zinc-950 hover:bg-violet-200"
              >
                Back to story
              </Link>
            </div>
          </div>
        </header>

        {canon.records.length === 0 ? (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-300">
            No active Private Canon records have been loaded for this story.
          </section>
        ) : (
          Object.entries(groups).map(([category, records]) => (
            <section key={category} className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-2xl font-semibold">{humanize(category)}</h2>
                <span className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-xs text-violet-300">
                  {records.length}
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                {records.map((record) => (
                  <article
                    key={record.id}
                    className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                        record.canon_state === "confirmed"
                          ? "bg-emerald-400/15 text-emerald-300"
                          : "bg-amber-400/15 text-amber-300"
                      }`}>
                        {record.canon_state}
                      </span>
                      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
                        {record.content_status}
                      </span>
                    </div>
                    <h3 className="mt-4 text-xl font-semibold">{record.title}</h3>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">
                      {record.rule}
                    </p>
                    <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
                      <div>
                        <dt>Importance</dt>
                        <dd className="mt-1 text-zinc-200">{humanize(record.importance)}</dd>
                      </div>
                      <div>
                        <dt>Canon key</dt>
                        <dd className="mt-1 break-all text-zinc-200">{record.canon_key}</dd>
                      </div>
                    </dl>
                  </article>
                ))}
              </div>
            </section>
          ))
        )}
      </div>
    </main>
  );
}
