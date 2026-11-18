import { useEffect, useState } from "react";
import { listCollections, listPhotos } from "../lib/gallery";
import {
  Footer,
  Icon,
  LongArrow,
  Modal,
  Notice,
  PhotoSlot,
  Placeholder,
} from "./UI";
import { Header } from "./Layout";
import {
  INSTAGRAM_HANDLE,
  INSTAGRAM_URL,
  WHATSAPP_DISPLAY,
} from "../lib/site";

// Client photographs are still pending. Set `image` to a URL (for example a
// file in /public) to replace each placeholder.
const HERO_SLIDES = [
  { line: "Wedding Photography", image: null },
  { line: "Defining timeless moments", image: null },
  { line: "Honest moments, beautiful memories", image: null },
  { line: "Your story, beautifully kept", image: null },
];
const PACKAGES = [
  {
    title: "The wedding day",
    text: "For the meaningful moments, the celebrations and everything in between.",
    image: null,
  },
  {
    title: "An intimate celebration",
    text: "A thoughtful approach to the smaller stories that deserve to be remembered.",
    image: null,
  },
  {
    title: "A moment for two",
    text: "Natural portraits, honest connections and the beginning of your story.",
    image: null,
  },
];
const HERITAGE_IMAGE = null;

const pad = (n) => String(n).padStart(2, "0");

function useCarousel(count, interval = 0) {
  const [index, setIndex] = useState(0);
  const [resetKey, setResetKey] = useState(0);
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (!interval || reduce) return;
    const id = setInterval(() => setIndex((i) => (i + 1) % count), interval);
    return () => clearInterval(id);
  }, [count, interval, resetKey]);
  const step = (delta) => {
    setIndex((i) => (i + delta + count) % count);
    setResetKey((k) => k + 1);
  };
  return [index, step];
}

function SlideControls({ index, count, onStep, label }) {
  return (
    <div className="tf-controls">
      <button onClick={() => onStep(-1)} aria-label={`Previous ${label}`}>
        <LongArrow dir="left" />
      </button>
      <span className="tf-counter">
        <span>{pad(index + 1)}</span>
        <span aria-hidden="true">/</span>
        <span>{pad(count)}</span>
      </span>
      <button onClick={() => onStep(1)} aria-label={`Next ${label}`}>
        <LongArrow />
      </button>
    </div>
  );
}

function HeroSlider() {
  const [index, step] = useCarousel(HERO_SLIDES.length, 6000);
  return (
    <section
      className="tf-hero"
      aria-roledescription="carousel"
      aria-label="Featured photographs"
    >
      {HERO_SLIDES.map((slide, i) => (
        <div
          key={i}
          className={`tf-hero-slide${i === index ? " active" : ""}`}
          aria-hidden={i !== index}
        >
          <PhotoSlot
            image={slide.image}
            label={`[Hero photograph ${pad(i + 1)}]`}
            tone={i}
          />
        </div>
      ))}
      <div className="tf-hero-copy">
        <h1>
          Welcome to
          <br />
          ThenFrame
        </h1>
        <p key={index} className="tf-hero-line">
          {HERO_SLIDES[index].line}
        </p>
        <SlideControls
          index={index}
          count={HERO_SLIDES.length}
          onStep={step}
          label="slide"
        />
      </div>
    </section>
  );
}

function PackagesCarousel() {
  const [index, step] = useCarousel(PACKAGES.length);
  const current = PACKAGES[index];
  return (
    <section
      className="tf-band tf-dark tf-packages"
      id="packages"
      aria-roledescription="carousel"
      aria-label="Packages"
    >
      <div className="tf-narrow">
        <PhotoSlot
          key={index}
          className="tf-package-photo"
          image={current.image}
          label={`[Package photograph ${pad(index + 1)}]`}
          tone={index + 1}
        />
        <span className="tf-eyebrow">Packages</span>
        <h2>{current.title}</h2>
        <p className="tf-quote">“{current.text}”</p>
        <SlideControls
          index={index}
          count={PACKAGES.length}
          onStep={step}
          label="package"
        />
        <a className="tf-pill" href="#/contact">
          Ready to connect
        </a>
        <a className="tf-text-link" href="#/packages">
          See all packages
        </a>
      </div>
    </section>
  );
}

