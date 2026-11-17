import { useEffect, useState } from "react";
import { Icon, Notice, Wordmark } from "./UI";
import { signInWithUsername } from "../lib/username";

// Studio staff only. Customers do not have accounts; they browse the public
// site and send booking enquiries without logging in.
export default function AuthPage({ client, auth, mode = "admin" }) {
  const reset = mode === "reset";
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  useEffect(() => {
    if (reset || auth.loading || !auth.profile || !auth.isAdmin) return;
    window.location.hash = "/admin";
  }, [auth.loading, auth.profile, auth.isAdmin, reset]);
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
      } else {
        const result = await signInWithUsername(client, data.get("username"), data.get("password"));
        if (result.error) throw result.error;
        const profile = await client
          .from("profiles")
          .select("role")
          .eq("id", result.data.user.id)
          .single();
        if (profile.error || profile.data?.role !== "admin") {
          await client.auth.signOut();
          throw new Error("This account does not have studio admin access.");
        }
        window.location.hash = "/admin";
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="auth-page staff-auth">
      <header className="auth-header">
        <Wordmark />
        <a href="#/">← Return to site</a>
      </header>
      <main id="main-content" className="auth-layout">
        <div className="auth-editorial">
          <div className="staff-panel">
            <span className="eyebrow">◎ THENFRAME / STUDIO</span>
            <div className="monogram">ThenFrame</div>
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
        </div>
        <section className="auth-form-panel">
          <span className="eyebrow">◎ AUTHORIZED STAFF ONLY</span>
          <h1>{reset ? "A fresh start." : "Studio Login."}</h1>
          {reset ? (
            <p className="lead">
              We’ll email you a secure link to reset your password.
            </p>
          ) : (
            <p className="small-text">
              <a href="#/admin/setup">
                First admin account? View studio setup →
              </a>
            </p>
          )}
          <form onSubmit={submit}>
            {reset ? (
              <label>
                Email address
                <input name="email" type="email" autoComplete="email"
                  placeholder="name@studio.example" required />
              </label>
            ) : (
              <>
                <label>
                  Username
                  <input name="username" aria-label="Username" autoComplete="username" required
                    minLength={3} maxLength={40} pattern="[A-Za-z][A-Za-z0-9_]{2,39}"
                    placeholder="e.g. username" />
                </label>
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
                    autoComplete="current-password"
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="form-options">
                  <small>Sign out after using a shared device.</small>
                  <a href="#/reset">Forgot password?</a>
                </div>
              </>
            )}
            <Notice error>{error}</Notice>
            <Notice>{message}</Notice>
            <button className="primary full" disabled={busy || auth.loading}>
              {busy ? "Please wait…" : reset ? "Send reset link" : "Login"}
            </button>
          </form>
          <p className="auth-switch">
            {reset ? (
              <a href="#/admin/login">Return to login</a>
            ) : (
              <>
                <Icon name="shield" size={15} />
                Studio accounts are created by the studio owner.
              </>
            )}
          </p>
        </section>
      </main>
      <footer className="auth-footer">
        <span>© ThenFrame · Studio workspace</span>
        <span>Your story, beautifully kept.</span>
      </footer>
    </div>
  );
}
