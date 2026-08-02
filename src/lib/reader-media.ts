import { supabase } from "@/lib/supabase";
import type { EducationDocument, EducationNode, ReaderMedia } from "@/lib/education-content";

export function collectMediaAssetIds(document: EducationDocument): string[] {
  const ids = new Set<string>();
  function visit(node: EducationNode) {
    const id = typeof node.attrs?.mediaAssetId === "string" ? node.attrs.mediaAssetId.trim() : "";
    if (id) ids.add(id);
    (node.content ?? []).forEach(visit);
  }
  document.content.forEach(visit);
  return [...ids];
}

export async function resolveReaderMedia(document: EducationDocument): Promise<Record<string, ReaderMedia>> {
  const ids = collectMediaAssetIds(document);
  if (!ids.length) return {};
  const { data, error } = await supabase.from("episode_reader_media").select("*").in("id", ids);
  if (error || !data) return {};
  return Object.fromEntries((data as ReaderMedia[]).map((asset) => [asset.id, asset]));
}
