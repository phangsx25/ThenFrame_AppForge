# Five-member Sprint 1 task allocation

This is a proposed allocation. Replace Member 1–5 with actual names. Most Sprint 1 UI/code already exists; these tasks complete live acceptance, remaining fixes and integration. Do not rebuild the app.

| Member | Story / area | Remaining tasks | Acceptance evidence |
| --- | --- | --- | --- |
| 1 — admin owner | US02: Admin secure login (3 points) | Maintain protected admin access and verify customer denial of gallery mutations. Customer account administration is excluded. | Admin login works; customers cannot access admin gallery operations. |
| 2 | US01: Customer registration/login (3 points), self-service settings | Verify registration with a real test email, confirmation, name edits, email change, password recovery/change and signout scopes. Name-sync trigger was activated on 14 November 2026. Check any missing resend-confirmation flow. | A test user registers as customer, name persists across reload, old password fails after reset, and logout works. Never include passwords/tokens in evidence. |
| 3 | US03: Gallery management (5 points) | Test collection/photo CRUD and private Storage using only disposable fixtures. Align UI with inspected constraints: bucket is 8 MB; style max 80; description constraint 1–3000. Verify object-path validation and both visibility levels. | Admin upload/edit/hide/publish/delete works; rejected uploads do not create metadata; cleanup is scoped and visible on failure. |
| 4 | US04: Public portfolio (5 points) | Verify actual published test collections, search/style filter, collection detail, photo viewer and desktop/mobile keyboard behavior. Test signed-out visitors and hidden collections/photos. Use partner-approved imagery. | Only public/public content is visible and downloadable; hidden paths are denied; signed-link expiry is explained. Preserve the wine theme. |
| 5 | SETUP-01: PWA, deployment and integration (no extra points) | Check Vercel Preview env configuration/protection and Supabase email redirect allowlist. Verify install/offline shell/update behavior and temporary icons. Collect live acceptance evidence, keep CI green and review the documented dev-dependency audit. | A shared Preview works for authorized teammates, confirmation/reset links return to the app, PWA install/update is demonstrated, and secrets are absent from source. |

Total story points stay 16. Points are not individual working hours. Every member should review another member's PR.

## Current verified state

- Account settings and gallery/portfolio code are on feature/sprint1-burgundy-wireframes.
- 41 behavioral/security tests and eight browser transport flows passed in GitHub Actions. Browser requests are intercepted; these do not prove live RLS.
- The owner-authorized existing account has been assigned the admin role and display name. No shared or hardcoded admin password exists.
- The supplied desired password did not authenticate as the existing password. A normal recovery-email request was accepted. The account owner must complete that email flow; no password was read or directly rewritten.
- Read-only Supabase inspection verified profiles, registration trigger, policies, constraints and private bucket configuration.
- Profile-name synchronization was activated on 14 November 2026. The Accounts page and undeployed account-admin service source were removed as out of scope.
- Main is not merged. Production remains on the original main; the new app runs at the approved Preview URL.

## Collaboration

1. Each member uses their own GitHub account. The repository owner adds them under Settings → Collaborators → Add people.
2. Work in the same repository on focused feature branches. Open PRs and have another member review. Do not overwrite or force-push others' work.
3. All members use the same agreed Supabase project for integration, with their own app test accounts. Console access is needed only by members who manage backend configuration.
4. The owner can keep a single Vercel project linked to the repository. Teammates do not need separate Vercel deployments just to develop or test the app. A protected Preview must be shared with the required access; a Vercel account alone does not grant access.
5. Give teammates only the shared project URL and publishable browser key for local setup. Service/secret keys and account passwords do not belong in the repository.
6. An app login, a GitHub collaborator account, a Supabase dashboard account and a Vercel account are separate identities. Do not reuse a shared login for the whole group.

Preview: https://then-frame-app-forge-git-feature-sprint1-burgu-a5004e-phangsx25.vercel.app

## Later sprints

Booking requests/statuses, private-client assignment, photo proof selection/final delivery, heritage content, B40 support flow, AI categorization and FAQ chatbot are not marked complete by this Sprint 1 implementation.
