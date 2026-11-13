import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AuthPage from "../src/components/AuthPage";
import App from "../src/App";
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
    auth: {
      signUp: vi
        .fn()
        .mockResolvedValue({ data: { session: null }, error: null }),
      signInWithPassword: vi
        .fn()
        .mockResolvedValue({ data: { user: { id: "u1" } }, error: null }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      resetPasswordForEmail: vi.fn().mockResolvedValue({ error: null }),
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
  await user.type(
    screen.getByLabelText(/Email address/i),
    "person@example.test",
  );
  await user.type(
    screen.getByLabelText("Password", { exact: true }),
    "password123",
  );
}
describe("auth flows with a mocked Supabase boundary", () => {
  it("shows mismatched passwords and does not call signUp", async () => {
    const user = userEvent.setup(),
      client = fakeClient();
    render(<AuthPage client={client} auth={anonymous} mode="register" />);
    await user.type(screen.getByLabelText("Full name"), "A customer");
    await loginFields(user);
    await user.type(
      screen.getByLabelText("Confirm password", { exact: true }),
      "different123",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Register" }));
    expect(await screen.findByRole("alert")).toHaveTextContent("do not match");
    expect(client.auth.signUp).not.toHaveBeenCalled();
  });
  it("registers through Supabase without user-controlled role metadata and asks for email confirmation", async () => {
    const user = userEvent.setup(),
      client = fakeClient();
    render(<AuthPage client={client} auth={anonymous} mode="register" />);
    await user.type(screen.getByLabelText("Full name"), "A customer");
    await loginFields(user);
    await user.type(
      screen.getByLabelText("Confirm password", { exact: true }),
      "password123",
    );
    await user.click(screen.getByRole("checkbox"));
    await user.click(screen.getByRole("button", { name: "Register" }));
    expect(await screen.findByRole("status")).toHaveTextContent(
      "Check your email",
    );
    expect(client.auth.signUp.mock.calls[0][0]).toMatchObject({
      email: "person@example.test",
      password: "password123",
      options: { data: { display_name: "A customer" } },
    });
    expect(client.auth.signUp.mock.calls[0][0].options.data).not.toHaveProperty(
      "role",
    );
  });
  it("passes credentials to signInWithPassword and displays authentication errors", async () => {
    const client = fakeClient(),
      user = userEvent.setup();
    client.auth.signInWithPassword.mockResolvedValue({
      error: { message: "Invalid login credentials" },
    });
    render(<AuthPage client={client} auth={anonymous} />);
    await loginFields(user);
    await user.click(screen.getByRole("button", { name: "Login" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Invalid login credentials",
    );
    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "person@example.test",
      password: "password123",
    });
  });
  it("rejects customer credentials on the admin form and signs out the rejected session", async () => {
    const client = fakeClient(),
      user = userEvent.setup();
    render(<AuthPage client={client} auth={anonymous} mode="admin" />);
    await loginFields(user);
    await user.click(
      screen.getByRole("button", { name: "Login to Admin Dashboard" }),
    );
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "does not have studio admin access",
    );
    expect(client.auth.signOut).toHaveBeenCalledOnce();
    expect(client.from).toHaveBeenCalledWith("profiles");
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
});
