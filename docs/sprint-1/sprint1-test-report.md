# Sprint 1 — Test Report

**Scope:** US01–US04, 5–18 November 2026.
**Status:** 9 criteria passed by system tests. 12 criteria need a manual test on the live site; their result columns are blank until QA (Awwab) fills them in: US02 [#60](https://github.com/phangsx25/ThenFrame_AppForge/issues/60), US03 [#52](https://github.com/phangsx25/ThenFrame_AppForge/issues/52), US04 [#61](https://github.com/phangsx25/ThenFrame_AppForge/issues/61). 5 criteria (US01) no longer apply after the Sprint 1 review.
**Requirements:** [Sprint 1 stories](sprint1-user-story.md). Existing historical checks and their limits remain in [VERIFICATION.md](../VERIFICATION.md); this template does not reset or replace those records.

Work progress and responsibility are recorded in the [shared daily log](../daily-log.md). This report records test steps, actual outcomes, defects and retest evidence.

## Two kinds of testing

This project uses Vitest and manual testing. They answer different questions, and this report keeps them apart.

| | Automated tests | Acceptance tests |
| --- | --- | --- |
| Who runs them | The computer: Vitest, with `npm test`, locally and in the GitHub **verify** check on every pull request | A person, in a real browser or on a phone |
| What they check | Application logic, such as validation, access guards and upload rules, using simulated backend responses | Each user story’s acceptance criteria, end to end, on the deployed app |
| Where results are recorded | [Automated tests](#automated-tests) and [System tests](#system-tests) | The manual test tables under each user story |
| Current result | 74 Vitest tests and 5 burndown script tests pass | 9 Pass (system tests), 12 waiting for manual testing, 5 no longer apply (US01) |

Automated tests and system tests are recorded once, in their own sections. The tables under each user story list only the criteria that need a person to test them on the live site; fill in Actual result, Status (Pass or Fail), Tester and Date after testing.

## Test session

| Field | Value |
| --- | --- |
| Actual execution date / time | 14 November 2026 (Asia/Kuala_Lumpur); exact manual test time not recorded |
| Tester(s) | Phang (live recovery confirmation); automated checks performed during the fix. Remaining acceptance cases: Awwab (QA) — US02 #60, US03 #52, US04 #61 |
| Branch / commit / deployment URL | main / `05a51549ef40c8b97a0364f24e20f267eb720059` / https://then-frame-app-forge.vercel.app |
| Browser / device / viewport | Automated browser checks: headless Microsoft Edge; manual browser/device not recorded |
| Environment and test account roles | Production user recovery flow (manual); synthetic customer and intercepted Auth/profile responses (browser regression) |
| Test data and cleanup plan | Automated checks used synthetic credentials and did not send real emails or change real account passwords. Manual test used a fresh reset email; no reset links or credentials retained here. |

Tests are grouped by user story and reference the numbered acceptance criteria in the story document. Record actual execution dates and testers for each case; leave a manual row blank until it has been tested.

## Automated tests

| Command / check | Actual date and commit | Result | Evidence |
| --- | --- | --- | --- |
| npm run lint | 18 November 2026 | Pass | Local execution |
| npm test (Vitest) | 18 November 2026 | Pass — 74 tests across 6 files | Local execution |
| npm test (burndown script, node --test) | 18 November 2026 | Pass — 5 tests | Local execution |
| npm run build | 18 November 2026 | Pass — production/PWA build | Local execution |
| npm audit --omit=dev | 18 November 2026 | Pass — 0 vulnerabilities | Local execution |

The audit failed in CI on 18 November because of picomatch ([GHSA-fc5q-39xc-vjpf](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), no fixed version yet). picomatch is used only by build tools (Vite, Vitest, the PWA plugin). It appeared in the production audit because Tailwind, which runs only during the build, was listed under dependencies. Tailwind now sits in devDependencies, so the production audit passes; the advisory remains in the build tools and is rechecked when a fixed version is released.

Previous record: on 17 November 2026 (`774e2eb`) lint, 74 Vitest tests, 3 burndown tests, the build and the audit passed ([Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43882838433)).

Earlier record: on 14 November 2026 (`05a5154`) lint, 46 tests across 4 files and the build passed ([Verify run](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43609938325)).

## System tests

These acceptance criteria were checked with scripted tests against the live database and website, or with unit tests, during development. They need no manual test.

| Test ID | What was checked | Result | Status | Date |
| --- | --- | --- | --- | --- |
| US02-AC04 | Non-admin users cannot access admin-only pages. | A non-admin account was rejected by the admin login and signed out; a direct admin URL was blocked before any gallery request (live browser check and tests/auth.test.jsx). | Pass | 15 November 2026 |
| US02-AC06 | Public users cannot make themselves administrators. | Role tampering and direct role updates were denied (rolled-back database tests). | Pass | 15 November 2026 |
| US03-AC01 | Logged-in admins can upload wedding photos. | A temporary PNG upload succeeded and was cleaned up (live admin check). | Pass | 14 November 2026 |
| US03-AC02 | Admins can create a collection with a title, description and event type. | The collection was created and edited (live admin check). | Pass | 14 November 2026 |
| US03-AC03 | Uploaded photos are added to the selected collection. | The upload was stored under the selected collection; a wrong-collection path was rejected by the database (live admin check). | Pass | 14 November 2026 |
| US03-AC07 | Visitors and non-admins cannot use upload or gallery management. | An anonymous collection update was denied; a non-admin opening an admin URL was blocked (live check and tests/auth.test.jsx). | Pass | 14 November 2026 |
| US04-AC01 | Visitors browse public collections without logging in. | Anonymous reads of public collections and photos succeeded (live check). | Pass | 14 November 2026 |
| US04-AC04 | Only public photos in public collections are shown. | Only public collections with public photos were returned (live check). | Pass | 14 November 2026 |
| US04-AC07 | Visitors cannot upload, edit or delete photos or collections. | The update was denied (live check). | Pass | 14 November 2026 |

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

### Manual tests

Already passed by system tests: US02-AC04, US02-AC06 (see [System tests](#system-tests)).

| Test ID | Steps | Expected result | Actual result | Status | Tester | Date |
| --- | --- | --- | --- | --- | --- | --- |
| US02-AC01 | Log in on the studio login page with the studio username and password. | Authorized admins log in with their username and password. |  |  |  |  |
| US02-AC02 | Log in as admin and observe the landing page. | Successful admin login opens the studio dashboard. |  |  |  |  |
| US02-AC03 | Enter a wrong password on the studio login page. | Incorrect login details display an error message. |  |  |  |  |
| US02-AC05 | Log out, then open `#/admin` directly. | After logout, the studio dashboard cannot be opened. |  |  |  |  |

## US03 — Gallery management

Requirements: [US03 acceptance criteria](sprint1-user-story.md#us03--gallery-management).

### Manual tests

Already passed by system tests: US03-AC01, US03-AC02, US03-AC03, US03-AC07 (see [System tests](#system-tests)).

| Test ID | Steps | Expected result | Actual result | Status | Tester | Date |
| --- | --- | --- | --- | --- | --- | --- |
| US03-AC04 | Delete one photo, then delete a whole collection. | Admins can view, edit and delete their photos and collections. |  |  |  |  |
| US03-AC05 | Upload one JPG and one WebP photo. | JPG/JPEG, PNG and WebP up to 8 MB are accepted; other types and larger files are rejected. |  |  |  |  |
| US03-AC06 | Create a collection with photos, then refresh the page. | Photos and collection details remain after refreshing. |  |  |  |  |

## US04 — Public portfolio browsing

Requirements: [US04 acceptance criteria](sprint1-user-story.md#us04--public-portfolio-browsing).

### Manual tests

Already passed by system tests: US04-AC01, US04-AC04, US04-AC07 (see [System tests](#system-tests)).

| Test ID | Steps | Expected result | Actual result | Status | Tester | Date |
| --- | --- | --- | --- | --- | --- | --- |
| US04-AC02 | Without logging in, open a public collection. | Visitors can open a collection and see its photos and details. |  |  |  |  |
| US04-AC03 | In the portfolio, filter by event type. | Only collections of the chosen event type are shown. |  |  |  |  |
| US04-AC05 | Open the portfolio on a phone and on a laptop. | The layout works on both mobile and desktop. |  |  |  |  |
| US04-AC06 | Open a public collection with no photos. | A message says the collection has no photos. |  |  |  |  |
| US04-AC08 | Open the homepage and look at Latest Work. | Latest Work shows the three most recently published public collections, with links and View All; private collections do not appear. |  |  |  |  |

### Latest Work verification — 15 November 2026

- Homepage preview uses the three latest public collections and offers View All. The public collection request sorts by publication time descending; private collections are excluded.
- Live database assertions passed for private creation, publishing, editing without changing publication time, and republishing. Temporary records were rolled back. All existing public collections have a publication timestamp; historical values fall back to creation time.
- Automated verification: 56 tests passed; lint, production build and whitespace checks passed. Browser verification of this homepage change remains pending.

## Defects and retesting

| Defect | Related test | Severity | Owner | Fix commit | Retest result / evidence |
| --- | --- | --- | --- | --- | --- |
| RESET-01: Email redirected to the old Sites home page; recovery event was not handled explicitly. | US01-RESET01–03 | Blocks password recovery | Phang | `ac900f6` | User confirmed recovery routing works after correction; automated frontend regression passed. |
| RESET-02: Same-tab expired-link navigation retained the earlier callback error state. | US01-RESET04 | Incorrect link-error feedback | Phang | `05a5154` | Vitest and deployed frontend expiry checks passed. |

## Session outcome

- Acceptance criteria: 9 passed by system tests; 12 waiting for manual testing on the live site (blank rows in the US02–US04 tables); 5 no longer apply because US01 was retired. Recovery checks (US01 record): 4 passed, 1 not run.
- Remaining risks and limitations: real new-password login and old-password rejection are not yet confirmed. Mocked API success does not establish a real server-side password update.
- Test-data cleanup result: automated browser checks created no live accounts, sent no emails and made no real password changes. No shared recovery link was redeemed by the agent.
- Acceptance decision and reviewer: TBD; passing tests alone does not establish the full Definition of Done.
