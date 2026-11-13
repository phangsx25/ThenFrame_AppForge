# Verification — 13 November 2026

## Scope correction — 14 November 2026

Removed the Accounts navigation/page/route, administration client, undeployed
account-admin Edge Function source, and tests/mocks specific to that feature.
Customer account administration was an unrequested scope expansion. Customers
register themselves; Account settings remains for users to manage their own details.
Earlier account-admin implementation/deployment plans below are historical and
no longer pending work. No live accounts or database policies were changed.
After removal, lint, all 36 remaining unit tests, and the production build passed.

## Profile name synchronization — 14 November 2026

Applied the existing `sync_account_display_name` migration after authorization.
The trigger updates only `profiles.display_name` when Auth user metadata changes
and contains a trimmed name of 1–100 characters. It does not change roles or grant
customers profile UPDATE access. A transaction containing an Auth metadata update
and a subsequent read confirmed name synchronization and preserved the admin role;
the transaction was rolled back to preserve existing account details.
This is a database check, not complete browser acceptance of account settings.
Earlier notes about this migration being pending are historical.
Customer invitation/disable/delete administration is excluded from the agreed scope;
the account-admin Edge Function remains undeployed.

## Live Gallery acceptance — 14 November 2026

Executed normal Supabase API requests against the existing project using an authorized
admin and a separate anonymous client. No service-role bypass was used.

- PASS: admin login/profile role, temporary collection creation, PNG Storage upload,
  photo metadata insertion, caption update and object download.
- PASS: all four public/hidden collection/photo combinations. Anonymous collection
  reads follow collection visibility; photo reads, fresh signed URLs and direct
  object downloads succeed only when both collection and photo are public.
- PASS: anonymous collection update leaves the original title unchanged, verified
  by an admin readback.
- PASS: deleted the exact temporary photo row, Storage object and collection.

No existing gallery records were modified. These checks did not exercise authenticated
customer permissions, all unauthorized mutation methods, live JPEG/WebP uploads,
previously issued signed-link expiry, or browser UI interactions. They do not establish
complete US01–US04 acceptance.

## Gallery configuration follow-up

Read-only live inspection confirmed the gallery bucket is private, allows JPEG/PNG/WebP,
and has an 8,388,608-byte limit. The client now uses that same limit. Collection
validation matches the inspected database constraints: description is required with
1–3000 trimmed characters; style is required with 1–80 trimmed characters. Values
outside these bounds are rejected rather than silently truncated.

An earlier manually reconstructed regex test incorrectly suggested that the photo
path constraint rejected generated paths. Evaluating the actual expression obtained
from `pg_get_expr` confirmed JPEG, PNG and WebP paths pass, while wrong-collection,
SVG and traversal paths fail. No constraint or other database configuration was changed.
These expression checks do not replace live upload/RLS acceptance tests.

Base: original main `3d8696e7f3e5c2ca11af669e6e02cef5b6c3a248`. The earlier local Work implementation was not used.

## Executed locally

- GitHub write access: branch creation succeeded after the user updated access.
- Inspected all eight uploaded PNG wireframes. Applied wine/warm-white colors, arch placeholders, editorial typography, separate auth layouts and studio sidebar. Later-sprint data is not fabricated.
- `npm test`: 26 behavioral tests passed (mocked Supabase boundary). Includes registration payload, password mismatch, auth errors, customer rejection on admin login, direct admin-route denial, failed profile lookup, stale-session race, visibility query scopes, selected-ID writes, invalid files, upload compensation and deletion cleanup.
- `npm run lint`: passed.
- `npm run build`: passed, including PWA manifest, service worker and Workbox precache generation.
- Anonymous GETs against the existing Supabase `gallery_collections` and `gallery_photos` endpoints: both HTTP 200, zero returned rows. This proves connectivity, not hidden-data isolation. The root REST OpenAPI endpoint returned HTTP 401, so catalog/constraint/policy inspection remains unavailable.
- Local Playwright browser launch: BLOCKED by runtime socket restrictions (`socket() failed: Operation not permitted`). Chromium download also returned a truncated archive; the installed system Chromium reaches the socket restriction. No local browser test is claimed to pass.

## GitHub Actions

GitHub-hosted run https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43410673787 passed all installation, lint, unit, build, audit and six Playwright flows on code commit `cdbc6bd58a41f3ede4d5a56f6529154b6dff1cbc`. The browser flows cover registration, login/reload/logout, admin rejection, collection/photo CRUD and portfolio filtering, desktop/mobile layout, and password recovery form submission. These flows use the real app and Supabase client with intercepted HTTP responses; they do not verify live RLS. Earlier browser failures exposed field-label and mobile-grid issues; both were fixed and rerun. A final focus-return regression check was added after screenshot review.

Downloaded and visually reviewed desktop/mobile screenshots of the public/auth screens and admin gallery. Wine colors and wireframe layout were preserved. Vercel commit status explicitly reported `Canceled by Ignored Build Step`, confirming this feature branch did not deploy.

## Outstanding live checks

No Supabase management connection or customer/admin test passwords are available. Catalog/RLS/trigger/bucket inspection, live auth/email/reset, admin/customer write permissions, hidden object isolation and live upload/download have not been executed. The fixture runner and read-only SQL are supplied for those checks. No schema changes, role promotions or existing data deletions have been made.

Vercel environment values and Supabase redirect settings have not been inspected. No production deployment is requested. The feature branch's ignored-build command requests skipping its deployment until acceptance is complete. PWA install/offline/update behavior is not yet verified in a deployed browser. Temporary PWA PNG icons are retained.

## Sprint status

US01–US04 have an implementation for review. SETUP-01 and the stories are not verified Done. No Kanban item is moved to Done. Booking, private-client albums/proof selection/final delivery, heritage content and AI features remain later-sprint work.

## Install and dependency audit

Clean `npm ci` passed after lockfile synchronization. Production audit reported zero vulnerabilities. Full audit still reports 9 affected development/build packages (2 low, 7 moderate; no high or critical): ESLint/config-array/@eslint/js/minimatch and the PWA/Workbox resolver chain (glob, deepmerge). The root advisories are minimatch globparts amplification (GHSA-g3hv-75wg-m249), glob cancellation bypass (GHSA-3g3m-2fjr-6pw4), and deepmerge prototype poisoning (GHSA-gcqx-w48m-w2h4). Suggested fixes include major-version downgrades of ESLint and vite-plugin-pwa. No forced fix or major downgrade was applied. Recheck patched upstream releases and build only trusted inputs.

## Login role selector

Both login pages now expose a Customer/Admin choice before credentials are entered. Switching opens the appropriate form and never changes an account role. A behavior test verifies both directions without an auth request; the browser rejection flow starts with the Admin choice and still rejects a customer account. No database or authorization rule changed.


## Account management follow-up

Live read-only inspection through the Supabase connection verified the actual profile schema, RLS policies, function definitions, registration trigger, constraints and private gallery bucket. The existing account has no name in Auth metadata and its profile contains the generic Customer name; there is currently no admin profile. No password was read, reset or created. No role was changed.

Security advisories report public execution grants on the existing SECURITY DEFINER functions and disabled leaked-password protection. The existing functions have a fixed empty search path; `is_admin()` is required by the existing anonymous-read policies. No broad policy or grant was changed as part of this account update.

Prepared account service, account settings UI and tests are version controlled. Automatic approval review rejected Edge Function deployment and the name-sync migration because they activate authentication/security changes requiring explicit owner approval. Neither operation ran. Admin account management remains blocked until the function is deployed and an admin account is explicitly designated. Self-service name/password/email/session operations use ordinary Supabase Auth.

The new trigger only updates display_name, preserves roles, and revokes direct execution from public/anon/authenticated. Its migration is not applied. Rollback instructions are included in the SQL file. Existing data is preserved.


## Owner-authorized admin assignment and team plan

The explicitly designated existing account was assigned the admin role and the requested display name; a readback verified both fields. The supplied desired password failed normal password authentication. A standard recovery-email request was accepted; completion and email delivery are not verified. No password was read, displayed or committed. Automatic review denied reading password-derived data, so the normal recovery flow was used instead.

Automatic review again refused the name-sync migration because the new authorization clearly covered the named account but did not explicitly cover this separate Auth-trigger change. The migration and privileged Edge Function remain unapplied/undeployed. No workaround was used. See TEAM_TASKS.md for remaining work and acceptance evidence.
