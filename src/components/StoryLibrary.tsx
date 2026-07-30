"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import FeaturedStoryCard from "@/components/FeaturedStory";
import StoryRow from "@/components/StoryRow";
import { STUDIO_MODE_COOKIE } from "@/lib/studio-mode-constants";
import {
  type ContentStatus,
  isPublishedStatus,
  PRODUCTION_STATUS_LABELS,
} from "@/lib/content-status";

const LAST_SELECTED_KEY = "discover-stories:lastSelectedStory";
const PROGRESS_KEY = "discover-stories:storyProgress";

export type LibraryStory = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  description: string | null;
  cover_image_path: string | null;
  banner_image_path: string | null;
  genres: Array<{ slug: string; name: string }>;
  content_status: ContentStatus;
  scheduled_at: string | null;
  episodeCount: number;
  seasonNumber: number;
  created_at: string;
};

function getStoredProgress(): Record<string, { episode: string; percentage: number }> {
  try {
    const saved = window.localStorage.getItem(PROGRESS_KEY);
    if (!saved) return {};
    return JSON.parse(saved) as Record<string, { episode: string; percentage: number }>;
  } catch {
    return {};
  }
}

function saveProgressMap(progressMap: Record<string, { episode: string; percentage: number }>) {
  try {
    window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(progressMap));
  } catch {
    // ignore
  }
}

function getStoryCategories(story: Pick<LibraryStory, "genres">): string[] {
  return (story.genres ?? []).map((genre) => genre.name);
}

export default function StoryLibrary({ stories, initialStudioMode = false }: { stories: LibraryStory[]; initialStudioMode?: boolean }) {
  const router = useRouter();
  const [lastSelectedSlug, setLastSelectedSlug] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { episode: string; percentage: number }>>({});
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [studioMode, setStudioMode] = useState(initialStudioMode);

  useEffect(() => {
    let savedSlug: string | null = null;
    let savedProgress: Record<string, { episode: string; percentage: number }> = {};

    try {
      savedSlug = window.localStorage.getItem(LAST_SELECTED_KEY);
      savedProgress = getStoredProgress();
    } catch {
      // ignore client-side storage errors
    }

    /* eslint-disable react-hooks/set-state-in-effect */
    setLastSelectedSlug(savedSlug);
    setProgressMap(savedProgress);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const publishedStories = useMemo(
    () => stories.filter((story) => isPublishedStatus(story.content_status)),
    [stories]
  );

  const productionGroups = useMemo(() => {
    return (["review", "scheduled", "draft", "archived"] as const)
      .map((status) => ({
        status,
        title: PRODUCTION_STATUS_LABELS[status],
        stories: stories.filter((story) => story.content_status === status),
      }))
      .filter((group) => group.stories.length > 0);
  }, [stories]);

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    publishedStories.forEach((story) => {
      getStoryCategories(story).forEach((category) => categories.add(category));
    });
    return ["All", ...Array.from(categories).sort()];
  }, [publishedStories]);

  const visiblePublishedStories = useMemo(() => {
    const filtered = selectedCategory === "All"
      ? publishedStories
      : publishedStories.filter((story) => getStoryCategories(story).includes(selectedCategory));

    return [...filtered].sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [publishedStories, selectedCategory]);

  const featuredStory = useMemo(() => {
    const lastSelected = lastSelectedSlug
      ? visiblePublishedStories.find((story) => story.slug === lastSelectedSlug)
      : undefined;
    return lastSelected ?? visiblePublishedStories[0] ?? null;
  }, [visiblePublishedStories, lastSelectedSlug]);

  const continueStory = useMemo(() => {
    if (!lastSelectedSlug) return null;
    return visiblePublishedStories.find((story) => story.slug === lastSelectedSlug) ?? null;
  }, [visiblePublishedStories, lastSelectedSlug]);

  const continueStories = useMemo(() => {
    if (!continueStory) return [];
    const progress = progressMap[continueStory.slug] ?? { episode: "Episode 1", percentage: 10 };
    return [{ ...continueStory, last_listened_episode: progress.episode, percentage_complete: progress.percentage }];
  }, [continueStory, progressMap]);

  const newestStories = useMemo(
    () => visiblePublishedStories.filter((story) => story.slug !== featuredStory?.slug).slice(0, 8),
    [visiblePublishedStories, featuredStory]
  );

  const handleSelect = (slug: string) => {
    try {
      window.localStorage.setItem(LAST_SELECTED_KEY, slug);
      setProgressMap((current) => {
        if (current[slug]) return current;
        const next = { ...current, [slug]: { episode: "Episode 4", percentage: 61 } };
        saveProgressMap(next);
        return next;
      });
    } catch {
      // ignore
    }
  };

  const handleStudioModeChange = (enabled: boolean) => {
    setStudioMode(enabled);
    document.cookie = `${STUDIO_MODE_COOKIE}=${enabled}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };

  return (
    <div className="relative space-y-8">
      <div className="pointer-events-none absolute -top-16 right-0 z-10">
        <label
          className="pointer-events-auto inline-flex cursor-pointer items-center gap-2 rounded-full border border-zinc-700 bg-zinc-900/90 px-3 py-1.5 text-xs font-medium text-zinc-200"
          title="Studio Mode: Preview production statuses on the live layout."
        >
          <span>Studio</span>
          <input
            type="checkbox"
            checked={studioMode}
            onChange={(event) => handleStudioModeChange(event.target.checked)}
            className="h-4 w-4 accent-emerald-400"
          />
          <span>{studioMode ? "On" : "Off"}</span>
        </label>
      </div>

      {studioMode ? (
        <div className="rounded-2xl border border-amber-400/30 bg-amber-400/10 px-5 py-4 text-sm text-amber-100">
          Studio Mode is a layout preview. Database permissions still control which production records are available.
        </div>
      ) : null}

      {availableCategories.length > 1 ? (
        <div className="flex flex-wrap gap-2">
          {availableCategories.map((category) => {
            const isActive = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                  isActive
                    ? "border-emerald-400 bg-emerald-400/15 text-emerald-300"
                    : "border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      ) : null}

      {featuredStory ? <FeaturedStoryCard story={featuredStory} onSelect={handleSelect} /> : null}

      <div className="grid gap-12 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        {continueStories.length > 0 ? (
          <div className="lg:sticky lg:top-24">
            <StoryRow title="Continue Listening" stories={continueStories} onSelect={handleSelect} />
          </div>
        ) : null}
        <div className={continueStories.length > 0 ? "" : "lg:col-span-2"}>
          <StoryRow title="Newest Stories" stories={newestStories} onSelect={handleSelect} />
        </div>
      </div>

      {studioMode
        ? productionGroups.map((group) => (
            <StoryRow
              key={group.status}
              title={group.title}
              stories={group.stories}
              onSelect={handleSelect}
            />
          ))
        : null}
    </div>
  );
}
