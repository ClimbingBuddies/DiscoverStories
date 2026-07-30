"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type WikiBrowserEntry = {
  id: string;
  slug: string;
  title: string;
  short_description: string | null;
  introduction: string | null;
  entry_type: string;
};

export type WikiBrowserCategory = {
  slug: string;
  name: string;
  sort_order: number;
};

type WikiSection = {
  id: string;
  heading: string | null;
  content: string | null;
};

type WikiRelationship = {
  relationship_type: string;
  public_description: string | null;
};

type WikiEpisode = {
  id: string;
  season_number: number;
  episode_number: number;
  episode_end_number?: number | null;
  title: string;
};

type WikiEntryDetail = WikiBrowserEntry & {
  is_unlocked: boolean;
};

type WikiDetailResponse = {
  requested_entry: WikiEntryDetail | null;
  sections: WikiSection[];
  relationships: WikiRelationship[];
  episodes: WikiEpisode[];
};

type Props = {
  storySlug: string;
  entries: WikiBrowserEntry[];
  categories: WikiBrowserCategory[];
  queryString: string;
};

function humanizeType(entryType: string) {
  return entryType.replace(/_/g, " ").replace(/\b\w/g, (value) => value.toUpperCase());
}

export default function WikiObjectBrowser({
  storySlug,
  entries,
  categories,
  queryString,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedEntry, setSelectedEntry] = useState<WikiBrowserEntry | null>(null);
  const [detail, setDetail] = useState<WikiDetailResponse | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [search, setSearch] = useState("");

  const categoryMap = useMemo(
    () => new Map(categories.map((category) => [category.slug, category])),
    [categories]
  );

  const grouped = useMemo(() => {
    const result = new Map<string, { category: WikiBrowserCategory; entries: WikiBrowserEntry[] }>();

    for (const entry of entries) {
      const recognised = categoryMap.get(entry.entry_type);
      const category = recognised ?? { slug: "other", name: "Other", sort_order: 2147483647 };
      const current = result.get(category.slug) ?? { category, entries: [] };
      current.entries.push(entry);
      result.set(category.slug, current);
    }

    return [...result.values()].sort(
      (a, b) =>
        a.category.sort_order - b.category.sort_order ||
        a.category.name.localeCompare(b.category.name)
    );
  }, [categoryMap, entries]);

  const selected = grouped.find((group) => group.category.slug === selectedCategory);
  const normalisedSearch = search.trim().toLowerCase();
  const visibleEntries = selected?.entries.filter((entry) =>
    !normalisedSearch ||
    entry.title.toLowerCase().includes(normalisedSearch) ||
    entry.short_description?.toLowerCase().includes(normalisedSearch) ||
    entry.introduction?.toLowerCase().includes(normalisedSearch)
  ) ?? [];

  const openEntry = async (entry: WikiBrowserEntry) => {
    setSelectedEntry(entry);
    setDetail(null);
    setDetailError(null);
    setIsLoadingDetail(true);

    try {
      const response = await fetch(
        `/api/stories/${encodeURIComponent(storySlug)}/wiki/${encodeURIComponent(entry.slug)}${queryString}`
      );

      if (!response.ok) {
        throw new Error("Unable to load this Wiki entry.");
      }

      setDetail((await response.json()) as WikiDetailResponse);
    } catch (error) {
      setDetailError(error instanceof Error ? error.message : "Unable to load this Wiki entry.");
    } finally {
      setIsLoadingDetail(false);
    }
  };

  const closeEntry = () => {
    setSelectedEntry(null);
    setDetail(null);
    setDetailError(null);
  };

  if (grouped.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-300">
        No Wiki entries are currently available.
      </section>
    );
  }

  return (
    <section aria-label="Wiki categories" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {grouped.map(({ category, entries: categoryEntries }, index) => {
          const active = selectedCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              aria-expanded={active}
              aria-controls="wiki-category-panel"
              onClick={() => {
                setSelectedCategory(active ? null : category.slug);
                closeEntry();
              }}
              className={`flex min-h-24 items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400 ${
                active
                  ? "border-emerald-400 bg-emerald-400 text-zinc-950"
                  : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              <span className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm ${
                active ? "border-zinc-950/70" : "border-zinc-600 text-zinc-300"
              }`}>
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-lg font-semibold">{category.name}</span>
                <span className={`mt-1 block text-sm ${active ? "text-zinc-800" : "text-zinc-500"}`}>
                  {categoryEntries.length} {categoryEntries.length === 1 ? "entry" : "entries"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <article id="wiki-category-panel" className="rounded-2xl border border-zinc-800 bg-zinc-900 shadow-2xl shadow-black/20">
          <div className="sticky top-0 z-20 rounded-t-2xl border-b border-zinc-800 bg-zinc-900/95 p-5 backdrop-blur sm:px-7 lg:px-9">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">
                  {selectedEntry ? selected.category.name : "Wiki category"}
                </p>
                <h2 className="mt-1 truncate text-2xl font-semibold text-emerald-400 sm:text-3xl">
                  {selectedEntry?.title ?? selected.category.name}
                </h2>
                {!selectedEntry ? (
                  <p className="mt-1 text-sm text-zinc-500">
                    {selected.entries.length} {selected.entries.length === 1 ? "entry" : "entries"}
                  </p>
                ) : null}
              </div>

              {selectedEntry ? (
                <button
                  type="button"
                  onClick={closeEntry}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm font-semibold text-white transition hover:border-emerald-400 hover:text-emerald-300"
                >
                  ← Back to {selected.category.name}
                </button>
              ) : (
                <label className="w-full sm:max-w-sm">
                  <span className="sr-only">Search {selected.category.name}</span>
                  <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={`Search ${selected.category.name.toLowerCase()}`}
                    className="w-full rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-emerald-400"
                  />
                </label>
              )}
            </div>
          </div>

          <div className="p-5 sm:p-7 lg:p-9">
            {selectedEntry ? (
              <div aria-live="polite">
                {isLoadingDetail ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 text-sm text-zinc-400">
                    Loading {selectedEntry.title}…
                  </p>
                ) : detailError ? (
                  <div className="rounded-xl border border-rose-900/60 bg-rose-950/20 p-6">
                    <p className="text-sm text-rose-200">{detailError}</p>
                    <button
                      type="button"
                      onClick={() => openEntry(selectedEntry)}
                      className="mt-4 text-sm font-semibold text-emerald-300 hover:text-emerald-200"
                    >
                      Try again
                    </button>
                  </div>
                ) : detail?.requested_entry ? (
                  <div className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]">
                    <div className="space-y-5">
                      <div>
                        <p className="text-xs uppercase tracking-[0.18em] text-emerald-400">
                          {humanizeType(detail.requested_entry.entry_type)}
                        </p>
                        <p className="mt-3 text-lg leading-8 text-zinc-300">
                          {detail.requested_entry.short_description ??
                            detail.requested_entry.introduction ??
                            "No public description available."}
                        </p>
                      </div>

                      {detail.sections.map((section) => (
                        <section key={section.id} className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
                          <h3 className="text-xl font-semibold text-white">
                            {section.heading ?? "Details"}
                          </h3>
                          <p className="mt-3 whitespace-pre-line text-sm leading-7 text-zinc-300">
                            {section.content ?? "No section content available."}
                          </p>
                        </section>
                      ))}
                    </div>

                    <aside className="space-y-4">
                      {detail.episodes.length > 0 ? (
                        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
                          <h3 className="text-xs uppercase tracking-[0.18em] text-emerald-400">
                            Related episodes
                          </h3>
                          <div className="mt-4 flex flex-wrap gap-2">
                            {detail.episodes.map((episode) => {
                              const isRange = Boolean(
                                episode.episode_end_number &&
                                episode.episode_end_number > episode.episode_number
                              );
                              const label = isRange
                                ? `S${episode.season_number} · E${episode.episode_number}–${episode.episode_end_number}`
                                : `S${episode.season_number} · E${episode.episode_number}`;

                              return (
                                <Link
                                  key={episode.id}
                                  href={`/stories/${storySlug}/episodes/${episode.episode_number}`}
                                  title={episode.title}
                                  className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 transition hover:border-emerald-400 hover:text-emerald-300"
                                >
                                  {label}
                                </Link>
                              );
                            })}
                          </div>
                        </section>
                      ) : null}

                      {detail.relationships.length > 0 ? (
                        <section className="rounded-2xl border border-zinc-800 bg-zinc-950/70 p-6">
                          <h3 className="text-xs uppercase tracking-[0.18em] text-emerald-400">
                            Related entries
                          </h3>
                          <ul className="mt-4 space-y-3 text-sm text-zinc-300">
                            {detail.relationships.map((relationship, index) => (
                              <li key={`${relationship.relationship_type}-${index}`}>
                                <span className="font-semibold text-white">
                                  {humanizeType(relationship.relationship_type)}:
                                </span>{" "}
                                {relationship.public_description}
                              </li>
                            ))}
                          </ul>
                        </section>
                      ) : null}
                    </aside>
                  </div>
                ) : null}
              </div>
            ) : (
              <>
                <div className="grid gap-4 md:grid-cols-2">
                  {visibleEntries.map((entry) => (
                    <button
                      key={entry.id}
                      type="button"
                      onClick={() => openEntry(entry)}
                      className="group rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 text-left transition hover:border-emerald-400"
                    >
                      <h3 className="text-xl font-semibold transition group-hover:text-emerald-300">
                        {entry.title}
                      </h3>
                      <p className="mt-3 text-sm leading-6 text-zinc-400">
                        {entry.short_description ?? entry.introduction ?? "No summary available."}
                      </p>
                      <div className="mt-6 flex items-center justify-between text-sm text-emerald-300">
                        <span>View entry</span><span>→</span>
                      </div>
                    </button>
                  ))}
                </div>

                {visibleEntries.length === 0 ? (
                  <p className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 text-sm text-zinc-400">
                    No entries match this search.
                  </p>
                ) : null}
              </>
            )}
          </div>
        </article>
      ) : (
        <p className="text-center text-sm text-zinc-500">Select a category to view its entries.</p>
      )}
    </section>
  );
}
