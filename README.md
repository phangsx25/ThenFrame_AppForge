# ThenFrame

Wedding Photography Portfolio & Gallery Management PWA, built with React, Vite, Tailwind, Supabase and the existing Vercel setup.

This branch starts from original `main` commit `3d8696e7f3e5c2ca11af669e6e02cef5b6c3a248`. It does not use the earlier local Work-generated Sprint 1 version.

## Design

The eight supplied wireframes guide the Burgundy / Wine Red Editorial theme: wine `#7d2e46`, dark wine `#542033`, warm white `#fff9f5`, rose `#f3e5df`, serif headings, arch-shaped image placeholders and a wine studio sidebar. Placeholders are intentional reference-design elements, not real studio photographs. Published portfolio images come from Supabase.

| Wireframe | Implementation |
| --- | --- |
| Homepage | Editorial hero, portfolio, approach, heritage notice, studio story and footer |
| Customer Login | Split arch layout, real password login, customer/admin navigation |
| Customer Register | Name, email, password confirmation and email-confirmation response |
| Admin Login | Dedicated studio layout, password auth and profile-role check |
| Portfolio & Booking | Public gallery browsing, collection detail, search and style filter; booking explicitly planned |
| Customer Dashboard | Real account name and logout; booking and private albums explicitly planned |
| Customer Photo Album | Planned notice only; no client assignment/proof/delivery schema is invented |
| Admin Dashboard | Wine sidebar, real collection counts and gallery CRUD; later-sprint panels clearly labelled |

## Team setup (all five members)

Use Node.js 24 LTS and npm. Clone the repository, then check out this branch to review the new implementation:

```sh
git clone https://github.com/phangsx25/ThenFrame_AppForge.git
cd ThenFrame_AppForge
git switch feature/sprint1-burgundy-wireframes
npm ci
cp .env.example .env.local
npm run dev
```

PowerShell: use `Copy-Item .env.example .env.local` instead of `cp` if preferred.

Fill `.env.local` with the existing Supabase project URL and **publishable** key, supplied privately by the project owner:

```dotenv
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_REPLACE_ME
```

Restart Vite after changing these values. VITE variables are public browser configuration. The client deliberately rejects secret/service-role keys. Never put database passwords, account passwords or service-role keys in a VITE variable or GitHub. All `.env` files are ignored except `.env.example`.

Use existing project `hoxtsapehydyaxvdibty`. Do not bootstrap, replace or clear its tables. Registration uses the existing profile trigger; the app only supplies `display_name`, never a role. Admin status is read from `profiles.role`; no account is promoted by this code.

## Sprint 1 behavior

- US01 (3): customer registration, password confirmation, login, session restoration, logout and password-reset request/update.
- US02 (3): Customer/Admin selector on both login pages, separate admin login, database role verification, fail-closed protected route and late-session-response protection.
- US03 (5): create/edit collections; hidden/public visibility; upload JPEG/PNG/WebP files up to 10 MB; edit photo caption/visibility; delete a confirmed individual photo; delete a confirmed empty collection. Metadata-upload failure triggers cleanup of only the new object. Cleanup failures are reported.
- US04 (5): public collections/photos, title/description search, style filtering, collection details, photo viewer and signed image links.

Total: 16 points. SETUP-01 adds no story points. Implementation and mocked tests do not prove live RLS acceptance. Do not mark stories Done until the live checklist passes.

Collection/photo visibility currently uses `public` and `hidden` from the provided requirements. Inspect existing constraints before a live demo. Database and Storage policies must enforce access even when requests omit the UI filters. The app does not modify those policies.

Photo links expire after 60 seconds. Use Refresh photo links to renew them. Hiding a photo prevents new links only if RLS is correct; already issued links can remain usable until expiry. Storage and metadata are separate operations, not a database transaction. If a photo is deleted but its object cleanup fails, the UI reports the orphan path for owner cleanup. Do not retry bulk deletions.

Cross-device refresh is manual; Realtime subscriptions are not implemented. Booking, private-client assignment, photo selection, final delivery, heritage articles and both AI features belong to later sprints. No fake customer records, example bookings or demo login are included in the running app.

## Verification

```sh
npm ci
npm run lint
npm test
npm run build
npm audit --omit=dev
```

