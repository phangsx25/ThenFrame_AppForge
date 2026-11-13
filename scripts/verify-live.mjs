// Normal Supabase API clients only. No privileged database connection is used.
import assert from "node:assert/strict";
import { createClient } from "@supabase/supabase-js";
const env = process.env;
const url = env.VITE_SUPABASE_URL,
  key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
assert.ok(
  url && key?.startsWith("sb_publishable_"),
  "Set the URL and publishable key in .env.local.",
);
const make = () =>
  createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
const anonymous = make();
const unwrap = (result) => {
  if (result.error) throw result.error;
  return result.data;
};
const rows = unwrap(
  await anonymous.from("gallery_collections").select("id,visibility"),
);
assert.ok(rows.every((row) => row.visibility === "public"));
const photos = unwrap(
  await anonymous.from("gallery_photos").select("id,collection_id,visibility"),
);
assert.ok(
  photos.every(
    (photo) =>
      photo.visibility === "public" &&
      rows.some((c) => c.id === photo.collection_id),
  ),
);
console.log(
  `PASS anonymous API returned only public rows (${rows.length} collections, ${photos.length} photos). Empty data is not proof of isolation.`,
);
if (!process.argv.includes("--fixtures")) {
  console.log(
    "SKIP authenticated writes and Storage isolation: use --fixtures with dedicated test accounts after inspecting policies.",
  );
  process.exit(0);
}
for (const name of [
  "TEST_ADMIN_EMAIL",
  "TEST_ADMIN_PASSWORD",
  "TEST_CUSTOMER_EMAIL",
  "TEST_CUSTOMER_PASSWORD",
])
  assert.ok(env[name], `Missing ${name}; no fixtures created.`);
const admin = make(),
  customer = make();
