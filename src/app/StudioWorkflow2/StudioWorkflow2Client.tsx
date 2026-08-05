"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import "./studio-reference.css";

type StoryOption = { id: string; title: string; slug: string; content_status: string };
type Episode = { id: string; episode_number: number; season_number: number; title: string; summary: string | null; episode_status: string; word_count: number | null; artwork_url: string | null; artwork_path: string | null };
type PlanningBlock = { id: string; season_number: number; block_number: number; episode_start: number; episode_end: number; title: string; arc_summary: string | null; content_status: string };
type CanonCategory = { slug: string; name: string; description: string | null; sort_order: number; record_count: number };
type CanonSection = { id: string; heading: string; section_key: string; content: string; content_status: string; sort_order: number };
type CanonRecord = {
  id: string; slug: string; category: string; title: string; summary: string | null;
  description: string | null; primary_image_path: string | null; banner_image_path: string | null;
  content_status: string; is_public: boolean; spoiler_level: number; sort_order: number | null;
  updated_at: string; reveal_episode: { season_number: number; episode_number: number; title: string } | null;
  sections: CanonSection[]; images: { id: string; public_url: string | null; storage_path: string | null; alt_text: string | null; caption: string | null }[];
  character_profile: Record<string, string | null> | null;
  related_records: { id: string; title: string; slug: string; category: string; relationship_type: string; description: string | null }[];
  linked_episodes: { id: string; season_number: number; episode_number: number; title: string; appearance_type: string; notes: string | null }[];
};
type Dashboard = {
  story: { id: string; title: string; slug: string; content_status: string; short_description: string | null; description: string | null; cover_image_url: string | null; cover_image_path: string | null; banner_image_path: string | null };
  premise: { premise_title: string; premise_text: string; content_status: string; version_number: number; updated_at: string } | null;
  episodes: Episode[]; planning_blocks: PlanningBlock[]; canon_categories: CanonCategory[]; canon_records: CanonRecord[];
  counts: { episodes: number; published_episodes: number; draft_episodes: number; review_episodes: number; planning_blocks: number; canon_records: number };
};

const tabs = ["Story Brief", "Season Plan", "Episodes", "Canon", "Planning", "Review"] as const;
type Tab = (typeof tabs)[number];

const categoryAliases: Record<string, string> = {
  character: "Characters", location: "Locations", organisation: "Factions",
  faction: "Factions", technology: "Technology & Science", concept: "Rules & Concepts",
  event: "History & Timeline", artefact: "Objects", object: "Objects",
};
const profileLabels: Record<string, string> = {
  role_in_story: "Role in story", personality: "Personality", strengths: "Strengths",
  weaknesses: "Weaknesses", motivations: "Motivations", fears: "Fears",
  speech_style: "Speech style", appearance: "Appearance",
  habits_and_mannerisms: "Habits & mannerisms", moral_boundaries: "Moral boundaries",
  current_state: "Current state", character_arc_notes: "Development",
};

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function RichText({ value }: { value: string }) {
  const blocks = value.split(/\n{2,}/).filter((part) => part.trim());
  return <div className="sr-richtext">{blocks.map((block, index) => {
    const text = block.trim();
    const heading = text.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      const Tag = heading[1].length === 1 ? "h2" : heading[1].length === 2 ? "h3" : "h4";
      return <Tag key={index}>{heading[2]}</Tag>;
    }
    const lines = text.split("\n");
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return <ul key={index}>{lines.map((line) => <li key={line}>{line.replace(/^[-*]\s+/, "")}</li>)}</ul>;
    }
    return <p key={index}>{lines.join(" ")}</p>;
  })}</div>;
}

