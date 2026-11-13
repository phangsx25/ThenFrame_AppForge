import { useState } from "react";
import { Workspace } from "./Layout";
import { Notice, Icon } from "./UI";
import {
  accountName,
  updateAccountName,
  changeAccountPassword,
  changeAccountEmail,
} from "../lib/account";

export default function AccountSettings({ auth, client }) {
  const [busy, setBusy] = useState(""),
    [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [showPasswords, setShowPasswords] = useState(false),
    [nonceRequired, setNonceRequired] = useState(false);
  const user = auth.session.user,
    name = accountName(user, auth.profile),
    admin = auth.profile.role === "admin";
  async function run(key, action) {
    setBusy(key);
    setError("");
    setMessage("");
    try {
      await action();
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy("");
    }
  }
  async function saveName(event) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    await run("profile", async () => {
      const updated = await updateAccountName(client, data.get("name"));
      auth.updateUserDetails(updated);
      setMessage("Your name has been saved.");
    });
  }
  async function saveEmail(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    await run("email", async () => {
      const email = data.get("email").trim();
      if (email.toLowerCase() === user.email.toLowerCase())
        throw new Error("Enter a different email address.");
      await changeAccountEmail(client, email, window.location.origin);
      form.reset();
      setMessage(
        "Email change requested. Check the confirmation links sent by Supabase. Your current email stays active until the change is confirmed.",
      );
    });
  }
  async function savePassword(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    await run("password", async () => {
      try {
        await changeAccountPassword(client, {
          currentPassword: data.get("currentPassword"),
          password: data.get("password"),
          confirmation: data.get("confirmation"),
          nonce: data.get("nonce"),
        });
      } catch (e) {
        if (/nonce|reauth|recently|verification code/i.test(e.message))
          setNonceRequired(true);
        throw e;
      }
      form.reset();
      setNonceRequired(false);
      setMessage("Your password has been changed.");
    });
  }
  function navigate(section) {
    window.location.hash =
      section === "Gallery management"
        ? "/admin"
        : section === "Accounts"
          ? "/admin/accounts"
          : admin
            ? "/admin"
            : "/dashboard";
  }
  return (
    <Workspace
      auth={auth}
      admin={admin}
      active="Account settings"
      onSection={navigate}
    >
      <div className="dashboard-heading">
        <div>
          <span className="eyebrow">YOUR ACCOUNT / PROFILE & SECURITY</span>
          <h1>Your account, your space.</h1>
          <p>Keep your name and sign-in details up to date.</p>
        </div>
      </div>
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
      <section className="dashboard-card account-identity">
        <span className="avatar large">{name.charAt(0).toUpperCase()}</span>
        <div>
          <h2>{name}</h2>
          <p>{user.email}</p>
          <span className="pill">{admin ? "Studio admin" : "Customer"}</span>
        </div>
        <div className="identity-confirmation">
          <Icon name="shield" size={18} />
          <span>
            {user.email_confirmed_at
              ? "Email verified"
              : "Email verification not confirmed"}
          </span>
        </div>
      </section>
      <div className="account-settings-grid">
        <section className="dashboard-card">
          <span className="eyebrow">01 / PERSONAL DETAILS</span>
          <h2>Your profile</h2>
          <p>Your name appears in your dashboard and account menu.</p>
          <form onSubmit={saveName}>
            <label>
              Full name
              <input
                name="name"
                autoComplete="name"
                defaultValue={name === "Your account" ? "" : name}
                required
                maxLength={100}
              />
            </label>
            <label>
              Account role
              <input readOnly value={admin ? "Studio admin" : "Customer"} />
            </label>
            <small className="muted">
              Your account role is managed by the studio owner.
            </small>
            <button disabled={Boolean(busy)} className="primary full">
              {busy === "profile" ? "Saving…" : "Save profile"}
            </button>
          </form>
        </section>
        <section className="dashboard-card">
          <span className="eyebrow">02 / EMAIL ADDRESS</span>
          <h2>Change your email</h2>
          <p>
            Current sign-in email: <strong>{user.email}</strong>
          </p>
          {user.new_email && (
            <Notice>
              Pending email change: {user.new_email}. Check your email to
              confirm.
            </Notice>
          )}
          <form onSubmit={saveEmail}>
            <label>
              New email address
              <input
                type="email"
                name="email"
                autoComplete="email"
                required
                placeholder="Your new email address"
              />
            </label>
            <p className="small-text muted">
              Supabase may require confirmation from both your current and new
              email addresses.
            </p>
            <button disabled={Boolean(busy)} className="button-outline full">
              {busy === "email" ? "Sending…" : "Request email change"}
            </button>
          </form>
        </section>
        <section className="dashboard-card" id="security">
          <span className="eyebrow">03 / ACCOUNT SECURITY</span>
          <h2>Change password</h2>
          <p>
            Use a different password with at least 8 characters, a letter and a
            number.
          </p>
          <button
            className="text-button"
            type="button"
            onClick={() => setShowPasswords(!showPasswords)}
          >
            {showPasswords ? "Hide passwords" : "Show passwords"}
          </button>
          <form onSubmit={savePassword}>
            <label>
              Current password
              <input
                name="currentPassword"
                type={showPasswords ? "text" : "password"}
                autoComplete="current-password"
                required
              />
            </label>
            <label>
              New password
              <input
                name="password"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            <label>
              Confirm new password
              <input
                name="confirmation"
                type={showPasswords ? "text" : "password"}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </label>
            {nonceRequired && (
              <label>
                Email verification code
                <input
                  name="nonce"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                />
              </label>
            )}
            <button disabled={Boolean(busy)} className="primary full">
              {busy === "password" ? "Updating…" : "Change password"}
            </button>
          </form>
          <div className="account-card-links">
            <a href="#/reset">Forgot your current password?</a>
            <button
              className="text-button"
              disabled={Boolean(busy)}
              onClick={() =>
                run("reauth", async () => {
                  const result = await client.auth.reauthenticate();
                  if (result.error) throw result.error;
                  setNonceRequired(true);
                  setMessage(
                    "A verification code has been requested. Check your email, then enter the code with your new password.",
                  );
                })
              }
            >
              Send verification code
            </button>
          </div>
        </section>
        <section className="dashboard-card">
          <span className="eyebrow">04 / SIGN-IN SESSIONS</span>
          <h2>Manage your sessions</h2>
          <p>
            Sign out when you finish using a shared device. Session revocation
            does not instantly invalidate already issued access tokens.
          </p>
          <div className="session-actions">
            <button
              disabled={Boolean(busy)}
              className="button-outline"
              onClick={() =>
                run("otherSessions", async () => {
                  const result = await client.auth.signOut({ scope: "others" });
                  if (result.error) throw result.error;
                  setMessage(
                    "Other sessions have been signed out. Existing access tokens can remain valid until expiry.",
                  );
                })
              }
            >
              Sign out other devices
            </button>
            <button
              disabled={Boolean(busy)}
              className="button-outline"
              onClick={() =>
                run("logout", async () => {
                  await auth.logout("local");
                  window.location.hash = "/login";
                })
              }
            >
              Sign out this device
            </button>
            <button
              disabled={Boolean(busy)}
              className="primary"
              onClick={() =>
                run("logoutAll", async () => {
                  await auth.logout("global");
                  window.location.hash = "/login";
                })
              }
            >
              Sign out all devices
            </button>
          </div>
        </section>
      </div>
      <section className="dashboard-card">
        <h2>Account details</h2>
        <dl className="account-details">
          <div>
            <dt>Email</dt>
            <dd>{user.email}</dd>
          </div>
          <div>
            <dt>Account role</dt>
            <dd>{admin ? "Studio admin" : "Customer"}</dd>
          </div>
          {user.created_at && (
            <div>
              <dt>Joined</dt>
              <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
            </div>
          )}
          {user.last_sign_in_at && (
            <div>
              <dt>Last sign-in</dt>
              <dd>{new Date(user.last_sign_in_at).toLocaleString()}</dd>
            </div>
          )}
        </dl>
      </section>
    </Workspace>
  );
}
