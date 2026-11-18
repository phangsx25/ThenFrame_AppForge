# ThenFrame — Daily Development Log

| Item | Details |
| --- | --- |
| Project | ThenFrame — AppForge, Group 3, Section 02 |
| Coverage | Sprints 1–4; entries grouped by sprint |
| Contributors | Frontend — Munif, Ezz; Backend — Naqyuddin, Phang; QA — Awwab |
| Prepared on | 13 November 2026 |
| Record basis | Retrospective activity dates provided by the contributor; Git commit dates listed separately as supporting references. |

This is a development activity log. It does not record stand-up attendance or meeting duration. Development activity began with Figma design on 10 November. The 10–12 and 13–14 November ranges reflect the contributor's approximate recollection, rather than separate daily attendance records.

## Sprint 1 — 5–18 November 2026

### Daily progress

Record who worked on what and the next action here. Responsible people follow the Sprint 1 role assignments; each Kanban task is an issue in this repository (see [Sprint 1 tasks](sprint-1/sprint1-user-story.md)). Keep test steps, results and retest evidence in the [Sprint 1 test report](sprint-1/sprint1-test-report.md).

| Date (2026) | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |
| 5–9 November | No Development Activity | No development work recorded during this period. Figma design began on 10 November. | — | Begin Figma design on 10 November. | — |
| 10–12 November (approximately 2–3 days) | Figma Design and Sprint 1 Scope | Begin the ThenFrame design in Figma on 10 November. Work on the Burgundy Editorial visual direction and customer/admin screen layouts for authentication, gallery management and public portfolio browsing (US01–US04). | Munif, Ezz (Frontend) | Set up the application and backend services, then begin implementing the designed screens. | Keep the design aligned with the selected user stories and access requirements. |
| 13–14 November | Project Setup and Initial Integration | Set up the application structure and Supabase Auth, Database and Storage. Begin connecting customer/admin authentication, roles and gallery data to the application screens; configure the Preview environment and address initial UI issues. | Phang, Naqyuddin | Continue backend refinement and verify account permissions, uploads, collection management and public visibility. | Complete live account and access checks; verify deployment separately from configuration. |
| 14 November | Backend Refinement and Documentation | Refine gallery validation, signup guidance, category labels and collection deletion; clarify AI scope and clean up project assets/testing setup; organize backlog and Sprint story documents and update dates. | Munif, Ezz, Phang | Review and integrate Sprint 1 fixes; complete live acceptance and prepare user-review evidence. | Sprint 1 fixes remain separate from main in the inspected refs; complete testing, staging and Product Owner acceptance evidence. |
| 14 November | Password Recovery Fix and Retest | Correct the reset-email destination and recovery routing; fix same-tab expired-link handling and deploy the fixes. Recovery routing confirmed in retest; [test results](sprint-1/sprint1-test-report.md#password-recovery-regression--us01-account-security) record automated and live evidence separately. | Phang, Awwab | Verify real login with the new password and rejection of the old password; continue remaining Sprint 1 acceptance checks. | New/old password login results are not yet recorded. |
| 15 November | Username-Based Login | Change both customer and admin website login to username and password only; remove the email login option. Add unique username registration and username editing in Account settings. Update existing accounts directly in Supabase while preserving passwords and roles. Keep email for account confirmation and password recovery. Replace the personalized input example with a generic username placeholder. Update the backlog and [test report](sprint-1/sprint1-test-report.md#username-login-validation--15-november-2026), and deploy the changes. | Phang, Naqyuddin, Munif | Confirm existing-account login with the assigned username and complete remaining Sprint 1 acceptance checks. | 56 automated tests and CI passed; real-backend and local-browser checks passed. Existing owners’ successful password entry and new signup email delivery are not separately confirmed. |
| 15 November | Latest Work | Add a Latest Work section to the homepage that automatically shows the three most recently published public collections. Visitors can open each collection or select View All to browse the complete portfolio. Record publication time when a collection changes from Private to Public; ordinary edits do not move it to the top. Keep private collections excluded. Apply the database migration and synchronize the implementation and English documentation to GitHub. | Ezz, Naqyuddin | Review the homepage with the studio and complete browser acceptance checks; see the [test report](sprint-1/sprint1-test-report.md#latest-work-verification--15-november-2026). | 56 automated tests, lint, production build and database publication lifecycle assertions passed. Browser verification remains pending. Existing public collections use creation time as a historical fallback. |
| 15 November | Sprint 1 Fix Integration | Integrate duplicate-email registration guidance and confirmed populated-collection deletion from the older Sprint 1 branch while preserving username login, Event Type, Public/Private and Latest Work. Add development regression checks and update the deletion guidance. | Ezz, Phang | Complete formal browser acceptance later; fixes have also been synchronized into the US05 branch. | 65 development tests passed on main; 78 passed after synchronization into the US05 branch (35216b4). Lint and build passed on both. Collection deletion is not atomic; no formal acceptance result is claimed. |
| 16 November | PWA App Icon Refinement | Replace the TF abbreviation with the full ThenFrame wordmark using the existing burgundy/cream palette and arch. Add matching desktop/Android icons, a maskable icon and an Apple touch icon; update favicon and installation metadata. | Phang | Verify installation and icon appearance on an actual phone and desktop; reinstall an older installation if its icon remains cached. | Production build and generated icon/manifest checks passed. Device installation acceptance is not yet recorded. |
| 16 November | Kanban Subtasks and Burndown | Create the 26 Sprint 1 subtasks as issues in this repository, each assigned to its responsible member and linked to its user story on the Kanban. Set up the hourly burndown sync and record acceptance status from development checks in the [test report](sprint-1/sprint1-test-report.md). | Phang | Keep the Kanban and burndown up to date as work finishes. | Board statuses were updated in batches rather than daily. |
| 16–17 November | Admin Gallery Improvements | Separate the admin Overview and Gallery management views; upload several photos at once with progress, drag and drop and a preview; bigger admin photo grid with a full-screen photo viewer; renew expired photo links automatically. | Ezz | Integrate with the review changes and include in the live demo. | Merged into main with the review changes on 18 November (#74). |
| 17 November | Sprint 1 User Review | Online review of the live website with the ThenFrame studio manager, recorded with consent. The manager asked for studio-only login with no customer accounts, more readable text, and bookings sent by email with WhatsApp follow-up. See the [user review](sprint-1/sprint1-user-review.md). | Naqyuddin | Apply the requested changes and refine the backlog. | — |
| 18 November | Refinement and Review Changes | Record Refinement 2 in the [refinement notes](sprint-1/sprint1-refinement.md): US01 retired, US02 studio-only. Remove customer accounts; add a small studio login icon; make helper text readable (contrast 4.0 → 8.7) and use the ThenFrame wordmark; send "Book your date" and the new Track booking tab to Coming soon pages. Merged and deployed in #74; tracked as [#75](https://github.com/phangsx25/ThenFrame_AppForge/issues/75). | Phang | Live demo on 20 November; booking form in Sprint 2 (US05). | 74 automated tests, lint, build and the verify check passed before merge. |
| 18 November | Burndown, Audit and Test Report | Burn down story points per closed subtask and fix the chart's date scale (#72). Move Tailwind to build-only dependencies so the production audit passes (#73). Restructure the [test report](sprint-1/sprint1-test-report.md): automated tests recorded once; 12 manual tests listed for QA. | Phang | Awwab completes the 12 manual tests on the live site. | Manual test results pending. |
| 18 November | Sprint 1 Presentation | Prepare the Sprint 1 demo slides: goal and backlog, testing and burndown, development practices, live demo, manager feedback and Sprint 2 plan. | Phang | Team splits the presentation parts and rehearses before 20 November. | Slides due 19 November, 6 PM. |

### Work by member

Taken from the Sprint 1 Kanban issues, each assigned to one member. Issue close dates show when the board was updated, not when the work was finished.

| Member | Role | Sprint 1 tasks (Kanban issues) |
| --- | --- | --- |
| Munif | Frontend | Login and register forms ([#36](https://github.com/phangsx25/ThenFrame_AppForge/issues/36)); admin login ([#41](https://github.com/phangsx25/ThenFrame_AppForge/issues/41)); gallery forms ([#46](https://github.com/phangsx25/ThenFrame_AppForge/issues/46)); upload UI ([#48](https://github.com/phangsx25/ThenFrame_AppForge/issues/48)); gallery details ([#54](https://github.com/phangsx25/ThenFrame_AppForge/issues/54)); responsive UI ([#55](https://github.com/phangsx25/ThenFrame_AppForge/issues/55)) |
| Ezz | Frontend | Validation UI ([#37](https://github.com/phangsx25/ThenFrame_AppForge/issues/37)); dashboard UI ([#42](https://github.com/phangsx25/ThenFrame_AppForge/issues/42)); photo preview ([#47](https://github.com/phangsx25/ThenFrame_AppForge/issues/47)); portfolio cards ([#53](https://github.com/phangsx25/ThenFrame_AppForge/issues/53)); event type filters ([#59](https://github.com/phangsx25/ThenFrame_AppForge/issues/59)); admin gallery improvements, 16–17 November (#74) |
| Naqyuddin | Backend | Profile trigger ([#39](https://github.com/phangsx25/ThenFrame_AppForge/issues/39)); admin role check ([#43](https://github.com/phangsx25/ThenFrame_AppForge/issues/43)); RLS policies ([#45](https://github.com/phangsx25/ThenFrame_AppForge/issues/45)); storage upload and delete ([#50](https://github.com/phangsx25/ThenFrame_AppForge/issues/50)); public gallery queries ([#56](https://github.com/phangsx25/ThenFrame_AppForge/issues/56)); ran the Sprint 1 user review, 17 November |
| Phang | Backend | Repo and project scaffold ([#35](https://github.com/phangsx25/ThenFrame_AppForge/issues/35)); Supabase Auth ([#38](https://github.com/phangsx25/ThenFrame_AppForge/issues/38)); sessions ([#40](https://github.com/phangsx25/ThenFrame_AppForge/issues/40)); protected access ([#44](https://github.com/phangsx25/ThenFrame_AppForge/issues/44)); gallery CRUD ([#49](https://github.com/phangsx25/ThenFrame_AppForge/issues/49)); permissions ([#51](https://github.com/phangsx25/ThenFrame_AppForge/issues/51)); visibility rules ([#57](https://github.com/phangsx25/ThenFrame_AppForge/issues/57)); review changes ([#75](https://github.com/phangsx25/ThenFrame_AppForge/issues/75)) |
| Awwab | QA | Registration and login tests ([#58](https://github.com/phangsx25/ThenFrame_AppForge/issues/58)); unauthorized access tests ([#60](https://github.com/phangsx25/ThenFrame_AppForge/issues/60)); gallery CRUD and upload tests ([#52](https://github.com/phangsx25/ThenFrame_AppForge/issues/52)); public and hidden content tests ([#61](https://github.com/phangsx25/ThenFrame_AppForge/issues/61)); manual tests for US02–US04 pending |

### Supporting references

Git timestamps below identify when code was committed, not the start date of every activity above.

| Activity | Supporting reference | Reference date / scope |
| --- | --- | --- |
| Project scope | [Product backlog](PRODUCT_BACKLOG.md), [Sprint 1 user stories](sprint-1/sprint1-user-story.md) | Markdown references prepared 14 November; activity dates above were provided retrospectively by the contributor. |
| Project foundation and UI design | `3d8696e`, `4713391` | Commits dated 13 November; they do not independently verify the earlier startup/design dates. |
| Backend and integration | `4713391`, `5569083`, `4b2a6ac` | Commits dated 13 November. |
| Refinement and cleanup | `44b8214`, `23e31f6`, `f2e4b75`, `e397df8` | Commits dated 14 November; selected fixes from `e397df8` were integrated into main as `8efa56e` on 15 November. The old branch was subsequently removed. |
| Latest Work implementation | `39eaa8c`, [test report](sprint-1/sprint1-test-report.md#latest-work-verification--15-november-2026) | 15 November; homepage preview, publication timestamp migration and automated/database verification. |
| Review changes and admin gallery | #74 (`0e2e48d`), #75 | Ezz's commits 16–17 November; review changes 18 November. |
| Burndown and audit | #72 (`baecee8`), #73 (`2c38249`) | 18 November. |
| Remaining verification | [VERIFICATION.md](VERIFICATION.md) | Consult the recorded limits and outstanding live acceptance checks. |

### Follow-up

| Item | Next step | Status |
| --- | --- | --- |
| Stand-up evidence | Add actual meeting attendance and duration if available. | Not recorded |
| Kanban and burndown/burnup | Maintain [Projects](https://github.com/users/phangsx25/projects/1) and [burndown](sprint-1/sprint1-burndown.md); points burn as story subtasks are closed. | All 26 story subtasks Done; burndown reached 0 on 18 November |
| Testing and acceptance | Awwab runs the remaining acceptance tests: US02 [#60](https://github.com/phangsx25/ThenFrame_AppForge/issues/60), US03 [#52](https://github.com/phangsx25/ThenFrame_AppForge/issues/52), US04 [#61](https://github.com/phangsx25/ThenFrame_AppForge/issues/61); record results in the [test report](sprint-1/sprint1-test-report.md). | 9 criteria passed by automated checks; 12 manual tests pending |
| User review and retrospective | User review held 17 November ([record](sprint-1/sprint1-user-review.md)); retrospective not yet recorded. | Review done; retrospective planned |

## Sprint 2 — 19 November–9 December 2026

No activity entries recorded yet.

| Date | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |

## Sprint 3 — 10–23 December 2026

No activity entries recorded yet.

| Date | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |

## Sprint 4 — 24 December 2026–6 January 2027

No activity entries recorded yet.

| Date | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |
