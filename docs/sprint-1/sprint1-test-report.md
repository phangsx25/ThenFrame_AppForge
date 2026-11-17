# Sprint 1 — Test Report

**Scope:** US01–US04, 5–18 November 2026.
**Status:** Acceptance tables filled from checks run during development: 9 Pass, 9 Partial, 3 Not run, 5 No longer applicable (US01 retired after the Sprint 1 review). QA (Awwab) completes the Partial and Not run cases: US02 [#60](https://github.com/phangsx25/ThenFrame_AppForge/issues/60), US03 [#52](https://github.com/phangsx25/ThenFrame_AppForge/issues/52), US04 [#61](https://github.com/phangsx25/ThenFrame_AppForge/issues/61).
**Requirements:** [Sprint 1 stories](sprint1-user-story.md). Existing historical checks and their limits remain in [VERIFICATION.md](../VERIFICATION.md); this template does not reset or replace those records.

Work progress and responsibility are recorded in the [shared daily log](../daily-log.md). This report records test steps, actual outcomes, defects and retest evidence.

## Two kinds of testing

This project uses Vitest and manual testing. They answer different questions, and this report keeps them apart.

| | Automated tests | Acceptance tests |
| --- | --- | --- |
| Who runs them | The computer: Vitest, with `npm test`, locally and in the GitHub **verify** check on every pull request | A person, in a real browser or on a phone |
| What they check | Application logic, such as validation, access guards and upload rules, using simulated backend responses | Each user story’s acceptance criteria, end to end, on the deployed app |
| Where results are recorded | [Automated checks](#automated-checks) | The acceptance tables under each user story |
| Current result | 74 Vitest tests and 3 burndown script tests pass | 9 Pass, 9 Partial, 3 Not run, 5 No longer applicable |

Passing automated tests does not pass an acceptance criterion by itself. In the acceptance tables, **Tested during development** means the result comes from checks made while building the feature; the Status and Evidence columns say whether that was a live check, a browser check or a unit test. Rows marked Partial or Not run still need a person to complete them.

## Test session

| Field | Value |
| --- | --- |
| Actual execution date / time | 14 November 2026 (Asia/Kuala_Lumpur); exact manual test time not recorded |
| Tester(s) | Phang (live recovery confirmation); automated checks performed during the fix. Remaining acceptance cases: Awwab (QA) — US02 #60, US03 #52, US04 #61 |
| Branch / commit / deployment URL | main / `05a51549ef40c8b97a0364f24e20f267eb720059` / https://then-frame-app-forge.vercel.app |
| Browser / device / viewport | Automated browser checks: headless Microsoft Edge; manual browser/device not recorded |
| Environment and test account roles | Production user recovery flow (manual); synthetic customer and intercepted Auth/profile responses (browser regression) |
| Test data and cleanup plan | Automated checks used synthetic credentials and did not send real emails or change real account passwords. Manual test used a fresh reset email; no reset links or credentials retained here. |

Tests are grouped by user story and reference the numbered acceptance criteria in the story document. Record actual execution dates and testers for each case; leave unexecuted cases as **Not run**. Existing supporting checks retain their original scope and do not automatically pass an acceptance criterion.

## US01 — Customer registration and login

Requirements: [US01 acceptance criteria](sprint1-user-story.md#us01--customer-registration-and-login).

US01 was retired after the Sprint 1 review with the studio manager (17 November 2026); customer accounts were removed from the website on 18 November. The results below are kept as a record. See [Sprint 1 refinement](sprint1-refinement.md#refinement-2--18-november-2026-after-the-sprint-1-user-review).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US01-AC01 | 1 | Register a disposable account with name, username, email and password. | New users can register with a name, unique username, email address and valid password. | Username format, case normalization and duplicate rejection are enforced by the database trigger; the disposable account was created. Full browser signup with email confirmation is not recorded. | No longer applicable: US01 retired after the Sprint 1 review (18 Nov) | Tested during development | 15 November 2026 | [USER01](#username-login-validation--15-november-2026); signup email delivery pending |
| US01-AC02 | 2 | Log in with the correct username and password. | Registered users log in with their username and password. | A customer session was established; logging in again in the browser after a username change also succeeded. | No longer applicable: US01 retired after the Sprint 1 review (18 Nov) | Tested during development | 15 November 2026 | [USER02, USER03](#username-login-validation--15-november-2026) |
| US01-AC03 | 3 | Log in with a wrong password, then with an unknown username. | Incorrect login details display an error message. | Both cases returned the same generic error message. | No longer applicable: US01 retired after the Sprint 1 review (18 Nov) | Tested during development | 15 November 2026 | [USER02](#username-login-validation--15-november-2026) |
| US01-AC04 | 4 | Register with an existing email; register with an existing username in different letter case. | Duplicate email registration is prevented; usernames are unique and case-insensitive. | Duplicate and case-variant usernames were rejected. Duplicate-email guidance was checked only in a UI unit test with a mocked Auth response (tests/auth.test.jsx), not against live signup. | No longer applicable: US01 retired after the Sprint 1 review (18 Nov) | Tested during development | 15 November 2026 | [USER01](#username-login-validation--15-november-2026); `8efa56e` |
| US01-AC05 | 5 | Log out, then open a protected account page. | Users can log out and cannot access protected account pages after logging out. | Logout completed in the browser. Opening a protected page after logout was not recorded. | No longer applicable: US01 retired after the Sprint 1 review (18 Nov) | Tested during development | 15 November 2026 | [USER03](#username-login-validation--15-november-2026) |

### Password recovery regression — US01 account security

These checks supplement the original US01 criteria; they do not mark unrelated registration, login or logout cases as passed.

| Test ID | Steps / expected result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- |
| US01-RESET01 | Request a fresh reset email from the production Forgot password page and follow it to the recovery flow instead of the home page. | Phang confirmed that the recovery flow was working after the corrected deployment and updated Supabase URL configuration. This confirms the reported recovery-routing problem is resolved; individual save/login steps were not separately described. | Pass — user-confirmed routing | Conversation confirmation, 14 November 2026; no screenshot supplied. |
| US01-RESET02 | Confirm the reset request targets the production `/?auth=password` callback. | Correct callback observed in the deployed frontend's intercepted Auth request. | Pass — mocked API browser check | Production Edge smoke check; no real email sent by automation. |
| US01-RESET03 | A recovery callback without a query marker must open the password form after SDK token consumption; submitting matching passwords calls updateUser. | Installed Supabase SDK routed to the form, submitted the expected password to the intercepted endpoint and showed success; tokens were absent from the resulting URL. | Pass — mocked API browser check | Local and production frontend browser regression; Vitest coverage. |
| US01-RESET04 | Open an expired link in the same tab; an existing session must not hide the link error. A new valid recovery event must clear the old error. | Expiry message displayed; invalid-link form blocked; valid recovery event restored the password form. | Pass — automated | Production expiry smoke check and Vitest regression. |
| US01-RESET05 | After a real password save, log in with the new password and verify the old password is rejected. | Not separately confirmed by the user or exercised against a real account by automation. | Not run | Requires explicit live login results. |

### Username login validation — 15 November 2026

Username/password is the only website login method for both customers and admins. Email is used for registration confirmation and password recovery only. These are feature verification results, not Product Owner acceptance or proof of real customer adoption.

| Test ID | Check | Actual result | Status / evidence |
| --- | --- | --- | --- |
| US01-USER01 | Normalize and validate usernames; prevent duplicate registration. | Case normalized, invalid format and duplicate names rejected by database constraints/trigger. | Pass — unit tests and rolled-back database fixtures. |
| US01-USER02 | Verify correct, wrong and unknown username/password combinations. | Correct credentials established a normal customer session; wrong and unknown combinations returned the same generic failure. | Pass — live disposable-account API checks and unit UI coverage. |
| US01-USER03 | Change own username and log in again. | Own update succeeded; previous username failed; new username succeeded. Browser covered settings, logout and changed-username login. | Pass — live API and local Edge browser with real backend. |
| US01-USER04 | Prevent public email lookup or role/username tampering through metadata. | Anonymous/customer RPC lookup denied; profiles isolated; direct role update denied; editable Auth metadata did not overwrite profile username/role. | Pass — live fixture and rolled-back role checks. |
| US01-USER05 | Preserve admin boundaries and username-only website login. | A customer was rejected by the admin login and signed out. Current login forms require username/password and have no email login switch. Existing account count/roles preserved. | Pass — live browser admin denial and current UI tests; existing owners' password entry not independently verified. |
| US01-USER06 | Enforce persistent login-attempt limits. | Attempts above 10 per username per 15-minute window were rejected before private lookup. | Pass — rolled-back database test and handler regression test. |

A dedicated temporary confirmed customer account was used for integration checks, with no email sent and no changes to existing users' passwords. Cleanup status is recorded in the verification log. New signup email delivery and the existing owner's chosen username still require their own manual acceptance. Earlier password-recovery evidence above remains separately scoped.

For the username change, all **55 tests**, lint and production/PWA build passed.
[CI verification](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43707900774)
passed for `9f7da33`; Vercel reported production READY. A production-browser run
was not authorized, so the browser evidence in this section is local frontend →
real backend only. The temporary test account/profile and its known login-attempt
records were removed; readback confirmed the original two accounts/profiles remain.

Username-only follow-up: 56 tests, lint and production/PWA build passed after removal of the email login switch. Both existing profiles were updated directly in Supabase with usable usernames. Passwords and roles were preserved; existing users' successful password entry is not claimed without their confirmation.

The username verification also supports US02 admin restrictions; it does not replace the US02 acceptance tests.

## US02 — Administrator login

Requirements: [US02 acceptance criteria](sprint1-user-story.md#us02--administrator-login).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US02-AC01 | 1 | Log in on the admin form with the admin username and password. | Authorized admins log in with their username and password. | Admin login and the database admin role were verified on 14 November. Admin login with the new username has not been confirmed by the account owner. | Partial | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US02-AC02 | 2 | Log in as admin and observe the landing page. | Successful admin login redirects to the admin dashboard. | Redirect to the admin dashboard was not separately recorded. | Not run | — | — | — |
| US02-AC03 | 3 | Enter a wrong password on the admin form. | Incorrect login details display an error message. | Login uses the same generic failure handling verified in [USER02](#username-login-validation--15-november-2026); the admin form itself was not tested with wrong details. | Partial | Tested during development | 15 November 2026 | [USER02](#username-login-validation--15-november-2026) |
| US02-AC04 | 4 | Sign in as a customer, then use the admin form and open an admin URL directly. | Regular customers cannot access admin-only pages. | The customer was rejected by the admin login and signed out; a direct admin URL was blocked before any gallery request. | Pass — live browser and unit test | Tested during development | 15 November 2026 | [USER05](#username-login-validation--15-november-2026); tests/auth.test.jsx |
| US02-AC05 | 5 | Log out as admin, then open the dashboard. | Admins can log out, and protected dashboard pages cannot be accessed after logout. | Admin tools are not restored after sign-out in a unit test; not checked in a browser. | Partial | Tested during development | 15 November 2026 | tests/auth.test.jsx |
| US02-AC06 | 6 | Sign up publicly and try to set an admin role through metadata or a direct update. | Public users cannot register themselves as administrators. | New accounts are forced to the customer role; role tampering and direct role updates were denied. | Pass — rolled-back database fixtures | Tested during development | 15 November 2026 | [USER04](#username-login-validation--15-november-2026) |

## US03 — Gallery management

Requirements: [US03 acceptance criteria](sprint1-user-story.md#us03--gallery-management).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US03-AC01 | 1 | As admin, upload a PNG photo. | Logged-in admins can upload wedding photos to the system. | A temporary PNG upload succeeded; the fixture was cleaned up. | Pass — live admin check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US03-AC02 | 2 | As admin, create and edit a collection with title, description and event type. | Admins can create a gallery collection with a title, description and event type. | Collection metadata was created and edited successfully. | Pass — live admin check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US03-AC03 | 3 | Upload a photo into a selected collection; try a path for a different collection. | Admins can add uploaded photos to a selected collection. | The upload was stored under the selected collection; a wrong-collection path was rejected by the database constraint. | Pass — live admin check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US03-AC04 | 4 | Edit, then delete a photo and a collection. | Admins can view, edit and delete their uploaded photos and collections. | Editing was checked live. Photo and collection deletion are covered by unit tests only. | Partial | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work); tests/gallery.test.js |
| US03-AC05 | 5 | Upload JPG, PNG and WebP files; try an SVG and a file over 8 MB. | The system accepts JPG/JPEG, PNG and WebP images up to 8 MB (8,388,608 bytes) per file, and rejects unsupported file types or larger files. | Bucket limits (8,388,608 bytes; JPEG/PNG/WebP) and the path constraint were verified; SVG and oversized files are rejected. Live JPEG and WebP uploads were not performed. | Partial | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work); tests/gallery.test.js |
| US03-AC06 | 6 | Create a collection with photos, then refresh the page. | Uploaded photos and collection details remain saved after refreshing the page. | Records were saved in the live database; a page refresh check was not recorded. | Partial | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US03-AC07 | 7 | As a visitor and as a customer, try to open gallery management or update a collection. | Regular customers and visitors cannot access photo upload or gallery management functions. | An anonymous collection update was denied live; a customer opening an admin URL was blocked. | Pass — live check and unit test | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work); tests/auth.test.jsx |

## US04 — Public portfolio browsing

Requirements: [US04 acceptance criteria](sprint1-user-story.md#us04--public-portfolio-browsing).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US04-AC01 | 1 | Without logging in, open the portfolio. | Visitors can browse public wedding photography collections without logging in. | Anonymous reads of public collections and photos succeeded. | Pass — live anonymous check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US04-AC02 | 2 | Open a public collection. | Visitors can open a collection to view its wedding photos and details. | Visitor photo requests are scoped to the collection with expiring links (unit test); a browser check was not recorded. | Partial | Tested during development | 14 November 2026 | tests/gallery.test.js |
| US04-AC03 | 3 | Filter collections by event type. | Visitors can browse and filter collections by event type. | Not recorded. | Not run | — | — | — |
| US04-AC04 | 4 | As a visitor, view all four public/hidden collection and photo combinations. | Only photos and collections marked as public are displayed to visitors. | Only public collections with public photos were returned. | Pass — live anonymous check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US04-AC05 | 5 | Open the portfolio on a phone and a desktop screen. | The gallery works properly on both mobile and desktop screens. | Only an earlier automated mobile-layout check exists (since removed); no current device check was recorded. | Partial | Tested during development | 14 November 2026 | — |
| US04-AC06 | 6 | Open a public collection with no photos. | The system displays a message when a collection has no photos. | The message exists in the code but was not tested. | Not run | — | — | — |
| US04-AC07 | 7 | As a visitor, try to update a collection. | Visitors cannot upload, edit or delete gallery photos or collections. | The unauthorized update was denied. | Pass — live anonymous check | Tested during development | 14 November 2026 | [VERIFICATION](../VERIFICATION.md#completed-work) |
| US04-AC08 | 8 | Publish, edit and republish collections, then view the homepage. | The homepage displays the three most recently published public collections in Latest Work, with links to each collection and View All; private collections are excluded and ordinary edits do not change publication order. | Database assertions passed for publication order and private exclusion; the homepage was not checked in a browser. | Partial | Tested during development | 15 November 2026 | [Latest Work verification](#latest-work-verification--15-november-2026) |

### Latest Work verification — 15 November 2026

- Homepage preview uses the three latest public collections and offers View All. The public collection request sorts by publication time descending; private collections are excluded.
- Live database assertions passed for private creation, publishing, editing without changing publication time, and republishing. Temporary records were rolled back. All existing public collections have a publication timestamp; historical values fall back to creation time.
- Automated verification: 56 tests passed; lint, production build and whitespace checks passed. Browser verification of this homepage change remains pending.

## Automated checks

| Command / check | Actual date and commit | Result | Evidence |
| --- | --- | --- | --- |
| npm run lint | 17 November 2026 / `774e2eb` | Pass | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43882838433) |
| npm test (Vitest) | 17 November 2026 / `774e2eb` | Pass — 74 tests across 6 files | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43882838433) |
| npm test (burndown script, node --test) | 17 November 2026 / `774e2eb` | Pass — 3 tests | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43882838433) |
| npm run build | 17 November 2026 / `774e2eb` | Pass — production/PWA build | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43882838433) |
| npm audit --omit=dev | 17 November 2026 / `774e2eb` | Pass — 0 vulnerabilities | Local execution |

Earlier record: on 14 November 2026 (`05a5154`) lint, 46 tests across 4 files and the build passed ([Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43609938325)).

## Defects and retesting

| Defect | Related test | Severity | Owner | Fix commit | Retest result / evidence |
| --- | --- | --- | --- | --- | --- |
| RESET-01: Email redirected to the old Sites home page; recovery event was not handled explicitly. | US01-RESET01–03 | Blocks password recovery | Phang | `ac900f6` | User confirmed recovery routing works after correction; automated frontend regression passed. |
| RESET-02: Same-tab expired-link navigation retained the earlier callback error state. | US01-RESET04 | Incorrect link-error feedback | Phang | `05a5154` | Vitest and deployed frontend expiry checks passed. |

## Session outcome

- Recovery checks: 4 passed with evidence types shown under US01; 1 live login check not run. Of the 26 acceptance cases, 9 pass, 9 are partial, 3 are not run and 5 no longer apply because US01 was retired, based on checks run during development; each partial or not-run row states what still needs testing.
- Remaining risks and limitations: real new-password login and old-password rejection are not yet confirmed. Mocked API success does not establish a real server-side password update.
- Test-data cleanup result: automated browser checks created no live accounts, sent no emails and made no real password changes. No shared recovery link was redeemed by the agent.
- Acceptance decision and reviewer: TBD; passing tests alone does not establish the full Definition of Done.
