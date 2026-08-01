import { Node } from "@tiptap/core";

export const EducationCallout = Node.create({
  name: "educationCallout",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      kind: { default: "keyFact" },
      title: { default: "Key fact" },
      body: { default: "" },
    };
  },
  parseHTML() {
    return [{ tag: "aside[data-education-callout]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const kind = String(HTMLAttributes.kind ?? "keyFact");
    return [
      "aside",
      {
        "data-education-callout": kind,
        class: `education-callout education-callout--${kind}`,
      },
      ["strong", { class: "education-callout__title" }, String(HTMLAttributes.title ?? "Key fact")],
      ["p", {}, String(HTMLAttributes.body ?? "")],
    ];
  },
});

export const LightCalculatorNode = Node.create({
  name: "lightCalculator",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      calculatorType: { default: "light-distance" },
      defaultValue: { default: 1 },
      defaultUnit: { default: "second" },
    };
  },
  parseHTML() {
    return [{ tag: "div[data-light-calculator]" }];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      {
        "data-light-calculator": String(HTMLAttributes.calculatorType ?? "light-distance"),
        class: "education-calculator-placeholder",
      },
      `Interactive calculator: ${String(HTMLAttributes.calculatorType ?? "light-distance")}`,
    ];
  },
});

export const EducationImageNode = Node.create({
  name: "educationImage",
  group: "block",
  atom: true,
  addAttributes() {
    return {
      src: { default: "" },
      alt: { default: "" },
      caption: { default: "" },
      credit: { default: "" },
      display: { default: "wide" },
    };
  },
  parseHTML() {
    return [{ tag: "figure[data-education-image]" }];
  },
  renderHTML({ HTMLAttributes }) {
    const caption = [HTMLAttributes.caption, HTMLAttributes.credit].filter(Boolean).join(" — ");
    return [
      "figure",
      {
        "data-education-image": "",
        class: `education-figure education-figure--${String(HTMLAttributes.display ?? "wide")}`,
      },
      ["img", { src: String(HTMLAttributes.src ?? ""), alt: String(HTMLAttributes.alt ?? "") }],
      ["figcaption", {}, caption],
    ];
  },
});
