import { useEffect, useId, useRef } from "react";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  SITE_LINKS,
  WHATSAPP_DISPLAY,
} from "../lib/site";
export function Icon({ name = "camera", size = 20 }) {
  const paths = {
    camera: (
      <>
        <path d="M4 7h4l2-3h4l2 3h4v13H4z" />
        <circle cx="12" cy="13" r="4" />
      </>
    ),
    arrow: <path d="M4 12h16m-6-6 6 6-6 6" />,
    grid: (
      <>
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </>
    ),
    lock: (
      <>
        <rect x="5" y="10" width="14" height="11" rx="2" />
        <path d="M8 10V6a4 4 0 0 1 8 0v4m-4 4v3" />
      </>
    ),
    photo: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="8" cy="8" r="2" />
        <path d="m3 17 6-6 4 4 3-3 5 5" />
      </>
    ),
    logout: <path d="M9 4H4v16h5m3-13 5 5-5 5m-5-5h14" />,
    user: (
      <>
        <circle cx="12" cy="7" r="4" />
        <path d="M4 21v-2a8 8 0 0 1 16 0v2" />
      </>
    ),
    shield: <path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6zm-4 9 3 3 5-6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    refresh: (
      <>
        <path d="M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    trash: <path d="M4 7h16M9 7V4h6v3m-8 0 1 13h8l1-13M10 11v6m4-6v6" />,
    "chevron-left": <path d="m15 5-7 7 7 7" />,
    "chevron-right": <path d="m9 5 7 7-7 7" />,
    close: <path d="M6 6l12 12M18 6 6 18" />,
    menu: <path d="M3 7h18M3 12h18M3 17h18" />,
    instagram: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.5" cy="6.5" r="0.6" fill="currentColor" />
      </>
    ),
    whatsapp: (
      <>
        <path d="M3.5 20.5 5 16a8.5 8.5 0 1 1 3.2 3.1z" />
        <path d="M9 8.5c0 3.5 3 6.5 6.5 6.5l1-1.5-2-1-1 .8a4.5 4.5 0 0 1-2.3-2.3l.8-1-1-2z" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.camera}
    </svg>
  );
}
export function Wordmark({ light = false }) {
  return (
    <a className={`wordmark ${light ? "light" : ""}`} href="#/">
      ThenFrame
    </a>
  );
}
export function Placeholder({ label, arch = false, className = "" }) {
  return (
    <div className={`photo-placeholder ${arch ? "arch" : ""} ${className}`}>
      <div className="photo-placeholder-inner">
        <Icon name="camera" />
        <em>{label}</em>
        <span>EDITORIAL PHOTO PLACEHOLDER</span>
      </div>
    </div>
  );
}
export function Notice({ children, error = false }) {
  return children ? (
    <div
      className={`notice ${error ? "error" : ""}`}
      role={error ? "alert" : "status"}
    >
      {children}
    </div>
  ) : null;
}
// Long, thin arrow used by the editorial slide controls.
export function LongArrow({ dir = "right" }) {
  const d =
    dir === "left"
      ? "M63 8H1M9 1 1 8l8 7"
      : dir === "up"
        ? "M8 79V1M1 9l7-8 7 8"
        : "M1 8h62M55 1l8 7-8 7";
  const vertical = dir === "up";
  return (
    <svg
      width={vertical ? 16 : 64}
      height={vertical ? 80 : 16}
      viewBox={vertical ? "0 0 16 80" : "0 0 64 16"}
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

// Image slot that shows a tinted placeholder until the client supplies a
// photograph. Pass `image` (a URL) to show the real photo.
export function PhotoSlot({ image, label, alt = "", tone = 0, className = "" }) {
  return (
    <div className={`photo-slot tone-${tone % 4} ${className}`}>
      {image ? (
        <img src={image} alt={alt} loading="lazy" />
      ) : (
        <span className="photo-slot-label">
          <Icon name="camera" size={16} />
          {label}
        </span>
      )}
    </div>
  );
}

export function Footer() {
  return (
    <>
      <section className="tf-instagram" aria-labelledby="instagram-title">
        <a
          className="tf-instagram-head"
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          <Icon name="instagram" size={30} />
          <h2 id="instagram-title">Follow us on Instagram</h2>
          <span>{INSTAGRAM_HANDLE}</span>
        </a>
        <div className="tf-instagram-grid-wrap">
          <div className="tf-instagram-grid">
            {[1, 2, 3, 4].map((n) => (
              <a
                key={n}
                href={INSTAGRAM_URL}
                target="_blank"
                rel="noreferrer"
                aria-label={`Instagram post ${n} on ${INSTAGRAM_HANDLE}`}
              >
                <PhotoSlot label={`[Instagram 0${n}]`} tone={n} />
              </a>
            ))}
          </div>
        </div>
      </section>
      <footer className="tf-footer">
        <div className="tf-footer-contact">
          <a href="#/contact">
            <Icon name="whatsapp" size={18} />
            Contact us · {WHATSAPP_DISPLAY}
          </a>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
            <Icon name="instagram" size={18} />
            {INSTAGRAM_HANDLE}
          </a>
        </div>
        <nav aria-label="Footer navigation">
          {SITE_LINKS.map(([label, href]) => (
            <a key={href} href={href}>
              {label}
            </a>
          ))}
        </nav>
        <a className="tf-footer-studio" href="#/admin/login">
          Studio login
        </a>
        <p>All content copyright © {new Date().getFullYear()} ThenFrame</p>
        <button
          className="tf-top"
          aria-label="Back to top"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <LongArrow dir="up" />
        </button>
      </footer>
    </>
  );
}
export function Modal({ title, onClose, children, className = "" }) {
  const titleId = useId();
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
      else {
        const main = document.getElementById("main-content");
        main?.setAttribute("tabindex", "-1");
        main?.focus({ preventScroll: true });
      }
    };
  }, []);
  return (
    <dialog
      aria-labelledby={titleId}
      className={className}
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2 id={titleId}>{title}</h2>
        <button
          className="icon-button"
          onClick={onClose}
          aria-label="Close dialog"
        >
          ×
        </button>
      </div>
      {children}
    </dialog>
  );
}
export function LaterCard({ title, children }) {
  return (
    <section className="later-card">
      <span className="pill">Coming soon</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}
