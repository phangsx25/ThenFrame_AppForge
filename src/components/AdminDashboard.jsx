import { useCallback, useEffect, useRef, useState } from "react";
import {
  deleteCollection,
  deletePhoto,
  listCollections,
  listPhotos,
  saveCollection,
  updatePhoto,
  uploadPhoto,
} from "../lib/gallery";
import { Workspace } from "./Layout";
import { Icon, LaterCard, Modal, Notice } from "./UI";

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
  async function run(action, success) {
    setBusy(true);
    setError("");
    setMessage("");
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
  async function choose(collection) {
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
      await loadPhotos(selected.id);
    }, "Photo uploaded.");
  }
  const published = collections.filter((c) => c.visibility === "public").length;
  return (
    <Workspace auth={auth} admin active={section} onSection={setSection}>
      <div className="dashboard-heading">
        <div>
          <h1>
            {section === "Overview"
              ? "Welcome to ThenFrame Studio"
              : "Gallery management"}
          </h1>
          <p>Manage wedding collections and prepare stories to be shared.</p>
        </div>
        <button className="primary" onClick={() => setEditor({})}>
          ＋ New collection
        </button>
      </div>
      <Notice error>{error}</Notice>
      <Notice>{message}</Notice>
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
          <span>Hidden collections</span>
          <strong>
            {loading
              ? "—"
              : (collections.length - published).toString().padStart(2, "0")}
          </strong>
          <small>Not shared publicly</small>
        </article>
        <article>
          <span>Photos in selected collection</span>
          <strong>
            {photoLoading
              ? "—"
              : selected
                ? photos.length.toString().padStart(2, "0")
                : "—"}
          </strong>
          <small>{selected?.title || "Select a collection"}</small>
        </article>
      </div>
      <div className="admin-columns">
        <div>
          <section className="dashboard-card">
            <div className="section-heading">
              <div>
                <h2>Portfolio collections</h2>
                <p>Review your collections and manage their visibility.</p>
              </div>
              <button
                className="outline small"
                disabled={busy}
                onClick={() => run(refreshCollections)}
              >
                Refresh
              </button>
            </div>
            {loading ? (
              <p role="status">Loading collections…</p>
            ) : !collections.length ? (
              <div className="empty-state">
                <Icon name="photo" size={28} />
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
                      <th>Style</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {collections.map((c) => (
                      <tr key={c.id}>
                        <td>
                          <strong>{c.title}</strong>
                          <small>{c.description || "No description yet"}</small>
                        </td>
                        <td>{c.style || "—"}</td>
                        <td>
                          <span className="pill">● {c.visibility}</span>
                        </td>
                        <td>
                          <button
                            className="outline small"
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
          </section>
          {selected && (
            <section className="dashboard-card selected-gallery">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">CURRENT COLLECTION</span>
                  <h2>{selected.title}</h2>
                  <p>{selected.description}</p>
                </div>
                <div className="button-row">
                  <button
                    className="outline small"
                    disabled={busy}
                    onClick={() => setEditor(selected)}
                  >
                    Edit collection
                  </button>
                  <button
                    className="outline small danger"
                    disabled={busy}
                    onClick={() =>
                      setConfirmation({
                        title: "Delete collection?",
                        text: "Only an empty collection can be deleted. This cannot be undone.",
                        action: async () => {
                          await deleteCollection(client, selected.id);
                          photoGeneration.current++;
                          setSelected(null);
                          setPhotos([]);
                          await refreshCollections();
                        },
                      })
                    }
                  >
                    Delete empty collection
                  </button>
                </div>
              </div>
              <form onSubmit={upload} className="upload-form">
                <h3>Add a photograph</h3>
                <div className="form-grid">
                  <label>
                    Photograph
                    <input
                      name="photo"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      required
                    />
                    <small>JPEG, PNG or WebP · up to 10 MB</small>
                  </label>
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
                    <select name="visibility" defaultValue="hidden">
                      <option value="hidden">Hidden</option>
                      <option value="public">Public</option>
                    </select>
                  </label>
                </div>
                <p className="small-text muted">
                  A photo is public only when both the photo and its collection
                  are public.
                </p>
                <button className="primary" disabled={busy || photoLoading}>
                  {busy ? "Working…" : "Upload photo"}
                </button>
              </form>
              <div className="section-heading">
                <h3>Photographs</h3>
                <button
                  className="text-button"
                  disabled={busy || photoLoading}
                  onClick={() => run(() => loadPhotos(selected.id))}
                >
                  Refresh photo links ↻
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
                        <span className="pill">● {photo.visibility}</span>
                        <p>{photo.caption || "No caption yet"}</p>
                        <div className="button-row">
                          <button
                            disabled={busy}
                            className="outline small"
                            onClick={() => setPhotoEditor(photo)}
                          >
                            Edit photo
                          </button>
                          <button
                            disabled={busy}
                            className="text-button danger"
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
              New content starts hidden. Signed image links expire after one
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
          <LaterCard title="AI photo categorization & FAQ chatbot">
            AI features are planned. No AI result is generated on this screen.
          </LaterCard>
        </aside>
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
                maxLength={2000}
                defaultValue={editor.description || ""}
              />
            </label>
            <label>
              Photography style
              <input
                name="style"
                maxLength={100}
                defaultValue={editor.style || ""}
                placeholder="e.g. Traditional Malay wedding"
              />
            </label>
            <label>
              Visibility
              <select
                name="visibility"
                defaultValue={editor.visibility || "hidden"}
              >
                <option value="hidden">Hidden</option>
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
              <select name="visibility" defaultValue={photoEditor.visibility}>
                <option value="hidden">Hidden</option>
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
              className="outline"
              onClick={() => setConfirmation(null)}
            >
              Cancel
            </button>
            <button
              disabled={busy}
              className="primary"
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
