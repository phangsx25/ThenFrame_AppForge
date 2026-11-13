import { useState } from "react";
import { Icon, Wordmark } from "./UI";
import { accountName } from "../lib/account";
export function Header({ auth }) {
  const [open, setOpen] = useState(false);
  return (
    <header className="public-header">
      <Wordmark />
      <button
        className="mobile-menu button-outline"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        Menu
      </button>
      <nav
        aria-label="Main navigation"
        className={open ? "open" : ""}
        onClick={() => setOpen(false)}
      >
        <a href="#/">Home</a>
        <a href="#/portfolio">Portfolio</a>
        <a href="#/portfolio#packages">Packages</a>
        <a href="#/#heritage">Heritage</a>
        <a href="#/#our-story">Our story</a>
      </nav>
      <a
        className="account-link"
        href={
          auth.session ? (auth.isAdmin ? "#/admin" : "#/dashboard") : "#/login"
        }
      >
        <Icon name="user" size={16} />
        {auth.session ? "My space" : "Login / Register"}
      </a>
    </header>
  );
}
export function Workspace({
  auth,
  admin = false,
  children,
  active = "Overview",
  onSection,
}) {
  const [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  const name = accountName(auth.session?.user, auth.profile);
  async function logout() {
    setBusy(true);
    try {
      await auth.logout();
      window.location.hash = "/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const items = admin
    ? [
        ["Overview", "grid"],
        ["Gallery management", "photo"],
      ]
    : [
        ["Overview", "grid"],
        ["My albums", "lock"],
      ];
  return (
    <div className="workspace">
      <aside className="sidebar">
        <Wordmark light />
        <p className="eyebrow">
          {admin ? "STUDIO MANAGEMENT" : "YOUR EXCLUSIVE SPACE"}
        </p>
        <nav aria-label={admin ? "Studio navigation" : "Customer navigation"}>
          {items.map(([label, icon]) => (
            <button
              key={label}
              className={active === label ? "active" : ""}
              onClick={() => onSection(label)}
            >
              <Icon name={icon} size={18} />
              {label}
            </button>
          ))}
          {admin && (
            <a
              className={active === "Accounts" ? "active" : ""}
              href="#/admin/accounts"
            >
              <Icon name="user" size={18} />
              Accounts
            </a>
          )}
          <a
            className={active === "Account settings" ? "active" : ""}
            href="#/account"
          >
            <Icon name="shield" size={18} />
            Account settings
          </a>
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-note">
            {admin ? "Your studio, in focus." : "Just for you."}
            <span>
              {admin
                ? "A thoughtful space for every story."
                : "Your photography journey with ThenFrame."}
            </span>
          </p>
          <a href="#/portfolio">
            <Icon name="arrow" size={17} />
            Back to website
          </a>
          <button disabled={busy} onClick={logout}>
            <Icon name="logout" size={18} />
            {busy ? "Signing out…" : "Logout"}
          </button>
          {error && <p role="alert">{error}</p>}
        </div>
      </aside>
      <div className="workspace-main">
        <header className="workspace-header">
          <div>
            <span className="eyebrow">
              {admin ? "STUDIO" : "CUSTOMER SPACE"}
            </span>
            <span className="breadcrumb">/</span>
            {active}
          </div>
          <a
            href="#/account"
            aria-label="Account settings"
            className="profile-chip"
          >
            <span className="avatar">{name.charAt(0).toUpperCase()}</span>
            <div>
              {name}
              <small>{admin ? "Studio admin" : "Customer account"}</small>
            </div>
          </a>
        </header>
        <main id="main-content">{children}</main>
        <footer className="workspace-footer">
          ThenFrame ·{" "}
          {admin ? "Studio workspace" : "Your story, beautifully kept."}
        </footer>
      </div>
    </div>
  );
}
