# Sprint 1 — Test Report

**Scope:** US01–US04, 5–18 November 2026.
**Status:** Password recovery and username-login verification recorded; remaining acceptance cases await execution.
**Requirements:** [Sprint 1 stories](sprint1-user-story.md). Existing historical checks and their limits remain in [VERIFICATION.md](../VERIFICATION.md); this template does not reset or replace those records.

Work progress and responsibility are recorded in the [shared daily log](../daily-log.md). This report records test steps, actual outcomes, defects and retest evidence.

## Test session

| Field | Value |
| --- | --- |
| Actual execution date / time | 14 November 2026 (Asia/Kuala_Lumpur); exact manual test time not recorded |
| Tester(s) | Phang (live recovery confirmation); automated checks performed during the fix |
| Branch / commit / deployment URL | main / `05a51549ef40c8b97a0364f24e20f267eb720059` / https://then-frame-app-forge.vercel.app |
| Browser / device / viewport | Automated browser checks: headless Microsoft Edge; manual browser/device not recorded |
| Environment and test account roles | Production user recovery flow (manual); synthetic customer and intercepted Auth/profile responses (browser regression) |
| Test data and cleanup plan | Automated checks used synthetic credentials and did not send real emails or change real account passwords. Manual test used a fresh reset email; no reset links or credentials retained here. |

## Acceptance results

For each criterion, fill concrete steps and test data, expected/actual results and evidence. Use Pass, Fail, Blocked or Not run. Test real permission boundaries with anonymous, customer and admin accounts as relevant; distinguish mocked tests from live backend checks.

| Test ID | Expected behavior / acceptance criterion | Steps / test data | Actual result | Status | Evidence / defect |
| --- | --- | --- | --- | --- | --- |
| US01-AC01 | New users can register with a name, unique username, email address and valid password. | TBD | TBD | Not run | TBD |
| US01-AC02 | Registered users can log in with their username and password; existing accounts retain email fallback. | TBD | TBD | Not run | TBD |
| US01-AC03 | Incorrect login details display an error message. | TBD | TBD | Not run | TBD |
| US01-AC04 | Duplicate email registration is prevented; usernames are unique and case-insensitive. | TBD | TBD | Not run | TBD |
| US01-AC05 | Users can log out and cannot access protected account pages after logging out. | TBD | TBD | Not run | TBD |
| US02-AC01 | Authorized admins can log in with username and password; existing admins retain email fallback. | TBD | TBD | Not run | TBD |
| US02-AC02 | Successful admin login redirects to the admin dashboard. | TBD | TBD | Not run | TBD |
| US02-AC03 | Incorrect login details display an error message. | TBD | TBD | Not run | TBD |
| US02-AC04 | Regular customers cannot access admin-only pages. | TBD | TBD | Not run | TBD |
| US02-AC05 | Admins can log out, and protected dashboard pages cannot be accessed after logout. | TBD | TBD | Not run | TBD |
| US02-AC06 | Public users cannot register themselves as administrators. | TBD | TBD | Not run | TBD |
| US03-AC01 | Logged-in admins can upload wedding photos to the system. | TBD | TBD | Not run | TBD |
| US03-AC02 | Admins can create a gallery collection with a title and description. | TBD | TBD | Not run | TBD |
| US03-AC03 | Admins can add uploaded photos to a selected collection. | TBD | TBD | Not run | TBD |
| US03-AC04 | Admins can view, edit and delete their uploaded photos and collections. | TBD | TBD | Not run | TBD |
| US03-AC05 | The system accepts JPG/JPEG, PNG and WebP images up to 8 MB (8,388,608 bytes) per file, and rejects unsupported file types or larger files. | TBD | TBD | Not run | TBD |
| US03-AC06 | Uploaded photos and collection details remain saved after refreshing the page. | TBD | TBD | Not run | TBD |
| US03-AC07 | Regular customers and visitors cannot access photo upload or gallery management functions. | TBD | TBD | Not run | TBD |
| US04-AC01 | Visitors can browse public wedding photography collections without logging in. | TBD | TBD | Not run | TBD |
| US04-AC02 | Visitors can open a collection to view its wedding photos and details. | TBD | TBD | Not run | TBD |
| US04-AC03 | Visitors can view different wedding photography styles and collections. | TBD | TBD | Not run | TBD |
| US04-AC04 | Only photos and collections marked as public are displayed to visitors. | TBD | TBD | Not run | TBD |
| US04-AC05 | The gallery works properly on both mobile and desktop screens. | TBD | TBD | Not run | TBD |
| US04-AC06 | The system displays a message when a collection has no photos. | TBD | TBD | Not run | TBD |
| US04-AC07 | Visitors cannot upload, edit or delete gallery photos or collections. | TBD | TBD | Not run | TBD |