`npm test` runs behavioral tests using a mocked Supabase boundary. They test auth submission/error handling, role blocking, session races, CRUD scoping, upload validation and cleanup. They do not test the live database policies.

```sh
npx playwright install --with-deps chromium
npm run test:e2e
```

Playwright runs the actual browser UI and Supabase client with intercepted HTTP responses. Test-only credentials and data live only in `e2e/`; they cannot log in to the real project. Screenshots and reports are generated under ignored `test-results/`. GitHub Actions runs these checks too.

For real API verification, run `npm run test:live`. It uses the public configuration from `.env.local` and only reads anonymous gallery rows by default. To test writes and Storage isolation, use dedicated customer and existing authorized admin accounts; see [security checks](docs/SECURITY.md). Never paste their passwords into issues, PRs or chat.

See [verification results](docs/VERIFICATION.md) for exactly what ran, what failed to run and remaining blockers.

## Five-member collaboration

| Member | Suggested focus | Reviewer |
| --- | --- | --- |
| 1 | Customer auth/profile | 2 |
| 2 | Admin access/security checks | 3 |
| 3 | Gallery/Storage | 4 |
| 4 | Portfolio/responsive design | 5 |
| 5 | PWA, CI and integration | 1 |

Agree actual names as a group. Branch from updated main as `feature/US01-description` or `fix/description`. Use small commits. Before a PR, run clean install, lint, tests and build; include actual test evidence. One other member reviews. Merge only with owner approval and passing relevant acceptance checks. The owner should require PR reviews and Verify checks on main; branch protection has not been configured here. Kanban has not been changed.

## Vercel, Auth and PWA

Existing production homepage: https://then-frame-app-forge.vercel.app. The current main commit has a successful Vercel status. This PR is not a production deployment.

Vite build command: `npm run build`; output: `dist`. Set both VITE variables in the intended Vercel environment and rebuild after changes. Confirm the real production Site URL and trusted redirect URLs in Supabase Auth. Email confirmation redirects to `/?auth=confirmed`; recovery to `/?auth=password`. Query-based callbacks leave the URL fragment available for Supabase tokens. Use hash routes so navigation works on static hosting without server rewrites.

The owner has approved Vercel Preview deployment of this feature branch for online testing. The branch ignore rule was removed; main remains unchanged and must not be merged without approval. Preview uses the configured Supabase project, so live authentication/RLS acceptance is still required. Preview URL: https://then-frame-app-forge-git-feature-sprint1-burgu-a5004e-phangsx25.vercel.app

The PWA plugin and temporary PNG install icons are preserved. Manifest colors follow the wine theme. Only the static app shell is precached; no Supabase API or private image runtime cache is configured. Login, registration, galleries and uploads need internet. Verify install/offline shell/update behavior on the deployed HTTPS URL before the demo.


## Account management update

Customers and admins have Account settings in the sidebar and profile menu. They can edit their name, request a confirmed email change, change password using the current password, request a verification nonce when required, and sign out this/all/other devices. The displayed name uses Auth metadata, then a non-generic profile name, then the email prefix; it never invents a person’s name or uses Customer as the person’s name.

`supabase/functions/account-admin/` contains the protected account service: server-verified JWT and database admin role, paginated account list, customer invitation, name editing, reset-email requests, enabling/disabling and confirmed customer deletion. It never exposes passwords or promotes users, and protects all admin accounts from disabling/deletion. Server credentials stay in Supabase’s function environment. The function is **prepared but not deployed**: activation requires owner approval. It accepts only the production and named Preview origins plus localhost ports 5173/4173. Add a trusted origin in source before using a new host.

The first admin must be explicitly designated by the project owner. There is no pre-made admin password. Use the designated person’s existing Auth account and password, or the password reset email. Public `/#/admin/setup` explains this workflow.

The inspected database currently permits only own-profile SELECT. Self-service names therefore update normal Auth user metadata. `supabase/migrations/20261113113000_sync_account_display_name.sql` adds a narrowly scoped, non-public trigger to sync a user-entered name back to profiles without touching roles. This migration is **prepared but not applied** pending owner approval; names still display from Auth metadata meanwhile. Do not grant unrestricted profile UPDATE to customers.

No existing account, role or user data was modified by this update. Permanent customer deletion is a deliberate admin action requiring the exact account email, and existing FK/Storage constraints can refuse it. Disabling a user or signing out sessions does not immediately invalidate existing access tokens.
