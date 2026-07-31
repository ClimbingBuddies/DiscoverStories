"use client";

import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { Mathematics } from "@tiptap/extension-mathematics";
import type { EducationDocument } from "@/lib/education-content";
import {
  EducationCallout,
  EducationImageNode,
  LightCalculatorNode,
} from "@/lib/tiptap-education-extensions";

type Props = {
  initialContent: EducationDocument;
  onChange: (content: EducationDocument) => void;
  onExport: () => void;
};

export default function EducationEditor({ initialContent, onChange, onExport }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit,
      Mathematics.configure({
        katexOptions: { throwOnError: false, strict: "warn", trust: false },
      }),
      EducationCallout,
      LightCalculatorNode,
      EducationImageNode,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: "education-editor__surface",
        "aria-label": "Education episode content",
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      onChange(currentEditor.getJSON() as EducationDocument);
    },
  });

  function insertCallout(kind: "keyFact" | "workedExample" | "discussion") {
    const titles = {
      keyFact: "Key fact",
      workedExample: "Worked example",
      discussion: "Discussion",
    };
    const body = window.prompt(`${titles[kind]} text`, "Add the educational note here.");
    if (!body) return;
    editor?.chain().focus().insertContent({
      type: "educationCallout",
      attrs: { kind, title: titles[kind], body },
    }).run();
  }

  function insertEquation() {
    const latex = window.prompt("Enter a LaTeX equation", "d = c \\times t");
    if (latex) editor?.chain().focus().insertContent({ type: "blockMath", attrs: { latex } }).run();
  }

  function insertCalculator() {
    const calculatorType = window.prompt(
      "Calculator type: light-distance, light-time, round-trip, refractive-speed, gamma or light-year",
      "light-distance",
    );
    if (!calculatorType) return;
    editor?.chain().focus().insertContent({
      type: "lightCalculator",
      attrs: { calculatorType, defaultValue: 1, defaultUnit: "second" },
    }).run();
  }

  function insertImage() {
    const src = window.prompt("Supabase Storage image URL");
    if (!src) return;
    const alt = window.prompt("Alt text (required for accessibility)")?.trim();
    if (!alt) return;
    const caption = window.prompt("Caption") ?? "";
    const credit = window.prompt("Source or credit") ?? "";
    editor?.chain().focus().insertContent({
      type: "educationImage",
      attrs: { src, alt, caption, credit, display: "wide" },
    }).run();
  }

  if (!editor) return <div className="education-editor__loading">Loading Tiptap editor…</div>;

  return (
    <section className="education-editor">
      <div className="education-editor__toolbar" role="toolbar" aria-label="Education editor">
        <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>Heading</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBold().run()}>Bold</button>
        <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()}>Italic</button>
        <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()}>List</button>
        <button type="button" onClick={() => insertCallout("keyFact")}>Key fact</button>
        <button type="button" onClick={() => insertCallout("workedExample")}>Worked example</button>
        <button type="button" onClick={insertEquation}>Equation</button>
        <button type="button" onClick={insertCalculator}>Calculator</button>
        <button type="button" onClick={insertImage}>Image</button>
        <button type="button" onClick={() => insertCallout("discussion")}>Discussion</button>
        <button type="button" className="education-editor__export" onClick={onExport}>Download JSON</button>
      </div>
      <EditorContent editor={editor} />
      <p className="education-editor__status">
        This Studio preview is local. Download the JSON before leaving the page.
      </p>
    </section>
  );
}
