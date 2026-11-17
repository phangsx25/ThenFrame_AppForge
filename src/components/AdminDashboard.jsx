import { useCallback, useEffect, useRef, useState } from "react";
import {
  EVENT_TYPES,
  deleteCollection,
  deletePhoto,
  listCollections,
  listPhotos,
  saveCollection,
  updatePhoto,
  refreshPhotoLink,
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

// Full-screen photo viewer (like Google Photos / Drive): dark background,
// the photo centred and scaled to fit the same space whatever its shape,
// with previous/next arrows and keyboard support (← → Esc).
function PhotoViewer({ photos, index, fallbackTitle, onIndex, onClose, onExpired }) {
  const ref = useRef(null);
  const photo = photos[index];
  const count = photos.length;
  useEffect(() => {
    const dialog = ref.current;
    const trigger = document.activeElement;
    dialog.showModal();
    return () => {
      dialog.close();
      if (trigger instanceof HTMLElement && trigger.isConnected)
        trigger.focus({ preventScroll: true });
    };
  }, []);
  if (!photo) return null;
  const title = photo.caption || fallbackTitle;
  const go = (step) => onIndex((index + step + count) % count);
  return (
    <dialog
      ref={ref}
      className="photo-viewer"
      aria-label={`Photo ${index + 1} of ${count}: ${title}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onKeyDown={(event) => {
        if (count < 2) return;
        if (event.key === "ArrowLeft") go(-1);
        if (event.key === "ArrowRight") go(1);
      }}
    >
      <div className="photo-viewer-bar">
        <span className="photo-viewer-title">{title}</span>
        <span className="photo-viewer-count">
          {index + 1} / {count}
        </span>
        <VisibilityPill visibility={photo.visibility} />
        <button
          type="button"
          className="photo-viewer-button"
          onClick={onClose}
          aria-label="Close viewer"
        >
          <Icon name="close" size={22} />
        </button>
      </div>
      <div
        className="photo-viewer-stage"
        onClick={(event) => {
          if (event.target === event.currentTarget) onClose();
        }}
      >
        {count > 1 && (
          <button
            type="button"
            className="photo-viewer-button photo-viewer-prev"
            onClick={() => go(-1)}
            aria-label="Previous photo"
          >
            <Icon name="chevron-left" size={28} />
          </button>
        )}
        <img
          key={photo.id}
          src={photo.url}
          alt={title}
          onError={(e) => {
            if (!onExpired(photo, e.timeStamp))
              e.currentTarget.alt = "This photo could not be loaded. Close and refresh photo links.";
          }}
        />
        {count > 1 && (
          <button
            type="button"
            className="photo-viewer-button photo-viewer-next"
            onClick={() => go(1)}
            aria-label="Next photo"
          >
            <Icon name="chevron-right" size={28} />
          </button>
        )}
      </div>
    </dialog>
  );
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
  // Files chosen for upload: [{ id, file, url, problem, failed }].
  // url is a local object URL for the thumbnail; problem means the file
  // fails validation and will be skipped; failed holds the error from a
  // previous attempt so the file can be retried.
  const [chosen, setChosen] = useState([]),
    [uploadNotice, setUploadNotice] = useState(null),
    [progress, setProgress] = useState(null);
  const chosenRef = useRef([]);
  // Index (within photos that have a link) of the photo open in the
  // full-screen viewer, or null.
  const [viewing, setViewing] = useState(null);
  function replaceChosen(next) {
    const keep = new Set(next.map((item) => item.url));
    for (const item of chosenRef.current)
      if (item.url && !keep.has(item.url)) URL.revokeObjectURL(item.url);
    chosenRef.current = next;
    setChosen(next);
  }
  useEffect(
    () => () => {
      for (const item of chosenRef.current)
        if (item.url) URL.revokeObjectURL(item.url);
    },
    [],
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
  // Photo links last 60 seconds. When a photo on screen fails to load,
  // fetch a fresh link for that photo only and swap it in, so the grid
  // and viewer keep working without a manual refresh. Each photo is
  // retried at most once every 15 seconds (measured with the error
  // event's timestamp); returns false when no retry was started so the
  // caller can show a fallback message.
  const relinkAttempts = useRef(new Map());
  function relink(photo, at) {
    const last = relinkAttempts.current.get(photo.id);
    if (!photo.storage_path || (last !== undefined && at - last < 15000))
      return false;
    relinkAttempts.current.set(photo.id, at);
    const version = photoGeneration.current;
    refreshPhotoLink(client, photo)
      .then((url) => {
        if (!url || version !== photoGeneration.current) return;
        setPhotos((list) =>
          list.map((item) => (item.id === photo.id ? { ...item, url } : item)),
        );
      })
      .catch(() => {});
    return true;
  }
  async function run(action, success) {
    setBusy(true);
    setError("");
    setMessage("");
    setUploadNotice(null);
    try {
      await action();
      if (success) setMessage(success);
      return true;
    } catch (e) {
      setError(e.message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  function pickPhotos(event) {
    setFiles(Array.from(event.currentTarget.files || []));
  }
  // Drag and drop onto the upload box. dragDepth counts enter/leave pairs
  // so moving over child elements does not flicker the highlight.
  const dragDepth = useRef(0),
    [dragging, setDragging] = useState(false);
  const hasFiles = (event) =>
    Array.from(event.dataTransfer?.types || []).includes("Files");
  const dropHandlers = {
    onDragEnter(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current += 1;
      if (!busy) setDragging(true);
    },
    onDragOver(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      event.dataTransfer.dropEffect = busy ? "none" : "copy";
    },
    onDragLeave(event) {
      if (!hasFiles(event)) return;
      dragDepth.current = Math.max(0, dragDepth.current - 1);
      if (!dragDepth.current) setDragging(false);
    },
    onDrop(event) {
      if (!hasFiles(event)) return;
      event.preventDefault();
      dragDepth.current = 0;
      setDragging(false);
      if (busy) return;
      const input = event.currentTarget.elements.namedItem("photos");
      if (input) input.value = "";
      setFiles(Array.from(event.dataTransfer.files || []));
    },
  };
  // While a collection is open, a file dropped just outside the box would
  // make the browser open the image and leave the dashboard. Ignore those.
  const uploadOpen = section === "Gallery management" && Boolean(selected);
  useEffect(() => {
    if (!uploadOpen) return;
    const ignore = (event) => {
      if (Array.from(event.dataTransfer?.types || []).includes("Files"))
        event.preventDefault();
    };
    window.addEventListener("dragover", ignore);
    window.addEventListener("drop", ignore);
    return () => {
      window.removeEventListener("dragover", ignore);
      window.removeEventListener("drop", ignore);
    };
  }, [uploadOpen]);
  function setFiles(files) {
    setUploadNotice(null);
    replaceChosen(
      files.map((file, index) => {
        let problem = "";
        try {
          validateImage(file);
        } catch (e) {
          problem = e.message;
        }
        return {
          id: `${Date.now()}-${index}`,
          file,
          url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
          problem,
          failed: "",
        };
      }),
    );
  }
  async function choose(collection) {
    replaceChosen([]);
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
  // Uploads valid files one after another so progress can be shown and one
  // failure does not stop the rest. Results are reported beside the form.
  async function upload(event) {
    event.preventDefault();
    const form = event.currentTarget,
      data = new FormData(form);
    const valid = chosen.filter((item) => !item.problem),
      skipped = chosen.length - valid.length;
    if (!valid.length) return;
    const caption = data.get("caption"),
      visibility = data.get("visibility");
    setBusy(true);
    setError("");
    setMessage("");
    setUploadNotice(null);
    setProgress({ done: 0, total: valid.length });
    try {
      const failed = [];
      for (const [index, item] of valid.entries()) {
        try {
          await uploadPhoto(client, selected.id, item.file, caption, visibility);
        } catch (e) {
          failed.push({ ...item, failed: e.message });
        }
        setProgress({ done: index + 1, total: valid.length });
      }
      const uploaded = valid.length - failed.length;
      const parts = [];
      if (uploaded)
        parts.push(`${uploaded} ${uploaded === 1 ? "photo" : "photos"} uploaded.`);
      if (failed.length)
        parts.push(
          `${failed.length} could not be uploaded and ${failed.length === 1 ? "is" : "are"} still selected so you can try again.`,
        );
      if (skipped)
        parts.push(
          `${skipped} skipped: too large or not a JPG, PNG or WebP.`,
        );
      try {
        await loadPhotos(selected.id);
      } catch (e) {
        parts.push(`The photo list could not be refreshed: ${e.message}`);
      }
      if (!failed.length) form.reset();
      const fileInput = form.elements.namedItem("photos");
      if (fileInput) fileInput.value = "";
      replaceChosen(failed);
      setUploadNotice({ error: failed.length > 0, text: parts.join(" ") });
    } finally {
      setProgress(null);
      setBusy(false);
    }
  }
  const published = collections.filter((c) => c.visibility === "public").length;
  const overview = section === "Overview";
  const shownCollections = overview ? collections.slice(0, 3) : collections;
  const latest = collections[0];
  const viewable = photos.filter((photo) => photo.url);
  const invalidCount = chosen.filter((item) => item.problem).length,
    validCount = chosen.length - invalidCount;
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
              <form
                key={selected.id}
                onSubmit={upload}
                className={`upload-form${dragging ? " is-dragging" : ""}`}
                {...dropHandlers}
              >
                <h3>Add photographs</h3>
                <div className="form-grid">
                  <label>
                    Photographs
                    <input
                      aria-label="Photographs"
                      name="photos"
                      type="file"
                      multiple
                      accept=".jpg,.jpeg,.png,.webp,image/jpeg,image/png,image/webp"
                      onChange={pickPhotos}
                    />
                    <small>
                      Choose one or several, or drag photos onto this box · JPG / JPEG, PNG or WebP · up to 8 MB each
                    </small>
                  </label>
                  {chosen.length > 0 && (
                    <div className="upload-chosen">
                      {chosen.length > 1 && (
                        <p className="upload-summary">
                          {chosen.length} photos chosen ·{" "}
                          {formatSize(chosen.reduce((sum, item) => sum + item.file.size, 0))}
                          {invalidCount > 0 &&
                            ` · ${invalidCount} will be skipped`}
                        </p>
                      )}
                      <ul className="upload-preview-list">
                        {chosen.map((item) => (
                          <li key={item.id} className="upload-preview">
                            {item.url ? (
                              <img src={item.url} alt={`Preview of ${item.file.name}`} />
                            ) : (
                              <div className="upload-preview-empty">
                                <Icon name="photo" size={22} />
                              </div>
                            )}
                            <div>
                              <strong title={item.file.name}>{item.file.name}</strong>
                              <small>{formatSize(item.file.size)}</small>
                              {(item.problem || item.failed) && (
                                <p className="upload-preview-problem">
                                  {item.problem || `Upload failed: ${item.failed}`}
                                </p>
                              )}
                            </div>
                          </li>
                        ))}
                      </ul>
                      {invalidCount > 0 && (
                        <p className="visually-hidden" role="alert">
                          {invalidCount === 1
                            ? `${chosen.find((item) => item.problem).problem}`
                            : `${invalidCount} files will be skipped because they are too large or not a JPG, PNG or WebP.`}
                        </p>
                      )}
                    </div>
                  )}
                  <label>
                    Caption
                    <input
                      name="caption"
                      maxLength={500}
                      placeholder="A few words about this moment"
                    />
                    {validCount > 1 && (
                      <small>Used for every photo in this upload. You can edit each one afterwards.</small>
                    )}
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
                  disabled={busy || photoLoading || validCount === 0}
                >
                  {progress
                    ? `Uploading ${Math.min(progress.done + 1, progress.total)} of ${progress.total}…`
                    : busy
                      ? "Working…"
                      : validCount > 1
                        ? `Upload ${validCount} photos`
                        : "Upload photo"}
                </button>
                {progress && (
                  <progress
                    className="upload-progress"
                    value={progress.done}
                    max={progress.total}
                    aria-label="Upload progress"
                  />
                )}
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
                        <button
                          type="button"
                          className="admin-photo-open"
                          onClick={() =>
                            setViewing(viewable.findIndex((p) => p.id === photo.id))
                          }
                          aria-label={`View larger: ${photo.caption || selected.title}`}
                        >
                          <img
                            src={photo.url}
                            alt={photo.caption || selected.title}
                            loading="lazy"
                            onError={(e) => {
                              if (!relink(photo, e.timeStamp))
                                e.currentTarget.alt =
                                  "This photo could not be loaded. Refresh photo links.";
                            }}
                          />
                        </button>
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
              New content starts private. Photo previews renew their links
              automatically when they expire.
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
      {viewing !== null && viewable[viewing] && (
        <PhotoViewer
          photos={viewable}
          index={viewing}
          fallbackTitle={selected?.title || "Photograph"}
          onIndex={setViewing}
          onClose={() => setViewing(null)}
          onExpired={relink}
        />
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
