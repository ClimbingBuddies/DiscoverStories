"use client";

import katex from "katex";
import type { ReactNode } from "react";
import LightTravelCalculator from "@/components/LightTravelCalculator";
import type { EducationDocument, EducationNode } from "@/lib/education-content";

type Props = {
  document: EducationDocument;
};

function safeUrl(value: unknown): string | null {
  const url = String(value ?? "").trim();
  if (url.startsWith("/") || url.startsWith("https://") || url.startsWith("http://")) return url;
  return null;
}

function Formula({ latex, block = false }: { latex: string; block?: boolean }) {
  const html = katex.renderToString(latex, {
    displayMode: block,
    throwOnError: false,
    strict: "warn",
    trust: false,
    output: "htmlAndMathml",
  });
  const Tag = block ? "div" : "span";
  return (
    <Tag
      className={block ? "education-math-block" : "education-math-inline"}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function markedText(node: EducationNode, key: string): ReactNode {
  let output: ReactNode = node.text ?? "";
  for (const [index, mark] of (node.marks ?? []).entries()) {
    if (mark.type === "bold") output = <strong key={`${key}-bold-${index}`}>{output}</strong>;
    if (mark.type === "italic") output = <em key={`${key}-italic-${index}`}>{output}</em>;
    if (mark.type === "strike") output = <s key={`${key}-strike-${index}`}>{output}</s>;
    if (mark.type === "code") output = <code key={`${key}-code-${index}`}>{output}</code>;
    if (mark.type === "link") {
      const href = safeUrl(mark.attrs?.href);
      if (href) {
        output = <a key={`${key}-link-${index}`} href={href} rel="noreferrer">{output}</a>;
      }
    }
  }
  return output;
}

function renderChildren(node: EducationNode, key: string) {
  return (node.content ?? []).map((child, index) => renderNode(child, `${key}-${index}`));
}

function renderNode(node: EducationNode, key: string): ReactNode {
  const attrs = node.attrs ?? {};
  switch (node.type) {
    case "text":
      return <span key={key}>{markedText(node, key)}</span>;
    case "paragraph":
      return <p key={key}>{renderChildren(node, key)}</p>;
    case "heading": {
      const level = Math.min(4, Math.max(2, Number(attrs.level ?? 2)));
      if (level === 2) return <h2 key={key}>{renderChildren(node, key)}</h2>;
      if (level === 3) return <h3 key={key}>{renderChildren(node, key)}</h3>;
      return <h4 key={key}>{renderChildren(node, key)}</h4>;
    }
    case "blockquote":
      return <blockquote key={key}>{renderChildren(node, key)}</blockquote>;
    case "bulletList":
      return <ul key={key}>{renderChildren(node, key)}</ul>;
    case "orderedList":
      return <ol key={key}>{renderChildren(node, key)}</ol>;
    case "listItem":
      return <li key={key}>{renderChildren(node, key)}</li>;
    case "horizontalRule":
      return <hr key={key} />;
    case "hardBreak":
      return <br key={key} />;
    case "inlineMath":
      return <Formula key={key} latex={String(attrs.latex ?? "")} />;
    case "blockMath":
      return <Formula key={key} latex={String(attrs.latex ?? "")} block />;
    case "educationCallout":
      return (
        <aside key={key} className={`education-callout education-callout--${String(attrs.kind ?? "keyFact")}`}>
          <p className="education-callout__title">{String(attrs.title ?? "Key fact")}</p>
          {attrs.body ? <p>{String(attrs.body)}</p> : renderChildren(node, key)}
        </aside>
      );
    case "lightCalculator":
      return (
        <LightTravelCalculator
          key={key}
          calculatorType={String(attrs.calculatorType ?? "light-distance")}
          defaultValue={Number(attrs.defaultValue ?? 1)}
          defaultUnit={String(attrs.defaultUnit ?? "second")}
        />
      );
    case "educationImage":
    case "figureBlock": {
      const src = safeUrl(attrs.src);
      if (!src) return null;
      return (
        <figure key={key} className={`education-figure education-figure--${String(attrs.display ?? "wide")}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={String(attrs.alt ?? "")} loading="lazy" />
          {attrs.caption || attrs.credit ? (
            <figcaption>
              {String(attrs.caption ?? "")}
              {attrs.credit ? <span> — {String(attrs.credit)}</span> : null}
            </figcaption>
          ) : null}
        </figure>
      );
    }
    default:
      return <div key={key}>{renderChildren(node, key)}</div>;
  }
}

export default function EducationReader({ document }: Props) {
  return (
    <div className="education-reader">
      {document.content.map((node, index) => renderNode(node, `education-node-${index}`))}
    </div>
  );
}
