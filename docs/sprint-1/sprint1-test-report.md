# Sprint 1 — Test Report

**Scope:** US01–US04, 5–18 November 2026.
**Status:** Password recovery and username-login verification recorded; remaining acceptance cases await execution.
**Requirements:** [Sprint 1 stories](sprint1-user-story.md). Existing historical checks and their limits remain in [VERIFICATION.md](../VERIFICATION.md); this template does not reset or replace those records.

Work progress and responsibility are recorded in the [shared daily log](../daily-log.md). This report records test steps, actual outcomes, defects and retest evidence.

## Test session

| Field | Value |
| --- | --- |
| Actual execution date / time | 14 November 2026 (Asia/Kuala_Lumpur); exact manual test time not recorded |
| Tester(s) | Phang (live recovery confirmation); automated checks performed during the fix. Remaining acceptance cases: Awwab (QA) — US01 #58, US02 #60, US03 #52, US04 #61 |
| Branch / commit / deployment URL | main / `05a51549ef40c8b97a0364f24e20f267eb720059` / https://then-frame-app-forge.vercel.app |
| Browser / device / viewport | Automated browser checks: headless Microsoft Edge; manual browser/device not recorded |
| Environment and test account roles | Production user recovery flow (manual); synthetic customer and intercepted Auth/profile responses (browser regression) |
| Test data and cleanup plan | Automated checks used synthetic credentials and did not send real emails or change real account passwords. Manual test used a fresh reset email; no reset links or credentials retained here. |

Tests are grouped by user story and reference the numbered acceptance criteria in the story document. Record actual execution dates and testers for each case; leave unexecuted cases as **Not run**. Existing supporting checks retain their original scope and do not automatically pass an acceptance criterion.

## US01 — Customer registration and login

