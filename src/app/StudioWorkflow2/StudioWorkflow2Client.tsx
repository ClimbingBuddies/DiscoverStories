"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type StoryOption = { id: string; title: string; slug: string; content_status: string };
type Episode = {
  id: string; episode_number: number; season_number: number; title: string;
  summary: string | null; episode_status: string; word_count: number;
  artwork_url: string | null; artwork_path: string | null;
};
type PlanningBlock = {
  id: string; season_number: number; block_number: number; episode_start: number;
  episode_end: number; title: string; arc_summary: string; content_status: string;
};
type Character = { id: string; slug: string; title: string; short_description: string | null; content_status: string };
type Dashboard = {
  story: { id: string; title: string; slug: string; content_status: string; short_description: string | null; description: string | null; cover_image_url: string | null };
  premise: { premise_title: string; premise_text: string; content_status: string; version_number: number; updated_at: string } | null;
  episodes: Episode[];
  planning_blocks: PlanningBlock[];
  characters: Character[];
  counts: { episodes: number; published_episodes: number; draft_episodes: number; review_episodes: number; planning_blocks: number; characters: number };
};

const primary = ["Overview", "Story", "Canon", "Artwork", "Wiki", "Security"] as const;
const storyTabs = ["Story Brief", "Season Plan", "Episodes", "Characters", "Canon", "Review"] as const;

