"use client";
import { useEffect, useState } from "react";
import katex from "katex";
import type { ReactNode } from "react";
import LightTravelCalculator from "@/components/LightTravelCalculator";
import type { EducationDocument, EducationNode, ReaderMedia } from "@/lib/education-content";
import { resolveReaderMedia } from "@/lib/reader-media";
type Props = { document: EducationDocument };
function safeUrl(value: unknown): string | null { const url = String(value ?? "").trim(); return url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://") ? url : null; }
function Formula({ latex, block = false }: { latex: string; block?: boolean }) { const html = katex.renderToString(latex, { displayMode: block, throwOnError: false, strict: "warn", trust: false, output: "htmlAndMathml" }); const Tag = block ? "div" : "span"; return <Tag className={block ? "education-math-block" : "education-math-inline"} dangerouslySetInnerHTML={{ __html: html }} />; }
function children(node: EducationNode, key: string, media: Record<string, ReaderMedia>) { return (node.content ?? []).map((child, index) => renderNode(child, \`\${key}-\${index}\`, media)); }
function renderNode(node: EducationNode, key: string, media: Record<string, ReaderMedia>): ReactNode {
 const a = node.attrs ?? {};
 if (node.type === "text") return <span key={key}>{node.text ?? ""}</span>;
 if (node.type === "paragraph") return <p key={key}>{children(node, key, media)}</p>;
 if (node.type === "heading") { const level = Math.min(4, Math.max(2, Number(a.level ?? 2))); const Tag = \`h\${level}\` as "h2"; return <Tag key={key}>{children(node, key, media)}</Tag>; }
 if (node.type === "blockquote") return <blockquote key={key}>{children(node, key, media)}</blockquote>;
 if (node.type === "bulletList") return <ul key={key}>{children(node, key, media)}</ul>;
 if (node.type === "orderedList") return <ol key={key}>{children(node, key, media)}</ol>;
 if (node.type === "listItem") return <li key={key}>{children(node, key, media)}</li>;
 if (node.type === "horizontalRule") return <hr key={key} />;
 if (node.type === "hardBreak") return <br key={key} />;
 if (node.type === "inlineMath") return <Formula key={key} latex={String(a.latex ?? "")} />;
 if (node.type === "blockMath") return <Formula key={key} latex={String(a.latex ?? "")} block />;
 if (node.type === "educationCallout") return <aside key={key} className={\`education-callout education-callout--\${String(a.kind ?? "keyFact")}\`}><p className="education-callout__title">{String(a.title ?? "Key fact")}</p><p>{String(a.body ?? "")}</p></aside>;
 if (node.type === "lightCalculator") return <LightTravelCalculator key={key} calculatorType={String(a.calculatorType ?? "light-distance")} defaultValue={Number(a.defaultValue ?? 1)} defaultUnit={String(a.defaultUnit ?? "second")} />;
 if (node.type === "educationImage" || node.type === "figureBlock") {
   const asset = typeof a.mediaAssetId === "string" ? media[a.mediaAssetId] : undefined;
   const src = safeUrl(asset?.source_url ?? a.src); if (!src) return null;
   const mode = asset?.display_mode ?? a.displayMode ?? a.display ?? "standard";
   const role = asset?.visual_role ?? a.visualRole ?? "episode_image";
   const alt = asset?.alt_text ?? a.alt ?? "";
   const caption = asset?.caption ?? a.caption;
   const credit = asset?.credit_text ?? a.credit;
   return <figure key={key} className={\`education-figure education-figure--\${mode} education-figure--role-\${role}\`} data-reader-position={asset?.reader_position_key ?? a.readerPositionKey}><img src={src} alt={String(alt)} loading="lazy" />{caption || credit ? <figcaption>{caption ? <span>{String(caption)}</span> : null}{credit ? <span className="education-figure__credit"> — {String(credit)}</span> : null}</figcaption> : null}</figure>;
 }
 return <div key={key}>{children(node, key, media)}</div>;
}
export default function EducationReader({ document }: Props) {
 const [media, setMedia] = useState<Record<string, ReaderMedia>>({});
 useEffect(() => { let active = true; resolveReaderMedia(document).then((resolved) => { if (active) setMedia(resolved); }); return () => { active = false; }; }, [document]);
 return <div className="education-reader">{document.content.map((node, index) => renderNode(node, \`education-node-\${index}\`, media))}</div>;
}
