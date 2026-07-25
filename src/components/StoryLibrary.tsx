"use client";

import { useEffect, useMemo, useState } from "react";
import FeaturedStoryCard from "@/components/FeaturedStory";
import StoryRow from "@/components/StoryRow";

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
  content_status: string;
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

const CATEGORY_KEYWORDS: Array<{ label: string; keywords: string[] }> = [
  { label: "Science Fiction", keywords: ["science fiction", "sci-fi", "sci fi", "future", "space", "robot", "dyson", "cosmic", "quantum", "galaxy", "star", "satellite", "technology", "ai", "android"] },
  { label: "Romance", keywords: ["romance", "love", "heart", "kiss", "affection", "relationship"] },
  { label: "Fantasy", keywords: ["fantasy", "magic", "wizard", "dragon", "enchanted", "myth", "spell", "kingdom", "realm"] },
  { label: "Education", keywords: ["education", "learn", "school", "teacher", "history", "science", "lesson", "knowledge", "academy"] },
  { label: "Mystery", keywords: ["mystery", "secret", "detective", "clue", "unknown", "hidden", "haunted", "ghost", "riddle"] },
  { label: "Adventure", keywords: ["adventure", "journey", "quest", "explore", "travel", "expedition", "treasure", "survival", "escape"] },
  { label: "Drama", keywords: ["drama", "conflict", "struggle", "loss", "family", "war", "betrayal", "sacrifice"] },
];

function inferStoryCategories(story: Pick<LibraryStory, "title" | "short_description" | "description">): string[] {
  const haystack = `${story.title ?? ""} ${story.short_description ?? ""} ${story.description ?? ""}`.toLowerCase();

  return CATEGORY_KEYWORDS.filter(({ keywords }) => keywords.some((keyword) => haystack.includes(keyword))).map(({ label }) => label);
}

export default function StoryLibrary({ stories }: { stories: LibraryStory[] }) {
  const [lastSelectedSlug, setLastSelectedSlug] = useState<string | null>(null);
  const [progressMap, setProgressMap] = useState<Record<string, { episode: string; percentage: number }>>({});
  const [selectedCategory, setSelectedCategory] = useState("All");

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
    () => stories.filter((story) => story.content_status === "published"),
    [stories]
  );

  const availableCategories = useMemo(() => {
    const categories = new Set<string>();
    publishedStories.forEach((story) => {
      inferStoryCategories(story).forEach((category) => categories.add(category));
    });

    return ["All", ...Array.from(categories).sort()];
  }, [publishedStories]);

  const filteredPublishedStories = useMemo(() => {
    if (selectedCategory === "All") {
      return publishedStories;
    }

    return publishedStories.filter((story) => inferStoryCategories(story).includes(selectedCategory));
  }, [publishedStories, selectedCategory]);

  const allPublished = useMemo(
    () => [...filteredPublishedStories].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    [filteredPublishedStories]
  );

  const featuredStory = useMemo(() => {
    const lastSelected = lastSelectedSlug
      ? allPublished.find((story) => story.slug === lastSelectedSlug)
      : undefined;
    return lastSelected ?? allPublished[0] ?? null;
  }, [allPublished, lastSelectedSlug]);

  const continueStory = useMemo(() => {
    if (!lastSelectedSlug) return null;
    return allPublished.find((story) => story.slug === lastSelectedSlug) ?? null;
  }, [allPublished, lastSelectedSlug]);

  const continueStories = useMemo(() => {
    if (!continueStory) return [];

    const progress = progressMap[continueStory.slug] ?? {
      episode: "Episode 1",
      percentage: 10,
    };
    return [
      {
        ...continueStory,
        last_listened_episode: progress.episode,
        percentage_complete: progress.percentage,
      },
    ];
  }, [continueStory, progressMap]);

  const newestStories = useMemo(
    () => allPublished.filter((story) => story.slug !== featuredStory?.slug).slice(0, 8),
    [allPublished, featuredStory]
  );

  const comingSoonStories = useMemo(
    () => stories.filter((story) => story.content_status !== "published").slice(0, 8),
    [stories]
  );

  const handleSelect = (slug: string) => {
    try {
      window.localStorage.setItem(LAST_SELECTED_KEY, slug);
      setLastSelectedSlug(slug);
      setProgressMap((current) => {
        if (current[slug]) return current;
        const next = {
          ...current,
          [slug]: {
            episode: "Episode 4",
            percentage: 61,
          },
        };
        saveProgressMap(next);
        return next;
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="space-y-12">
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

      {featuredStory ? (
        <FeaturedStoryCard story={featuredStory} onSelect={handleSelect} />
      ) : null}

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

      <StoryRow title="Coming Soon" stories={comingSoonStories} onSelect={handleSelect} />
    </div>
  );
}
