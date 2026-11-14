import { createClient } from "@supabase/supabase-js";
import { readAuthCallback } from "./authCallback";

// Supabase consumes the token fragment asynchronously during initialization.
// Capture the non-secret intent first so rendering cannot lose the reset route.
export const initialAuthCallback = typeof window === "undefined"
  ? { route: null, error: "" }
  : readAuthCallback(window.location);

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
