import type { Metadata } from "next";
import StudioWorkflowClient from "./StudioWorkflowClient";

export const metadata: Metadata = {
  title: "Studio Workflow | Discover Stories",
  description:
    "The interactive Audio Platform workflow from initial draft through publication.",
};

export default function StudioWorkflowPage() {
  return <StudioWorkflowClient />;
}
