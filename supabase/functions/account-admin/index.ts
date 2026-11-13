import { createAccountHandler } from "./handler.js";
const origins = [
  "https://then-frame-app-forge.vercel.app",
  "https://then-frame-app-forge-git-feature-sprint1-burgu-a5004e-phangsx25.vercel.app",
  "http://localhost:5173",
  "http://localhost:4173",
];
const handler = createAccountHandler({
  env: {
    SUPABASE_URL: Deno.env.get("SUPABASE_URL"),
    SUPABASE_SERVICE_ROLE_KEY: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
    ALLOWED_ORIGINS: origins.join(","),
  },
});
Deno.serve(async (request) => {
  const origin = request.headers.get("origin") || "";
  if (origin && !origins.includes(origin))
    return new Response("Origin not allowed", { status: 403 });
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
    Vary: "Origin",
    "Access-Control-Allow-Headers":
      "authorization, apikey, content-type, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
  };
  if (origin) headers["Access-Control-Allow-Origin"] = origin;
  if (request.method === "OPTIONS")
    return new Response(null, { status: 204, headers });
  let body = {};
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: "Send a JSON request." }), {
      status: 400,
      headers,
    });
  }
  let status = 200,
    response: Response | undefined;
  const res = {
    setHeader(name: string, value: string) {
      headers[name] = value;
    },
    status(value: number) {
      status = value;
      return this;
    },
    json(value: unknown) {
      response = new Response(JSON.stringify(value), { status, headers });
      return response;
    },
  };
  await handler(
    {
      method: request.method,
      headers: Object.fromEntries(request.headers),
      body,
    },
    res,
  );
  return (
    response ||
    new Response(
      JSON.stringify({ error: "No response from account service." }),
      { status: 500, headers },
    )
  );
});
