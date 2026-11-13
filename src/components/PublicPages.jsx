import { useEffect, useState } from "react";
import { listCollections, listPhotos } from "../lib/gallery";
import { Footer, Icon, Notice, Placeholder } from "./UI";
import { Header } from "./Layout";

export function Home({ client, auth }) {
  return (
    <>
      <Header auth={auth} />
      <main id="main-content">
        <section className="hero page-width">
          <div className="hero-copy">
            <span className="eyebrow">WEDDING PHOTOGRAPHY / THENFRAME</span>
            <h1>
              Your Love Story,
              <br />
              Beautifully
              <br />
              <em>Captured</em>
            </h1>
            <p>
              Wedding photographs that feel like you — thoughtful,
              <br className="desktop" /> heartfelt, and full of the moments that
              matter.
            </p>
            <div className="button-row">
              <a className="outline" href="#/portfolio">
                Portfolio
              </a>
              <a className="primary" href="#/register">
                Begin your story
              </a>
            </div>
            <div className="hero-footnote">
              <span className="tiny-line" />
              YOUR STORY, BEAUTIFULLY KEPT
            </div>
          </div>
          <div className="hero-images">
            <Placeholder arch label="[Romantic wedding portrait]" />
            <Placeholder
              className="hero-inset"
              label="[A small, beautiful detail]"
            />
            <p className="image-caption">
              A day full of little moments. A story that lasts.
            </p>
          </div>
        </section>
        <section className="intro-note page-width">
          <span className="eyebrow">
            HONEST MOMENTS.
            <br />
            BEAUTIFUL MEMORIES.
          </span>
          <p>
            Not just how your day looked. But how it felt — the tenderness, the
            <br className="desktop" /> traditions, and everything in between.
          </p>
        </section>
        <PortfolioSection client={client} preview />
        <section className="packages-section" id="packages">
          <div className="page-width two-column">
            <div>
              <span className="eyebrow">THOUGHTFULLY / YOUR WAY</span>
              <h2>Your day. Your way.</h2>
              <p>
                From the first conversation to the final frame, we’re here to
                help you find a photography style that feels right.
              </p>
              <a className="outline" href="#/portfolio#packages">
                Explore our approach
              </a>
            </div>
            <div className="numbered-list">
              {[
                [
                  "01",
                  "The wedding day",
                  "For the meaningful moments, the celebrations and everything in between.",
                ],
                [
                  "02",
                  "An intimate celebration",
                  "A thoughtful approach to the smaller stories that deserve to be remembered.",
                ],
                [
                  "03",
                  "A moment for two",
                  "Natural portraits, honest connections, and the beginning of your story.",
                ],
              ].map(([n, t, d]) => (
                <article key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{t}</h3>
                    <p>{d}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>
        <section className="page-width planning">
          <span className="eyebrow">A LITTLE GUIDANCE</span>
          <h2>A little planning. A lot of heart.</h2>
          <div className="three-column">
            {[
              [
                "01",
                "Find your story",
                "Explore the portfolio and discover the moments and styles that speak to you.",
              ],
              [
                "02",
                "Make it personal",
                "Create your customer account to begin your journey with the studio.",
              ],
              [
                "03",
                "Make lovely memories",
                "Celebrate your day, your traditions, and the people who make it yours.",
              ],
            ].map(([n, t, d]) => (
              <article key={n}>
                <span className="eyebrow">{n}</span>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </section>
        <section className="heritage-section" id="heritage">
          <div className="page-width two-column">
            <Placeholder arch label="[Traditional Malay wedding]" />
            <div>
              <span className="eyebrow">ROOTED IN TRADITION</span>
              <h2>
                Traditions held close.
                <br />
                Stories carried forward.
              </h2>
              <p>
                We value the traditions that make each wedding meaningful. A
                dedicated space for traditional Malay wedding knowledge is
                planned for a later sprint.
              </p>
              <span className="pill light-pill">
                Heritage content · Coming later
              </span>
            </div>
          </div>
        </section>
        <section className="page-width two-column story-section" id="our-story">
          <div>
            <span className="eyebrow">THE STUDIO / OUR STORY</span>
            <h2>For the beautifully real.</h2>
            <p>
              ThenFrame is a wedding photography portfolio and gallery
              management project developed with our photography studio partner.
            </p>
            <p>
              A simpler way to discover the studio’s work and keep every public
              collection in one considered place.
            </p>
            <a className="text-link" href="#/portfolio">
              Discover the portfolio <Icon name="arrow" size={16} />
            </a>
          </div>
          <Placeholder label="[Behind the lens, on a wedding day]" />
        </section>
        <section className="closing-cta">
          <span className="eyebrow">A NEW CHAPTER STARTS HERE</span>
          <h2>
            Let’s make something
            <br />
            you’ll hold onto forever.
          </h2>
          <p>Every story begins somewhere. We’d love to be part of yours.</p>
          <a className="primary" href="#/register">
            Create your customer account
          </a>
        </section>
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
    [style, setStyle] = useState(""),
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
      (!style || c.style === style) &&
      `${c.title} ${c.description || ""}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  return (
    <section className="portfolio-section page-width" id="portfolio">
      <div className="section-heading">
        <div>
          <span className="eyebrow">A FEW FRAMES / OUR PORTFOLIO</span>
          <h2>
            {selectedId ? "A story, in frames." : "Stories worth holding onto."}
          </h2>
        </div>
        {preview ? (
          <a className="text-link" href="#/portfolio">
            Explore the portfolio <Icon name="arrow" size={16} />
          </a>
        ) : (
          <button
            className="text-button"
            onClick={() => {
              setLoading(true);
              setError("");
              setRefresh((n) => n + 1);
            }}
          >
            Refresh portfolio ↻
          </button>
        )}
      </div>
      {!preview && !selectedId && (
        <div className="filters">
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
            Photography style
            <select value={style} onChange={(e) => setStyle(e.target.value)}>
              <option value="">All styles</option>
              {[
                ...new Set(collections.map((c) => c.style).filter(Boolean)),
              ].map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </label>
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
          <button
            className="text-button"
            onClick={() => {
              setLoading(true);
              setError("");
              setRefresh((n) => n + 1);
            }}
          >
            Try again
          </button>
        </Notice>
      ) : !shown.length ? (
        <div className="empty-state">
          <Icon name="photo" size={30} />
          <h3>
            {query || style
              ? "No stories match your search."
              : "Every story begins with a frame."}
          </h3>
          <p>
            {query || style
              ? "Try another title or photography style."
              : "The studio has not published any collections yet. Come back soon."}
          </p>
        </div>
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
function PublicCollection({ collection, client, detail }) {
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
            className="outline small"
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
            <p className="muted small-text">
              Photo links expire after one minute. Refresh them if a photograph
              stops loading.
            </p>
          </>
        )
      ) : (
        <a className="text-link" href={`#/portfolio/${collection.id}`}>
          View collection <Icon name="arrow" size={16} />
        </a>
      )}
      {lightbox && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={lightbox.caption || "Photograph"}
          onClick={() => setLightbox(null)}
        >
          <button
            className="lightbox-close"
            onClick={() => setLightbox(null)}
            autoFocus
            aria-label="Close photograph"
          >
            ×
          </button>
          <img src={lightbox.url} alt={lightbox.caption || collection.title} />
          <p>{lightbox.caption}</p>
        </div>
      )}
    </article>
  );
}
export function PortfolioPage({ client, auth, selectedId }) {
  return (
    <>
      <Header auth={auth} />
      <main id="main-content">
        {!selectedId && (
          <section className="portfolio-hero page-width two-column">
            <div>
              <span className="eyebrow">WEDDING PHOTOGRAPHY / THENFRAME</span>
              <h1>
                Your love story,
                <br />
                beautifully
                <br />
                <em>captured</em>
              </h1>
              <p>
                Wedding photographs that feel like you — thoughtful,
                <br className="desktop" /> heartfelt, and full of the moments
                that matter.
              </p>
              <a className="primary" href="#/register">
                Begin your story
              </a>
            </div>
            <Placeholder arch label="[Romantic wedding portrait]" />
          </section>
        )}
        <PortfolioSection client={client} selectedId={selectedId} />
        {!selectedId && (
          <section id="packages" className="packages-section">
            <div className="page-width two-column">
              <div>
                <span className="eyebrow">THOUGHTFULLY / YOUR WAY</span>
                <h2>Your day. Your way.</h2>
                <p>
                  We’re building a thoughtful way to explore the studio’s
                  photography services.
                </p>
              </div>
              <div>
                <h3>Tell us about your celebration.</h3>
                <p>
                  Booking enquiries and package customization are planned for a
                  later sprint. For now, explore the portfolio and create your
                  customer account.
                </p>
                <a className="outline" href="#/register">
                  Create an account
                </a>
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </>
  );
}
