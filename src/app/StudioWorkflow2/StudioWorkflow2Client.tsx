"use client";

import { useState } from "react";

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
  { label: "Episode Plan", note: "Map each episode", icon: "brief", state: "active" },
  { label: "Draft", note: "Write the story", icon: "draft", state: "next" },
  { label: "Review", note: "Check the candidate", icon: "review", state: "next" },
  { label: "Approve", note: "Release the version", icon: "approve", state: "next" },
] as const;

export default function StudioWorkflow2Client() {
  const [selected, setSelected] = useState("Overview");
  const [selectedStage, setSelectedStage] = useState("Episode Plan");

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
        <header className="studio2-topbar"><div><span className="studio2-kicker">DISCOVER STORIES / STUDIO WORKFLOW</span><h1>{selected === "Overview" ? "Studio overview" : selected}</h1></div><span className="studio2-mode"><span /> Studio mode</span></header>
        <div className="studio2-body">
          <div className="studio2-intro"><div><p className="studio2-kicker">CORE WORKFLOW</p><h2>Story</h2><p>Story Creation is the core creative production workflow. Plan, draft, review and approve the story before downstream publication.</p></div><span className="studio2-status"><span /> In development</span></div>
          <div className="studio2-workflow-card"><div className="studio2-workflow-title"><span className="studio2-round-icon"><Icon name="book" /></span><div><strong>STORY</strong><small>Creative production</small></div></div><div className="studio2-stage-row">{stages.map((stage, index) => <div className="studio2-stage-wrap" key={stage.label}><button onClick={() => setSelectedStage(stage.label)} className={`studio2-stage ${selectedStage === stage.label ? "is-active" : ""}`}><span className={`studio2-stage-icon ${stage.state}`}><Icon name={stage.icon} /></span><strong>{stage.label}</strong><small>{stage.note}</small></button>{index < stages.length - 1 && <span className="studio2-connector"><i /></span>}</div>)}</div></div>
          <div className="studio2-detail"><div><p className="studio2-kicker">CURRENT STAGE</p><h3>{selectedStage}</h3><p>{stages.find((stage) => stage.label === selectedStage)?.note}. This stage is presented here as the Story workspace entry point; its records and status can later be resolved from Supabase.</p></div><button className="studio2-open">Open workspace <span>→</span></button></div>
          <div className="studio2-foundations"><div><p className="studio2-kicker">WORKFLOW FOUNDATIONS</p><h3>Story works with the other studio domains</h3></div><div className="studio2-foundation-grid"><div><Icon name="database" /><strong>Canon</strong><span>Persistent source of truth</span></div><div><Icon name="image" /><strong>Artwork</strong><span>Supporting production layer</span></div><div><Icon name="file" /><strong>Wiki</strong><span>Approved public output</span></div></div></div>
        </div>
      </section>
    </main>
  );
}
