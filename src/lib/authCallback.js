// Keep only routing intent, never tokens or the provider's raw URL in app state.
export function readAuthCallback(location) {
  const query = new URLSearchParams(location.search);
  const fragment = (location.hash || "").slice(1);
  const hash = new URLSearchParams(fragment);
  const applicationRoute = fragment.startsWith("/") && fragment !== "/";
  if (applicationRoute) return { route: null, error: "" };
  const error = hash.has("error") || hash.has("error_code") ||
    query.has("error") || query.has("error_code");
  if (error) {
    return {
      route: "/password",
      error: "This email link is invalid or has expired. Request a new password reset link.",
    };
  }
  if (hash.get("type") === "recovery" || query.get("auth") === "password") {
    return { route: "/password", error: "" };
  }
  if (hash.has("access_token") || query.get("auth") === "confirmed") {
    return { route: "/login", error: "" };
  }
  return { route: null, error: "" };
}
