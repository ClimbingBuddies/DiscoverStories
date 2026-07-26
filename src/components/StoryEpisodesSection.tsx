"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import EpisodeCard from "@/components/EpisodeCard";

type EpisodeItem = {
  id: string;
  season_number: number | null;
  episode_number: number;
  title: string;
  summary: string | null;
  word_count: number | null;
  duration_seconds: number | null;
  episode_status: string;
  audio_url: string | null;
  artwork_path: string | null;
};

type StoryEpisodesSectionProps = {
  story: {
    slug: string;
    title: string;
  };
  wikiEnabled: boolean;
  initialPage: number;
  initialEpisodes: EpisodeItem[];
  episodes: EpisodeItem[];
  pageSize: number;
  totalEpisodes: number | null;
};

export default function StoryEpisodesSection({
  story,
  wikiEnabled,
  initialPage,
  initialEpisodes,
  episodes,
  pageSize,
  totalEpisodes,
}: StoryEpisodesSectionProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [page, setPage] = useState(initialPage);
  const [visibleEpisodes, setVisibleEpisodes] = useState(initialEpisodes);

  useEffect(() => {
    const nextPage = Math.max(1, Number(searchParams.get("page") ?? "1"));
    setPage(nextPage);

    const start = (nextPage - 1) * pageSize;
    const end = start + pageSize;
    setVisibleEpisodes(episodes.slice(start, end));
  }, [episodes, pageSize, searchParams]);

  const totalPages = totalEpisodes ? Math.ceil(totalEpisodes / pageSize) : 1;
  const hasPreviousPage = page > 1;
  const hasNextPage = page < totalPages;
  const previousPage = page - 1;
  const nextPage = page + 1;
  const startEpisode = totalEpisodes ? (page - 1) * pageSize + 1 : 0;
  const endEpisode = totalEpisodes ? Math.min(page * pageSize, totalEpisodes) : 0;

  const getPaginationItems = (currentPage: number, totalPageCount: number) => {
    const items: Array<number | "ellipsis"> = [];

    if (totalPageCount <= 7) {
      for (let index = 1; index <= totalPageCount; index += 1) {
        items.push(index);
      }
      return items;
    }

    items.push(1);

    if (currentPage <= 3) {
      items.push(2, 3, 4, 5, "ellipsis", totalPageCount);
      return items;
    }

    if (currentPage >= totalPageCount - 2) {
      items.push("ellipsis", totalPageCount - 4, totalPageCount - 3, totalPageCount - 2, totalPageCount - 1, totalPageCount);
      return items;
    }

    items.push("ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", totalPageCount);
    return items;
  };

  const paginationItems = useMemo(() => getPaginationItems(page, totalPages), [page, totalPages]);

  const seasons = useMemo(() => {
    return visibleEpisodes.reduce(
      (groups, episode) => {
        const season = episode.season_number ?? 1;
        groups[season] ??= [];
        groups[season].push(episode);
        return groups;
      },
      {} as Record<number, typeof visibleEpisodes>
    );
  }, [visibleEpisodes]);

  const navigateToPage = (nextPageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());

    if (nextPageNumber === 1) {
      params.delete("page");
    } else {
      params.set("page", nextPageNumber.toString());
    }

    const queryString = params.toString();
    const nextUrl = queryString ? `${pathname}?${queryString}` : pathname;

    router.replace(nextUrl, { scroll: false });
    setPage(nextPageNumber);

    const start = (nextPageNumber - 1) * pageSize;
    const end = start + pageSize;
    setVisibleEpisodes(episodes.slice(start, end));
  };

  return (
    <div className="space-y-10">
      {wikiEnabled ? (
        <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-6 text-sm text-emerald-200">
          <p className="font-semibold">Story wiki available</p>
          <p className="mt-2 text-zinc-300">
            Explore the public story wiki, spoiler-aware and tied to your completed episode progress.
          </p>
          <a
            href={`/stories/${story.slug}/wiki`}
            className="mt-4 inline-flex items-center justify-center rounded-full bg-emerald-400 px-5 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-emerald-300"
          >
            View story wiki
          </a>
        </div>
      ) : null}

      <div className="rounded-2xl border border-zinc-800 bg-zinc-950/60 p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-white">Episode blocks</p>
            <p className="text-sm text-zinc-400">
              Showing {startEpisode}-{endEpisode} of {totalEpisodes ?? 0} episodes
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasPreviousPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(previousPage)}
                className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
              >
                ← Previous 10
              </button>
            ) : null}

            {paginationItems.map((item, index) => {
              if (item === "ellipsis") {
                return (
                  <span key={`ellipsis-${index}`} className="px-2 text-sm text-zinc-500">
                    …
                  </span>
                );
              }

              const isActive = item === page;

              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => navigateToPage(item)}
                  className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-emerald-500 text-zinc-950"
                      : "border border-zinc-700 text-zinc-200 hover:border-emerald-500 hover:text-emerald-300"
                  }`}
                >
                  {item}
                </button>
              );
            })}

            {hasNextPage ? (
              <button
                type="button"
                onClick={() => navigateToPage(nextPage)}
                className="rounded-full border border-zinc-700 px-3 py-2 text-sm font-medium text-zinc-200 transition hover:border-emerald-500 hover:text-emerald-300"
              >
                Next 10 →
              </button>
            ) : null}
          </div>
        </div>
      </div>

      {Object.entries(seasons).map(([seasonNumber, seasonEpisodes]) => (
        <section key={seasonNumber}>
          <h2 className="mb-4 text-2xl font-semibold text-white">Season {seasonNumber}</h2>

          <div className="space-y-4">
            {seasonEpisodes.map((episode) => (
              <EpisodeCard
                key={episode.id}
                episode={episode}
                storySlug={story.slug}
                storyTitle={story.title}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
