"use client";

import { useState } from "react";
import EducationEditor from "@/components/EducationEditor";
import EducationReader from "@/components/EducationReader";
import type { EducationDocument } from "@/lib/education-content";

type Props = {
  initialContent: EducationDocument;
  filename: string;
};

export default function EducationStudio({ initialContent, filename }: Props) {
  const [document, setDocument] = useState(initialContent);

  function downloadJson() {
    const blob = new Blob([JSON.stringify(document, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = window.document.createElement("a");
    anchor.href = url;
    anchor.download = filename;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="education-studio-grid">
      <div>
        <p className="education-panel-label">Tiptap editor</p>
        <EducationEditor
          initialContent={initialContent}
          onChange={setDocument}
          onExport={downloadJson}
        />
      </div>
      <div>
        <p className="education-panel-label">Reader preview</p>
        <div className="education-reader-card">
          <EducationReader document={document} />
        </div>
      </div>
    </div>
  );
}
