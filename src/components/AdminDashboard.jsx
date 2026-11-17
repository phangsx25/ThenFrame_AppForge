import { useCallback, useEffect, useRef, useState } from "react";
import {
  EVENT_TYPES,
  deleteCollection,
  deletePhoto,
  listCollections,
  listPhotos,
  saveCollection,
  updatePhoto,
  uploadPhoto,
  validateImage,
} from "../lib/gallery";
import { Workspace } from "./Layout";
import { Icon, LaterCard, Modal, Notice } from "./UI";

function formatSize(bytes) {
  return bytes < 1024 * 1024
    ? `${Math.max(1, Math.round(bytes / 1024))} KB`
    : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function VisibilityPill({ visibility }) {
  const isPrivate = visibility === "hidden";
  return (
    <span className={`pill visibility-pill ${isPrivate ? "is-private" : "is-public"}`}>
      <Icon name={isPrivate ? "lock" : "eye"} size={12} />
      {isPrivate ? "Private" : "Public"}
    </span>
  );
}

export default function AdminDashboard({ auth, client }) {
  const [section, setSection] = useState("Overview"),
    [collections, setCollections] = useState([]),
    [selected, setSelected] = useState(null);
  const [photos, setPhotos] = useState([]),
    [loading, setLoading] = useState(true),
    [photoLoading, setPhotoLoading] = useState(false);
  const [error, setError] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  const [editor, setEditor] = useState(null),
    [photoEditor, setPhotoEditor] = useState(null),
    [confirmation, setConfirmation] = useState(null);
  // Chosen file before upload: { url, name, size, problem } — url is a local
  // object URL for the thumbnail and is revoked whenever it is replaced.
  const [preview, setPreview] = useState(null),
    [uploadNotice, setUploadNotice] = useState(null);
  useEffect(
    () => () => {
      if (preview?.url) URL.revokeObjectURL(preview.url);
    },
    [preview],
  );
  const photoGeneration = useRef(0);
  const refreshCollections = useCallback(async () => {
    const data = await listCollections(client, true);
    setCollections(data);
    return data;
  }, [client]);
  useEffect(() => {
    let active = true;
    listCollections(client, true)
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
  }, [client]);
  async function loadPhotos(id) {
    const version = ++photoGeneration.current;
    setPhotoLoading(true);
    setPhotos([]);
    try {
      const data = await listPhotos(client, id, true);
      if (version === photoGeneration.current) setPhotos(data);
    } finally {
      if (version === photoGeneration.current) setPhotoLoading(false);
    }
  }
  // target "upload" shows the result next to the upload form instead of at
  // the top of the page.
  async function run(action, success, target = "page") {
    setBusy(true);
    setError("");
    setMessage("");
    setUploadNotice(null);
    try {
      await action();
      if (success) {
        if (target === "upload") setUploadNotice({ text: success });
        else setMessage(success);
      }
      return true;
    } catch (e) {
      if (target === "upload") setUploadNotice({ error: true, text: e.message });
      else setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function pickPhoto(event) {
    const file = event.currentTarget.files?.[0];
    setUploadNotice(null);
    if (!file) {
      setPreview(null);
      return;
    }
    let problem = "";
    try {
      validateImage(file);
    } catch (e) {
      problem = e.message;
    }
    setPreview({
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
      name: file.name,
      size: file.size,
      problem,
    });
  }
  async function choose(collection) {
    setPreview(null);
    setUploadNotice(null);
    setSelected(collection);
    setSection("Gallery management");
    await run(() => loadPhotos(collection.id));
  }
  async function save(event) {
    event.preventDefault();
    const input = Object.fromEntries(new FormData(event.currentTarget));
    await run(async () => {
      const saved = await saveCollection(client, input, editor.id);
      setEditor(null);
      await refreshCollections();
      setSelected(saved);
      setSection("Gallery management");
      await loadPhotos(saved.id);
    }, "Collection saved.");
  }
  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    await run(async () => {
      await uploadPhoto(
        client,
        selected.id,
        data.get("photo"),
        data.get("caption"),
        data.get("visibility"),
      );
      form.reset();
      setPreview(null);
      await loadPhotos(selected.id);
    }, "Photo uploaded.", "upload");
  }
  const published = collections.filter((c) => c.visibility === "public").length;
  const overview = section === "Overview";
  const shownCollections = overview ? collections.slice(0, 3) : collections;
  const latest = collections[0];
  return (
    <Workspace auth={auth} admin active={section} onSection={setSection}>
      <div className="dashboard-heading">
        <div>
          <h1>{overview ? "Welcome to ThenFrame Studio" : "Gallery management"}</h1>
          <p>
            {overview
              ? "A quick look at your studio and its newest collections."
              : "Create collections, upload photographs and choose what is shared."}
          </p>
        </div>
        <button className="primary" onClick={() => setEditor({})}>
          <Icon name="plus" size={16} />
          New collection
        </button>
      </div>
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
      {overview && (
      <div className="stat-grid">
        <article>
          <span>Gallery collections</span>
          <strong>
            {loading ? "—" : collections.length.toString().padStart(2, "0")}
          </strong>
          <small>In your studio</small>
        </article>
        <article>
          <span>Public collections</span>
          <strong>
            {loading ? "—" : published.toString().padStart(2, "0")}
          </strong>
          <small>Portfolio visibility</small>
        </article>
        <article>
          <span>Private collections</span>
          <strong>
            {loading
              ? "—"
              : (collections.length - published).toString().padStart(2, "0")}
          </strong>
          <small>Not shared publicly</small>
        </article>
        <article>
          <span>Latest collection</span>
          <strong className="stat-text" title={latest?.title}>
            {loading || !latest ? "—" : latest.title}
          </strong>
          <small>
            {loading
              ? "Loading…"
              : latest
                ? latest.style || "No event type"
                : "No collections yet"}
          </small>
        </article>
      </div>
      )}
      <div className={overview ? "admin-columns" : undefined}>
        <div>
          <section className="dashboard-card">
            <div className="section-heading">
              <div>
                <h2>{overview ? "Recent collections" : "Portfolio collections"}</h2>
                <p>
                  {overview
                    ? "Your newest collections. Open one to manage its photographs."
                    : "Review your collections and manage their visibility."}
                </p>
              </div>
              <button
                className="button-outline small"
                disabled={busy}
                onClick={() => run(refreshCollections)}
              >
                <Icon name="refresh" size={14} />
                Refresh
              </button>
            </div>
            {loading ? (
              <p role="status">Loading collections…</p>
            ) : !collections.length ? (
              <div className="empty-state">
                <Icon aria-label="Photograph" name="photo" size={28} />
                <h3>A new story starts here.</h3>
                <p>
                  Create your first collection, then upload your photographs.
                </p>
              </div>
            ) : (
              <div className="table-scroll">
                <table>
                  <thead>
                    <tr>
                      <th>Collection</th>
                      <th>Event type</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownCollections.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.title}</strong>
                          <small>{c.description || "No description yet"}</small>
                        </td>
                        <td>{c.style || "—"}</td>
                        <td>
                          <VisibilityPill visibility={c.visibility} />
                        </td>
                        <td>
                          <button
                            className="button-outline small"
                            disabled={busy}
                            onClick={() => choose(c)}
                          >
                            Manage
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {overview && !loading && collections.length > 0 && (
              <button
                className="text-button"
                onClick={() => setSection("Gallery management")}
              >
                View all {collections.length} collections
                <Icon name="arrow" size={14} />
              </button>
            )}
          </section>
          {!overview && selected && (
            <section className="dashboard-card selected-gallery">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    CURRENT COLLECTION{" "}
                    <span className="count-box">
                      {photoLoading
                        ? "LOADING…"
                        : `${photos.length} ${photos.length === 1 ? "PHOTOGRAPH" : "PHOTOGRAPHS"}`}
                    </span>
                  </span>
                  <h2>{selected.title}</h2>
                  <p>{selected.description}</p>
                </div>
                <div className="button-row">
                  <button
                    className="button-outline small"
                    disabled={busy}
                    onClick={() => setEditor(selected)}
                  >
                    Edit collection
                  </button>
                  <button
                    className="button-outline small danger"
                    disabled={busy}
                    onClick={() =>
                      setConfirmation({
                        title: "Delete collection?",
                        text: `Delete “${selected.title}” and all photos inside it? This permanently deletes the collection and its photos. This cannot be undone.`,
                        action: async () => {
                          try {
                            await deleteCollection(client, selected.id);
                          } catch (error) {
                            // A failed operation may already have removed some photos.
                            // Refresh the view while preserving the original cleanup error.
                            await loadPhotos(selected.id).catch(() => {});
                            throw error;
                          }
                          photoGeneration.current++;
                          setSelected(null);
                          setPhotos([]);
                          await refreshCollections();
                        },
                      })
                    }
                  >
                    <Icon name="trash" size={14} />
                    Delete collection
                  </button>
                </div>
              </div>
              <form key={selected.id} onSubmit={upload} className="upload-form">
                <h3>Add a photograph</h3>
                <div className="form-grid">
                  <label>
                    Photograph
                    <input
                      aria-label="Photograph"
                      name="photo"
                      type="file"
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      required
                      onChange={pickPhoto}
                    />
                    <small>JPG / JPEG, PNG or WebP · up to 8 MB</small>
                  </label>
                  {preview && (
                    <div className="upload-preview">
                      {preview.url ? (
                        <img src={preview.url} alt="Preview of the chosen photograph" />
                      ) : (
                        <div className="upload-preview-empty">
                          <Icon name="photo" size={22} />
                        </div>
                      )}
                      <div>
                        <strong>{preview.name}</strong>
                        <small>{formatSize(preview.size)}</small>
                        {preview.problem && (
                          <p className="upload-preview-problem" role="alert">
                            {preview.problem}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                  <label>
                    Caption
                    <input
                      name="caption"
                      maxLength={500}
                      placeholder="A few words about this moment"
                    />
                  </label>
                  <label>
                    Visibility
                    <select
                      aria-label="Visibility"
                      name="visibility"
                      defaultValue="hidden"
                    >
                      <option value="hidden">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                </div>
                <p className="small-text muted">
                  A photo is public only when both the photo and its collection
                  are public.
                </p>
                <button
                  className="primary"
                  disabled={busy || photoLoading || Boolean(preview?.problem)}
                >
                  {busy ? "Working…" : "Upload photo"}
                </button>
                <Notice error={uploadNotice?.error}>{uploadNotice?.text}</Notice>
              </form>
              <div className="section-heading">
                <h3>Photographs</h3>
                <button
                  className="text-button"
                  disabled={busy || photoLoading}
                  onClick={() => run(() => loadPhotos(selected.id))}
                >
                  <Icon name="refresh" size={14} />
                  Refresh photo links
                </button>
              </div>
              {photoLoading ? (
                <p role="status">Loading photographs…</p>
              ) : !photos.length ? (
                <p className="muted">No photographs in this collection yet.</p>
              ) : (
                <div className="admin-photo-grid">
                  {photos.map((photo) => (
                    <figure key={photo.id}>
                      {photo.url ? (
                        <img
                          src={photo.url}
                          alt={photo.caption || selected.title}
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.alt =
                              "Link expired. Refresh photo links.";
                          }}
                        />
                      ) : (
                        <div className="photo-unavailable">
                          Preview unavailable. Check Storage policies or
                          refresh.
                        </div>
                      )}
                      <figcaption>
                        <VisibilityPill visibility={photo.visibility} />
                        <p>{photo.caption || "No caption yet"}</p>
                        <div className="button-row">
                          <button
                            disabled={busy}
                            className="button-outline small"
                            onClick={() => setPhotoEditor(photo)}
                          >
                            Edit photo
                          </button>
                          <button
                            disabled={busy}
                            className="button-outline small danger"
                            onClick={() =>
                              setConfirmation({
                                title: "Delete photograph?",
                                text: "This removes the photo record and its stored file. This cannot be undone.",
                                action: async () => {
                                  try {
                                    await deletePhoto(client, photo);
                                  } finally {
                                    await loadPhotos(selected.id);
                                  }
                                },
                              })
                            }
                          >
                            <Icon name="trash" size={14} />
                            Delete
                          </button>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              )}
            </section>
          )}
        </div>
        {overview && (
        <aside>
          <section className="dashboard-card">
            <h2>Portfolio uploads</h2>
            <p>Add new story frames to the public portfolio.</p>
            <ol className="workflow-list">
              <li>
                <span>01</span>Create a collection
              </li>
              <li>
                <span>02</span>Upload & caption
              </li>
              <li>
                <span>03</span>Review & publish
              </li>
            </ol>
            <p className="small-text muted">
              New content starts private. Signed image links expire after one
              minute; refresh previews when needed.
            </p>
          </section>
          <LaterCard title="Bookings & consultations">
            Booking management is planned for a later sprint. This dashboard
            shows real gallery data only.
          </LaterCard>
          <LaterCard title="Private client albums">
            Client assignment, proof selection and final delivery are planned
            for a later sprint.
          </LaterCard>
          <LaterCard title="AI enquiry / booking summaries & FAQ chatbot">
            AI summaries of customer enquiries and booking requests, plus an FAQ
            chatbot for packages and studio information, are planned for later
            sprints. These features are not available yet.
          </LaterCard>
        </aside>
        )}
      </div>
      {editor && (
        <Modal
          title={editor.id ? "Edit collection" : "A new collection"}
          onClose={() => {
            if (!busy) setEditor(null);
          }}
        >
          <form onSubmit={save}>
            <label>
              Title
              <input
                name="title"
                required
                maxLength={150}
                defaultValue={editor.title || ""}
              />
            </label>
            <label>
              Description
              <textarea
                name="description"
                required
                maxLength={3000}
                defaultValue={editor.description || ""}
              />
            </label>
            <label>
              Event type
              <select
                name="style"
                required
                defaultValue={editor.style || ""}
              >
                <option value="" disabled>Choose an event type</option>
                {[...new Set([
                  ...EVENT_TYPES,
                  ...(editor.style ? [editor.style] : []),
                ])].map((style) => (
                  <option key={style} value={style}>{style}</option>
                ))}
              </select>
            </label>
            <label>
              Visibility
              <select
                aria-label="Visibility"
                name="visibility"
                defaultValue={editor.visibility || "hidden"}
              >
                <option value="hidden">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <Notice error>{error}</Notice>
            <button className="primary full" disabled={busy}>
              {busy ? "Saving…" : "Save collection"}
            </button>
          </form>
        </Modal>
      )}
      {photoEditor && (
        <Modal
          title="Edit photograph"
          onClose={() => {
            if (!busy) setPhotoEditor(null);
          }}
        >
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const input = Object.fromEntries(
                new FormData(event.currentTarget),
              );
              void run(async () => {
                await updatePhoto(client, photoEditor, input);
                setPhotoEditor(null);
                await loadPhotos(selected.id);
              }, "Photograph updated.");
            }}
          >
            <label>
              Caption
              <input
                name="caption"
                maxLength={500}
                defaultValue={photoEditor.caption || ""}
              />
            </label>
            <label>
              Visibility
              <select
                aria-label="Visibility"
                name="visibility"
                defaultValue={photoEditor.visibility}
              >
                <option value="hidden">Private</option>
                <option value="public">Public</option>
              </select>
            </label>
            <Notice error>{error}</Notice>
            <button disabled={busy} className="primary full">
              {busy ? "Saving…" : "Save photo"}
            </button>
          </form>
        </Modal>
      )}
      {confirmation && (
        <Modal
          title={confirmation.title}
          onClose={() => {
            if (!busy) setConfirmation(null);
          }}
        >
          <p>{confirmation.text}</p>
          <Notice error>{error}</Notice>
          <div className="button-row">
            <button
              disabled={busy}
              className="button-outline"
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </button>
            <button
              disabled={busy}
              className="primary danger-fill"
              onClick={async () => {
                if (await run(confirmation.action, "Deleted."))
                  setConfirmation(null);
              }}
            >
              {busy ? "Deleting…" : "Confirm delete"}
            </button>
          </div>
        </Modal>
      )}
    </Workspace>
  );
}
