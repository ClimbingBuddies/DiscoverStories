"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import "./studio-workflow3.css";

type StoryOption = { id:string; title:string; slug:string; content_status:string };
type Episode = { id:string; episode_number:number; season_number:number; title:string; summary:string|null; episode_status:string; word_count:number|null; artwork_url:string|null; audio_url?:string|null; duration_seconds?:number|null };
type PlanningBlock = { id:string; episode_start:number; episode_end:number; title:string; arc_summary:string|null; content_status:string };
type PlanningDocument = { title:string; season_number:number; planning:unknown; content_status:string };
type Category = { slug:string; name:string; description:string|null; sort_order:number; record_count:number };
type CanonRecord = { id:string; slug:string; category:string; title:string; summary:string|null; description:string|null; content_status:string; is_public:boolean; spoiler_level:number; reveal_episode:{episode_number:number}|null; sections:{id:string;heading:string;content:string}[]; images:{id:string;public_url:string|null;alt_text:string|null;caption:string|null}[]; character_profile:Record<string,string|null>|null; related_records:{id:string;title:string;category:string;relationship_type:string}[]; linked_episodes:{id:string;episode_number:number;title:string;appearance_type:string}[] };
type Dashboard = { story:{id:string;title:string;content_status:string;short_description:string|null;description:string|null;cover_image_url:string|null}; premise:{premise_title:string;premise_text:string;content_status:string;version_number:number}|null; episodes:Episode[]; planning:PlanningDocument|null; planning_blocks:PlanningBlock[]; canon_categories:Category[]; canon_records:CanonRecord[]; counts:{episodes:number;published_episodes:number;planning_blocks:number;canon_records:number} };

const tabs = ["Story Brief","Season Plan","Episodes","Canon","Planning","Review"] as const;
type ColourScheme = "warm-parchment"|"clean-light"|"dark-studio"|"midnight-blue"|"sage-editorial"|"coral-pop"|"violet-dusk"|"ocean-glass";
const colourSchemes:{value:ColourScheme;label:string}[] = [
  {value:"warm-parchment",label:"Warm Parchment"},
  {value:"clean-light",label:"Clean Light"},
  {value:"dark-studio",label:"Dark Studio"},
  {value:"midnight-blue",label:"Midnight Blue"},
  {value:"sage-editorial",label:"Sage Editorial"},
  {value:"coral-pop",label:"Coral Pop"},
  {value:"violet-dusk",label:"Violet Dusk"},
  {value:"ocean-glass",label:"Ocean Glass"},
];
type Tab = typeof tabs[number];
const icons:Record<string,string> = { character:"♙",location:"△",organisation:"⚑",faction:"⚑",technology:"⚙",concept:"⚖",event:"⌛",artefact:"▣",object:"▣" };
const aliases:Record<string,string> = { character:"Characters",location:"Locations",organisation:"Factions",faction:"Factions",technology:"Technology & Science",concept:"Rules",event:"History & Timeline",artefact:"Objects",object:"Objects" };
const profileLabels:Record<string,string> = { role_in_story:"Role in the story",personality:"Personality",strengths:"Strengths",weaknesses:"Weaknesses",motivations:"Motivations",fears:"Fears",speech_style:"Speech style",appearance:"Appearance",habits_and_mannerisms:"Habits & mannerisms",moral_boundaries:"Moral boundaries",current_state:"Current state",character_arc_notes:"Development" };
const pretty = (v:string) => v.replaceAll("_"," ").replace(/\b\w/g,c=>c.toUpperCase());
const rangeStartForEpisode = (episodeNumber:number) => Math.floor((Math.max(1,episodeNumber)-1)/20)*20+1;