const fixture = { collection: null, photo: null, paths: [] };
let failures = 0;
async function check(name, fn) {
  try {
    await fn();
    console.log("PASS " + name);
  } catch (error) {
    failures++;
    console.error("FAIL " + name + ": " + error.message);
  }
}
try {
  for (const [client, actor] of [
    [admin, "ADMIN"],
    [customer, "CUSTOMER"],
  ]) {
    const session = unwrap(
      await client.auth.signInWithPassword({
        email: env[`TEST_${actor}_EMAIL`],
        password: env[`TEST_${actor}_PASSWORD`],
      }),
    );
    const profile = unwrap(
      await client
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single(),
    );
    assert.equal(
      profile.role,
      actor.toLowerCase(),
      `Wrong ${actor} profile role; no fixtures will be created.`,
    );
  }
  fixture.collection = unwrap(
    await admin
      .from("gallery_collections")
      .insert({
        title: `ThenFrame security fixture ${crypto.randomUUID()}`,
        description: "Disposable security test; not customer data.",
        style: "Test fixture",
        visibility: "hidden",
      })
      .select()
      .single(),
  );
  const cid = fixture.collection.id;
  const bytes = Uint8Array.from(
    Buffer.from(
      "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aJqkAAAAASUVORK5CYII=",
      "base64",
    ),
  );
  const path = `${cid}/${crypto.randomUUID()}.png`;
  fixture.paths.push(path);
  unwrap(
    await admin.storage
      .from("gallery")
      .upload(path, bytes, { contentType: "image/png", upsert: false }),
  );
  fixture.photo = unwrap(
    await admin
      .from("gallery_photos")
      .insert({
        collection_id: cid,
        storage_path: path,
        caption: "Security fixture",
        visibility: "hidden",
      })
      .select()
      .single(),
  );
  console.log(
    "PASS admin password login, profile read, collection creation, Storage upload and photo metadata creation.",
  );
  for (const [client, actor] of [
    [anonymous, "anonymous"],
    [customer, "customer"],
  ]) {
    await check(`${actor} cannot insert a collection`, async () => {
      // Reuse the fixture ID, so no unexpected new record can be created.
      const result = await client
        .from("gallery_collections")
        .insert({
          id: crypto.randomUUID(),
          title: "Unexpected permission-test collection",
          visibility: "hidden",
        })
        .select();
      if (!result.error && result.data?.length) {
        // Record only IDs this request actually created and remove through admin.
        for (const row of result.data)
          unwrap(
            await admin.from("gallery_collections").delete().eq("id", row.id),
          );
        throw new Error(
          "Insert was permitted; created test records were removed.",
        );
      }
      assert.ok(result.error, "Insert did not return a denial");
    });
    await check(`${actor} cannot update the fixture collection`, async () => {
      await client
        .from("gallery_collections")
        .update({ title: "UNAUTHORIZED CHANGE" })
        .eq("id", cid)
        .select();
      const row = unwrap(
        await admin
          .from("gallery_collections")
          .select("title")
          .eq("id", cid)
          .single(),
      );
      assert.equal(row.title, fixture.collection.title);
    });
    await check(`${actor} cannot upload a gallery object`, async () => {
      const deniedPath = `${cid}/${crypto.randomUUID()}.png`;
      fixture.paths.push(deniedPath);
      const result = await client.storage
        .from("gallery")
        .upload(deniedPath, bytes, { contentType: "image/png", upsert: false });
      assert.ok(result.error, "Unauthorized upload succeeded");
    });
  }
  for (const collectionVisibility of ["hidden", "public"])
    for (const photoVisibility of ["hidden", "public"]) {
      unwrap(
        await admin
          .from("gallery_collections")
          .update({ visibility: collectionVisibility })
          .eq("id", cid),
      );
      unwrap(
        await admin
          .from("gallery_photos")
          .update({ visibility: photoVisibility })
          .eq("id", fixture.photo.id),
      );
      const visible =
        collectionVisibility === "public" && photoVisibility === "public";
      for (const [client, actor] of [
        [anonymous, "anonymous"],
        [customer, "customer"],
      ]) {
        await check(
          `${actor} collection=${collectionVisibility}, photo=${photoVisibility}`,
          async () => {
            const found = unwrap(
              await client
                .from("gallery_photos")
                .select("id")
                .eq("id", fixture.photo.id),
            );
            assert.equal(
              found.length,
              visible ? 1 : 0,
              "Photo row visibility mismatch",
            );
            const signed = await client.storage
              .from("gallery")
              .createSignedUrl(path, 60);
            assert.equal(
              Boolean(signed.data?.signedUrl && !signed.error),
              visible,
              "Fresh signed URL permission mismatch",
            );
            const download = await client.storage
              .from("gallery")
              .download(path);
            assert.equal(
              Boolean(download.data && !download.error),
              visible,
              "Direct object download permission mismatch",
            );
          },
        );
      }
    }
  await check("admin can download the private Storage fixture", async () => {
    assert.ok(unwrap(await admin.storage.from("gallery").download(path)));
  });
} finally {
  // Only exact IDs and object paths recorded above are cleaned up.
  if (fixture.photo) {
    const result = await admin
      .from("gallery_photos")
      .delete()
      .eq("id", fixture.photo.id);
    if (result.error) {
      failures++;
      console.error("CLEANUP photo failed: " + result.error.message);
    }
  }
  if (fixture.paths.length) {
    const result = await admin.storage.from("gallery").remove(fixture.paths);
    if (result.error) {
      failures++;
      console.error("CLEANUP Storage failed: " + result.error.message);
    }
  }
  if (fixture.collection) {
    const result = await admin
      .from("gallery_collections")
      .delete()
      .eq("id", fixture.collection.id);
    if (result.error) {
      failures++;
      console.error("CLEANUP collection failed: " + result.error.message);
    }
  }
  await admin.auth.signOut();
  await customer.auth.signOut();
}
console.log(
  "Role escalation, account registration/email delivery and existing-link expiry need separate review. No accounts or roles were changed.",
);
if (failures) process.exitCode = 1;
