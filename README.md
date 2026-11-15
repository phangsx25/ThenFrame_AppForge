# ThenFrame

[Backlog](docs/PRODUCT_BACKLOG.md) | [Daily Log](docs/daily-log.md) | [Sprint 1](docs/sprint-1/README.md) | [Sprint 2](docs/sprint-2/README.md) | [Sprint 3](docs/sprint-3/README.md) | [Sprint 4](docs/sprint-4/README.md)

Wedding photography portfolio and gallery management PWA.

Browse the [documentation index](docs/README.md) for sprint plans, daily logs,
test reports, user review and progress tracking.

Product requirements, user stories and Sprint 1 acceptance criteria are in
[PRODUCT_BACKLOG.md](docs/PRODUCT_BACKLOG.md), transcribed from the original backlog PDF.
Sprint progress is shown in [Sprint 1 Burndown](docs/sprint-1/sprint1-burndown.md).
Manage task statuses on the [GitHub Projects Kanban](https://github.com/users/phangsx25/projects/1).
Hourly burndown synchronization is configured in GitHub Actions; see
[activation and credential setup](docs/BURNDOWN_SYNC.md).

## Stack

- Frontend: React, Vite, Tailwind CSS
- PWA: vite-plugin-pwa
- Backend, database, Auth and Storage: Supabase
- Hosting: Vercel
- Testing: Vitest and manual testing
- Planned AI: Gemini API for enquiry/booking summaries (US10) and FAQ chatbot (US11)
- Runtime: Node.js 24 LTS (24.15 or newer) and npm
- Repository, collaboration and Kanban: GitHub

## Local setup

```sh
git clone https://github.com/phangsx25/ThenFrame_AppForge.git
cd ThenFrame_AppForge
git switch sprint-2
npm ci
```

Copy `.env.example` to `.env.local` and fill the Supabase URL and publishable key
provided privately by the project owner. On PowerShell:

```powershell
Copy-Item .env.example .env.local
npm run dev
```

Only the URL and publishable key belong in browser configuration. Never commit
passwords, secret/service-role keys or `.env.local`. Restart Vite after env changes.
Use the agreed existing Supabase project; do not recreate or clear its tables.

## Implemented scope

- US01: registration, username/password login, sessions, logout and email-based password recovery. Customers and admins use username/password only; usernames can be changed in Account settings.
- US02: admin login and profile-role checks; protected pages fail closed.
- US03: collection/photo CRUD, captions, Public/Private visibility and JPG/JPEG,
  PNG or WebP uploads up to 8 MB. Admins can confirm deletion of a collection
  together with its photos and stored files; partial failures are reported.
- US04: public collections, search/event-type filtering, details and photo viewer.
- Users open their own profile/security settings through the avatar. Customers
  register themselves; admin customer-account management is outside scope.
- Booking and Heritage navigation currently show later-sprint notices.

UI uses the wine editorial theme and intentional placeholders. Public photographs
come from Supabase. Enquiries and booking/consultation management (US05–US06), Heritage (US07), private albums and
selection/delivery (US08–US09), AI summaries (US10), FAQ chatbot (US11) and feedback (US12) remain planned. No AI photo categorization is planned or implemented.

## Portfolio classification

Collections use event types: Akad / Nikah, Reception, Akad & Reception, Engagement, Pre/Post Wedding, Others. Admin and visitor screens use the same Event type terminology. The existing database `style` column stores this value for compatibility; no columns or existing collection values are removed. Legacy custom values remain editable until the owner reclassifies them. Portfolio uploads remain photographs only, with the existing 8 MB limit.

## Username login

New registrations require a unique username (3–40 characters, starting with a letter; letters, numbers and underscores). Names are case-insensitive. Email is still required for confirmation and password recovery.

The `username-login` Supabase Edge Function privately resolves usernames and verifies passwords through Auth. A service-only RPC limits attempts to 10 per username per 15 minutes; generic failures do not disclose emails. Its platform JWT check is disabled because it is a pre-login credential exchange, while password validation is performed inside the handler. Both login forms accept username/password only. Assign and communicate usernames to existing users before enabling the frontend; their passwords and roles remain unchanged.

The additive migration in `supabase/migrations/20261115104633_username_login.sql` preserves existing roles, emails and passwords. Apply it and deploy the function before deploying the frontend to a separate environment. Keep backend elevated keys in Edge Function environment variables only.

## Development checks

```sh
npm run lint
npm test
npm run build
npm audit --omit=dev
```

Vitest uses mocked Supabase responses and does not prove live permissions. Manual
browser checks cover device layout, real Auth flows, navigation and PWA behavior.
GitHub Actions runs install, lint, Vitest, build and the production dependency audit.
Backend inspection and optional live fixtures are described in [SECURITY.md](docs/SECURITY.md).
Current status and development history are in [VERIFICATION.md](docs/VERIFICATION.md).

## Hosting and collaboration

Vercel builds with `npm run build` and serves `dist`. Production URL:
https://then-frame-app-forge.vercel.app. Confirm the actual deployment status in
Vercel; a source push alone does not establish deployment success.

Set the two browser env variables in each intended Vercel environment. Supabase
must allow the trusted site's `/?auth=confirmed` and `/?auth=password` callbacks.
The app uses hash routes. PWA icons and static shell precaching remain; Supabase
responses and private images are not configured for runtime caching. Auth and
gallery operations require internet. Install/offline/update behavior needs manual
checks on HTTPS.

Use focused branches and PRs, keep main stable, and have another member review.
The Sprint 2 integration branch is `sprint-2`. The unmerged `fix/sprint1-completion`
work must be integrated separately. Git branches do not isolate the shared database;
coordinate schema changes and keep migrations version controlled.
