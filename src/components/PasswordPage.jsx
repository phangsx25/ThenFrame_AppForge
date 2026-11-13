import { useState } from "react";
import { Notice, Wordmark } from "./UI";
export default function PasswordPage({ client, auth }) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [done, setDone] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    const data = new FormData(event.currentTarget);
    if (data.get("password") !== data.get("confirmation"))
      return setError("Your passwords do not match.");
    setBusy(true);
    try {
      const result = await client.auth.updateUser({
        password: data.get("password"),
      });
      if (result.error) throw result.error;
      setDone(true);
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="single-form" id="main-content">
      <Wordmark />
      <span className="eyebrow">ACCOUNT SECURITY</span>
      <h1>Choose a new password.</h1>
      {auth.loading ? (
        <p role="status">Checking reset link…</p>
      ) : !auth.session ? (
        <Notice error>
          Open the link from your password reset email first.{" "}
          <a href="#/reset">Request a new link</a>.
        </Notice>
      ) : done ? (
        <Notice>
          Password updated. <a href="#/dashboard">Go to your account →</a>
        </Notice>
      ) : (
        <form onSubmit={submit}>
          <label>
            New password
            <input
              type="password"
              name="password"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <label>
            Confirm password
            <input
              type="password"
              name="confirmation"
              required
              minLength={8}
              autoComplete="new-password"
            />
          </label>
          <Notice error>{error}</Notice>
          <button disabled={busy} className="primary">
            {busy ? "Saving…" : "Update password"}
          </button>
        </form>
      )}
    </main>
  );
}
