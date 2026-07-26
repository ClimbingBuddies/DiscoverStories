import { cookies } from "next/headers";
import { STUDIO_MODE_COOKIE } from "@/lib/studio-mode-constants";

export async function isStudioModeEnabled() {
  const cookieStore = await cookies();
  return cookieStore.get(STUDIO_MODE_COOKIE)?.value === "true";
}
