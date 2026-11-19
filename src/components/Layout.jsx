import { useEffect, useRef, useState } from "react";
import { Icon, Wordmark } from "./UI";
import { INSTAGRAM_HANDLE, INSTAGRAM_URL, SITE_LINKS } from "../lib/site";
import { accountName } from "../lib/account";
// Public header: wordmark plus a "Menu" button that opens a full-screen menu.
// `overlay` places it transparently over a full-bleed hero image.
export function Header({ auth, overlay = false }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef(null);
  // The header stays fixed at the top; once the page scrolls it gains a solid
  // background so the ThenFrame wordmark is always readable.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (event) => {
      if (event.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);
  return (
    <header
      className={`site-header${overlay ? " overlay" : ""}${scrolled ? " scrolled" : ""}${open ? " menu-open" : ""}`}
    >
      <div className="site-header-bar">
        <Wordmark />
        <div className="site-header-actions">
          {auth.isAdmin ? (
            <a className="account-link" href="#/admin">
              <Icon name="user" size={16} />
              Studio
            </a>
          ) : (
            <a
              className="account-link studio-icon-link"
              href="#/admin/login"
              aria-label="Studio login"
              title="Studio login"
            >
              <Icon name="user" size={18} />
            </a>
          )}
          <button
            ref={toggleRef}
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="site-menu"
            onClick={() => setOpen(!open)}
          >
            <span>{open ? "Close" : "Menu"}</span>
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </div>
      </div>
      <nav
        id="site-menu"
        aria-label="Main navigation"
        className="site-menu"
        onClick={(event) => {
          if (event.target.closest("a")) setOpen(false);
        }}
      >
        <ul>
          {SITE_LINKS.map(([label, href]) => (
            <li key={href}>
              <a href={href}>{label}</a>
            </li>
          ))}
        </ul>
        <div className="site-menu-extra">
          <a className="tf-pill" href="#/contact">
            Book your date
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Icon name="instagram" size={18} />
            {INSTAGRAM_HANDLE}
          </a>
        </div>
      </nav>
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
