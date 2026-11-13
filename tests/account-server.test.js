import { describe, it, expect, vi } from "vitest";
import { createAccountHandler } from "../supabase/functions/account-admin/handler";
function fixture(role = "admin") {
  const actor = "11111111-1111-4111-8111-111111111111",
    target = "22222222-2222-4222-8222-222222222222";
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { role }, error: null }),
    in: vi
      .fn()
      .mockResolvedValue({
        data: [{ id: target, role: "customer", display_name: "Someone" }],
        error: null,
      }),
  };
  const db = {
    from: vi.fn(() => query),
    auth: {
      getUser: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: actor } }, error: null }),
      admin: {
        listUsers: vi
          .fn()
          .mockResolvedValue({
            data: {
              users: [
                {
                  id: target,
                  email: "customer@example.test",
                  user_metadata: { display_name: "A customer" },
                  email_confirmed_at: "2026-01-01",
                },
              ],
              total: 1,
            },
            error: null,
          }),
        getUserById: vi
          .fn()
          .mockResolvedValue({
            data: {
              user: {
                id: target,
                email: "customer@example.test",
                user_metadata: {},
              },
            },
            error: null,
          }),
        updateUserById: vi.fn().mockResolvedValue({ data: {}, error: null }),
        deleteUser: vi.fn().mockResolvedValue({ data: {}, error: null }),
        inviteUserByEmail: vi
          .fn()
          .mockResolvedValue({ data: { user: { id: target } }, error: null }),
      },
      resetPasswordForEmail: vi
        .fn()
        .mockResolvedValue({ data: {}, error: null }),
    },
  };
  const makeClient = vi.fn(() => db);
  const handler = createAccountHandler({
    makeClient,
    env: {
      SUPABASE_URL: "https://project.supabase.co",
      SUPABASE_SECRET_KEY: "sb_secret_server_only",
    },
  });
  async function call(
    body,
    headers = {
      authorization: "Bearer verified-token",
      host: "studio.example",
      origin: "https://studio.example",
    },
  ) {
    const result = {};
    const res = {
      setHeader: vi.fn(),
      status(code) {
        result.status = code;
        return this;
      },
      json(body) {
        result.body = body;
        return this;
      },
    };
    await handler({ method: "POST", headers, body }, res);
    return result;
  }
  return { actor, target, db, query, call, makeClient };
}
describe("server account administration security", () => {
  it("rejects unauthenticated calls before creating a privileged client", async () => {
    const f = fixture();
    expect((await f.call({ action: "list" }, {})).status).toBe(401);
    expect(f.makeClient).not.toHaveBeenCalled();
  });
  it("rejects a forged/expired user token", async () => {
    const f = fixture();
    f.db.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: new Error("Invalid JWT"),
    });
    expect((await f.call({ action: "list" })).status).toBe(401);
    expect(f.db.auth.admin.listUsers).not.toHaveBeenCalled();
  });
  it("rejects customers even when they send an admin action", async () => {
    const f = fixture("customer");
    expect((await f.call({ action: "list", role: "admin" })).status).toBe(403);
    expect(f.db.auth.admin.listUsers).not.toHaveBeenCalled();
  });
  it("rejects an untrusted web origin", async () => {
    const f = fixture();
    expect(
      (
        await f.call(
          { action: "list" },
          {
            authorization: "Bearer token",
            host: "studio.example",
            origin: "https://evil.example",
          },
        )
      ).status,
    ).toBe(403);
  });
  it("returns only safe account fields, never full auth records/passwords", async () => {
    const f = fixture();
    const r = await f.call({ action: "list" });
    expect(r.status).toBe(200);
    expect(r.body.users[0]).toMatchObject({
      email: "customer@example.test",
      display_name: "A customer",
      role: "customer",
    });
    expect(JSON.stringify(r.body)).not.toMatch(
      /user_metadata|password|access_token/,
    );
  });
  it("cannot promote users through an arbitrary role action", async () => {
    const f = fixture();
    expect(
      (await f.call({ action: "role", userId: f.target, role: "admin" }))
        .status,
    ).toBe(400);
    expect(f.db.auth.admin.updateUserById).not.toHaveBeenCalled();
  });
  it("requires typed email confirmation for deletion", async () => {
    const f = fixture();
    f.query.single
      .mockResolvedValueOnce({ data: { role: "admin" } })
      .mockResolvedValueOnce({ data: { role: "customer" } });
    expect(
      (
        await f.call({
          action: "delete",
          userId: f.target,
          confirmEmail: "wrong@example.test",
        })
      ).status,
    ).toBe(400);
    expect(f.db.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
  it("protects every admin account from disable/delete", async () => {
    const f = fixture();
    expect(
      (
        await f.call({
          action: "delete",
          userId: f.target,
          confirmEmail: "customer@example.test",
        })
      ).status,
    ).toBe(409);
    expect(f.db.auth.admin.deleteUser).not.toHaveBeenCalled();
  });
  it("does not allow the caller to disable their own account", async () => {
    const f = fixture();
    f.db.auth.admin.getUserById.mockResolvedValue({
      data: { user: { id: f.actor, email: "admin@example.test" } },
    });
    expect(
      (
        await f.call({
          action: "disable",
          userId: f.actor,
          confirmEmail: "admin@example.test",
        })
      ).status,
    ).toBe(409);
  });
  it("invites a customer with a name and no supplied role or shared password", async () => {
    const f = fixture();
    const r = await f.call({
      action: "invite",
      name: "New customer",
      email: "new@example.test",
      role: "admin",
    });
    expect(r.status).toBe(200);
    expect(f.db.auth.admin.inviteUserByEmail).toHaveBeenCalledWith(
      "new@example.test",
      {
        data: { display_name: "New customer" },
        redirectTo: "https://studio.example/?auth=password",
      },
    );
  });
});
