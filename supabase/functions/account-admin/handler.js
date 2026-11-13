import { createClient } from "@supabase/supabase-js";

const isServiceRoleKey = (key) => {
  try {
    return JSON.parse(atob(key.split(".")[1])).role === "service_role";
  } catch {
    return false;
  }
};
const failure = (status, message, extra = {}) =>
  Object.assign(new Error(message), { status, ...extra });
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export function createAccountHandler({
  makeClient = createClient,
  env = {},
} = {}) {
  return async function handler(req, res) {
    res.setHeader("Cache-Control", "no-store");
    if (req.method !== "POST")
      return res.status(405).json({ error: "Method not allowed." });
    try {
      if (
        req.headers.origin &&
        new URL(req.headers.origin).host !== req.headers.host &&
        !(env.ALLOWED_ORIGINS || "").split(",").includes(req.headers.origin)
      )
        throw failure(403, "Cross-origin account requests are not allowed.");
      const token = req.headers.authorization?.match(/^Bearer (.+)$/i)?.[1];
      if (!token) throw failure(401, "Please sign in again.");
      const url = env.SUPABASE_URL || env.VITE_SUPABASE_URL,
        key = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
      if (!url || !key)
        throw failure(
          503,
          "The account administration service needs owner configuration.",
          { setupRequired: true },
        );
      if (!key.startsWith("sb_secret_") && !isServiceRoleKey(key))
        throw failure(
          503,
          "The account administration service has an invalid server credential.",
          { setupRequired: true },
        );
      const db = makeClient(url, key, {
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const actor = await db.auth.getUser(token);
      if (actor.error || !actor.data.user)
        throw failure(
          401,
          "Your session is no longer valid. Please sign in again.",
        );
      const role = await db
        .from("profiles")
        .select("role")
        .eq("id", actor.data.user.id)
        .single();
      if (role.error || role.data?.role !== "admin")
        throw failure(403, "Studio admin access is required.");
      const input =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body || {};
      if (JSON.stringify(input).length > 8000)
        throw failure(413, "Request too large.");
      const { action } = input;
      const origin =
        req.headers.origin || env.APP_URL || `https://${req.headers.host}`;
      const unwrap = (result) => {
        if (result.error) throw failure(400, result.error.message);
        return result.data;
      };
      if (action === "list") {
        const page = Math.max(
          1,
          Math.min(10000, Number.parseInt(input.page, 10) || 1),
        );
        const data = unwrap(
          await db.auth.admin.listUsers({ page, perPage: 25 }),
        );
        const ids = data.users.map((user) => user.id);
        const profiles = ids.length
          ? unwrap(
              await db
                .from("profiles")
                .select("id,display_name,role")
                .in("id", ids),
            )
          : [];
        return res.status(200).json({
          users: data.users.map((user) => {
            const profile = profiles.find((row) => row.id === user.id);
            return {
              id: user.id,
              email: user.email,
              display_name:
                user.user_metadata?.display_name || profile?.display_name || "",
              role: profile?.role || "missing",
              created_at: user.created_at,
              last_sign_in_at: user.last_sign_in_at,
              confirmed: Boolean(user.email_confirmed_at),
              disabled: Boolean(
                user.banned_until && Date.parse(user.banned_until) > Date.now(),
              ),
            };
          }),
          page,
          hasMore: data.users.length === 25,
          total: data.total ?? null,
        });
      }
      if (action === "invite") {
        const email = String(input.email || "").trim(),
          name = String(input.name || "").trim();
        if (!emailPattern.test(email) || !name || name.length > 100)
          throw failure(
            400,
            "Enter a valid email and a name of 1–100 characters.",
          );
        const invited = unwrap(
          await db.auth.admin.inviteUserByEmail(email, {
            data: { display_name: name },
            redirectTo: origin + "/?auth=password",
          }),
        );
        return res
          .status(200)
          .json({
            id: invited.user.id,
            message:
              "Customer invitation sent. The person sets their own password through the email link.",
          });
      }
      if (!["name", "reset", "disable", "enable", "delete"].includes(action))
        throw failure(
          400,
          "Unknown account action. Account roles cannot be changed through this endpoint.",
        );
      if (
        typeof input.userId !== "string" ||
        !/^[0-9a-f-]{36}$/i.test(input.userId)
      )
        throw failure(400, "Choose a valid account.");
      const target = unwrap(await db.auth.admin.getUserById(input.userId)).user;
      const targetProfile = unwrap(
        await db.from("profiles").select("role").eq("id", target.id).single(),
      );
      if (action === "name") {
        const name = String(input.name || "").trim();
        if (!name || name.length > 100)
          throw failure(400, "Enter a name of 1–100 characters.");
        unwrap(
          await db.auth.admin.updateUserById(target.id, {
            user_metadata: { ...target.user_metadata, display_name: name },
          }),
        );
        return res.status(200).json({ message: "Account name updated." });
      }
      if (action === "reset") {
        if (!target.email)
          throw failure(400, "This account has no email address.");
        unwrap(
          await db.auth.resetPasswordForEmail(target.email, {
            redirectTo: origin + "/?auth=password",
          }),
        );
        return res
          .status(200)
          .json({
            message:
              "Password reset email requested. Passwords are never shown to studio admins.",
          });
      }
      if (target.id === actor.data.user.id)
        throw failure(
          409,
          "You cannot disable or delete your own account from account administration.",
        );
      if (targetProfile.role === "admin")
        throw failure(
          409,
          "Studio admin accounts are protected. The project owner must review changes in Supabase.",
        );
      if (input.confirmEmail !== target.email)
        throw failure(400, "Type the account email to confirm this action.");
      if (action === "delete") {
        // Supabase enforces existing FK/Storage restrictions. Never cascade manually here.
        unwrap(await db.auth.admin.deleteUser(target.id));
        return res.status(200).json({ message: "Customer account deleted." });
      }
      unwrap(
        await db.auth.admin.updateUserById(target.id, {
          ban_duration: action === "disable" ? "876000h" : "none",
        }),
      );
      return res
        .status(200)
        .json({
          message:
            action === "disable"
              ? "Account disabled for new sign-ins and refreshes. Existing access tokens may remain valid until expiry."
              : "Account enabled.",
        });
    } catch (error) {
      const status = error.status || 500;
      return res
        .status(status)
        .json({
          error:
            status === 500
              ? "Account service failed. The owner can inspect the server logs."
              : error.message,
          ...(error.setupRequired ? { setupRequired: true } : {}),
        });
    }
  };
}