export function Home({ client, auth }) {
  return (
    <>
      <Header auth={auth} overlay />
      <main id="main-content">
        <HeroSlider />
        <section className="tf-tagline">
          <h2>“Defining Timeless Moments”</h2>
          <p>Wedding photography for the stories you’ll keep</p>
        </section>
        <section className="tf-latest">
          <div className="tf-center">
            <a className="tf-pill" href="#/portfolio">
              Click to view our portfolio
            </a>
          </div>
          <PortfolioSection client={client} preview />
        </section>
        <section className="tf-band tf-dark" id="our-story">
          <div className="tf-narrow">
            <span className="tf-eyebrow">Our story</span>
            <h2>Where every story begins</h2>
            <p>
              Not just how your day looked, but how it felt: the tenderness,
              the traditions and everything in between. ThenFrame captures the
              honest moments of your celebration and keeps them beautifully for
              the years to come.
            </p>
            <div className="tf-pill-stack">
              <a className="tf-pill" href="#/portfolio">
                Explore the portfolio
              </a>
              <a className="tf-pill" href="#/contact">
                Begin your story
              </a>
            </div>
          </div>
        </section>
        <section className="tf-feature" id="heritage">
          <PhotoSlot
            image={HERITAGE_IMAGE}
            label="[Traditional Malay wedding photograph]"
            tone={2}
          />
          <div className="tf-feature-copy">
            <span className="tf-eyebrow">Rooted in tradition</span>
            <h2>Malay Wedding Heritage</h2>
          </div>
        </section>
        <section className="tf-band tf-light">
          <div className="tf-narrow">
            <p>
              Traditions held close. Stories carried forward. A dedicated guide
              to traditional Malay wedding customs is planned for a later
              sprint.
            </p>
            <span className="tf-pill tf-pill-static">
              Heritage guide · Coming soon
            </span>
          </div>
        </section>
        <PackagesCarousel />
      </main>
      <Footer />
    </>
  );
}
export function PortfolioSection({
  client,
  preview = false,
  selectedId = null,
}) {
  const [collections, setCollections] = useState([]),
    [loading, setLoading] = useState(true),
    [error, setError] = useState("");
  const [query, setQuery] = useState(""),
    [eventType, setEventType] = useState(""),
    [refresh, setRefresh] = useState(0);
  useEffect(() => {
    let active = true;
    if (!client) {
      return;
    }
    listCollections(client)
      .then((data) => {
        if (active) setCollections(data);
      })
      .catch((e) => {
        if (active) setError(e.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [client, refresh]);
  const shown = collections.filter(
    (c) =>
      (!selectedId || c.id === selectedId) &&
      (!eventType || c.style === eventType) &&
      `${c.title} ${c.description || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const fullPortfolio = !preview && !selectedId;
  const reload = () => {
    setLoading(true);
    setError("");
    setRefresh((n) => n + 1);
  };
  return (
    <section
      className={`portfolio-section page-width${fullPortfolio ? " tf-portfolio" : ""}`}
      id="portfolio"
    >
      {!fullPortfolio && (
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              {preview ? "FRESH FROM THE STUDIO" : "A FEW FRAMES / OUR PORTFOLIO"}
            </span>
            <h2>{preview ? "Latest Work" : "A story, in frames."}</h2>
          </div>
          {preview ? (
            <a className="text-link" href="#/portfolio">
              View All <Icon name="arrow" size={16} />
            </a>
          ) : (
            <button className="text-button" onClick={reload}>
              Refresh portfolio ↻
            </button>
          )}
        </div>
      )}
      {fullPortfolio && (
        <div className="filters tf-filters">
          <label>
            Find a story
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections"
              type="search"
            />
          </label>
          <label>
            Event type
            <select
              aria-label="Event type"
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
            >
              <option value="">All event types</option>
              {[
                ...new Set(collections.map((c) => c.style).filter(Boolean)),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
          <button className="text-button" onClick={reload}>
            Refresh portfolio ↻
          </button>
        </div>
      )}
      {!client ? (
        <Notice>
          The studio’s portfolio connection is not configured yet.
        </Notice>
      ) : loading ? (
        <p role="status" className="loading">
          Gathering the stories…
        </p>
      ) : error ? (
        <Notice error>
          {error}{" "}
          <button className="text-button" onClick={reload}>
            Try again
          </button>
        </Notice>
      ) : !shown.length ? (
        <div className="empty-state">
          <Icon name="photo" size={30} />
          <h3>
            {query || eventType
              ? "No stories match your search."
              : "Every story begins with a frame."}
          </h3>
          <p>
            {query || eventType
              ? "Try another title or event type."
              : "The studio has not published any collections yet. Come back soon."}
          </p>
        </div>
      ) : fullPortfolio ? (
        <Masonry
          items={shown}
          render={(c, i) => (
            <PublicCollection
              key={c.id + refresh}
              collection={c}
              client={client}
              variant="masonry"
              tall={i % 5 === 2}
            />
          )}
        />
      ) : (
        <div className={selectedId ? "" : "portfolio-grid"}>
          {(preview ? shown.slice(0, 3) : shown).map((c) => (
            <PublicCollection
              key={c.id + refresh}
              collection={c}
              client={client}
              detail={Boolean(selectedId)}
            />
          ))}
        </div>
      )}
      {selectedId && (
        <a className="text-link" href="#/portfolio">
          ← All collections
        </a>
      )}
    </section>
  );
}
function useColumnCount() {
  const read = () =>
    window.innerWidth <= 640 ? 1 : window.innerWidth <= 1000 ? 2 : 3;
  const [count, setCount] = useState(read);
  useEffect(() => {
    const onResize = () => setCount(read());
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);
  return count;
}

// Row-order masonry: item 1 goes to column 1, item 2 to column 2, and so on,
// so the newest collections still read first.
function Masonry({ items, render }) {
  const count = useColumnCount();
  const columns = Array.from({ length: count }, () => []);
  items.forEach((item, i) => columns[i % count].push([item, i]));
  return (
    <div className="tf-masonry">
      {columns.map((column, c) => (
        <div className="tf-masonry-col" key={c}>
          {column.map(([item, i]) => render(item, i))}
        </div>
      ))}
    </div>
  );
}

function PublicCollection({
  collection,
  client,
  detail,
  variant = "card",
  tall = false,
}) {
  const [photos, setPhotos] = useState([]),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true),
    [version, setVersion] = useState(0),
    [lightbox, setLightbox] = useState(null);
  useEffect(() => {
    let alive = true;
    listPhotos(client, collection.id)
      .then((data) => {
        if (alive) setPhotos(data);
      })
      .catch((e) => {
        if (alive) setError(e.message);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [client, collection.id, version]);
  useEffect(() => {
    if (!lightbox) return;
    const close = (e) => {
      if (e.key === "Escape") setLightbox(null);
    };
    window.addEventListener("keydown", close);
    return () => window.removeEventListener("keydown", close);
  }, [lightbox]);
  const cover = photos.find((p) => p.url);
  if (variant === "masonry")
    return (
      <article className="tf-story-card">
        <a className="tf-story-link" href={`#/portfolio/${collection.id}`}>
          <div className={`tf-story-cover${tall ? " tall" : ""}`}>
            {cover ? (
              <img
                src={cover.url}
                alt={cover.caption || collection.title}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                }}
              />
            ) : (
              <PhotoSlot
                label={loading ? "[Loading photographs…]" : "[Cover photograph]"}
                tone={tall ? 2 : 1}
              />
            )}
          </div>
          <h3>{collection.title}</h3>
          <span>{collection.style || "ThenFrame stories"}</span>
        </a>
        <Notice error>{error}</Notice>
      </article>
    );
  return (
    <article className={`portfolio-card ${detail ? "collection-detail" : ""}`}>
      {!detail && (
        <a className="cover-link" href={`#/portfolio/${collection.id}`}>
          {cover ? (
            <img
              src={cover.url}
              alt={cover.caption || collection.title}
              loading="lazy"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          ) : (
            <Placeholder
              label={
                loading
                  ? "[Loading photographs…]"
                  : "[A story waiting to be shared]"
              }
            />
          )}
        </a>
      )}
      <div className="collection-heading">
        <div>
          <span className="eyebrow">
            {collection.style || "THENFRAME STORIES"}
          </span>
          <h3>
            {detail ? (
              collection.title
            ) : (
              <a href={`#/portfolio/${collection.id}`}>{collection.title}</a>
            )}
          </h3>
          <p>{collection.description}</p>
        </div>
        {detail && (
          <button
            className="button-outline small"
            onClick={() => {
              setLoading(true);
              setError("");
              setVersion((n) => n + 1);
            }}
          >
            Refresh photo links
          </button>
        )}
      </div>
      <Notice error>{error}</Notice>
      {detail ? (
        loading ? (
          <p role="status">Loading photographs…</p>
        ) : (
          <>
            {!photos.length && (
              <Notice>This collection has no published photographs yet.</Notice>
            )}
            <div className="photo-grid">
              {photos.map((photo) => (
                <figure key={photo.id}>
                  {photo.url ? (
                    <button
                      className="photo-open"
                      onClick={() => setLightbox(photo)}
                      aria-label={`View ${photo.caption || "photograph"}`}
                    >
                      <img
                        src={photo.url}
                        alt={photo.caption || collection.title}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.alt =
                            "Photo link expired. Refresh photo links.";
                        }}
                      />
                    </button>
                  ) : (
                    <div className="photo-unavailable">
                      Photo unavailable. Refresh photo links.
                    </div>
                  )}
                  <figcaption>{photo.caption}</figcaption>
                </figure>
              ))}
            </div>
          </>
        )
      ) : (
        <a className="text-link" href={`#/portfolio/${collection.id}`}>
          View collection <Icon name="arrow" size={16} />
        </a>
      )}
      {lightbox && (
        <Modal
          title={lightbox.caption || collection.title}
          className="photo-dialog"
          onClose={() => setLightbox(null)}
        >
          <img
            className="photo-viewer-image"
            src={lightbox.url}
            alt={lightbox.caption || collection.title}
          />
        </Modal>
      )}
    </article>
  );
}
// Client photographs are still pending for the portfolio and packages pages.
const PORTFOLIO_HERO_IMAGE = null;
const PACKAGES_PORTRAIT_IMAGE = null;
const PACKAGES_BANNER_IMAGE = null;

