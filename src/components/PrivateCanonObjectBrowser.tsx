"use client";

import { useMemo, useState } from "react";

export type CanonBrowserRecord = {
  id: string;
  canon_key: string;
  title: string;
  category: string;
  category_label: string;
  raw_category: string | null;
  rule: string;
  importance: string;
  canon_state: "proposed" | "confirmed";
  content_status: string;
  spoiler_level: number;
  updated_at: string;
};

export type CanonBrowserCategory = {
  slug: string;
  name: string;
  sort_order: number;
};

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function PrivateCanonObjectBrowser({
  records,
  categories,
}: {
  records: CanonBrowserRecord[];
  categories: CanonBrowserCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const grouped = useMemo(
    () =>
      categories
        .map((category) => ({
          category,
          records: records.filter((record) => record.category === category.slug),
        }))
        .filter((group) => group.records.length > 0)
        .sort(
          (a, b) =>
            a.category.sort_order - b.category.sort_order ||
            a.category.name.localeCompare(b.category.name)
        ),
    [categories, records]
  );

  const selected = grouped.find((group) => group.category.slug === selectedCategory);
  const normalisedSearch = search.trim().toLowerCase();
  const visibleRecords = selected?.records.filter((record) =>
    !normalisedSearch ||
    record.title.toLowerCase().includes(normalisedSearch) ||
    record.rule.toLowerCase().includes(normalisedSearch) ||
    record.canon_key.toLowerCase().includes(normalisedSearch)
  ) ?? [];

  if (records.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-8 text-zinc-300">
        No active Private Canon records have been loaded for this story.
      </section>
    );
  }

  return (
    <section aria-label="Private Canon categories" className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {grouped.map(({ category, records: categoryRecords }, index) => {
          const active = selectedCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              aria-expanded={active}
              aria-controls="canon-category-panel"
              onClick={() => setSelectedCategory(active ? null : category.slug)}
              className={`flex min-h-24 items-center gap-4 rounded-xl border px-5 py-4 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 ${
                active
                  ? "border-amber-300 bg-amber-300 text-zinc-950"
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
                  {categoryRecords.length} {categoryRecords.length === 1 ? "record" : "records"}
                </span>
              </span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <article id="canon-category-panel" className="rounded-2xl border border-amber-300/20 bg-zinc-900 p-5 shadow-2xl shadow-black/20 sm:p-7 lg:p-9">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Private Canon category</p>
              <h2 className="mt-1 text-2xl font-semibold text-amber-300 sm:text-3xl">
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
                className="w-full rounded-full border border-zinc-700 bg-zinc-950 px-5 py-3 text-sm text-white outline-none placeholder:text-zinc-500 focus:border-amber-300"
              />
            </label>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {visibleRecords.map((record) => (
              <section key={record.id} className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-6">
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
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{record.rule}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-400">
                  <div><dt>Importance</dt><dd className="mt-1 text-zinc-200">{humanize(record.importance)}</dd></div>
                  <div><dt>Canon key</dt><dd className="mt-1 break-all text-zinc-200">{record.canon_key}</dd></div>
                </dl>
              </section>
            ))}
          </div>

          {visibleRecords.length === 0 ? (
            <p className="mt-6 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 text-sm text-zinc-400">
              No records match this search.
            </p>
          ) : null}
        </article>
      ) : (
        <p className="text-center text-sm text-zinc-500">Select a category to view its records.</p>
      )}
    </section>
  );
}
