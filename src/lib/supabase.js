import { createClient } from "@supabase/supabase-js";

export function makeClient(url, key) {
  if (!url || !key) return null;
  // Vite values are public. Never accept a secret or service-role key here.
  if (!key.startsWith("sb_publishable_")) return null;
  try {
    if (new URL(url).protocol !== "https:") return null;
    return createClient(url, key);
  } catch {
    return null;
  }
}
export const supabase = makeClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);