export function PortfolioPage({ client, auth, selectedId }) {
  return (
    <>
      <Header auth={auth} overlay={!selectedId} />
      <main id="main-content">
        {!selectedId && (
          <>
            <section className="tf-hero tf-page-hero">
              <div className="tf-hero-slide active">
                <PhotoSlot
                  image={PORTFOLIO_HERO_IMAGE}
                  label="[Portfolio cover photograph]"
                  tone={2}
                />
              </div>
              <div className="tf-hero-copy">
                <h1>Portfolio</h1>
                <p className="tf-hero-line">Every photo tells a story</p>
              </div>
            </section>
            <section className="tf-portfolio-intro page-width">
              <p>
                This is our portfolio of weddings and celebrations. Take a
                peek at some of the stories we have been trusted to keep.
              </p>
              <p className="tf-note">
                P/S: Open a collection to see every photograph from the day.
              </p>
            </section>
          </>
        )}
        <PortfolioSection client={client} selectedId={selectedId} />
      </main>
      <Footer />
    </>
  );
}

export function PackagesPage({ auth }) {
  return (
    <>
      <Header auth={auth} />
      <main id="main-content" className="tf-packages-page">
        <section className="page-width tf-pk-top">
          <h1 className="tf-pk-label">Packages</h1>
          <div className="tf-pk-intro">
            <h2>Your day, your way</h2>
            <PhotoSlot
              className="tf-pk-portrait"
              image={PACKAGES_PORTRAIT_IMAGE}
              label="[Portrait]"
              tone={3}
            />
            <div className="tf-pk-text">
              <p>
                ThenFrame is a wedding photography studio in Malaysia, capturing
                akad, reception and every celebration in between.
              </p>
              <p>
                Every package is shaped around your day: the traditions you
                hold close, the people who matter and the moments you will
                want to return to for years to come.
              </p>
            </div>
          </div>
        </section>
        <section className="page-width tf-pk-banner">
          <PhotoSlot
            image={PACKAGES_BANNER_IMAGE}
            label="[Wide wedding photograph]"
            tone={1}
          />
        </section>
        <section className="page-width tf-pk-list">
          {PACKAGES.map((pkg, i) => (
            <article key={pkg.title}>
              <span>{pad(i + 1)}</span>
              <h3>{pkg.title}</h3>
              <p>{pkg.text}</p>
            </article>
          ))}
        </section>
        <section className="page-width tf-pk-closing">
          <p>
            Guided by an honest and thoughtful approach, ThenFrame focuses on
            photographs that feel personal and enduring. Tell us about your
            date and the studio will share the package that suits you best.
          </p>
        </section>
        <section className="page-width tf-pk-info" aria-label="Contact the studio">
          <ul>
            <li>Akad / Nikah</li>
            <li>Reception</li>
            <li>Engagement</li>
          </ul>
          <ul>
            <li>
              <a href="#/contact">{WHATSAPP_DISPLAY} (WhatsApp)</a>
            </li>
          </ul>
          <ul>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer">
                {INSTAGRAM_HANDLE}
              </a>
            </li>
          </ul>
          <ul className="tf-pk-actions">
            <li>
              <a href="#/contact">Contact us</a>
            </li>
            <li>
              <a href="#/contact">Book your date</a>
            </li>
            <li>
              <a href="#/portfolio">Portfolio</a>
            </li>
          </ul>
        </section>
      </main>
      <Footer />
    </>
  );
}
