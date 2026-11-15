const invalidCredentials = "Invalid username or password.";
const allowedOrigin = origin => origin === "https://then-frame-app-forge.vercel.app" ||
  /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin) ||
  /^https:\/\/then-frame-app-forge-[a-z0-9-]+-phangsx25\.vercel\.app$/.test(origin);

// Public credential exchange: the function validates the password with Supabase
// Auth before returning a user session. No lookup endpoint exposes account email.
export function createUsernameLoginHandler({ url, anonKey, serviceKey, fetchImpl = fetch }) {
  return async request => {
    const origin = request.headers.get("Origin") || "";
    const headers = { "Content-Type": "application/json", "Cache-Control": "no-store", "Vary": "Origin" };
    if (origin && allowedOrigin(origin)) headers["Access-Control-Allow-Origin"] = origin;
    const reply = (status, body) => new Response(JSON.stringify(body), { status, headers });
    if (origin && !allowedOrigin(origin)) return reply(403, { error: "Origin not allowed." });
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: { ...headers,
        "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
        "Access-Control-Allow-Methods": "POST, OPTIONS" } });
    }
    if (request.method !== "POST") return reply(405, { error: "Method not allowed." });
    if (!url || !anonKey || !serviceKey) return reply(503, { error: "Sign-in is temporarily unavailable." });
    if (Number(request.headers.get("content-length")) > 4096) return reply(400, { error: invalidCredentials });
    let input;
    try {
      const text = await request.text();
      if (text.length > 4096) return reply(400, { error: invalidCredentials });
      input = JSON.parse(text);
    } catch {
      return reply(400, { error: invalidCredentials });
    }
    const username = typeof input?.username === "string" ? input.username.trim().toLowerCase() : "";
    const password = input?.password;
    if (!/^[a-z][a-z0-9_]{2,39}$/.test(username) || typeof password !== "string" || !password || password.length > 1024) {
      return reply(400, { error: invalidCredentials });
    }
    try {
      const lookup = await fetchImpl(`${url}/rest/v1/rpc/resolve_username_login`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: serviceKey,
          Authorization: `Bearer ${serviceKey}` }, body: JSON.stringify({ login_username: username }),
        signal: AbortSignal.timeout(10000),
      });
      if (!lookup.ok) {
        const error = await lookup.json().catch(() => ({}));
        return error.code === "P0001" && error.message === "username_login_rate_limited"
          ? reply(429, { error: "Too many sign-in attempts. Try again in 15 minutes." })
          : reply(503, { error: "Sign-in is temporarily unavailable." });
      }
      const email = await lookup.json();
      // Unknown usernames still take the normal Auth password-verification path.
      const auth = await fetchImpl(`${url}/auth/v1/token?grant_type=password`, {
        method: "POST", headers: { "Content-Type": "application/json", apikey: anonKey },
        body: JSON.stringify({ email: email || "unknown-username-login@example.invalid", password }),
        signal: AbortSignal.timeout(10000),
      });
      if (auth.status === 429) return reply(429, { error: "Too many sign-in attempts. Try again in 15 minutes." });
      if (!auth.ok) return reply(401, { error: invalidCredentials });
      const session = await auth.json();
      if (!email || !session.access_token || !session.refresh_token) return reply(401, { error: invalidCredentials });
      return reply(200, { session: { access_token: session.access_token, refresh_token: session.refresh_token } });
    } catch {
      return reply(503, { error: "Sign-in is temporarily unavailable." });
    }
  };
}
