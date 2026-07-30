import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";
import PrivateCanonObjectBrowser, { type CanonBrowserCategory, type CanonBrowserRecord } from "@/components/PrivateCanonObjectBrowser";

type PrivateCanonResponse = {
  story: {
    slug: string;
    title: string;
  };
  categories: CanonBrowserCategory[];
  records: CanonBrowserRecord[];
};

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

        <PrivateCanonObjectBrowser
          records={canon.records}
          categories={canon.categories}
        />
      </div>
    </main>
  );
}
