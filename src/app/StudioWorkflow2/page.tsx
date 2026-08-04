import type { Metadata } from "next";
import StudioWorkflow2Client from "./StudioWorkflow2Client";

export const metadata: Metadata = {
  title: "Studio Workflow 2 | Discover Stories",
  description: "A new Studio Workflow design prototype.",
};

export default function StudioWorkflow2Page() {
  return <StudioWorkflow2Client />;
}

