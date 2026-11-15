import { describe, it, expect, vi } from "vitest";
import { validateUsername, signInWithUsername, updateUsername } from "../src/lib/username";
import { createUsernameLoginHandler } from "../supabase/functions/username-login/handler";

describe("username validation and client session exchange", () => {
  it("normalizes case and rejects unsafe or ambiguous identifiers", () => {
    expect(validateUsername(" Phang_Photo ")).toBe("phang_photo");
    for (const value of ["ab", "1user", "a@b.com", "a b", "a".repeat(41), ""]) {
      expect(() => validateUsername(value)).toThrow();
    }
  });
  it("persists only a normal Auth session after backend password verification", async () => {
    const client = { functions: { invoke: vi.fn().mockResolvedValue({ data: { session: {
      access_token: "fixture-access", refresh_token: "fixture-refresh" } }, error: null }) },
      auth: { setSession: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }) } };
    await signInWithUsername(client, " Phang ", "password123");
    expect(client.functions.invoke).toHaveBeenCalledWith("username-login", { body: { username: "phang", password: "password123" } });
    expect(client.auth.setSession).toHaveBeenCalledWith({ access_token: "fixture-access", refresh_token: "fixture-refresh" });
  });
  it("updates only the caller username through the authorized RPC", async () => {
    const client = { rpc: vi.fn().mockResolvedValue({ data: "phang", error: null }) };
    expect(await updateUsername(client, " PHANG ")).toBe("phang");
    expect(client.rpc).toHaveBeenCalledWith("set_my_username", { new_username: "phang" });
  });
});

const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
function makeRequest(username = "phang", password = "password123", origin = "https://then-frame-app-forge.vercel.app") {
  return new Request("https://fixture.supabase.co/functions/v1/username-login", {
    method: "POST", headers: { Origin: origin, "Content-Type": "application/json" }, body: JSON.stringify({ username, password }),
  });
}
function handler(fetchImpl) {
  return createUsernameLoginHandler({ url: "https://fixture.supabase.co", anonKey: "fixture-public", serviceKey: "fixture-server", fetchImpl });
}
describe("server-side username credential exchange", () => {
  it("never returns lookup email or an elevated key on failed login", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(json("private@example.test"))
      .mockResolvedValueOnce(json({ error: "backend details" }, 400));
    const response = await handler(fetchImpl)(makeRequest());
    expect(response.status).toBe(401);
    expect(await response.text()).toBe('{"error":"Invalid username or password."}');
    expect(fetchImpl.mock.calls[1][1].headers.apikey).toBe("fixture-public");
    expect(fetchImpl.mock.calls[0][1].headers.Authorization).toBe("Bearer fixture-server");
  });
  it("uses the same generic failure for an unknown username", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(json(null)).mockResolvedValueOnce(json({}, 400));
    const response = await handler(fetchImpl)(makeRequest("unknown"));
    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "Invalid username or password." });
    expect(fetchImpl).toHaveBeenCalledTimes(2);
  });
  it("returns only user-session tokens after successful password verification", async () => {
    const fetchImpl = vi.fn().mockResolvedValueOnce(json("private@example.test"))
      .mockResolvedValueOnce(json({ access_token: "user-access", refresh_token: "user-refresh", user: { email: "private@example.test" } }));
    const response = await handler(fetchImpl)(makeRequest());
    expect(response.status).toBe(200);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(await response.json()).toEqual({ session: { access_token: "user-access", refresh_token: "user-refresh" } });
  });
  it("fails closed on rate limits and does not attempt a password exchange", async () => {
    const fetchImpl = vi.fn().mockResolvedValue(json({ code: "P0001", message: "username_login_rate_limited" }, 400));
    const response = await handler(fetchImpl)(makeRequest());
    expect(response.status).toBe(429);
    expect(fetchImpl).toHaveBeenCalledTimes(1);
  });
  it("rejects disallowed origins and invalid inputs before database access", async () => {
    const fetchImpl = vi.fn();
    expect((await handler(fetchImpl)(makeRequest("phang", "password123", "https://evil.example"))).status).toBe(403);
    expect((await handler(fetchImpl)(makeRequest("bad@name"))).status).toBe(400);
    expect(fetchImpl).not.toHaveBeenCalled();
  });
});