Requirements: [US01 acceptance criteria](sprint1-user-story.md#us01--customer-registration-and-login).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US01-AC01 | 1 | Register a disposable account with name, username, email and password. | New users can register with a name, unique username, email address and valid password. | Username format, case normalization and duplicate rejection are enforced by the database trigger; the disposable account was created. Full browser signup with email confirmation is not recorded. | Partial | Tested during development | 15 November 2026 | [USER01](#username-login-validation--15-november-2026); signup email delivery pending |
| US01-AC02 | 2 | Log in with the correct username and password. | Registered users log in with their username and password. | A customer session was established; logging in again in the browser after a username change also succeeded. | Pass — live API and local browser | Tested during development | 15 November 2026 | [USER02, USER03](#username-login-validation--15-november-2026) |
| US01-AC03 | 3 | Log in with a wrong password, then with an unknown username. | Incorrect login details display an error message. | Both cases returned the same generic error message. | Pass — live API and UI unit test | Tested during development | 15 November 2026 | [USER02](#username-login-validation--15-november-2026) |
| US01-AC04 | 4 | Register with an existing email; register with an existing username in different letter case. | Duplicate email registration is prevented; usernames are unique and case-insensitive. | Duplicate and case-variant usernames were rejected. Duplicate-email guidance was checked only in a UI unit test with a mocked Auth response (tests/auth.test.jsx), not against live signup. | Partial | Tested during development | 15 November 2026 | [USER01](#username-login-validation--15-november-2026); `8efa56e` |
| US01-AC05 | 5 | Log out, then open a protected account page. | Users can log out and cannot access protected account pages after logging out. | Logout completed in the browser. Opening a protected page after logout was not recorded. | Partial | Tested during development | 15 November 2026 | [USER03](#username-login-validation--15-november-2026) |

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
| US02-AC01 | 1 | TBD | Authorized admins log in with their username and password. | TBD | Not run | TBD | TBD | TBD |
| US02-AC02 | 2 | TBD | Successful admin login redirects to the admin dashboard. | TBD | Not run | TBD | TBD | TBD |
| US02-AC03 | 3 | TBD | Incorrect login details display an error message. | TBD | Not run | TBD | TBD | TBD |
| US02-AC04 | 4 | TBD | Regular customers cannot access admin-only pages. | TBD | Not run | TBD | TBD | TBD |
| US02-AC05 | 5 | TBD | Admins can log out, and protected dashboard pages cannot be accessed after logout. | TBD | Not run | TBD | TBD | TBD |
| US02-AC06 | 6 | TBD | Public users cannot register themselves as administrators. | TBD | Not run | TBD | TBD | TBD |

## US03 — Gallery management

Requirements: [US03 acceptance criteria](sprint1-user-story.md#us03--gallery-management).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US03-AC01 | 1 | TBD | Logged-in admins can upload wedding photos to the system. | TBD | Not run | TBD | TBD | TBD |
| US03-AC02 | 2 | TBD | Admins can create a gallery collection with a title, description and event type. | TBD | Not run | TBD | TBD | TBD |
| US03-AC03 | 3 | TBD | Admins can add uploaded photos to a selected collection. | TBD | Not run | TBD | TBD | TBD |
| US03-AC04 | 4 | TBD | Admins can view, edit and delete their uploaded photos and collections. | TBD | Not run | TBD | TBD | TBD |
| US03-AC05 | 5 | TBD | The system accepts JPG/JPEG, PNG and WebP images up to 8 MB (8,388,608 bytes) per file, and rejects unsupported file types or larger files. | TBD | Not run | TBD | TBD | TBD |
| US03-AC06 | 6 | TBD | Uploaded photos and collection details remain saved after refreshing the page. | TBD | Not run | TBD | TBD | TBD |
| US03-AC07 | 7 | TBD | Regular customers and visitors cannot access photo upload or gallery management functions. | TBD | Not run | TBD | TBD | TBD |

## US04 — Public portfolio browsing

Requirements: [US04 acceptance criteria](sprint1-user-story.md#us04--public-portfolio-browsing).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US04-AC01 | 1 | TBD | Visitors can browse public wedding photography collections without logging in. | TBD | Not run | TBD | TBD | TBD |
| US04-AC02 | 2 | TBD | Visitors can open a collection to view its wedding photos and details. | TBD | Not run | TBD | TBD | TBD |
| US04-AC03 | 3 | TBD | Visitors can browse and filter collections by event type. | TBD | Not run | TBD | TBD | TBD |
| US04-AC04 | 4 | TBD | Only photos and collections marked as public are displayed to visitors. | TBD | Not run | TBD | TBD | TBD |
| US04-AC05 | 5 | TBD | The gallery works properly on both mobile and desktop screens. | TBD | Not run | TBD | TBD | TBD |
| US04-AC06 | 6 | TBD | The system displays a message when a collection has no photos. | TBD | Not run | TBD | TBD | TBD |
| US04-AC07 | 7 | TBD | Visitors cannot upload, edit or delete gallery photos or collections. | TBD | Not run | TBD | TBD | TBD |
| US04-AC08 | 8 | TBD | The homepage displays the three most recently published public collections in Latest Work, with links to each collection and View All; private collections are excluded and ordinary edits do not change publication order. | TBD | Not run | TBD | TBD | See [Latest Work verification](#latest-work-verification--15-november-2026); browser acceptance pending. |

### Latest Work verification — 15 November 2026

- Homepage preview uses the three latest public collections and offers View All. The public collection request sorts by publication time descending; private collections are excluded.
- Live database assertions passed for private creation, publishing, editing without changing publication time, and republishing. Temporary records were rolled back. All existing public collections have a publication timestamp; historical values fall back to creation time.
- Automated verification: 56 tests passed; lint, production build and whitespace checks passed. Browser verification of this homepage change remains pending.

## Automated checks

| Command / check | Actual date and commit | Result | Evidence |
| --- | --- | --- | --- |
| npm run lint | 14 November 2026 / `05a5154` | Pass | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43609938325) |
| npm test | 14 November 2026 / `05a5154` | Pass — 46 tests across 4 files | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43609938325) |
| npm run build | 14 November 2026 / `05a5154` | Pass — production/PWA build | Local execution; [Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43609938325) |
| npm audit --omit=dev | TBD | Not recorded in this session | TBD |

## Defects and retesting

| Defect | Related test | Severity | Owner | Fix commit | Retest result / evidence |
| --- | --- | --- | --- | --- | --- |
| RESET-01: Email redirected to the old Sites home page; recovery event was not handled explicitly. | US01-RESET01–03 | Blocks password recovery | Phang | `ac900f6` | User confirmed recovery routing works after correction; automated frontend regression passed. |
| RESET-02: Same-tab expired-link navigation retained the earlier callback error state. | US01-RESET04 | Incorrect link-error feedback | Phang | `05a5154` | Vitest and deployed frontend expiry checks passed. |

## Session outcome

- Recovery checks: 4 passed with evidence types shown under US01; 1 live login check not run. The 26 acceptance cases remain unexecuted in this report; existing historical evidence is linked separately.
- Remaining risks and limitations: real new-password login and old-password rejection are not yet confirmed. Mocked API success does not establish a real server-side password update.
- Test-data cleanup result: automated browser checks created no live accounts, sent no emails and made no real password changes. No shared recovery link was redeemed by the agent.
- Acceptance decision and reviewer: TBD; passing tests alone does not establish the full Definition of Done.
