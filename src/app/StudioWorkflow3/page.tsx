import type { Metadata } from "next";
import StudioWorkflow3Client from "./StudioWorkflow3Client";
import "./canon-density.css";

export const metadata: Metadata = {
  title: "Story Studio | Discover Stories",
  description: "An illustrated, database-controlled story production and reference workspace.",
};

export default function StudioWorkflow3Page() {
  return <StudioWorkflow3Client />;
}
