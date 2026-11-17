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
      {auth.isAdmin && (
        <a className="account-link" href="#/admin">
          <Icon name="user" size={16} />
          Studio
        </a>
      )}
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
      window.location.hash = "/admin/login";
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }
  const items = [
    ["Overview", "grid"],
    ["Gallery management", "photo"],
  ];
  return (
    <div className={`workspace${admin ? " admin-workspace" : ""}`}>
      <aside className="sidebar">
        <Wordmark light />
        <p className="eyebrow">STUDIO MANAGEMENT</p>
        <nav aria-label="Studio navigation">
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
          <a
            className={active === "Heritage" ? "active" : ""}
            href="#/heritage"
          >
            <Icon name="photo" size={18} />
            Heritage
          </a>
          <a
            className={active === "Booking" ? "active" : ""}
            href="#/booking"
          >
            <Icon name="grid" size={18} />
            Booking
          </a>
        </nav>
        <div className="sidebar-bottom">
          <p className="sidebar-note">
            Your studio, in focus.
            <span>Defining Timeless Moments</span>
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
            <span className="eyebrow">STUDIO</span>
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
              <small>Studio admin</small>
            </div>
          </a>
        </header>
        <main id="main-content">{children}</main>
        <footer className="workspace-footer">
          ThenFrame · Defining Timeless Moments
        </footer>
      </div>
    </div>
  );
}
