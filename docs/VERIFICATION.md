# Development status and record

## Password recovery routing fix

The reported recovery email targeted the old Sites hostname rather than the current
Vercel application. The owner reported saving the corrected production Site URL and
callback allowlist. Configuration was not independently read back by the agent.

The frontend now captures non-secret callback intent before SDK initialization,
routes `PASSWORD_RECOVERY` events to the password form even after token removal,
keeps signup confirmation separate, and displays an expired-link message even if
an existing session is present. Signed-in users can open the reset-request form.

Verification: all 46 Vitest cases, lint and production/PWA build passed. A local
Edge browser using the installed Supabase SDK and intercepted Auth/profile API
responses passed root recovery callback, password submission, reload and expired
link handling. This does not establish actual email delivery or a real account
password change. Fresh email → production form → password update → old/new password
login checks remain live acceptance steps. The shared recovery URL was not opened
or redeemed. See [configuration guidance](SECURITY.md#password-recovery-configuration).

A production smoke check also identified same-tab navigation to an expired-link
fragment retaining the earlier page's error state. Callback errors are now read
on route changes, and a fresh valid recovery event clears previous errors. A
regression test covers this sequence.

## Current status — 14 November 2026

Sprint 1 core Auth, gallery management and public portfolio are implemented.
Implementation and mocked tests are separate from full live acceptance. Sprint 2
Booking functionality has not been implemented; Booking and Heritage are notices.

### Completed work

- Admin password login and database admin role were verified. No password is stored
  in the repository. Customers register themselves.
- Gallery bucket was inspected: private, 8,388,608-byte limit, JPEG/PNG/WebP allowed.
  Frontend limits match. Description is required (1–3000 trimmed characters), as
  is category/style (1–80). JPG aliases upload as canonical image/jpeg.
- RLS is enabled on profiles and gallery tables. Inspected policies restrict gallery
  writes to admin and public photo/object reads to public collection + public photo.
- Live admin/anonymous checks passed for temporary PNG upload, metadata create/edit,
  all four public/hidden combinations, fresh signed URLs, direct downloads and an
  unauthorized collection update. The exact fixtures were cleaned up. This does not
  establish all authenticated-customer permissions or every write restriction.
- The actual database path constraint passed JPG/PNG/WebP cases and rejected wrong
  collection, SVG and traversal cases. An earlier manually reconstructed expression
  gave an incorrect result; no constraint change was needed.
- Display-name sync was activated. A rolled-back transaction verified Auth metadata
  syncs to profiles without changing the admin role. Direct customer/anonymous
  execution is revoked. The migration remains in source.
- Out-of-scope admin customer-account management was removed, including its
  undeployed service. Profile/security settings remain behind the avatar.
- Wedding categories are Traditional Malay, Modern Malay, Engagement/Pertunangan
  and Wedding Reception/Majlis Resepsi. Planned AI is enquiry/booking summaries
  (US08) and FAQ chatbot (US11), not photo categorization.

### Work kept separate

The unmerged fix/sprint1-completion workspace adds duplicate-signup guidance,
consistent public Wedding category labels and irreversible confirmation for
populated-collection deletion. Its 40 unit tests, lint and build passed locally.
These changes are not part of this Sprint 2 cleanup branch yet.

### Outstanding acceptance, assigned separately from feature development

Real customer registration/confirmation, session refresh/logout, password recovery,
email delivery/redirects, authenticated customer denial paths, JPEG/WebP live uploads,
previously issued link expiry, responsive accessibility and PWA install/offline/update
still require appropriate manual evidence. Signed URLs may remain valid for 60 seconds
after hiding. Database and Storage changes are separate operations with partial-failure
risks. Never treat empty anonymous results as proof of isolation.

## Earlier evidence

Before cleanup, the main baseline passed 36 Vitest cases, lint and build locally.
Earlier GitHub Actions also exercised intercepted browser flows with Playwright;
these were mocked transport checks and did not prove live RLS. Historical run:
https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43419614754

The team selected Vitest plus manual testing. Playwright source, configuration,
script, direct dependency and CI steps were removed during Sprint 2 cleanup.
Production dependency audit was previously clean; development dependency findings
were documented earlier and should be rechecked rather than assumed current.

## Sprint 2 cleanup

Removed five unused assets and three CSS rules left by the removed Accounts page.
README now covers setup, stack and collaboration; SECURITY covers backend rules and
manual checks; this file records status/history. The separate proposed TEAM_TASKS
allocation was removed; ownership belongs in GitHub Kanban. No live database change
or deployment is part of this cleanup. New verification results are recorded below.

Cleanup verification: clean npm ci, lint, all 36 Vitest tests, production/PWA build
and production dependency audit passed (zero production vulnerabilities). The lockfile
was regenerated from an empty dependency directory after optional-dependency gaps
caused npm ci failures. The local Node 24.13 runtime emitted engine warnings for
jsdom/w3c-xmlserializer; use Node 24.15 or newer within the 24 LTS line.