## Password recovery regression — US01 account security

These checks supplement the original US01 criteria; they do not mark unrelated registration, login or logout cases as passed.

| Test ID | Steps / expected result | Actual result | Status | Evidence |
| --- | --- | --- | --- | --- |
| US01-RESET01 | Request a fresh reset email from the production Forgot password page and follow it to the recovery flow instead of the home page. | Phang confirmed that the recovery flow was working after the corrected deployment and updated Supabase URL configuration. This confirms the reported recovery-routing problem is resolved; individual save/login steps were not separately described. | Pass — user-confirmed routing | Conversation confirmation, 14 November 2026; no screenshot supplied. |
| US01-RESET02 | Confirm the reset request targets the production `/?auth=password` callback. | Correct callback observed in the deployed frontend's intercepted Auth request. | Pass — mocked API browser check | Production Edge smoke check; no real email sent by automation. |
| US01-RESET03 | A recovery callback without a query marker must open the password form after SDK token consumption; submitting matching passwords calls updateUser. | Installed Supabase SDK routed to the form, submitted the expected password to the intercepted endpoint and showed success; tokens were absent from the resulting URL. | Pass — mocked API browser check | Local and production frontend browser regression; Vitest coverage. |
| US01-RESET04 | Open an expired link in the same tab; an existing session must not hide the link error. A new valid recovery event must clear the old error. | Expiry message displayed; invalid-link form blocked; valid recovery event restored the password form. | Pass — automated | Production expiry smoke check and Vitest regression. |
| US01-RESET05 | After a real password save, log in with the new password and verify the old password is rejected. | Not separately confirmed by the user or exercised against a real account by automation. | Not run | Requires explicit live login results. |

## Username login validation — 15 November 2026

Username/password is now the default for customer and admin login. Email remains required for confirmation/recovery and available as a fallback for existing accounts. These are feature verification results, not Product Owner acceptance or proof of real customer adoption.

| Test ID | Check | Actual result | Status / evidence |
| --- | --- | --- | --- |
| US01-USER01 | Normalize and validate usernames; prevent duplicate registration. | Case normalized, invalid format and duplicate names rejected by database constraints/trigger. | Pass — unit tests and rolled-back database fixtures. |
| US01-USER02 | Verify correct, wrong and unknown username/password combinations. | Correct credentials established a normal customer session; wrong and unknown combinations returned the same generic failure. | Pass — live disposable-account API checks and unit UI coverage. |
| US01-USER03 | Change own username and log in again. | Own update succeeded; previous username failed; new username succeeded. Browser covered settings, logout and changed-username login. | Pass — live API and local Edge browser with real backend. |
| US01-USER04 | Prevent public email lookup or role/username tampering through metadata. | Anonymous/customer RPC lookup denied; profiles isolated; direct role update denied; editable Auth metadata did not overwrite profile username/role. | Pass — live fixture and rolled-back role checks. |
| US01-USER05 | Preserve admin boundaries and existing email fallback. | A customer was rejected by the admin login and signed out; explicit email fallback rendered and unit-tested. Existing account count/roles preserved. | Pass — live browser and unit tests; existing owner's actual username login not claimed. |
| US01-USER06 | Enforce persistent login-attempt limits. | Attempts above 10 per username per 15-minute window were rejected before private lookup. | Pass — rolled-back database test and handler regression test. |

A dedicated temporary confirmed customer account was used for integration checks, with no email sent and no changes to existing users' passwords. Cleanup status is recorded in the verification log. New signup email delivery and the existing owner's chosen username still require their own manual acceptance. Earlier password-recovery evidence above remains separately scoped.

For the username change, all **55 tests**, lint and production/PWA build passed.
[CI verification](https://github.com/phangsx25/ThenFrame_AppForge/actions/runs/43707900774)
passed for `9f7da33`; Vercel reported production READY. A production-browser run
was not authorized, so the browser evidence in this section is local frontend →
real backend only. The temporary test account/profile and its known login-attempt
records were removed; readback confirmed the original two accounts/profiles remain.

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

- Recovery checks: 4 passed with evidence types shown above; 1 live login check not run. The 25 original acceptance cases remain unexecuted in this report; existing historical evidence is linked separately.
- Remaining risks and limitations: real new-password login and old-password rejection are not yet confirmed. Mocked API success does not establish a real server-side password update.
- Test-data cleanup result: automated browser checks created no live accounts, sent no emails and made no real password changes. No shared recovery link was redeemed by the agent.
- Acceptance decision and reviewer: TBD; passing tests alone does not establish the full Definition of Done.
