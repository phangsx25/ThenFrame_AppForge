# Supabase security and acceptance checks

No database migration has been applied. Anonymous REST requests can read visible gallery rows, but they cannot inspect the full database catalog. Run `scripts/inspect-security.sql` in the existing Supabase SQL Editor before proposing any database change. Save only configuration results, never passwords or tokens.

Review all of these:

- RLS enabled on `profiles`, `gallery_collections` and `gallery_photos`.
- `profiles.id` references `auth.users.id`; `gallery_photos.collection_id` references collections. Inspect delete rules, uniqueness, visibility constraints and nullability.
- Registration creates exactly one customer profile; user metadata cannot set the role. No customer may update their own or another account's role.
- `is_admin()` checks the current authenticated user's database profile, avoids recursive RLS and has a fixed safe search path. Inspect SECURITY DEFINER functions and execute grants.
- The registration trigger is enabled on `auth.users`, calls the intended function and handles names safely.
- Anonymous/customer collection SELECT requires a public collection. Photo SELECT requires BOTH a public photo AND public collection.
- Storage bucket `gallery` is private. Object SELECT/signed URL access joins its exact path to an accessible photo and collection. No broad policy overrides this check. Admin alone may create/update/delete files and gallery records.
- Server-side Storage limits should allow JPEG/PNG/WebP and cap size at 10 MB. Client validation alone is not a security control.
- Confirm Auth email confirmation, rate limits, password rules, production Site URL, trusted redirect allowlist and reset email delivery.

## Reproducible live checks

1. Run read-only catalog SQL and review the configuration above.
2. Add `TEST_CUSTOMER_EMAIL`, `TEST_CUSTOMER_PASSWORD`, `TEST_ADMIN_EMAIL`, `TEST_ADMIN_PASSWORD` to ignored `.env.local`. Use disposable test accounts and an **existing authorized admin**. This code never creates an admin or changes roles.
3. Run `npm run test:live` for anonymous read checks.
4. After configuration review, run `npm run test:live -- --fixtures`. This logs in normally, creates one uniquely named test collection and PNG, tests customer/anonymous write restrictions and all four public/hidden collection/photo combinations, then removes only recorded fixture IDs and paths. No service-role key bypasses RLS.
5. Review each PASS/FAIL and cleanup message. A failed cleanup requires the owner to inspect the exact fixture. An empty anonymous response is not proof of isolation.

The fixture script does not test role escalation by attempting to promote an account. Inspect role-update policies/grants and use a disposable staging project for that test. It does not test all customer DELETE paths, cross-customer private-client access, foreign-key enforcement or revoked refresh tokens. These remain manual/staging checks.

## Browser acceptance on the real project (not mocked)

- Register with a real test email; confirm the email and verify the trigger-created profile is `customer`. Log in, reload and log out. Verify incorrect passwords and profile lookup failures.
- Request a reset email, open it on the trusted origin, update the password and verify the old password no longer works. Check expired/invalid links.
- Use the existing admin to create/edit a disposable collection, upload/caption/publish/hide a PNG, then verify the visitor portfolio in a separate signed-out browser. Verify both public/hidden levels and guessed object paths.
- Customer direct requests must not mutate gallery data or read hidden photo objects. Verify final data with admin readback; zero rows can be an RLS denial even without an error.
- Confirm empty-collection deletion is scoped and that populated collections cannot be deleted from the app. Delete only test fixtures. Check metadata/Storage partial-failure handling.
- Issue a public signed URL, hide its photo/collection, then verify a fresh link is denied. The old bearer link may remain valid until its 60-second expiry. Document this limitation.
- Verify desktop/mobile, keyboard navigation, dialogs, loading/empty/error states, PWA install, offline shell and app updates.

## Changes after inspection

If a real gap is found, write a targeted reviewed migration in `supabase/migrations/<timestamp>_<description>.sql`. Test in a disposable project first. Preserve existing rows and document rollback. Do not replace tables or assume policies based on this document. Do not deploy authentication/security changes until live checks pass.
