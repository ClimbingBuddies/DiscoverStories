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
  fields: Array<{
    key: string;
    label: string;
    value_type: string;
    help_text: string | null;
    value: unknown;
    sort_order: number;
  }>;
  relationships: Array<{
    id: string;
    relationship_type: string;
    description: string | null;
    target_canon_key: string;
    target_title: string;
    target_category: string;
  }>;
  images: Array<{
    id: string;
    title: string;
    description: string | null;
    asset_role: string;
    public_url: string | null;
    is_primary_reference: boolean;
    review_status: string;
  }>;
  references: Array<{
    id: string;
    reference_type: string;
    title: string;
    citation: string | null;
    url: string | null;
    description: string | null;
    review_status: string;
  }>;
};

export type CanonBrowserCategory = {
  slug: string;
  name: string;
  sort_order: number;
};

function humanize(value: string) {
  return value.replace(/_/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown) {
  if (Array.isArray(value)) return value.join(" · ");
  if (value && typeof value === "object") return JSON.stringify(value);
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function StatusPills({ record }: { record: CanonBrowserRecord }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <span
        className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
          record.canon_state === "confirmed"
            ? "bg-emerald-400/15 text-emerald-300"
            : "bg-amber-400/15 text-amber-300"
        }`}
      >
        {record.canon_state}
      </span>
      <span className="rounded-full bg-zinc-800 px-3 py-1 text-xs text-zinc-300">
        {record.content_status}
      </span>
    </div>
  );
}

function RecordDetails({ record }: { record: CanonBrowserRecord }) {
  return (
    <>
      <StatusPills record={record} />
      <h3 className="mt-4 text-xl font-semibold">{record.title}</h3>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-300">{record.rule}</p>
      <dl className="mt-5 grid grid-cols-1 gap-3 border-t border-zinc-800 pt-4 text-xs text-zinc-400 sm:grid-cols-2">
        <div>
          <dt>Importance</dt>
          <dd className="mt-1 text-zinc-200">{humanize(record.importance)}</dd>
        </div>
        <div>
          <dt>Canon key</dt>
          <dd className="mt-1 break-all text-zinc-200">{record.canon_key}</dd>
        </div>
      </dl>

      {record.fields.length > 0 ? (
        <section className="mt-6 overflow-hidden rounded-xl border border-sky-400/20 bg-sky-400/[0.04]">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-sky-400/15 px-4 py-3">
            <h4 className="text-sm font-semibold text-sky-200">Category-specific fields</h4>
            <span className="text-[11px] text-zinc-500">Fields vary by category</span>
          </div>
          <dl className="divide-y divide-zinc-800/80">
            {record.fields.map((field) => (
              <div key={field.key} className="grid gap-1 px-4 py-3 text-xs sm:grid-cols-[minmax(8rem,0.42fr)_1fr] sm:gap-4">
                <dt className="text-zinc-500">{field.label}</dt>
                <dd className="leading-5 text-zinc-200">{displayValue(field.value)}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {record.relationships.length > 0 ? (
        <section className="mt-6 rounded-xl border border-violet-400/20 bg-violet-400/[0.04] p-4">
          <h4 className="text-sm font-semibold text-violet-200">Relationships</h4>
          <ul className="mt-3 space-y-2">
            {record.relationships.map((relationship) => (
              <li key={relationship.id} className="flex items-center gap-3 rounded-lg bg-zinc-950/70 px-3 py-2 text-xs">
                <span className="rounded-full bg-violet-400/10 px-2 py-1 text-violet-300">
                  {humanize(relationship.relationship_type.replace(/-/g, "_"))}
                </span>
                <span className="min-w-0 truncate text-zinc-200">{relationship.target_title}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {record.images.length > 0 || record.references.length > 0 ? (
        <section className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/[0.035] p-4">
          <h4 className="text-sm font-semibold text-emerald-200">Images and references</h4>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {record.images.map((image) =>
              image.public_url ? (
                <a
                  key={image.id}
                  href={image.public_url}
                  target="_blank"
                  rel="noreferrer"
                  className="group overflow-hidden rounded-lg border border-zinc-800 bg-zinc-950"
                >
                  <img
                    src={image.public_url}
                    alt={image.description || image.title}
                    loading="lazy"
                    className="aspect-[4/3] w-full object-cover transition-transform group-hover:scale-[1.02]"
                  />
                  <span className="block px-3 py-2">
                    <span className="block text-xs font-medium text-zinc-200">{image.title}</span>
                    <span className="mt-1 block text-[11px] text-zinc-500">
                      {humanize(image.asset_role)}
                      {image.is_primary_reference ? " · Primary" : ""}
                    </span>
                  </span>
                </a>
              ) : null
            )}
            {record.references.map((reference) => (
              <a
                key={reference.id}
                href={reference.url || undefined}
                target={reference.url ? "_blank" : undefined}
                rel={reference.url ? "noreferrer" : undefined}
                className="flex min-h-28 flex-col rounded-lg border border-zinc-800 bg-zinc-950 p-3 hover:border-emerald-300/50"
              >
                <span className="text-2xl text-emerald-300" aria-hidden="true">▧</span>
                <span className="mt-auto text-xs font-medium text-zinc-200">{reference.title}</span>
                <span className="mt-1 text-[11px] text-zinc-500">{humanize(reference.reference_type)}</span>
              </a>
            ))}
          </div>
        </section>
      ) : null}
    </>
  );
}

export default function PrivateCanonObjectBrowser({
  records,
  categories,
}: {
  records: CanonBrowserRecord[];
  categories: CanonBrowserCategory[];
}) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
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
  const visibleRecords =
    selected?.records.filter(
      (record) =>
        !normalisedSearch ||
        record.title.toLowerCase().includes(normalisedSearch) ||
        record.rule.toLowerCase().includes(normalisedSearch) ||
        record.canon_key.toLowerCase().includes(normalisedSearch)
    ) ?? [];
  const selectedRecord =
    selected?.records.find((record) => record.id === selectedRecordId) ?? null;

  const chooseCategory = (slug: string) => {
    setSelectedCategory(slug);
    setSelectedRecordId(null);
    setSearch("");
  };

  const showCategories = () => {
    setSelectedCategory(null);
    setSelectedRecordId(null);
    setSearch("");
  };

  if (records.length === 0) {
    return (
      <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-300 sm:p-8">
        No active Private Canon records have been loaded for this story.
      </section>
    );
  }

  return (
    <section aria-label="Private Canon categories" className="space-y-5">
      <div className={selectedCategory ? "hidden sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"}>
        {grouped.map(({ category, records: categoryRecords }, index) => {
          const active = selectedCategory === category.slug;
          return (
            <button
              key={category.slug}
              type="button"
              aria-expanded={active}
              aria-controls="canon-category-panel"
              onClick={() => (active ? showCategories() : chooseCategory(category.slug))}
              className={`flex min-h-20 items-center gap-4 rounded-xl border px-4 py-3 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300 sm:min-h-24 sm:px-5 sm:py-4 ${
                active
                  ? "border-amber-300 bg-amber-300 text-zinc-950"
                  : "border-zinc-800 bg-zinc-900 text-zinc-100 hover:border-zinc-700 hover:bg-zinc-800"
              }`}
            >
              <span
                className={`grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm ${
                  active ? "border-zinc-950/70" : "border-zinc-600 text-zinc-300"
                }`}
              >
                {index + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-base font-semibold sm:text-lg">{category.name}</span>
                <span className={`mt-1 block text-sm ${active ? "text-zinc-800" : "text-zinc-500"}`}>
                  {categoryRecords.length} {categoryRecords.length === 1 ? "record" : "records"}
                </span>
              </span>
              <span aria-hidden="true" className="ml-auto text-xl text-zinc-500 sm:hidden">›</span>
            </button>
          );
        })}
      </div>

      {selected ? (
        <article
          id="canon-category-panel"
          className="rounded-2xl border border-amber-300/20 bg-zinc-900 shadow-2xl shadow-black/20 sm:p-7 lg:p-9"
        >
          <div className="sticky top-0 z-10 rounded-t-2xl border-b border-zinc-800 bg-zinc-900/95 p-4 backdrop-blur sm:static sm:rounded-none sm:border-b-0 sm:bg-transparent sm:p-0">
            <button
              type="button"
              onClick={selectedRecord ? () => setSelectedRecordId(null) : showCategories}
              className="mb-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-zinc-700 px-4 py-2 text-sm font-semibold text-zinc-200 hover:border-amber-300 hover:text-amber-300 sm:hidden"
            >
              <span aria-hidden="true">←</span>
              {selectedRecord ? selected.category.name : "All categories"}
            </button>

            {!selectedRecord ? (
            <div className="mb-4 flex items-center justify-between gap-4 sm:mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-300/80">Selected category</p>
                <h2 className="mt-1 text-xl font-semibold text-white sm:text-2xl">{selected.category.name}</h2>
              </div>
              <span className="shrink-0 text-sm text-zinc-500">{selected.records.length} {selected.records.length === 1 ? "record" : "records"}</span>
            </div>
          ) : null}

          <div className={selectedRecord ? "hidden sm:flex sm:justify-end" : "flex"}>
              <label className="w-full sm:ml-auto sm:max-w-sm">
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
          </div>

          {selectedRecord ? (
            <section className="p-5 sm:hidden">
              <RecordDetails record={selectedRecord} />
            </section>
          ) : null}

          <div
            className={`grid gap-3 p-4 sm:mt-6 sm:grid-cols-1 sm:gap-4 sm:p-0 ${
              selectedRecord ? "hidden sm:grid" : ""
            }`}
          >
              {visibleRecords.map((record) => (
                <section key={record.id} className="hidden rounded-xl border border-zinc-800 bg-zinc-950/70 p-6 sm:block">
                  <RecordDetails record={record} />
                </section>
              ))}

              {visibleRecords.map((record) => (
                <button
                  key={`mobile-${record.id}`}
                  type="button"
                  onClick={() => setSelectedRecordId(record.id)}
                  className="rounded-xl border border-zinc-800 bg-zinc-950/70 p-4 text-left hover:border-amber-300/60 sm:hidden"
                >
                  <StatusPills record={record} />
                  <span className="mt-3 flex items-center gap-3">
                    <span className="min-w-0 flex-1">
                      <span className="block text-base font-semibold text-white">{record.title}</span>
                      <span className="mt-1 block truncate text-xs text-zinc-500">
                        {humanize(record.importance)} · {record.canon_key}
                      </span>
                    </span>
                    <span aria-hidden="true" className="text-2xl text-zinc-500">›</span>
                  </span>
                </button>
              ))}
          </div>

          {!selectedRecord && visibleRecords.length === 0 ? (
            <p className="m-4 rounded-xl border border-zinc-800 bg-zinc-950/70 p-5 text-sm text-zinc-400 sm:m-0 sm:mt-6">
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
