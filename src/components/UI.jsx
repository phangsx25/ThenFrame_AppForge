import { useEffect, useRef } from "react";
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
export function Footer() {
  return (
    <footer className="site-footer">
      <div>
        <Wordmark />
        <p>
          Wedding stories, thoughtfully kept.
          <br />
          For the moments that become part of you.
        </p>
      </div>
      <div>
        <span className="eyebrow">EXPLORE</span>
        <a href="#/portfolio">Portfolio</a>
        <a href="#/login">Customer space</a>
      </div>
      <div>
        <span className="eyebrow">THE STUDIO</span>
        <a href="#/admin/login">Studio login</a>
        <span>ThenFrame · Malaysia</span>
      </div>
      <div className="footer-bottom">
        © {new Date().getFullYear()} ThenFrame · Wedding photography
        <span>Your story, beautifully kept.</span>
      </div>
    </footer>
  );
}
export function Modal({ title, onClose, children }) {
  const ref = useRef(null);
  useEffect(() => {
    const dialog = ref.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);
  return (
    <dialog
      ref={ref}
      onCancel={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="dialog-heading">
        <h2>{title}</h2>
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
      <span className="pill">Planned · Later sprint</span>
      <h3>{title}</h3>
      <p>{children}</p>
    </section>
  );
}