function RichText({value}:{value:string}) {
  let plain=value;
  try { const doc=JSON.parse(value); if(doc?.content) plain=doc.content.map((n:any)=>n.content?.map((x:any)=>x.text??"").join("")??"").filter(Boolean).join("\n\n"); } catch {}
  const blocks=plain.split(/\n{2,}/).filter(Boolean);
  return <div className="w3-prose">{blocks.map((block,i)=>{const text=block.trim();const h=text.match(/^(#{1,3})\s+(.+)$/);if(h){const Tag=(h[1].length===1?"h2":h[1].length===2?"h3":"h4") as "h2";return <Tag key={i}>{h[2]}</Tag>}return <p key={i}>{text.replace(/\n/g," ")}</p>})}</div>;
}
function Empty({title,children}:{title:string;children:React.ReactNode}) { return <div className="w3-empty"><span>✦</span><h3>{title}</h3><p>{children}</p></div> }
function Artwork({src,alt=""}:{src:string|null|undefined;alt?:string}) { const [failed,setFailed]=useState(false); return !src||failed?<div className="w3-art-empty"><span>✦</span><small>No artwork is linked at a working public URL</small></div>:<img src={src} alt={alt} onError={()=>setFailed(true)}/>; }

export default function StudioWorkflow3Client(){
  const [stories,setStories]=useState<StoryOption[]>([]),[storyId,setStoryId]=useState(""),[data,setData]=useState<Dashboard|null>(null);
  const [tab,setTab]=useState<Tab>("Story Brief"),[mode,setMode]=useState<"studio"|"reference">("studio"),[colourScheme,setColourScheme]=useState<ColourScheme>("warm-parchment");
  const [category,setCategory]=useState(""),[recordId,setRecordId]=useState(""),[episodeId,setEpisodeId]=useState(""),[loading,setLoading]=useState(true),[error,setError]=useState("");
  const [episodeRangeStart,setEpisodeRangeStart]=useState(1);
  useEffect(()=>{const saved=localStorage.getItem("story-studio-colour-scheme") as ColourScheme|null;if(saved&&colourSchemes.some(s=>s.value===saved))setColourScheme(saved);const initial=new URLSearchParams(location.search).get("story_id")??"";void supabase.rpc("list_studio_story_options",{p_studio_mode:true}).then(({data,error})=>{if(error){setError(error.message);setLoading(false);return}const list=(data??[]) as StoryOption[];setStories(list);setStoryId(list.some(s=>s.id===initial)?initial:list[0]?.id??"")})},[]);
  useEffect(()=>{if(!storyId)return;setLoading(true);setError("");const u=new URL(location.href);u.searchParams.set("story_id",storyId);history.replaceState({},"",u);void supabase.rpc("get_studio_story_dashboard",{p_story_id:storyId,p_studio_mode:mode==="studio"}).then(async ({data,error})=>{if(error){setError(error.message);setLoading(false);return}const d=data as Dashboard;const {data:episodeMedia,error:episodeMediaError}=await supabase.from("episodes").select("id,audio_url,duration_seconds").eq("story_id",storyId);if(episodeMediaError){setError(episodeMediaError.message);setLoading(false);return}const mediaById=new Map((episodeMedia??[]).map(e=>[e.id,e]));d.episodes=d.episodes.map(e=>{const media=mediaById.get(e.id);return media?{...e,audio_url:media.audio_url,duration_seconds:media.duration_seconds}:e});setData(d);setCategory(d.canon_categories.find(c=>c.record_count>0)?.slug??d.canon_categories[0]?.slug??"");setEpisodeId(d.episodes[0]?.id??"");setEpisodeRangeStart(rangeStartForEpisode(d.episodes[0]?.episode_number??1));setLoading(false)})},[storyId,mode]);
  useEffect(()=>localStorage.setItem("story-studio-colour-scheme",colourScheme),[colourScheme]);
  const selectedStory=stories.find(s=>s.id===storyId)??null;
  const categories=data?.canon_categories??[];
  const allEpisodes=data?.episodes??[];
  const episodeRanges=useMemo(()=>{if(!allEpisodes.length)return[] as {start:number;end:number;count:number}[];const maxEpisode=Math.max(...allEpisodes.map(e=>e.episode_number));const maxStart=rangeStartForEpisode(maxEpisode);const ranges:{start:number;end:number;count:number}[]=[];for(let start=1;start<=maxStart;start+=20){const end=start+19;ranges.push({start,end,count:allEpisodes.filter(e=>e.episode_number>=start&&e.episode_number<=end).length})}return ranges},[allEpisodes]);
  const filteredEpisodes=useMemo(()=>{const end=episodeRangeStart+19;return allEpisodes.filter(e=>e.episode_number>=episodeRangeStart&&e.episode_number<=end)},[allEpisodes,episodeRangeStart]);
  const records=useMemo(()=>(data?.canon_records??[]).filter(r=>r.category===category),[data,category]);
  const record=records.find(r=>r.id===recordId)??records[0]??null;
  const episode=filteredEpisodes.find(e=>e.id===episodeId)??filteredEpisodes[0]??null;
  const planningRecord=data?.planning??null;
  const planningValue=planningRecord?.planning;
  const planningText=typeof planningValue==="string"?planningValue:"";
  const planningRichValue=useMemo(()=>{
    if(!planningValue)return"";
    if(typeof planningValue==="object"&&Array.isArray((planningValue as {content?:unknown}).content))return JSON.stringify(planningValue);
    if(typeof planningValue==="string"){
      try{const parsed=JSON.parse(planningValue) as {content?:unknown};if(parsed&&typeof parsed==="object"&&Array.isArray(parsed.content))return planningValue}catch{}
    }
    return"";
  },[planningValue]);
  const hasPlanningBody=Boolean(planningRichValue||planningText.trim());
  useEffect(()=>{if(record&&record.id!==recordId)setRecordId(record.id)},[record,recordId]);
  useEffect(()=>{if(!episodeRanges.length)return;const activeRange=episodeRanges.find(r=>r.start===episodeRangeStart);if(activeRange&&activeRange.count>0)return;const firstPopulated=episodeRanges.find(r=>r.count>0);if(firstPopulated)setEpisodeRangeStart(firstPopulated.start)},[episodeRanges,episodeRangeStart]);
  useEffect(()=>{if(!filteredEpisodes.length)return;if(!filteredEpisodes.some(e=>e.id===episodeId))setEpisodeId(filteredEpisodes[0].id)},[filteredEpisodes,episodeId]);
  return <main className={`w3-shell scheme-${colourScheme}`}>
    <header className="w3-header"><button className="w3-brand" onClick={()=>setTab("Story Brief")}><span className="w3-compass">✥</span><span><strong>Story Studio</strong><small>DISCOVER STORIES</small></span></button><nav>{tabs.map(t=><button key={t} className={tab===t?"active":""} onClick={()=>setTab(t)}>{t}</button>)}</nav><div className="w3-actions"><select aria-label="Select story" value={storyId} onChange={e=>setStoryId(e.target.value)}>{stories.map(s=><option key={s.id} value={s.id}>{s.title}</option>)}</select><button onClick={()=>setMode(mode==="studio"?"reference":"studio")}>{mode==="studio"?"Studio":"Reference"}</button><details className="w3-scheme-picker"><summary aria-label="Choose colour scheme"><span>Colours</span><strong>{colourSchemes.find(s=>s.value===colourScheme)?.label}</strong><i aria-hidden="true">⌄</i></summary><div className="w3-scheme-menu">{colourSchemes.map(s=><button type="button" key={s.value} className={colourScheme===s.value?"active":""} onClick={e=>{setColourScheme(s.value);e.currentTarget.closest("details")?.removeAttribute("open")}}><span className={`w3-swatch scheme-${s.value}`} aria-hidden="true"/>{s.label}<small>{colourScheme===s.value?"Selected":""}</small></button>)}</div></details></div></header>
    {error&&<div className="w3-error">{error}</div>}{loading&&<div className="w3-loading">Opening the story studio…</div>}
    {!loading&&data&&<>
      {tab==="Story Brief"&&<section className="w3-page w3-story-brief-page"><div className="w3-brief-meta"><p>STORY FOUNDATION</p><span>{pretty(data.story.content_status)}</span></div><article className="w3-brief">
        <div className="w3-wide-art"><Artwork src={data.story.cover_image_url}/><div className="w3-art-caption"><span>THE WORLD OF</span><strong>{data.story.title}</strong></div></div>
        <div className="w3-brief-grid"><section><p className="w3-kicker">THE CONTROLLING IDEA</p><h2>{data.premise?.premise_title??data.story.title}</h2><p className="w3-lead">{data.story.short_description??data.story.description}</p><div className="w3-mini-rule"/>{data.premise?.premise_text?<RichText value={data.premise.premise_text}/>:<Empty title="No Story Brief loaded">Add the structured brief to the single premise text field.</Empty>}</section></div>
      </article></section>}
      {tab==="Season Plan"&&<section className="w3-page"><div className="w3-page-title"><div><p>STORY ARCHITECTURE</p><h1>Season Plan</h1></div><span>{data.planning_blocks.length} blocks</span></div><div className="w3-plan">{data.planning_blocks.length?data.planning_blocks.map((b,i)=><article key={b.id}><span>{String(i+1).padStart(2,"0")}</span><div><small>EPISODES {b.episode_start}-{b.episode_end}</small><h2>{b.title}</h2><p>{b.arc_summary??"No arc summary loaded."}</p></div><em>{pretty(b.content_status)}</em></article>):<Empty title="No season plan yet">Planning blocks will appear when loaded.</Empty>}</div></section>}
      {tab==="Episodes"&&<section className="w3-page"><p className="w3-kicker w3-episode-heading">SEASON {episode?.season_number}  ·  EPISODE {episode?.episode_number}</p><div className="w3-episodes"><aside><div className="w3-episode-list-tools"><div className="w3-episode-range-row">{episodeRanges.map(r=><button key={r.start} type="button" className={episodeRangeStart===r.start?"active":""} onClick={()=>setEpisodeRangeStart(r.start)} disabled={r.count===0}>{r.start}-{r.end}</button>)}</div></div>{filteredEpisodes.map(e=><button key={e.id} className={episode?.id===e.id?"active":""} onClick={()=>setEpisodeId(e.id)}><span>{String(e.episode_number).padStart(2,"0")}</span><div><strong>{e.title}</strong><small>{pretty(e.episode_status)}</small></div></button>)}</aside><article>{episode?<><div className="w3-episode-content"><div className="w3-episode-slider"><figure className="w3-episode-frame"><Artwork src={episode.artwork_url??data.story.cover_image_url} alt={`${episode.title} artwork`}/></figure></div><div className="w3-episode-copy"><p className="w3-kicker">SEASON {episode.season_number}  ·  EPISODE {episode.episode_number}</p><h2>{episode.title}</h2><p className="w3-lead">{episode.summary??"No episode summary loaded."}</p><div className="w3-episode-actions">{selectedStory?<a href={`/studio/reader/${selectedStory.slug}/episodes/${episode.episode_number}`} className="w3-read-btn"><span aria-hidden="true">📖</span><span>Read</span></a>:null}{selectedStory&&episode.audio_url?<a href={`/stories/${selectedStory.slug}/episodes/${episode.episode_number}/listen`} className="w3-audio-btn"><span aria-hidden="true">🎧</span><span>Audio</span></a>:null}</div><div className="w3-tags"><span>{pretty(episode.episode_status)}</span><span>{(episode.word_count??0).toLocaleString()} words</span>{episode.duration_seconds?<span>{Math.round(episode.duration_seconds/60)} min</span>:null}</div></div></div></>:<Empty title="No episodes in this range">Select another range tile to view episodes.</Empty>}</article></div></section>}
      {tab==="Canon"&&<section className="w3-canon"><div className="w3-canon-nav"><button className={!category?"active":""}>Overview</button>{categories.map(c=><button key={c.slug} className={category===c.slug?"active":""} onClick={()=>{setCategory(c.slug);setRecordId("")}}><span>{icons[c.slug]??"✦"}</span>{aliases[c.slug]??c.name}<small>{c.record_count}</small></button>)}</div><div className="w3-page">
        {!records.length?<Empty title="No Canon records in this category">No placeholder information has been invented.</Empty>:<div className="w3-canon-workspace"><aside>{records.map(r=><button key={r.id} className={record?.id===r.id?"active":""} onClick={()=>setRecordId(r.id)}>{r.images[0]?.public_url?<img src={r.images[0].public_url} alt=""/>:<span className="portrait">{icons[r.category]??"✦"}</span>}<div><strong>{r.title}</strong><small>{r.summary??"No summary loaded."}</small></div></button>)}</aside>{record&&<article className="w3-record"><div className="w3-record-hero"><div><p className="w3-kicker">{aliases[record.category]??pretty(record.category)}  ·  {pretty(record.content_status)}</p><h2>{record.title}</h2><p className="w3-lead">{record.summary}</p><div className="w3-tags"><span>{record.is_public?"Public infrastructure":"Restricted"}</span>{record.reveal_episode&&<span>Reveals E{record.reveal_episode.episode_number}</span>}<span>Spoiler {record.spoiler_level}</span></div></div>{record.images[0]?.public_url?<img src={record.images[0].public_url} alt={record.images[0].alt_text??""}/>:<div className="w3-art-empty">No reference artwork linked</div>}</div>{record.description&&<section><h3>Overview</h3><p className="w3-lead">{record.description}</p></section>}{record.sections.map(s=><section key={s.id}><h3>{s.heading}</h3><RichText value={s.content}/></section>)}{record.character_profile&&<section><h3>Character reference</h3><div className="w3-attributes">{Object.entries(record.character_profile).filter(([k,v])=>profileLabels[k]&&v).map(([k,v])=><div key={k}><small>{profileLabels[k]}</small><p>{v}</p></div>)}</div></section>}{record.related_records.length>0&&<section><h3>Related Canon</h3><div className="w3-links">{record.related_records.map(r=><button key={r.id} onClick={()=>{setCategory(r.category);setRecordId(r.id)}}><small>{aliases[r.category]??pretty(r.category)}</small><strong>{r.title}</strong></button>)}</div></section>}{record.linked_episodes.length>0&&<section><h3>Linked episodes</h3><div className="w3-links">{record.linked_episodes.map(e=><button key={e.id} onClick={()=>{setEpisodeId(e.id);setTab("Episodes")}}><small>EPISODE {e.episode_number}</small><strong>{e.title}</strong></button>)}</div></section>}</article>}</div>}
      </div></section>}
      {tab==="Planning"&&<section className="w3-page"><div className="w3-page-title"><div><p>STUDIO WORKSPACE</p><h1>Planning</h1></div>{planningRecord?<span>{pretty(planningRecord.content_status)}</span>:null}</div>{planningRecord?<article className="w3-record"><p className="w3-kicker">SEASON {planningRecord.season_number}</p><h2>{planningRecord.title}</h2><div className="w3-tags"><span>{pretty(planningRecord.content_status)}</span></div>{hasPlanningBody?(planningRichValue?<RichText value={planningRichValue}/>:<p className="w3-lead" style={{whiteSpace:"pre-wrap"}}>{planningText}</p>):<p className="w3-lead">No planning document has been created.</p>}</article>:<Empty title="Planning unavailable">No planning document has been created.</Empty>}</section>}
      {tab==="Review"&&<section className="w3-page"><div className="w3-page-title"><div><p>PRODUCTION EVIDENCE</p><h1>Review</h1></div></div><div className="w3-review">{[[data.counts.episodes,"Episodes"],[data.counts.published_episodes,"Published"],[data.counts.planning_blocks,"Plan blocks"],[data.counts.canon_records,"Canon records"]].map(([n,l])=><div key={l}><strong>{n}</strong><span>{l}</span></div>)}</div></section>}
    </>}
  </main>
}