function Icon({ symbol }: { symbol: string }) {
  return <span aria-hidden="true" className="studio-story-icon">{symbol}</span>;
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function StudioWorkflow2Client() {
  const [selected, setSelected] = useState<(typeof primary)[number]>("Overview");
  const [storyOptions, setStoryOptions] = useState<StoryOption[]>([]);
  const [storyId, setStoryId] = useState("");
  const [storySearch, setStorySearch] = useState("");
  const [dashboard, setDashboard] = useState<Dashboard | null>(null);
  const [activeTab, setActiveTab] = useState<(typeof storyTabs)[number]>("Story Brief");
  const [episodeFilter, setEpisodeFilter] = useState("all");
  const [episodeSearch, setEpisodeSearch] = useState("");
  const [statusOpen, setStatusOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get("story_id") ?? "";
    void supabase.rpc("list_studio_story_options", { p_studio_mode: true }).then(({ data, error: rpcError }) => {
      if (rpcError) { setError(rpcError.message); return; }
      const options = Array.isArray(data) ? data as StoryOption[] : [];
      setStoryOptions(options);
      setStoryId(options.some((option) => option.id === initial) ? initial : options[0]?.id ?? "");
    });
  }, []);

  useEffect(() => {
    if (!storyId) return;
    const url = new URL(window.location.href);
    url.searchParams.set("story_id", storyId);
    window.history.replaceState({}, "", url);
    setLoading(true);
    setError("");
    void supabase.rpc("get_studio_story_dashboard", { p_story_id: storyId, p_studio_mode: true }).then(({ data, error: rpcError }) => {
      if (rpcError) setError(rpcError.message);
      else setDashboard(data as Dashboard);
      setLoading(false);
    });
  }, [storyId]);

  useEffect(() => {\n    const matched = storyOptions.find((option) => option.title === storySearch);\n    if (matched && matched.id !== storyId) setStoryId(matched.id);\n  }, [storySearch, storyOptions, storyId]);\n\n  const selectedOption = storyOptions.find((option) => option.id === storyId);
  const matchingStories = storyOptions.filter((option) => option.title.toLowerCase().includes(storySearch.trim().toLowerCase()));
  const filteredEpisodes = useMemo(() => {
    if (!dashboard) return [];
    const query = episodeSearch.trim().toLowerCase();
    return dashboard.episodes.filter((episode) => {
      const matchesFilter =
        episodeFilter === "all" ||
        (episodeFilter === "artwork" && !episode.artwork_path && !episode.artwork_url) ||
        episode.episode_status === episodeFilter;
      const matchesSearch = !query || String(episode.episode_number).includes(query) || episode.title.toLowerCase().includes(query);
      return matchesFilter && matchesSearch;
    });
  }, [dashboard, episodeFilter, episodeSearch]);

  const openStory = () => {
    setSelected("Story");
    setActiveTab("Story Brief");
  };

  return (
    <main className="studio2-shell">
      <aside className="studio2-sidebar">
        <div className="studio2-brand"><span className="studio2-menu">☰</span><span>STUDIO</span></div>
        <nav aria-label="Studio sections">
          <p className="studio2-section-label">WORKSPACE</p>
          {primary.map((label) => (
            <button key={label} className={`studio2-nav-item ${selected === label ? "is-selected" : ""}`} onClick={() => label === "Story" ? openStory() : setSelected(label)}>
              <Icon symbol={label === "Overview" ? "⌂" : label === "Story" ? "▣" : label === "Canon" ? "◈" : label === "Artwork" ? "▧" : label === "Wiki" ? "▤" : "◇"} /><span>{label}</span>
            </button>
          ))}
        </nav>
        <div className="studio2-user"><span className="studio2-avatar">ST</span><span><strong>Studio Team</strong><small>Studio Editor</small></span></div>
      </aside>

      <section className="studio2-content studio-story-content">
        <header className="studio2-topbar">
          <div><span className="studio2-kicker">DISCOVER STORIES / STORY STUDIO</span><h1>{selected === "Story" && dashboard ? dashboard.story.title : "STUDIO WORKFLOW"}</h1></div>
          <label className="studio2-story-picker"><span>STORY</span><input value={storySearch} onChange={(event) => setStorySearch(event.target.value)} placeholder={selectedOption?.title ?? "Search stories"} list="studio-story-options" aria-label="Search stories" /><datalist id="studio-story-options">{matchingStories.map((option) => <option key={option.id} value={option.title} /></datalist></label>
          <span className="studio2-mode"><span /> Studio mode</span>
        </header>

        {selected !== "Story" ? (
          <div className="studio2-body"><div className="studio2-overview-label"><p className="studio2-kicker">CORE WORKFLOW</p></div><button className="studio-story-overview-card" onClick={openStory}><div><span className="studio2-kicker">STORY</span><h2>Open Story Studio</h2><p>Select a story to review its premise, season plan, episodes, characters and Canon context.</p></div><span className="studio-story-arrow">→</span></button></div>
        ) : (
          <div className="studio-story-page">
            <div className="studio-story-heading">
              <div><span className="studio2-kicker">STORY REVIEW</span><h2>{dashboard?.story.title ?? "Loading story…"}</h2><p>{dashboard?.story.short_description ?? ""}</p></div>
              <button className="studio-story-back" onClick={() => setSelected("Overview")}>← Overview</button>
            </div>
            <nav className="studio-story-tabs" aria-label="Story Studio views">
              {storyTabs.map((tab) => <button key={tab} className={activeTab === tab ? "is-active" : ""} onClick={() => setActiveTab(tab)}>{tab}</button>)}
            </nav>
            {error && <p className="studio-story-error">{error}</p>}
            {loading && <p className="studio-story-loading">Loading database records…</p>}
            {!loading && dashboard && activeTab === "Story Brief" && (
              <div className="studio-story-grid">
                <article className="studio-story-premise"><span className="studio2-kicker">STORY PREMISE</span><h3>{dashboard.premise?.premise_title ?? "No premise loaded"}</h3><div className="studio-story-premise-text">{dashboard.premise?.premise_text ?? "This story does not yet have a populated premise record."}</div></article>
                <aside className="studio-story-status">
                  <button onClick={() => setStatusOpen(!statusOpen)}><span>PRODUCT STATUS</span><strong>{statusOpen ? "⌃" : "⌄"}</strong></button>
                  {statusOpen && <div className="studio-story-status-body"><p><span>Story</span><strong>{statusLabel(dashboard.story.content_status)}</strong></p><p><span>Premise</span><strong>{dashboard.premise ? statusLabel(dashboard.premise.content_status) : "Missing"}</strong></p><p><span>Episodes</span><strong>{dashboard.counts.episodes}</strong></p><p><span>Characters</span><strong>{dashboard.counts.characters}</strong></p><p><span>Plan blocks</span><strong>{dashboard.counts.planning_blocks}</strong></p></div>}
                </aside>
              </div>
            )}
            {!loading && dashboard && activeTab === "Season Plan" && (
              <div className="studio-story-section"><div className="studio-story-section-head"><div><span className="studio2-kicker">SEASON PLAN</span><h3>Story architecture</h3></div><span>{dashboard.counts.planning_blocks} database plan blocks</span></div>{dashboard.planning_blocks.length ? dashboard.planning_blocks.map((block) => <article className="studio-story-plan-card" key={block.id}><div><strong>Episodes {block.episode_start}–{block.episode_end}</strong><h4>{block.title}</h4></div><p>{block.arc_summary}</p><small>{statusLabel(block.content_status)}</small></article>) : <div className="studio-story-empty"><h4>No planning blocks are populated yet.</h4><p>The Season Plan view is ready and will display roadmap blocks as they are loaded into Supabase.</p><button onClick={() => setActiveTab("Episodes")}>Review current episodes →</button></div>}</div>
            )}
            {!loading && dashboard && activeTab === "Episodes" && (
              <div className="studio-story-section"><div className="studio-story-section-head"><div><span className="studio2-kicker">EPISODES</span><h3>Production batch</h3></div><span>{filteredEpisodes.length} of {dashboard.episodes.length}</span></div><div className="studio-story-filters"><select value={episodeFilter} onChange={(event) => setEpisodeFilter(event.target.value)}><option value="all">All episodes</option><option value="published">Published</option><option value="review">Review</option><option value="draft">Draft</option><option value="artwork">Missing artwork</option></select><input value={episodeSearch} onChange={(event) => setEpisodeSearch(event.target.value)} placeholder="Search episode number or title" /></div><div className="studio-story-episode-list">{filteredEpisodes.map((episode) => <article key={episode.id}><span className="studio-story-episode-number">{String(episode.episode_number).padStart(2, "0")}</span><div><h4>{episode.title}</h4><p>{episode.summary ?? "No episode summary loaded."}</p></div><span className={`studio-story-badge ${episode.episode_status}`}>{statusLabel(episode.episode_status)}</span><small>{episode.artwork_path || episode.artwork_url ? "Artwork" : "Missing art"} · {episode.word_count.toLocaleString()} words</small></article>)}</div></div>
            )}
            {!loading && dashboard && activeTab === "Characters" && <div className="studio-story-section"><div className="studio-story-section-head"><div><span className="studio2-kicker">CHARACTERS</span><h3>Story character records</h3></div><span>{dashboard.characters.length} database records</span></div><div className="studio-story-character-grid">{dashboard.characters.map((character) => <article key={character.id}><span className="studio-story-character-mark">✦</span><h4>{character.title}</h4><p>{character.short_description ?? "No public description loaded."}</p><small>{statusLabel(character.content_status)}</small></article>)}</div></div>}
            {!loading && dashboard && activeTab === "Canon" && <div className="studio-story-section"><span className="studio2-kicker">CANON CONTEXT</span><h3>Private Canon remains the source of truth</h3><p className="studio-story-lead">This story view is a filtered reference point. Canon editing remains in the dedicated Canon workflow, while the selected story carries its context here for review.</p><div className="studio-story-empty"><h4>{dashboard.counts.characters} character records and story-linked Canon data are available.</h4><p>Open the Canon workflow to inspect or edit authoritative records.</p></div></div>}
            {!loading && dashboard && activeTab === "Review" && <div className="studio-story-section"><span className="studio2-kicker">REVIEW FRAMEWORK</span><h3>Review is being built</h3><p className="studio-story-lead">The dashboard does not invent review outcomes. It shows the production evidence currently available for this story.</p><div className="studio-story-review-grid"><span><strong>{dashboard.counts.episodes}</strong><small>Episodes loaded</small></span><span><strong>{dashboard.counts.published_episodes}</strong><small>Published episodes</small></span><span><strong>{dashboard.counts.characters}</strong><small>Characters linked</small></span><span><strong>{dashboard.premise ? "Ready" : "Missing"}</strong><small>Story premise</small></span></div></div>}
          </div>
        )}
      </section>
    </main>
  );
}
