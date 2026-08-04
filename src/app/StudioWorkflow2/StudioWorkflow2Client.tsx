"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";

type IconName = "home" | "book" | "database" | "image" | "file" | "shield" | "search" | "inbox" | "activity" | "settings" | "brief" | "calendar" | "draft" | "review" | "approve";

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    home: "M3 10.5 12 3l9 7.5M5.5 9v10h13V9M9 19v-5h6v5",
    book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v16H6.5A2.5 2.5 0 0 0 4 21.5zM4 5.5v16M8 7h8M8 11h8",
    database: "M4 5c0-1.1 3.6-2 8-2s8 .9 8 2-3.6 2-8 2-8-.9-8-2zm0 0v7c0 1.1 3.6 2 8 2s8-.9 8-2V5m-16 7v7c0 1.1 3.6 2 8 2s8-.9 8-2v-7",
    image: "M4 5h16v14H4zM7 15l3-3 2 2 2-2 3 3M8 9h.01",
    file: "M6 3h8l4 4v14H6zM14 3v5h5M9 12h6M9 16h6",
    shield: "M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6zM9 12l2 2 4-4",
    search: "m20 20-4.5-4.5M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15",
    inbox: "M4 5h16v14H4zM4 13h4l1.5 2h5L16 13h4",
    activity: "M3 12h4l2-6 4 12 2-6h6",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zm0-5v3m0 8v3m0 5v-3M4.9 4.9 7 7m10 10 2.1 2.1M3 12h3m12 0h3M4.9 19.1 7 17m10-10 2.1-2.1",
    brief: "M6 5h12v15H6zM9 5V3h6v2M9 10h6M9 14h4",
    calendar: "M5 4h14v16H5zM8 2v4m8-4v4M5 9h14M9 13h.01M13 13h.01M9 17h.01",
    draft: "M4 19.5V21h1.5L18.8 7.7l-2.5-2.5zM14.8 6.2l2.5 2.5M6 4h6",
    review: "M4 5h16v14H4zM8 10h8M8 14h5M7 7h.01",
    approve: "M12 3 20 6v5c0 5-3.3 8.5-8 10-4.7-1.5-8-5-8-10V6zM8 12l2.5 2.5L16 9",
  };
  return <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d={paths[name]} /></svg>;
}

const primary = [
  ["Overview", "home"], ["Story", "book"], ["Canon", "database"], ["Artwork", "image"], ["Wiki", "file"], ["Security", "shield"],
] as const;
const secondary = [["Search", "search"], ["Inbox", "inbox"], ["Activity", "activity"], ["Settings", "settings"]] as const;

const stages = [
  { label: "Brief", note: "Define the story", icon: "brief", state: "complete" },
  { label: "Season Plan", note: "Shape the season", icon: "calendar", state: "complete" },
  { label: "Episode Plan", note: "Map the episodes", icon: "calendar", state: "complete" },
  { label: "Draft", note: "Write the story", icon: "draft", state: "next" },
  { label: "Review", note: "Check the candidate", icon: "review", state: "next" },
  { label: "Approve", note: "Release the version", icon: "approve", state: "next" },
] as const;

const securityControls = [
  ["Access Control", "Roles and permissions"],
  ["Audit Log", "Track production changes"],
  ["Data Protection", "Classification and privacy"],
  ["Policy", "Rules and compliance"],
] as const;

type CanonWorkspace = { id: string; slug: string; title: string; record_count: number; confirmed_count: number; proposed_count: number; content_status: string; updated_at: string; linked_story: { slug: string; title: string } | null; };
type CanonMetrics = { stories: number; records: number; confirmed: number; draft: number; needs_review: number; characters: number; science: number; };\ntype ArtworkMetrics = { stories: number; episode_art: number; covers: number; banners: number; assets: number; approved: number; needs_review: number; draft: number; missing_art: number; };\ntype WikiMetrics = { stories: number; articles: number; public_articles: number; draft: number; needs_review: number; sections: number; episode_links: number; published: number; };\ntype StoryOption = { id: string; title: string; slug: string; };

