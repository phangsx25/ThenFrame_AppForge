import { describe, it, expect, vi } from "vitest";
import {
  collectionValues,
  validateImage,
  listCollections,
  listPhotos,
  saveCollection,
  uploadPhoto,
  updatePhoto,
  deletePhoto,
  deleteCollection,
} from "../src/lib/gallery";
function clientFor(results = []) {
  const calls = [];
  const client = {
    from: vi.fn((table) => {
      const response = results.shift() || { data: [], error: null };
      const chain = {
        then(resolve, reject) {
          return Promise.resolve(response).then(resolve, reject);
        },
      };
      for (const method of [
        "select",
        "insert",
        "update",
        "delete",
        "eq",
        "order",
        "single",
        "limit",
      ])
        chain[method] = vi.fn((...args) => {
          calls.push([table, method, ...args]);
          return chain;
        });
      return chain;
    }),
    storage: { from: vi.fn(() => storage) },
  };
  const storage = {
    upload: vi.fn().mockResolvedValue({ data: {}, error: null }),
    remove: vi.fn().mockResolvedValue({ data: [], error: null }),
    createSignedUrl: vi
      .fn()
      .mockResolvedValue({
        data: { signedUrl: "https://example.test/signed" },
        error: null,
      }),
  };
  return { client, calls, storage };
}
describe("gallery request behavior (mocked Supabase transport)", () => {
  it("rejects an empty title and arbitrary visibility before a database write", () => {
    expect(() =>
      collectionValues({ title: " ", visibility: "public" }),
    ).toThrow(/title/);
    expect(() =>
      collectionValues({ title: "Story", visibility: "private" }),
    ).toThrow(/visibility/);
  });
  it("trims collection values and never sends a role or owner from form input", async () => {
    const { client, calls } = clientFor([{ data: { id: "c1" } }]);
    await saveCollection(client, {
      title: " Story ",
      description: " Day ",
      style: " Malay ",
      visibility: "hidden",
      role: "admin",
    });
    expect(calls.find((c) => c[1] === "insert")[2]).toEqual({
      title: "Story",
      description: "Day",
      style: "Malay",
      visibility: "hidden",
    });
  });
  it("rejects blank or overlong description/style before sending a write", async () => {
    const valid = { title: "Story", description: "Day", style: "Malay", visibility: "hidden" };
    for (const input of [
      { ...valid, description: "   " },
      { ...valid, description: "a".repeat(3001) },
      { ...valid, style: "   " },
      { ...valid, style: "a".repeat(81) },
    ]) {
      const { client } = clientFor();
      await expect(saveCollection(client, input)).rejects.toThrow(/description|style/);
      expect(client.from).not.toHaveBeenCalled();
    }
    const boundary = { ...valid, description: "a".repeat(3000), style: "a".repeat(80) };
    expect(collectionValues(boundary)).toEqual(boundary);
  });
  it("scopes collection updates to the selected ID and detects RLS zero-row errors", async () => {
    const { client, calls } = clientFor([
      { data: null, error: new Error("Cannot return single row") },
    ]);
    await expect(
      saveCollection(client, { title: "Story", description: "Day", style: "Malay", visibility: "hidden" }, "c1"),
    ).rejects.toThrow(/single row/);
    expect(calls).toContainEqual(["gallery_collections", "eq", "id", "c1"]);
  });
  it("requests only public collections for visitors and leaves admin policy enforcement to RLS", async () => {
    const a = clientFor();
    await listCollections(a.client);
    expect(a.calls).toContainEqual([
      "gallery_collections",
      "eq",
      "visibility",
      "public",
    ]);
    const b = clientFor();
    await listCollections(b.client, true);
    expect(b.calls.some((c) => c[1] === "eq")).toBe(false);
  });
  it("scopes visitor photos by collection and visibility and requests expiring links", async () => {
    const { client, calls, storage } = clientFor([
      { data: [{ id: "p1", storage_path: "c1/a.jpg" }] },
    ]);
    const photos = await listPhotos(client, "c1");
    expect(calls).toContainEqual([
      "gallery_photos",
      "eq",
      "collection_id",
      "c1",
    ]);
    expect(calls).toContainEqual([
      "gallery_photos",
      "eq",
      "visibility",
      "public",
    ]);
    expect(storage.createSignedUrl).toHaveBeenCalledWith("c1/a.jpg", 60);
    expect(photos[0].url).toBe("https://example.test/signed");
  });
  it("does not invent a public URL when Storage refuses access", async () => {
    const { client, storage } = clientFor([
      { data: [{ storage_path: "hidden.jpg" }] },
    ]);
    storage.createSignedUrl.mockResolvedValue({
      data: null,
      error: { message: "Denied" },
    });
    expect((await listPhotos(client, "c1"))[0]).toMatchObject({
      url: null,
      linkError: "Denied",
    });
  });
  it("rejects active content, empty files and oversized uploads before touching Storage", async () => {
    const { client, storage } = clientFor();
    for (const file of [
      { type: "image/svg+xml", size: 10 },
      { type: "image/jpeg", size: 0 },
      { type: "image/png", size: 8 * 1024 * 1024 + 1 },
    ]) {
      await expect(uploadPhoto(client, "c1", file)).rejects.toThrow();
    }
    expect(storage.upload).not.toHaveBeenCalled();
    expect(validateImage({ type: "image/webp", size: 100 })).toBe("webp");
    expect(validateImage({ type: "image/jpeg", size: 8 * 1024 * 1024 })).toBe("jpg");
  });
  it("uses a generated path and records metadata only after a successful upload", async () => {
    const { client, storage, calls } = clientFor([{ data: { id: "p1" } }]);
    const file = { type: "image/jpeg", size: 100 };
    await uploadPhoto(client, "c1", file, " Moment ");
    const path = storage.upload.mock.calls[0][0];
    expect(path).toMatch(/^c1\/[0-9a-f-]+\.jpg$/);
    expect(calls.find((c) => c[1] === "insert")[2]).toEqual({
      collection_id: "c1",
      storage_path: path,
      caption: "Moment",
      visibility: "hidden",
    });
  });
  it.each([
    ["portrait.jpg", "image/jpeg"],
    ["portrait.jpeg", "image/jpeg"],
    ["portrait.JPG", "image/jpeg"],
    ["portrait.jpg", "image/jpg"],
  ])("uploads %s (%s) as a canonical JPEG", async (name, type) => {
    const { client, storage } = clientFor([{ data: { id: "p1" } }]);
    const file = { name, type, size: 100 };
    await uploadPhoto(client, "c1", file);
    expect(storage.upload).toHaveBeenCalledWith(
      expect.stringMatching(/\.jpg$/),
      file,
      { contentType: "image/jpeg", upsert: false },
    );
  });
  it("never creates metadata if Storage denies upload", async () => {
    const { client, storage } = clientFor();
    storage.upload.mockResolvedValue({ error: new Error("RLS denied upload") });
    await expect(
      uploadPhoto(client, "c1", { type: "image/png", size: 10 }),
    ).rejects.toThrow(/RLS/);
    expect(client.from).not.toHaveBeenCalled();
  });
  it("compensates for metadata failure by removing only the new upload", async () => {
    const { client, storage } = clientFor([
      { data: null, error: new Error("Metadata denied") },
    ]);
    await expect(
      uploadPhoto(client, "c1", { type: "image/jpeg", size: 20 }),
    ).rejects.toThrow("Metadata denied");
    expect(storage.remove).toHaveBeenCalledWith([
      storage.upload.mock.calls[0][0],
    ]);
  });
  it("reports failed cleanup instead of claiming atomic success", async () => {
    const { client, storage } = clientFor([
      { data: null, error: new Error("Metadata denied") },
    ]);
    storage.remove.mockResolvedValue({ error: new Error("Cleanup denied") });
    await expect(
      uploadPhoto(client, "c1", { type: "image/png", size: 20 }),
    ).rejects.toThrow(/could not be cleaned up/);
  });
  it("updates photo caption and visibility by its exact ID", async () => {
    const { client, calls } = clientFor([{ data: { id: "p1" } }]);
    await updatePhoto(
      client,
      { id: "p1" },
      { caption: " Kiss ", visibility: "public" },
    );
    expect(calls).toContainEqual(["gallery_photos", "eq", "id", "p1"]);
    expect(calls).toContainEqual([
      "gallery_photos",
      "update",
      { caption: "Kiss", visibility: "public" },
    ]);
  });
  it("does not remove a stored file if RLS denies deleting metadata", async () => {
    const { client, storage } = clientFor([
      { error: new Error("Delete denied") },
    ]);
    await expect(
      deletePhoto(client, { id: "p1", storage_path: "c1/a.jpg" }),
    ).rejects.toThrow(/denied/);
    expect(storage.remove).not.toHaveBeenCalled();
  });
  it("removes only the selected photo and reports Storage cleanup failure", async () => {
    const { client, storage, calls } = clientFor([{ data: { id: "p1" } }]);
    storage.remove.mockResolvedValue({ error: new Error("Cleanup denied") });
    await expect(
      deletePhoto(client, { id: "p1", storage_path: "c1/a.jpg" }),
    ).rejects.toThrow(/orphan object/);
    expect(calls).toContainEqual(["gallery_photos", "eq", "id", "p1"]);
    expect(storage.remove).toHaveBeenCalledWith(["c1/a.jpg"]);
  });
  it("refuses to delete a nonempty collection before a cascade could remove data", async () => {
    const { client } = clientFor([{ data: [{ id: "p1" }] }]);
    await expect(deleteCollection(client, "c1")).rejects.toThrow(
      /Remove.*photos/,
    );
    expect(client.from).toHaveBeenCalledTimes(1);
  });
  it("deletes an empty collection by its exact ID", async () => {
    const { client, calls } = clientFor([{ data: [] }, { data: { id: "c1" } }]);
    await deleteCollection(client, "c1");
    expect(calls).toContainEqual(["gallery_collections", "eq", "id", "c1"]);
  });
});
