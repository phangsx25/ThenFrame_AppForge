import { useEffect, useState } from "react";
import { Icon, Notice, Placeholder, Wordmark } from "./UI";

export default function AuthPage({ client, auth, mode = "login" }) {
  const register = mode === "register",
    admin = mode === "admin",
    reset = mode === "reset";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [show, setShow] = useState(false),
    [showConfirm, setShowConfirm] = useState(false);
  useEffect(() => {
    if (auth.loading || !auth.profile) return;
    if (admin && !auth.isAdmin) return;
    window.location.hash = auth.isAdmin ? "/admin" : "/dashboard";
  }, [auth.loading, auth.profile, auth.isAdmin, admin]);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setMessage("");
    if (!client) {
      setError(
        "Sign-in is unavailable. The studio must configure its Supabase connection.",
      );
      return;
    }
    const data = new FormData(event.currentTarget),
      email = String(data.get("email") || "").trim();
    if (register && data.get("password") !== data.get("confirmation")) {
      setError("Your passwords do not match.");
      return;
    }
    setBusy(true);
    try {
      if (reset) {
        const result = await client.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin + "/?auth=password",
        });
        if (result.error) throw result.error;
        setMessage(
          "If an account exists, check its email for a password reset link.",
        );
      } else if (register) {
        const result = await client.auth.signUp({
          email,
          password: data.get("password"),
          options: {
            data: { display_name: String(data.get("name")).trim() },
            emailRedirectTo: window.location.origin + "/?auth=confirmed",
          },
        });
        if (result.error) throw result.error;
        setMessage(
          result.data.session
            ? "Account created. Opening your customer space…"
            : "Check your email to confirm your account, then log in.",
        );
      } else {
        const result = await client.auth.signInWithPassword({
          email,
          password: data.get("password"),
        });
        if (result.error) throw result.error;
        if (admin) {
          const profile = await client
            .from("profiles")
            .select("role")
            .eq("id", result.data.user.id)
            .single();
          if (profile.error || profile.data?.role !== "admin") {
            await client.auth.signOut();
            throw new Error(
              "This account does not have studio admin access. Use Customer Login instead.",
            );
          }
          window.location.hash = "/admin";
        } else setMessage("Signed in. Loading your profile…");
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className={`auth-page ${admin ? "staff-auth" : ""}`}>
      <header className="auth-header">
        <Wordmark />
        <a href="#/">← {admin ? "Return to customer site" : "Home"}</a>
      </header>
      <main id="main-content" className="auth-layout">
        <div className="auth-editorial">
          {admin ? (
            <div className="staff-panel">
              <span className="eyebrow">◎ THENFRAME / STUDIO</span>
              <div className="monogram">tf</div>
              <h2>
                Behind every beautiful
                <br />
                story.
              </h2>
              <p>
                A considered space for the work behind the lens. Review
                galleries and prepare stories to be shared.
              </p>
              <div className="staff-panel-bottom">
                GALLERIES · PORTFOLIO · STUDIO
              </div>
            </div>
          ) : (
            <>
              <Placeholder
                arch
                label={
                  register
                    ? "[The beginning of a wedding story]"
                    : "[A tender wedding-day embrace]"
                }
              />
              <div className="auth-story">
                <span className="eyebrow">YOUR STORY, BEAUTIFULLY KEPT</span>
                <h2>
                  {register
                    ? "Every forever begins with a hello."
                    : "A little closer to your forever."}
                </h2>
                <p>
                  Your favourite frames, and the moments you’ll return to — all
                  in your own space.
                </p>
              </div>
            </>
          )}
        </div>
        <section className="auth-form-panel">
          {!register && !reset && (
            <div className="login-role-choice">
              <span className="eyebrow">LOG IN AS</span>
              <nav className="login-role-picker" aria-label="Login role">
                <a
                  href="#/login"
                  aria-current={!admin ? "page" : undefined}
                  aria-disabled={busy || undefined}
                  onClick={(event) => {
                    if (busy) event.preventDefault();
                  }}
                >
                  <Icon name="user" size={17} />
                  Customer
                </a>
                <a
                  href="#/admin/login"
                  aria-current={admin ? "page" : undefined}
                  aria-disabled={busy || undefined}
                  onClick={(event) => {
                    if (busy) event.preventDefault();
                  }}
                >
                  <Icon name="shield" size={17} />
                  Admin
                </a>
              </nav>
            </div>
          )}
          <span className="eyebrow">
            {admin
              ? "◎ AUTHORIZED STAFF ONLY"
              : register
                ? "CREATE YOUR CUSTOMER ACCOUNT"
                : "CUSTOMER SPACE"}
          </span>
          <h1>
            {admin
              ? "Studio Login."
              : register
                ? "Your story starts here."
                : reset
                  ? "A fresh start."
                  : "Welcome back."}
          </h1>
          <p className="lead">
            {admin
              ? "Sign in with your studio credentials to access the Admin Dashboard."
              : register
                ? "A personal space to explore our photography and keep your wedding memories close."
                : reset
                  ? "We’ll email you a secure link to reset your password."
                  : "Log in to your ThenFrame customer space."}
          </p>
          {admin && (
            <p className="small-text">
              <a href="#/admin/setup">
                First admin account? View studio setup →
              </a>
            </p>
          )}
          <form onSubmit={submit}>
            {register && (
              <label>
                Full name
                <input
                  name="name"
                  autoComplete="name"
                  placeholder="Your name"
                  required
                  maxLength={100}
                />
              </label>
            )}
            <label>
              {admin ? "Staff email address" : "Email address"}
              <input
                name="email"
                type="email"
                autoComplete="email"
                placeholder={admin ? "name@studio.example" : "you@example.com"}
                required
              />
            </label>
            {!reset && (
              <>
                <div className="field">
                  <div className="label-row">
                    <label htmlFor="password">Password</label>
                    <button
                      type="button"
                      className="text-button"
                      onClick={() => setShow(!show)}
                    >
                      {show ? "Hide" : "Show"} password
                    </button>
                  </div>
                  <input
                    id="password"
                    aria-label="Password"
                    name="password"
                    type={show ? "text" : "password"}
                    autoComplete={
                      register ? "new-password" : "current-password"
                    }
                    placeholder={register ? "Create a password" : "••••••••"}
                    required
                    minLength={register ? 8 : undefined}
                    pattern={
                      register ? "(?=.*[A-Za-z])(?=.*[0-9]).{8,}" : undefined
                    }
                  />
                  {register && (
                    <small>
                      Use at least 8 characters, including a letter and a
                      number.
                    </small>
                  )}
                </div>
                {register && (
                  <div className="field">
                    <div className="label-row">
                      <label htmlFor="confirmation">Confirm password</label>
                      <button
                        type="button"
                        className="text-button"
                        onClick={() => setShowConfirm(!showConfirm)}
                      >
                        {showConfirm ? "Hide" : "Show"} confirmation
                      </button>
                    </div>
                    <input
                      id="confirmation"
                      aria-label="Confirm password"
                      name="confirmation"
                      type={showConfirm ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Re-enter your password"
                      required
                    />
                  </div>
                )}
                {!register && (
                  <div className="form-options">
                    <small>Sign out after using a shared device.</small>
                    <a href="#/reset">Forgot password?</a>
                  </div>
                )}
              </>
            )}
            {register && (
              <label className="checkbox-label">
                <input type="checkbox" required />I understand this account is
                for customer access.
              </label>
            )}
            <Notice error>{error}</Notice>
            <Notice>{message}</Notice>
            <button className="primary full" disabled={busy || auth.loading}>
              {busy
                ? "Please wait…"
                : admin
                  ? "Login to Admin Dashboard"
                  : register
                    ? "Register"
                    : reset
                      ? "Send reset link"
                      : "Login"}
            </button>
          </form>
          <p className="auth-switch">
            {admin ? (
              <>
                <Icon name="shield" size={15} />
                Studio accounts are issued by an administrator. This login is
                separate from customer access.
              </>
            ) : register ? (
              <>
                Already have an account? <a href="#/login">Login</a>
              </>
            ) : reset ? (
              <a href="#/login">Return to login</a>
            ) : (
              <>
                New to ThenFrame? <a href="#/register">Register</a>
              </>
            )}
          </p>
          <div className="auth-divider">
            {admin ? (
              <>
                Looking for your photographs?{" "}
                <a href="#/login">Customer Login →</a>
              </>
            ) : (
              <>
                <span>
                  <Icon name="shield" size={16} />
                  Part of the studio?
                </span>
                <a href="#/admin/login">Admin Login ↗</a>
              </>
            )}
          </div>
        </section>
      </main>
      <footer className="auth-footer">
        <span>
          © ThenFrame · {admin ? "Studio workspace" : "Wedding photography"}
        </span>
        <span>Your story, beautifully kept.</span>
      </footer>
    </div>
  );
}