function Empty({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="sr-empty"><span aria-hidden="true">◇</span><h3>{title}</h3><p>{children}</p></div>;
}

export default function StudioWorkflow2Client() {
  const [stories, setStories] = useState<StoryOption[]>([]);
  const [storyId, setStoryId] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("Story Brief");
  const [mode, setMode] = useState<"studio" | "reference">("studio");
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [category, setCategory] = useState("");
  const [recordId, setRecordId] = useState("");
  const [episodeId, setEpisodeId] = useState("");
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedTheme = window.localStorage.getItem("story-studio-theme");
    if (savedTheme === "dark" || savedTheme === "light") setTheme(savedTheme);
    const initial = new URLSearchParams(window.location.search).get("story_id") ?? "";
    void supabase.rpc("list_studio_story_options", { p_studio_mode: true }).then(({ data, error: rpcError }) => {
      if (rpcError) { setError(rpcError.message); setLoading(false); return; }
      const options = Array.isArray(data) ? data as StoryOption[] : [];
      setStories(options);
      setStoryId(options.some((story) => story.id === initial) ? initial : options[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!storyId) return;
    setLoading(true); setError("");
    const url = new URL(window.location.href); url.searchParams.set("story_id", storyId);
    window.history.replaceState({}, "", url);
    void supabase.rpc("get_studio_story_dashboard", { p_story_id: storyId, p_studio_mode: mode === "studio" }).then(({ data, error: rpcError }) => {
      if (rpcError) setError(rpcError.message);
      else {
        const next = data as Dashboard;
        setDashboard(next);
        setCategory(next.canon_categories.find((item) => item.record_count > 0)?.slug ?? next.canon_categories[0]?.slug ?? "");
        setEpisodeId(next.episodes[0]?.id ?? "");
      }
      setLoading(false);
    });
  }, [storyId, mode]);

  useEffect(() => {
    window.localStorage.setItem("story-studio-theme", theme);
  }, [theme]);

  const categories = dashboard?.canon_categories ?? [];
  const records = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return (dashboard?.canon_records ?? []).filter((record) =>
      record.category === category && (!needle || record.title.toLowerCase().includes(needle) || record.summary?.toLowerCase().includes(needle))
    );
  }, [dashboard, category, query]);
  const selectedRecord = records.find((record) => record.id === recordId) ?? records[0] ?? null;
  const selectedEpisode = dashboard?.episodes.find((episode) => episode.id === episodeId) ?? dashboard?.episodes[0] ?? null;

  useEffect(() => {
    if (selectedRecord && selectedRecord.id !== recordId) setRecordId(selectedRecord.id);
  }, [selectedRecord, recordId]);

  const openRelated = (related: CanonRecord["related_records"][number]) => {
    setCategory(related.category); setRecordId(related.id);
  };

  return (
    <main className={"sr-shell " + (theme === "dark" ? "sr-dark" : "sr-light")}>
      <header className="sr-header">
        <button className="sr-brand" onClick={() => setActiveTab("Story Brief")}><span>DISCOVER STORIES</span><strong>STORY STUDIO</strong></button>
        <nav aria-label="Story Studio sections">{tabs.map((tab) => <button key={tab} onClick={() => setActiveTab(tab)} className={activeTab === tab ? "is-active" : ""}>{tab}</button>)}</nav>
        <div className="sr-controls">
          <label><span>Story</span><select value={storyId} onChange={(event) => setStoryId(event.target.value)}>{stories.map((story) => <option key={story.id} value={story.id}>{story.title}</option>)}</select></label>
          <button className="sr-pill" onClick={() => setMode(mode === "studio" ? "reference" : "studio")}>{mode === "studio" ? "Studio" : "Reference"}</button>
          <button className="sr-theme" aria-label="Toggle colour theme" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "◐" : "◑"}</button>
        </div>
      </header>

      {error && <div className="sr-error">{error}</div>}
      {loading && <div className="sr-loading">Loading story records…</div>}
      {!loading && dashboard && (
        <>
          {activeTab === "Story Brief" && <section className="sr-page sr-brief">
            <div className="sr-hero">
              <div className="sr-hero-copy"><p className="sr-eyebrow">STORY BRIEF · {label(dashboard.story.content_status)}</p><h1>{dashboard.story.title}</h1><p className="sr-deck">{dashboard.story.short_description}</p></div>
              {dashboard.story.cover_image_url ? <img src={dashboard.story.cover_image_url} alt="" /> : <div className="sr-art-placeholder"><span>Artwork</span><small>No story image is linked</small></div>}
            </div>
            <article className="sr-paper">
              <div className="sr-paper-head"><div><p className="sr-eyebrow">CONTROLLING BRIEF</p><h2>{dashboard.premise?.premise_title ?? "Story Brief"}</h2></div>{dashboard.premise && <span>Version {dashboard.premise.version_number} · {label(dashboard.premise.content_status)}</span>}</div>
              {dashboard.premise?.premise_text ? <RichText value={dashboard.premise.premise_text} /> : <Empty title="No Story Brief has been loaded">Add the complete structured brief to the single premise text field.</Empty>}
            </article>
          </section>}

          {activeTab === "Season Plan" && <section className="sr-page">
            <div className="sr-title"><p className="sr-eyebrow">SEASON PLAN</p><h1>Story architecture</h1><p>{dashboard.planning_blocks.length} database-controlled planning blocks.</p></div>
            <div className="sr-plan-list">{dashboard.planning_blocks.length ? dashboard.planning_blocks.map((block) => <article key={block.id}><span>EPISODES {block.episode_start}–{block.episode_end}</span><div><h2>{block.title}</h2><p>{block.arc_summary ?? "No arc summary loaded."}</p></div><small>{label(block.content_status)}</small></article>) : <Empty title="No season plan yet">Planning blocks will appear here when they are added to the story.</Empty>}</div>
          </section>}

          {activeTab === "Episodes" && <section className="sr-page sr-master-detail">
            <aside className="sr-record-list"><div className="sr-list-head"><p className="sr-eyebrow">EPISODES</p><h2>{dashboard.episodes.length} records</h2></div>{dashboard.episodes.map((episode) => <button key={episode.id} className={selectedEpisode?.id === episode.id ? "is-active" : ""} onClick={() => setEpisodeId(episode.id)}><span>{String(episode.episode_number).padStart(2, "0")}</span><div><strong>{episode.title}</strong><small>{label(episode.episode_status)}</small></div></button>)}</aside>
            <article className="sr-reading-surface">{selectedEpisode ? <><p className="sr-eyebrow">SEASON {selectedEpisode.season_number} · EPISODE {selectedEpisode.episode_number}</p><h1>{selectedEpisode.title}</h1>{selectedEpisode.artwork_url ? <img className="sr-episode-art" src={selectedEpisode.artwork_url} alt="" /> : <div className="sr-art-placeholder compact"><span>Episode artwork</span><small>No image linked</small></div>}<p className="sr-lead">{selectedEpisode.summary ?? "No episode summary loaded."}</p><div className="sr-meta-row"><span>{label(selectedEpisode.episode_status)}</span><span>{(selectedEpisode.word_count ?? 0).toLocaleString()} words</span></div></> : <Empty title="No episodes yet">Episodes will appear here when they are added to the story.</Empty>}</article>
          </section>}

          {activeTab === "Canon" && <section className="sr-canon">
            <div className="sr-canon-tabs">{categories.map((item) => <button key={item.slug} onClick={() => { setCategory(item.slug); setQuery(""); }} className={category === item.slug ? "is-active" : ""}><span>{categoryAliases[item.slug] ?? item.name}</span><small>{item.record_count}</small></button>)}</div>
            <div className="sr-canon-layout">
              <aside className="sr-record-browser"><div><p className="sr-eyebrow">{categoryAliases[category] ?? label(category)}</p><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" /></div>{records.length ? records.map((record) => <button key={record.id} className={selectedRecord?.id === record.id ? "is-active" : ""} onClick={() => setRecordId(record.id)}><strong>{record.title}</strong><span>{record.summary ?? "No summary loaded."}</span><small>{label(record.content_status)}{record.reveal_episode ? " · Reveals E" + record.reveal_episode.episode_number : ""}</small></button>) : <Empty title="No records in this category">This is an honest empty state; no placeholder Canon has been created.</Empty>}</aside>
              <article className="sr-canon-record">{selectedRecord ? <>
                <div className="sr-record-hero"><div><p className="sr-eyebrow">{categoryAliases[selectedRecord.category] ?? label(selectedRecord.category)} · {label(selectedRecord.content_status)}</p><h1>{selectedRecord.title}</h1><p>{selectedRecord.summary}</p><div className="sr-meta-row"><span>{selectedRecord.is_public ? "Public infrastructure" : "Not public"}</span><span>Spoiler level {selectedRecord.spoiler_level}</span>{selectedRecord.reveal_episode && <span>Reveal: Episode {selectedRecord.reveal_episode.episode_number}</span>}</div></div>{selectedRecord.images[0]?.public_url ? <img src={selectedRecord.images[0].public_url} alt={selectedRecord.images[0].alt_text ?? ""} /> : <div className="sr-art-placeholder"><span>Reference artwork</span><small>No Canon image is linked</small></div>}</div>
                {selectedRecord.description && <section><h2>Overview</h2><p className="sr-lead">{selectedRecord.description}</p></section>}
                {selectedRecord.sections.map((section) => <section key={section.id}><h2>{section.heading}</h2><RichText value={section.content} /></section>)}
                {selectedRecord.character_profile && Object.entries(selectedRecord.character_profile).some(([key, value]) => key in profileLabels && value) && <section><h2>Character reference</h2><div className="sr-attributes">{Object.entries(selectedRecord.character_profile).filter(([key, value]) => key in profileLabels && value).map(([key, value]) => <div key={key}><span>{profileLabels[key]}</span><p>{value}</p></div>)}</div></section>}
                {selectedRecord.related_records.length > 0 && <section><h2>Related Canon</h2><div className="sr-related">{selectedRecord.related_records.map((related) => <button key={related.id} onClick={() => openRelated(related)}><span>{categoryAliases[related.category] ?? label(related.category)}</span><strong>{related.title}</strong><small>{label(related.relationship_type)}</small></button>)}</div></section>}
                {selectedRecord.linked_episodes.length > 0 && <section><h2>Linked episodes</h2><div className="sr-linked">{selectedRecord.linked_episodes.map((episode) => <button key={episode.id} onClick={() => { setEpisodeId(episode.id); setActiveTab("Episodes"); }}><span>EP {episode.episode_number}</span><strong>{episode.title}</strong><small>{label(episode.appearance_type)}</small></button>)}</div></section>}
                {!selectedRecord.description && !selectedRecord.sections.length && !selectedRecord.character_profile && <Empty title="This Canon record is still concise">Only the database fields currently populated are shown.</Empty>}
              </> : <Empty title="Choose a Canon record">Select a populated category and record to open its illustrated reference page.</Empty>}</article>
            </div>
          </section>}

          {activeTab === "Planning" && <section className="sr-page"><div className="sr-title"><p className="sr-eyebrow">STUDIO ONLY</p><h1>Planning workspace</h1></div><Empty title="Planning remains available">The shell is ready, but no separate planning records beyond the Season Plan are being invented.</Empty></section>}

          {activeTab === "Review" && <section className="sr-page"><div className="sr-title"><p className="sr-eyebrow">REVIEW</p><h1>Production evidence</h1><p>Counts reflect current database records, not invented assessment results.</p></div><div className="sr-review"><div><strong>{dashboard.counts.episodes}</strong><span>Episodes</span></div><div><strong>{dashboard.counts.published_episodes}</strong><span>Published</span></div><div><strong>{dashboard.counts.planning_blocks}</strong><span>Plan blocks</span></div><div><strong>{dashboard.counts.canon_records}</strong><span>Canon records</span></div></div></section>}
        </>
      )}
    </main>
  );
}
