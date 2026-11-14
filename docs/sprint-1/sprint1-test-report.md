# Sprint 1 — Test Report

**Scope:** US01–US04, 5–18 November 2026.  
**Status:** Template — acceptance results not yet recorded here.  
**Requirements:** [Sprint 1 stories](sprint1-user-story.md). Existing historical checks and their limits remain in [VERIFICATION.md](../VERIFICATION.md); this template does not reset or replace those records.

## Test session

| Field | Value |
| --- | --- |
| Actual execution date / time | TBD |
| Tester(s) | TBD |
| Branch / commit / deployment URL | TBD |
| Browser / device / viewport | TBD |
| Environment and test account roles | TBD (no passwords or tokens) |
| Test data and cleanup plan | TBD |

## Acceptance results

For each criterion, fill concrete steps and test data, expected/actual results and evidence. Use Pass, Fail, Blocked or Not run. Test real permission boundaries with anonymous, customer and admin accounts as relevant; distinguish mocked tests from live backend checks.

| Test ID | Expected behavior / acceptance criterion | Steps / test data | Actual result | Status | Evidence / defect |
| --- | --- | --- | --- | --- | --- |
| US01-AC01 | New users can register with valid required information. | TBD | TBD | Not run | TBD |
| US01-AC02 | Registered users can log in with correct credentials. | TBD | TBD | Not run | TBD |
| US01-AC03 | Incorrect login details display an error message. | TBD | TBD | Not run | TBD |
| US01-AC04 | The system prevents registration using an existing email address. | TBD | TBD | Not run | TBD |
| US01-AC05 | Users can log out and cannot access protected account pages after logging out. | TBD | TBD | Not run | TBD |
| US02-AC01 | Authorized admins can log in using valid credentials. | TBD | TBD | Not run | TBD |
| US02-AC02 | Successful admin login redirects to the admin dashboard. | TBD | TBD | Not run | TBD |
| US02-AC03 | Incorrect login details display an error message. | TBD | TBD | Not run | TBD |
| US02-AC04 | Regular customers cannot access admin-only pages. | TBD | TBD | Not run | TBD |
| US02-AC05 | Admins can log out, and protected dashboard pages cannot be accessed after logout. | TBD | TBD | Not run | TBD |
| US02-AC06 | Public users cannot register themselves as administrators. | TBD | TBD | Not run | TBD |
| US03-AC01 | Logged-in admins can upload wedding photos to the system. | TBD | TBD | Not run | TBD |
| US03-AC02 | Admins can create a gallery collection with a title and description. | TBD | TBD | Not run | TBD |
| US03-AC03 | Admins can add uploaded photos to a selected collection. | TBD | TBD | Not run | TBD |
| US03-AC04 | Admins can view, edit and delete their uploaded photos and collections. | TBD | TBD | Not run | TBD |
| US03-AC05 | The system rejects unsupported file types and files that exceed the allowed size. | TBD | TBD | Not run | TBD |
| US03-AC06 | Uploaded photos and collection details remain saved after refreshing the page. | TBD | TBD | Not run | TBD |
| US03-AC07 | Regular customers and visitors cannot access photo upload or gallery management functions. | TBD | TBD | Not run | TBD |
| US04-AC01 | Visitors can browse public wedding photography collections without logging in. | TBD | TBD | Not run | TBD |
| US04-AC02 | Visitors can open a collection to view its wedding photos and details. | TBD | TBD | Not run | TBD |
| US04-AC03 | Visitors can view different wedding photography styles and collections. | TBD | TBD | Not run | TBD |
| US04-AC04 | Only photos and collections marked as public are displayed to visitors. | TBD | TBD | Not run | TBD |
| US04-AC05 | The gallery works properly on both mobile and desktop screens. | TBD | TBD | Not run | TBD |
| US04-AC06 | The system displays a message when a collection has no photos. | TBD | TBD | Not run | TBD |
| US04-AC07 | Visitors cannot upload, edit or delete gallery photos or collections. | TBD | TBD | Not run | TBD |

## Automated checks

| Command / check | Actual date and commit | Result | Evidence |
| --- | --- | --- | --- |
| npm run lint | TBD | Not recorded in this session | TBD |
| npm test | TBD | Not recorded in this session | TBD |
| npm run build | TBD | Not recorded in this session | TBD |
| npm audit --omit=dev | TBD | Not recorded in this session | TBD |

## Defects and retesting

| Defect | Related test | Severity | Owner | Fix commit | Retest result / evidence |
| --- | --- | --- | --- | --- | --- |
| TBD | TBD | TBD | TBD | TBD | TBD |

## Session outcome

- Passed / failed / blocked / not run totals: TBD.
- Remaining risks and limitations: TBD.
- Test-data cleanup result: TBD.
- Acceptance decision and reviewer: TBD; passing tests alone does not establish the full Definition of Done.
