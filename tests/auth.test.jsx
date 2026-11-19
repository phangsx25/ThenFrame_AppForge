import { describe, it, expect, vi } from "vitest";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthPage from "../src/components/AuthPage";
import App from "../src/App";
import PasswordPage from "../src/components/PasswordPage";
import { readAuthCallback } from "../src/lib/authCallback";
function fakeClient(role = "customer") {
  const query = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: "u1", role, display_name: "Test customer" },
    }),
  };
  const client = {
    from: vi.fn(() => query),
    functions: {
      invoke: vi.fn().mockResolvedValue({ data: { session: { access_token: "fixture-token", refresh_token: "fixture-refresh" } }, error: null }),
    },
    auth: {
      signUp: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      setSession: vi.fn().mockResolvedValue({ data: { user: { id: "u1" }, session: { user: { id: "u1" } } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
      updateUser: vi.fn().mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      getSession: vi.fn().mockResolvedValue({
        data: {
          session: { user: { id: "u1", email: "fixture@example.test" } },
        },
        error: null,
      }),
      onAuthStateChange: vi
        .fn()
        .mockReturnValue({ data: { subscription: { unsubscribe: vi.fn() } } }),
    },
  };
  return client;
}
const anonymous = {
  loading: false,
  session: null,
  profile: null,
  isAdmin: false,
};
async function loginFields(user) {
  const email = screen.queryByLabelText(/Email address/i);
  if (email) await user.type(email, "person@example.test");
  if (screen.queryByLabelText("Username", { exact: true })) {
    await user.type(screen.getByLabelText("Username", { exact: true }), "test_customer");
  }
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "password123",
  );
}
describe("auth flows with a mocked Supabase boundary", () => {
  it("passes username credentials to the backend and displays generic authentication errors", async () => {
    const client = fakeClient(),
      user = userEvent.setup();
    client.functions.invoke.mockResolvedValue({
      error: { context: { status: 401 } },
    });
    render(<AuthPage client={client} auth={anonymous} />);
    await loginFields(user);
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid username or password",
    );
    expect(client.functions.invoke).toHaveBeenCalledWith("username-login", {
      body: { username: "test_customer", password: "password123" },
    });
    expect(client.auth.setSession).not.toHaveBeenCalled();
  });
  it("rejects customer credentials on the admin form and signs out the rejected session", async () => {
    const client = fakeClient(),
      user = userEvent.setup();
    render(<AuthPage client={client} auth={anonymous} mode="admin" />);
    await loginFields(user);
    await user.click(
      screen.getByRole("button", { name: "Login", exact: true }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "does not have studio admin access",
    );
    expect(client.auth.signOut).toHaveBeenCalledOnce();
    expect(client.from).toHaveBeenCalledWith("profiles");
  });
  it("uses username only on the studio login form", () => {
    const client = fakeClient();
    render(<AuthPage client={client} auth={anonymous} />);
    expect(screen.getByLabelText("Username", { exact: true })).toBeVisible();
    expect(screen.queryByLabelText(/email address/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Use email instead/ })).not.toBeInTheDocument();
  });
  it("requests a real password-reset email through the client", async () => {
    const client = fakeClient(),
      user = userEvent.setup();
    render(<AuthPage client={client} auth={anonymous} mode="reset" />);
    await user.type(
      screen.getByLabelText("Email address"),
      "person@example.test",
    );
    await user.click(screen.getByRole("button", { name: "Send reset link" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "If an account exists",
    );
    expect(client.auth.resetPasswordForEmail).toHaveBeenCalledWith(
      "person@example.test",
      expect.objectContaining({
        redirectTo: expect.stringContaining("/?auth=password"),
      }),
    );
  });
  it("keeps the reset request form available for a signed-in account", async () => {
    window.history.replaceState({}, "", "/#/reset");
    const client = fakeClient();
    render(<AuthPage client={client} auth={{ ...anonymous, profile: { id: "u1" }, session: { user: { id: "u1" } } }} mode="reset" />);
    expect(screen.getByRole("button", { name: "Send reset link" })).toBeVisible();
    expect(window.location.hash).toBe("#/reset");
  });
  it("routes PASSWORD_RECOVERY to the password form after the SDK clears the callback fragment", async () => {
    window.history.replaceState({}, "", "/#/login");
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    const user = userEvent.setup();
    render(<App client={client} />);
    await screen.findByRole("button", { name: "Login" });
    const callback = client.auth.onAuthStateChange.mock.calls[0][0];
    act(() => {
      window.history.replaceState({}, "", "/");
      callback("PASSWORD_RECOVERY", { user: { id: "u1" } });
    });
    expect(await screen.findByRole("heading", { name: "Choose a new password." })).toBeVisible();
    await user.type(await screen.findByLabelText("New password"), "new-password123");
    await user.type(screen.getByLabelText("Confirm password"), "new-password123");
    await user.click(screen.getByRole("button", { name: "Update password" }));
    expect(await screen.findByRole("status")).toHaveTextContent("Password updated");
    expect(client.auth.updateUser).toHaveBeenCalledWith({ password: "new-password123" });
    expect(window.location.hash).toBe("#/password");
    expect(window.location.search).toBe("?auth=password");
  });
  it("does not route an ordinary sign-in to the password form", async () => {
    window.history.replaceState({}, "", "/#/login");
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<App client={client} />);
    await screen.findByRole("button", { name: "Login" });
    act(() => client.auth.onAuthStateChange.mock.calls[0][0]("SIGNED_IN", { user: { id: "u1" } }));
    await waitFor(() => expect(client.from).toHaveBeenCalledWith("profiles"));
    expect(window.location.hash).toBe("#/login");
    expect(screen.queryByRole("heading", { name: "Choose a new password." })).not.toBeInTheDocument();
  });
  it("shows expiry when an invalid callback is opened in the same application tab", async () => {
    window.history.replaceState({}, "", "/#/reset");
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<App client={client} />);
    await screen.findByRole("button", { name: "Send reset link" });
    act(() => {
      window.history.replaceState({}, "", "/#error=access_denied&error_code=otp_expired");
      fireEvent(window, new Event("hashchange"));
    });
    expect(await screen.findByRole("alert")).toHaveTextContent("invalid or has expired");
    act(() => client.auth.onAuthStateChange.mock.calls[0][0]("PASSWORD_RECOVERY", { user: { id: "u1" } }));
    expect(await screen.findByLabelText("New password")).toBeVisible();
    expect(screen.queryByText(/invalid or has expired/)).not.toBeInTheDocument();
  });
  it("shows a rejected-link message even when another account session already exists", () => {
    const client = fakeClient();
    render(<PasswordPage client={client} auth={{ ...anonymous, session: { user: { id: "u1" } } }}
      linkError="This email link is invalid or has expired. Request a new password reset link." />);
    expect(screen.getByRole("alert")).toHaveTextContent("invalid or has expired");
    expect(screen.queryByRole("button", { name: "Update password" })).not.toBeInTheDocument();
    expect(client.auth.updateUser).not.toHaveBeenCalled();
  });
  it("blocks a direct admin URL for a customer before any gallery request", async () => {
    window.location.hash = "/admin";
    const client = fakeClient();
    render(<App client={client} />);
    expect(
      await screen.findByRole("heading", { name: "Studio access only." }),
    ).toBeVisible();
    expect(
      client.from.mock.calls.every(([table]) => table === "profiles"),
    ).toBe(true);
  });
  it("fails closed if the profile lookup fails", async () => {
    window.location.hash = "/admin";
    const client = fakeClient("admin");
    client.from().single.mockResolvedValue({
      data: null,
      error: { message: "Profile permission denied" },
    });
    render(<App client={client} />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Profile permission denied",
    );
    expect(
      screen.queryByRole("button", { name: /New collection/ }),
    ).not.toBeInTheDocument();
  });
  it("does not let a late old profile response restore admin tools after signout", async () => {
    window.location.hash = "/admin";
    const client = fakeClient("admin");
    let resolveProfile;
    client.from().single.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveProfile = resolve;
        }),
    );
    render(<App client={client} />);
    await waitFor(() => expect(resolveProfile).toBeTypeOf("function"));
    const callback = client.auth.onAuthStateChange.mock.calls[0][0];
    callback("SIGNED_OUT", null);
    await screen.findByRole("heading", { name: "Your space, securely kept." });
    resolveProfile({ data: { id: "u1", role: "admin" } });
    await waitFor(() =>
      expect(
        screen.queryByRole("button", { name: /New collection/ }),
      ).not.toBeInTheDocument(),
    );
  });
  it.each(["/login", "/admin/login"])("shows only the studio login at %s, with no customer login or registration", async (path) => {
    window.location.hash = path;
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<App client={client} />);
    expect(await screen.findByRole("heading", { name: "Studio Login." })).toBeVisible();
    expect(screen.queryByRole("navigation", { name: "Login role" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: /customer|register/i })).not.toBeInTheDocument();
    expect(client.auth.signUp).not.toHaveBeenCalled();
  });
  it.each([
    ["/enquire", "BOOK YOUR DATE"],
  ])("shows a public coming-soon page at %s without logging in", async (path, eyebrow) => {
    window.location.hash = path;
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<App client={client} />);
    expect(await screen.findByRole("heading", { name: "Coming soon." })).toBeVisible();
    expect(screen.getByText(eyebrow)).toBeVisible();
    // Booking tracking was dropped at the studio's request (19 November 2026).
    expect(screen.queryByRole("link", { name: "Track booking" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Studio login" })).toHaveAttribute("href", "#/admin/login");
    expect(screen.queryByRole("heading", { name: "Studio Login." })).not.toBeInTheDocument();
  });
  it.each(["/register", "/dashboard", "/album", "/track"])("no longer serves the customer page %s", async (path) => {
    window.location.hash = path;
    const client = fakeClient();
    client.auth.getSession.mockResolvedValue({ data: { session: null }, error: null });
    render(<App client={client} />);
    expect(await screen.findByRole("heading", { name: "This story isn’t here." })).toBeVisible();
  });
});

describe("auth callback intent without storing credentials", () => {
  it("recognizes recovery type regardless of fragment parameter order", () => {
    expect(readAuthCallback({ search: "", hash: "#expires_in=3600&type=recovery&access_token=fixture" }))
      .toEqual({ route: "/password", error: "" });
  });
  it("accepts the reset query when a provider redirects to the home hash", () => {
    expect(readAuthCallback({ search: "?auth=password", hash: "#/" }).route).toBe("/password");
  });
  it("lets explicit navigation leave the reset page after saving", () => {
    expect(readAuthCallback({ search: "?auth=password", hash: "#/dashboard" }).route).toBeNull();
  });
  it("keeps signup confirmation separate from password recovery", () => {
    expect(readAuthCallback({ search: "", hash: "#access_token=fixture&type=signup" }).route).toBe("/login");
  });
  it("handles expired links without reflecting raw provider descriptions", () => {
    const callback = readAuthCallback({ search: "", hash: "#error_description=private-value&error_code=otp_expired&error=access_denied" });
    expect(callback.route).toBe("/password");
    expect(callback.error).toContain("invalid or has expired");
    expect(JSON.stringify(callback)).not.toContain("private-value");
  });
});
