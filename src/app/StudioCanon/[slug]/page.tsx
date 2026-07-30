import Link from "next/link";
import { notFound } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { isStudioModeEnabled } from "@/lib/studio-mode";
import PrivateCanonObjectBrowser, {
  type CanonBrowserCategory,
  type CanonBrowserRecord,
} from "@/components/PrivateCanonObjectBrowser";

type PrivateCanonResponse = {
  canon: {
    slug: string;
    title: string;
    content_status: string;
    linked_story_slug: string | null;
  };
  story: {
    slug: string;
    title: string;
  } | null;
  categories: CanonBrowserCategory[];
  records: CanonBrowserRecord[];
};

export const dynamic = "force-dynamic";

export default async function StudioCanonDetailPage({
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
              <h1 className="text-4xl font-bold sm:text-5xl">
                {canon.canon.title}
              </h1>
              <p className="mt-4 max-w-3xl text-lg leading-8 text-zinc-300">
                Authoritative truths, constraints, secrets, visual rules and
                proposed decisions. This workspace is loaded independently
                from Story and Wiki.
              </p>
              {!canon.story ? (
                <p className="mt-4 inline-flex rounded-full bg-amber-400/15 px-4 py-2 text-sm text-amber-200">
                  Canon-first workspace · no story has been linked yet
                </p>
              ) : null}
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/StudioCanon"
                className="inline-flex items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold hover:border-violet-300 hover:text-violet-200"
              >
                All Private Canon
              </Link>
              {canon.story ? (
                <>
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
                    Story
                  </Link>
                </>
              ) : null}
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
