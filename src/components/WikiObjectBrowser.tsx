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

type Props = {
  storySlug: string;
  entries: WikiBrowserEntry[];
  categories: WikiBrowserCategory[];
  queryString: string;
};

export default function WikiObjectBrowser({
  storySlug,
  entries,
  categories,
  queryString,
}: Props) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
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
              onClick={() => setSelectedCategory(active ? null : category.slug)}
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
        <article id="wiki-category-panel" className="rounded-2xl border border-zinc-800 bg-zinc-900 p-5 shadow-2xl shadow-black/20 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Wiki category</p>
              <h2 className="mt-1 text-2xl font-semibold text-emerald-400 sm:text-3xl">
                {selected.category.name}
              </h2>
            </div>
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
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleEntries.map((entry) => (
              <Link
                key={entry.id}
                href={`/stories/${storySlug}/wiki/${entry.slug}${queryString}`}
                className="group rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 transition hover:border-emerald-400"
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
              </Link>
            ))}
          </div>

          {visibleEntries.length === 0 ? (
            <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 text-sm text-zinc-400">
              No entries match this search.
            </p>
          ) : null}
        </article>
      ) : (
        <p className="text-center text-sm text-zinc-500">Select a category to view its entries.</p>
      )}
    </section>
  );
}