const domains = [
  { label: "Canon", eyebrow: "SOURCE OF TRUTH", icon: "database", state: "Synced", tone: "teal", description: "Canonical data used across all production domains.", items: [["Stories", "0"], ["Records", "0"], ["Confirmed", "0"], ["Draft", "0"], ["Needs Review", "0"], ["Characters", "0"], ["Science", "0"]], link: "Open Canon" },
  { label: "Artwork", eyebrow: "SUPPORTING LAYER", icon: "image", state: "Synced", tone: "blue", description: "Visual production informed by Canon and Story.", items: [["Stories", "0"], ["Episode Art", "0"], ["Covers", "0"], ["Banners", "0"], ["Approved", "0"], ["Needs Review", "0"], ["Missing Art", "0"]], link: "Open Artwork" },
  { label: "Wiki", eyebrow: "DOWNSTREAM PUBLICATION", icon: "file", state: "Published", tone: "purple", description: "Approved public knowledge with reveal and spoiler controls.", items: [["Stories", "0"], ["Articles", "0"], ["Published", "0"], ["Draft", "0"], ["Needs Review", "0"], ["Sections", "0"], ["Episode Links", "0"]], link: "Open Wiki" },
] as const;

export default function StudioWorkflow2Client() {
  const [selected, setSelected] = useState("Overview");
  const [selectedStage, setSelectedStage] = useState("Brief");
  const [canonWorkspaces, setCanonWorkspaces] = useState<CanonWorkspace[]>([]);
  const [canonMetrics, setCanonMetrics] = useState<CanonMetrics>({ stories: 0, records: 0, confirmed: 0, draft: 0, needs_review: 0, characters: 0, science: 0 });
  const [canonLoading, setCanonLoading] = useState(true);\n  const [wikiMetrics, setWikiMetrics] = useState<WikiMetrics>({ stories: 0, articles: 0, public_articles: 0, draft: 0, needs_review: 0, sections: 0, episode_links: 0, published: 0 });\n  const [artworkMetrics, setArtworkMetrics] = useState<ArtworkMetrics>({ stories: 0, episode_art: 0, covers: 0, banners: 0, assets: 0, approved: 0, needs_review: 0, draft: 0, missing_art: 0 });

  useEffect(() => {
    let mounted = true;
    void Promise.all([
      supabase.rpc("list_studio_private_canon", { p_studio_mode: true }),
      supabase.rpc("get_studio_canon_metrics", { p_studio_mode: true }),\n      supabase.rpc("get_studio_artwork_metrics", { p_studio_mode: true }),\n      supabase.rpc("get_studio_wiki_metrics"),
    ]).then(([workspacesResult, metricsResult, artworkResult, wikiResult]) => {
      if (!mounted) return;
      if (!workspacesResult.error && Array.isArray(workspacesResult.data)) setCanonWorkspaces(workspacesResult.data as CanonWorkspace[]);
      if (!metricsResult.error && metricsResult.data && typeof metricsResult.data === "object") {
        const value = metricsResult.data as Partial<CanonMetrics>;
        setCanonMetrics({
          stories: Number(value.stories ?? 0), records: Number(value.records ?? 0),
          confirmed: Number(value.confirmed ?? 0), draft: Number(value.draft ?? 0),
          needs_review: Number(value.needs_review ?? 0), characters: Number(value.characters ?? 0),
          science: Number(value.science ?? 0),
        });
      }
      if (!wikiResult.error && wikiResult.data && typeof wikiResult.data === "object") {
        const value = wikiResult.data as Partial<WikiMetrics>;
        setWikiMetrics({
          stories: Number(value.stories ?? 0), articles: Number(value.articles ?? 0),
          public_articles: Number(value.public_articles ?? 0), draft: Number(value.draft ?? 0),
          needs_review: Number(value.needs_review ?? 0), sections: Number(value.sections ?? 0),
          episode_links: Number(value.episode_links ?? 0), published: Number(value.published ?? 0),
        });
      }
      if (!artworkResult.error && artworkResult.data && typeof artworkResult.data === "object") {\n        const value = artworkResult.data as Partial<ArtworkMetrics>;\n        setArtworkMetrics({\n          stories: Number(value.stories ?? 0), episode_art: Number(value.episode_art ?? 0),\n          covers: Number(value.covers ?? 0), banners: Number(value.banners ?? 0), assets: Number(value.assets ?? 0),\n          approved: Number(value.approved ?? 0), needs_review: Number(value.needs_review ?? 0),\n          draft: Number(value.draft ?? 0), missing_art: Number(value.missing_art ?? 0),\n        });\n      }\n      setCanonLoading(false);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {\n    const storyId = new URLSearchParams(window.location.search).get("story_id") ?? "";\n    setSelectedStoryId(storyId);\n    void supabase.from("stories").select("id,title,slug").order("title").then(({ data }) => {\n      if (Array.isArray(data)) setStories(data as StoryOption[]);\n    });\n  }, []);\n\n  const filteredStories = stories.filter((story) => story.title.toLowerCase().includes(storySearch.trim().toLowerCase()));\n  const selectedStory = stories.find((story) => story.id === selectedStoryId);\n\n  useEffect(() => {\n    const matched = stories.find((story) => story.title === storySearch);\n    if (!matched) return;\n    setSelectedStoryId(matched.id);\n    const url = new URL(window.location.href);\n    url.searchParams.set("story_id", matched.id);\n    window.history.replaceState({}, "", url);\n  }, [storySearch, stories]);\n  const liveCanonMetrics = {
    stories: canonMetrics.stories, records: canonMetrics.records, confirmed: canonMetrics.confirmed,
    draft: canonMetrics.draft, needsReview: canonMetrics.needs_review,
    characters: canonMetrics.characters, science: canonMetrics.science,
  };

  const liveDomains = domains.map((domain) => domain.label === "Canon" ? { ...domain, state: canonLoading ? "Loading" : "Synced", items: [["Stories", String(canonMetrics.stories)], ["Records", String(canonMetrics.records)], ["Confirmed", String(canonMetrics.confirmed)], ["Draft", String(canonMetrics.draft)], ["Needs Review", String(canonMetrics.needs_review)], ["Characters", String(canonMetrics.characters)], ["Science", String(canonMetrics.science)]] as [string, string][] : domain.label === "Artwork" ? { ...domain, items: [["Stories", String(artworkMetrics.stories)], ["Episode Art", String(artworkMetrics.episode_art)], ["Covers", String(artworkMetrics.covers)], ["Banners", String(artworkMetrics.banners)], ["Approved", String(artworkMetrics.approved)], ["Needs Review", String(artworkMetrics.needs_review)], ["Missing Art", String(artworkMetrics.missing_art)]] as [string, string][] } : domain.label === "Wiki" ? { ...domain, state: "Synced", items: [["Stories", String(wikiMetrics.stories)], ["Articles", String(wikiMetrics.articles)], ["Published", String(wikiMetrics.published)], ["Draft", String(wikiMetrics.draft)], ["Needs Review", String(wikiMetrics.needs_review)], ["Sections", String(wikiMetrics.sections)], ["Episode Links", String(wikiMetrics.episode_links)]] as [string, string][] } : domain);
  const recentCanon = canonWorkspaces.slice().sort((a, b) => b.updated_at.localeCompare(a.updated_at)).slice(0, 4);
  const selectedDomain = selected === "Overview" ? "Canon" : selected;

  return (
    <main className="studio2-shell">
      <aside className="studio2-sidebar">
        <div className="studio2-brand"><span className="studio2-menu">☰</span><span>STUDIO</span></div>
        <nav aria-label="Studio sections">
          <p className="studio2-section-label">WORKSPACE</p>
          {primary.map(([label, icon]) => <button key={label} className={`studio2-nav-item ${selected === label ? "is-selected" : ""}`} onClick={() => setSelected(label)}><Icon name={icon} /><span>{label}</span>{label === "Overview" && <i />}</button>)}
          <div className="studio2-divider" />
          {secondary.map(([label, icon]) => <button key={label} className="studio2-nav-item" onClick={() => setSelected(label)}><Icon name={icon} /><span>{label}</span>{label === "Inbox" && <b>3</b>}</button>)}
        </nav>
        <div className="studio2-user"><span className="studio2-avatar">ST</span><span><strong>Studio Team</strong><small>Studio Editor</small></span><em>⌄</em></div>
      </aside>

      <section className="studio2-content">
        <header className="studio2-topbar"><div><span className="studio2-kicker">DISCOVER STORIES / STUDIO WORKFLOW</span><h1>STUDIO WORKFLOW</h1></div><label className="studio2-story-picker"><span>STORY</span><input value={storySearch} onChange={(event) => setStorySearch(event.target.value)} placeholder={selectedStory?.title ?? "Search stories"} list="studio2-story-options" aria-label="Search for a story" /><datalist id="studio2-story-options">{filteredStories.map((story) => <option key={story.id} value={story.title} />)}</datalist></label><span className="studio2-mode"><span /> Studio mode</span></header>
        <div className="studio2-body">
          <div className="studio2-overview-label"><p className="studio2-kicker">CORE WORKFLOW</p></div>
          <div className="studio2-workflow-card"><div className="studio2-workflow-title"><span className="studio2-round-icon"><Icon name="book" /></span><div><strong>STORY</strong><small>Core workflow</small></div></div><div className="studio2-stage-row">{stages.map((stage, index) => <div className="studio2-stage-wrap" key={stage.label}><button onClick={() => setSelectedStage(stage.label)} className={`studio2-stage ${selectedStage === stage.label ? "is-active" : ""}`}><span className={`studio2-stage-icon ${stage.state}`}><Icon name={stage.icon} /></span><strong>{stage.label}</strong><small>{stage.note}</small></button>{index < stages.length - 1 && <span className="studio2-connector"><i /></span>}</div>)}</div></div>
          <div className="studio2-foundations">
            <div className="studio2-layer-heading"><p className="studio2-kicker">SUPPORTING LAYERS</p><p>Independent production and publication domains connected to Story.</p></div>
            <div className="studio2-domain-grid">{liveDomains.map((domain) => <article className={`studio2-domain-card ${domain.tone}`} key={domain.label} onClick={() => setSelected(domain.label)}><div className="studio2-domain-head"><span className="studio2-domain-icon"><Icon name={domain.icon} /></span><div><p>{domain.eyebrow}</p><h4>{domain.label}</h4></div><span className="studio2-domain-state"><i />{domain.state}</span></div><p className="studio2-domain-description">{domain.description}</p><ul>{domain.items.map(([item, count]) => <li key={item}><span>{item}</span><strong>{count}</strong></li>)}</ul><button className="studio2-domain-link">{domain.link}<span>→</span></button></article>)}</div>
            <div className="studio2-flow-note"><span className="studio2-flow-line" /><strong>DEPENDENCY FLOW</strong><span>Canon informs Artwork</span><span>Story approval enables Wiki publication</span></div>
            <div className="studio2-layer-heading security-heading"><p className="studio2-kicker">SECURITY LAYER</p><p>Cross-cutting controls apply across every Studio domain.</p></div>
            <div className="studio2-security-card"><div className="studio2-security-title"><span className="studio2-domain-icon"><Icon name="shield" /></span><div><h4>Security</h4><p>Cross-cutting control</p></div><span className="studio2-domain-state"><i /> Compliant</span></div><div className="studio2-security-controls">{securityControls.map(([label, note]) => <div key={label}><strong>{label}</strong><small>{note}</small></div>)}</div><button className="studio2-domain-link">Open Security <span>→</span></button></div>
          </div>
        </div>
        <aside className="studio2-inspector"><button className="studio2-inspector-close" aria-label="Close inspector">×</button><div className="studio2-inspector-heading"><span className="studio2-domain-icon"><Icon name={selectedDomain === "Artwork" ? "image" : selectedDomain === "Wiki" ? "file" : "database"} /></span><div><h2>{selectedDomain.toUpperCase()}</h2><p>{selectedDomain === "Canon" ? "Source of Truth" : selectedDomain === "Artwork" ? "Supporting Layer" : "Downstream Publication"}</p></div></div><div className="studio2-inspector-sync"><i /> Synced <span>Updated just now</span> ↻</div><h3>OVERVIEW</h3><p>Canonical data and production information used across the Studio workflow.</p><div className="studio2-metric-grid"><span><strong>{canonMetrics.stories}</strong><small>Stories</small></span><span><strong>{canonMetrics.records}</strong><small>Canon records</small></span><span><strong>{canonMetrics.confirmed}</strong><small>Confirmed</small></span><span><strong>{canonMetrics.draft}</strong><small>Draft</small></span><span><strong>{canonMetrics.needs_review}</strong><small>Needs Review</small></span><span><strong>{canonMetrics.characters}</strong><small>Characters</small></span><span><strong>{canonMetrics.science}</strong><small>Science</small></span></div><h3>RECENT CHANGES <em>View All</em></h3><ul className="studio2-recent">{recentCanon.length ? recentCanon.map((workspace) => <li key={workspace.id}>{workspace.title}<small>{workspace.record_count} records · {new Date(workspace.updated_at).toLocaleDateString("en-AU")}</small></li>) : <li>{canonLoading ? "Loading Canon workspaces…" : "No Canon workspaces found"}<small>Supabase Studio read</small></li>}</ul><button className="studio2-inspector-open">Open {selectedDomain} <span>→</span></button></aside>
      </section>
    </main>
  );
}
