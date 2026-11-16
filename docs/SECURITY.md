# Supabase security and acceptance checks

The existing project has been inspected and the display-name synchronization migration was activated on 14 November 2026. Reinspect current configuration before backend changes using `scripts/inspect-security.sql`. Record configuration and outcomes without passwords or tokens.

Review all of these:

- RLS enabled on `profiles`, `gallery_collections` and `gallery_photos`.
- `profiles.id` references `auth.users.id`; `gallery_photos.collection_id` references collections. Inspect delete rules, uniqueness, visibility constraints and nullability.
- Registration creates exactly one customer profile; user metadata cannot set the role. No customer may update their own or another account's role.
- `is_admin()` checks the current authenticated user's database profile, avoids recursive RLS and has a fixed safe search path. Inspect SECURITY DEFINER functions and execute grants.
- The registration trigger is enabled on `auth.users`, calls the intended function and handles names safely.
- Anonymous/customer collection SELECT requires a public collection. Photo SELECT requires BOTH a public photo AND public collection.
- Storage bucket `gallery` is private. Object SELECT/signed URL access joins its exact path to an accessible photo and collection. No broad policy overrides this check. Admin alone may create/update/delete files and gallery records.
- Server-side Storage limits should allow JPEG/PNG/WebP and cap size at 8 MB. Client validation alone is not a security control.
- Confirm Auth email confirmation, rate limits, password rules, production Site URL, trusted redirect allowlist and reset email delivery.

## Password recovery configuration

Use `https://then-frame-app-forge.vercel.app` as the current production Site URL.
Allow both exact callbacks in Authentication → URL Configuration:

- `https://then-frame-app-forge.vercel.app/?auth=password`
- `https://then-frame-app-forge.vercel.app/?auth=confirmed`

Preserve other approved development callbacks. Reset email templates must use
Supabase's `{{ .ConfirmationURL }}` verification link rather than linking directly
to a home page. The app also handles `PASSWORD_RECOVERY` if a valid recovery
session reaches the root URL without the query marker. Callback intent is captured
before the SDK clears tokens; raw tokens are not retained in app routing state.

After changing the Site URL or allowlist, request a fresh email from the production
site. Previously issued emails keep their original destination. Do not share or
commit reset links. Verify the new password works and the old one fails with a
disposable customer account; automated/mock checks do not establish real delivery.

## Username sign-in

The `username-login` Edge Function is a pre-login credential exchange. Its gateway
JWT verification is disabled so signed-out users can log in; the handler verifies
the password through Supabase Auth before returning a normal user session. It does
not expose a username-to-email lookup API or return its elevated server key.

- `profiles.username` is unique, lowercase and restricted to 3–40 characters,
  beginning with a letter, followed by letters, digits or underscores.
- Existing accounts retain their email, password and role. Assign usable usernames
  before enabling username-only login. Users can rename themselves in Account settings.
- The website offers no email login switch. Supabase Auth still verifies passwords
  internally through the private username credential exchange; email is not exposed
  by an anonymous lookup endpoint.
- `set_my_username` is authenticated-only and updates only `auth.uid()`'s username.
  It is intentionally SECURITY DEFINER because profiles remain SELECT-only to users;
  it cannot update roles. [Advisor rationale](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable).
- `resolve_username_login` is executable only by service_role, not anon or
  authenticated. The private attempt table has RLS with no client policies or
  grants: denial to clients is intentional. [RLS advisor guidance](https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy).
- All existing and unknown usernames consume the durable 10-attempt / 15-minute
  per-username limit. This is not a complete IP-based abuse-prevention system;
  targeted username lockout is possible within that window.
- User-editable Auth metadata cannot rename an existing profile or change its role.
- Email confirmation and password recovery remain email-based. No changes were
  made to confirmation requirements, passwords or existing role assignments.

Security advisors were reviewed after migration. Existing `is_admin()` execution
and disabled leaked-password-protection notices were not changed by this feature.
No claim is made that all project advisories are resolved.

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
- Verify confirmed deletion of empty and populated disposable collections. Check exact photo/object scope, pagination, partial-failure messages and the retained collection after a cleanup failure. Coordinate testing so other admins do not upload into a collection being deleted; the multi-step operation is not atomic. Delete only test fixtures.
- Issue a public signed URL, hide its photo/collection, then verify a fresh link is denied. The old bearer link may remain valid until its 60-second expiry. Document this limitation.
- Verify desktop/mobile, keyboard navigation, dialogs, loading/empty/error states, PWA install, offline shell and app updates.

## Changes after inspection

If a real gap is found, write a targeted reviewed migration in `supabase/migrations/<timestamp>_<description>.sql`. Test in a disposable project first. Preserve existing rows and document rollback. Do not replace tables or assume policies based on this document. Do not deploy authentication/security changes until live checks pass.


## US06 booking management

`booking_reservations` and `booking_consultations` have RLS and authenticated read-only grants. Policies allow the studio admin or the linked enquiry's owner to read records. No anonymous access or authenticated direct mutation is granted. Customer forms never set review versions, status, actor IDs or reservation records directly.

`admin_update_enquiry` and `admin_save_consultation` are intentional SECURITY DEFINER APIs. Both reject a null auth.uid() and a caller whose current database profile is not admin; both use an empty search_path and fully qualified objects. PUBLIC/anon execution is revoked. Authenticated EXECUTE is necessary because admin JWTs also use the authenticated database role; it does not authorize customer calls. The [authenticated definer advisory](https://supabase.com/docs/guides/database/database-linter?lint=0029_authenticated_security_definer_function_executable) is expected and must be reviewed against these guards rather than resolved by exposing table writes.

A non-overlapping timestamptz-range exclusion constraint protects event reservations independently of the frontend availability preview. The booking RPC locks its enquiry, checks the expected review version, reserves/reschedules and updates status atomically. Consultation updates lock the same parent and check a separate consultation version. Formal tests should include two genuinely concurrent REST clients; development SQL assertions currently cover the constraint and rollback boundaries sequentially.
