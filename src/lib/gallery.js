export const VISIBILITIES = ["hidden", "public"];
export const MAX_FILE_SIZE = 10 * 1024 * 1024;
const imageTypes = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const required = (result) => {
  if (result.error) throw result.error;
  return result.data;
};
export function collectionValues(input) {
  const title = String(input.title || "").trim();
  if (!title || title.length > 150)
    throw new Error("Enter a collection title of 1–150 characters.");
  if (!VISIBILITIES.includes(input.visibility))
    throw new Error("Choose public or hidden visibility.");
  return {
    title,
    description: String(input.description || "")
      .trim()
      .slice(0, 2000),
    style: String(input.style || "")
      .trim()
      .slice(0, 100),
    visibility: input.visibility,
  };
}
export function validateImage(file) {
  if (!file || !imageTypes[file.type])
    throw new Error("Choose a JPEG, PNG or WebP image.");
  if (!file.size || file.size > MAX_FILE_SIZE)
    throw new Error("Choose an image smaller than 10 MB.");
  return imageTypes[file.type];
}
export async function listCollections(client, admin = false) {
  let query = client
    .from("gallery_collections")
    .select("*")
    .order("created_at", { ascending: false });
  if (!admin) query = query.eq("visibility", "public");
  return required(await query);
}
export async function listPhotos(client, collectionId, admin = false) {
  let query = client
    .from("gallery_photos")
    .select("*")
    .eq("collection_id", collectionId)
    .order("created_at", { ascending: false });
  if (!admin) query = query.eq("visibility", "public");
  const rows = required(await query);
  return Promise.all(
    rows.map(async (row) => {
      const { data, error } = await client.storage
        .from("gallery")
        .createSignedUrl(row.storage_path, 60);
      return {
        ...row,
        url: error ? null : data?.signedUrl,
        linkError: error?.message,
      };
    }),
  );
}
export async function saveCollection(client, input, id) {
  const values = collectionValues(input);
  const query = id
    ? client.from("gallery_collections").update(values).eq("id", id)
    : client.from("gallery_collections").insert(values);
  return required(await query.select().single());
}
export async function uploadPhoto(
  client,
  collectionId,
  file,
  caption,
  visibility = "hidden",
) {
  const ext = validateImage(file);
  if (!collectionId) throw new Error("Select a collection first.");
  if (!VISIBILITIES.includes(visibility))
    throw new Error("Choose public or hidden visibility.");
  const storage_path = `${collectionId}/${crypto.randomUUID()}.${ext}`;
  required(
    await client.storage
      .from("gallery")
      .upload(storage_path, file, { contentType: file.type, upsert: false }),
  );
  const result = await client
    .from("gallery_photos")
    .insert({
      collection_id: collectionId,
      storage_path,
      caption: String(caption || "")
        .trim()
        .slice(0, 500),
      visibility,
    })
    .select()
    .single();
  if (result.error) {
    const cleanup = await client.storage.from("gallery").remove([storage_path]);
    throw new Error(
      `${result.error.message}${cleanup.error ? " The uploaded file could not be cleaned up. Ask the studio owner to inspect this collection’s Storage folder." : ""}`,
    );
  }
  return result.data;
}
export async function updatePhoto(client, photo, input) {
  if (!VISIBILITIES.includes(input.visibility))
    throw new Error("Choose public or hidden visibility.");
  return required(
    await client
      .from("gallery_photos")
      .update({
        caption: String(input.caption || "")
          .trim()
          .slice(0, 500),
        visibility: input.visibility,
      })
      .eq("id", photo.id)
      .select()
      .single(),
  );
}
export async function deletePhoto(client, photo) {
  // Metadata first revokes fresh public links; a failed object cleanup is explicit.
  required(
    await client
      .from("gallery_photos")
      .delete()
      .eq("id", photo.id)
      .select()
      .single(),
  );
  const cleanup = await client.storage
    .from("gallery")
    .remove([photo.storage_path]);
  if (cleanup.error)
    throw new Error(
      "Photo removed from the gallery, but Storage cleanup failed. Ask the owner to remove this orphan object: " +
        photo.storage_path,
    );
}
export async function deleteCollection(client, id) {
  // Never rely on an unknown ON DELETE CASCADE setting for populated collections.
  const photos = required(
    await client
      .from("gallery_photos")
      .select("id")
      .eq("collection_id", id)
      .limit(1),
  );
  if (photos.length)
    throw new Error("Remove this collection’s photos before deleting it.");
  required(
    await client
      .from("gallery_collections")
      .delete()
      .eq("id", id)
      .select()
      .single(),
  );
}
