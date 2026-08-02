"use client";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "@tiptap/extension-mathematics";
import type { EducationDocument } from "@/lib/education-content";
import { EducationCallout, EducationImageNode, LightCalculatorNode } from "@/lib/tiptap-education-extensions";
type Props = { initialContent: EducationDocument; onChange: (content: EducationDocument) => void; onExport: () => void };
export default function EducationEditor({ initialContent, onChange, onExport }: Props) {
 const editor = useEditor({ immediatelyRender: false, extensions: [StarterKit, Mathematics.configure({ katexOptions: { throwOnError: false, strict: "warn", trust: false } }), EducationCallout, LightCalculatorNode, EducationImageNode], content: initialContent, onUpdate: ({ editor: currentEditor }) => onChange(currentEditor.getJSON() as EducationDocument) });
 function insertImage() {
  const mediaAssetId = window.prompt("Approved media asset ID (optional)")?.trim() ?? "";
  const src = window.prompt("Fallback image URL")?.trim() ?? "";
  const alt = window.prompt("Alt text (required)")?.trim();
  if (!alt || (!mediaAssetId && !src)) return;
  const caption = window.prompt("Caption") ?? ""; const credit = window.prompt("Source or credit") ?? "";
  const visualRole = window.prompt("Visual role", "education_diagram") ?? "education_diagram";
  const displayMode = window.prompt("Display mode", "diagram") ?? "diagram";
  const readerPositionKey = window.prompt("Reader placement key (optional)") ?? "";
  editor?.chain().focus().insertContent({ type: "educationImage", attrs: { mediaAssetId, src, alt, caption, credit, visualRole, displayMode, readerPositionKey } }).run();
 }
 if (!editor) return <div className="education-editor__loading">Loading Tiptap editor…</div>;
 return <section className="education-editor"><div className="education-editor__toolbar" role="toolbar"><button type="button" onClick={insertImage}>Image</button><button type="button" onClick={onExport}>Download JSON</button></div><EditorContent editor={editor} /></section>;
}