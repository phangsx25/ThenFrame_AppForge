# ThenFrame — Daily Development Log

| Item | Details |
| --- | --- |
| Project | ThenFrame — AppForge, Group 3, Section 02 |
| Coverage | Sprints 1–4; entries grouped by sprint |
| Contributors | Frontend — Munif, Ezz; Backend — Naqyuddin, Phang; QA — Awwab |
| Prepared on | 16 November 2026 (retrospective update) |
| Record basis | Retrospective activity dates provided by the contributor; Git commit dates listed separately as supporting references. |

This is a development activity log. It does not record stand-up attendance or meeting duration. Development activity began with Figma design on 10 November. The 10–12 and 13–14 November ranges reflect the contributor's approximate recollection, rather than separate daily attendance records.

## Sprint 1 — 5–18 November 2026

### Daily progress

Record who worked on what and the next action here. Responsible people follow the Sprint 1 role assignments; each Kanban task is an issue in this repository (see [Sprint 1 tasks](sprint-1/sprint1-user-story.md)). Keep test steps, results and retest evidence in the [Sprint 1 test report](sprint-1/sprint1-test-report.md).

| Date (2026) | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |
| 5–9 November | No Development Activity | No development work recorded during this period. Figma design began on 10 November. | — | Begin Figma design on 10 November. | — |
| 10–12 November (approximately 2–3 days) | Figma Design and Sprint 1 Scope | Begin the ThenFrame design in Figma on 10 November. Work on the Burgundy Editorial visual direction and customer/admin screen layouts for authentication, gallery management and public portfolio browsing (US01–US04). | Munif, Ezz (Frontend) | Set up the application and backend services, then begin implementing the designed screens. | Keep the design aligned with the selected user stories and access requirements. |
| 13–14 November | Project Setup and Initial Integration | Set up the application structure and Supabase Auth, Database and Storage. Begin connecting customer/admin authentication, roles and gallery data to the application screens; configure the Preview environment and address initial UI issues. | Phang (setup [#35](https://github.com/phangsx25/ThenFrame_AppForge/issues/35)); Naqyuddin, Phang (Backend: [#38](https://github.com/phangsx25/ThenFrame_AppForge/issues/38) [#39](https://github.com/phangsx25/ThenFrame_AppForge/issues/39) [#43](https://github.com/phangsx25/ThenFrame_AppForge/issues/43) [#44](https://github.com/phangsx25/ThenFrame_AppForge/issues/44) [#45](https://github.com/phangsx25/ThenFrame_AppForge/issues/45) [#49](https://github.com/phangsx25/ThenFrame_AppForge/issues/49) [#50](https://github.com/phangsx25/ThenFrame_AppForge/issues/50) [#51](https://github.com/phangsx25/ThenFrame_AppForge/issues/51)) | Continue backend refinement and verify account permissions, uploads, collection management and public visibility. | Complete live account and access checks; verify deployment separately from configuration. |
| 14 November | Backend Refinement and Documentation | Refine gallery validation, signup guidance, category labels and collection deletion; clarify AI scope and clean up project assets/testing setup; organize backlog and Sprint story documents and update dates. | Munif (gallery forms [#46](https://github.com/phangsx25/ThenFrame_AppForge/issues/46)); Ezz (signup validation [#37](https://github.com/phangsx25/ThenFrame_AppForge/issues/37)); Phang (collection deletion [#49](https://github.com/phangsx25/ThenFrame_AppForge/issues/49)) | Review and integrate Sprint 1 fixes; complete live acceptance and prepare user-review evidence. | Sprint 1 fixes remain separate from main in the inspected refs; complete testing, staging and Product Owner acceptance evidence. |
| 14 November | Password Recovery Fix and Retest | Correct the reset-email destination and recovery routing; fix same-tab expired-link handling and deploy the fixes. Recovery routing confirmed in retest; [test results](sprint-1/sprint1-test-report.md#password-recovery-regression--us01-account-security) record automated and live evidence separately. | Phang (sessions [#40](https://github.com/phangsx25/ThenFrame_AppForge/issues/40)); Awwab (QA retest [#58](https://github.com/phangsx25/ThenFrame_AppForge/issues/58)) | Verify real login with the new password and rejection of the old password; continue remaining Sprint 1 acceptance checks. | New/old password login results are not yet recorded. |
| 15 November | Username-Based Login | Change both customer and admin website login to username and password only; remove the email login option. Add unique username registration and username editing in Account settings. Update existing accounts directly in Supabase while preserving passwords and roles. Keep email for account confirmation and password recovery. Replace the personalized input example with a generic username placeholder. Update the backlog and [test report](sprint-1/sprint1-test-report.md#username-login-validation--15-november-2026), and deploy the changes. | Phang (Supabase Auth [#38](https://github.com/phangsx25/ThenFrame_AppForge/issues/38)); Naqyuddin (profile trigger [#39](https://github.com/phangsx25/ThenFrame_AppForge/issues/39)); Munif (login forms [#36](https://github.com/phangsx25/ThenFrame_AppForge/issues/36) [#41](https://github.com/phangsx25/ThenFrame_AppForge/issues/41)) | Confirm existing-account login with the assigned username and complete remaining Sprint 1 acceptance checks. | 56 automated tests and CI passed; real-backend and local-browser checks passed. Existing owners’ successful password entry and new signup email delivery are not separately confirmed. |
| 15 November | Latest Work | Add a Latest Work section to the homepage that automatically shows the three most recently published public collections. Visitors can open each collection or select View All to browse the complete portfolio. Record publication time when a collection changes from Private to Public; ordinary edits do not move it to the top. Keep private collections excluded. Apply the database migration and synchronize the implementation and English documentation to GitHub. | Ezz (gallery cards [#53](https://github.com/phangsx25/ThenFrame_AppForge/issues/53)); Naqyuddin (public gallery queries [#56](https://github.com/phangsx25/ThenFrame_AppForge/issues/56)) | Review the homepage with the studio and complete browser acceptance checks; see the [test report](sprint-1/sprint1-test-report.md#latest-work-verification--15-november-2026). | 56 automated tests, lint, production build and database publication lifecycle assertions passed. Browser verification remains pending. Existing public collections use creation time as a historical fallback. |
| 15 November | Sprint 1 Fix Integration | Integrate duplicate-email registration guidance and confirmed populated-collection deletion from the older Sprint 1 branch while preserving username login, Event Type, Public/Private and Latest Work. Add development regression checks and update the deletion guidance. | Ezz (duplicate-email guidance [#37](https://github.com/phangsx25/ThenFrame_AppForge/issues/37)); Phang (collection deletion [#49](https://github.com/phangsx25/ThenFrame_AppForge/issues/49)) | Complete formal browser acceptance later; fixes have also been synchronized into the US05 branch. | 65 development tests passed on main; 78 passed after synchronization into the US05 branch (35216b4). Lint and build passed on both. Collection deletion is not atomic; no formal acceptance result is claimed. |
| 16 November | PWA App Icon Refinement | Replace the TF abbreviation with the full ThenFrame wordmark using the existing burgundy/cream palette and arch. Add matching desktop/Android icons, a maskable icon and an Apple touch icon; update favicon and installation metadata. | Phang | Verify installation and icon appearance on an actual phone and desktop; reinstall an older installation if its icon remains cached. | Production build and generated icon/manifest checks passed. Device installation acceptance is not yet recorded. |

### Supporting references

Git timestamps below identify when code was committed, not the start date of every activity above.

| Activity | Supporting reference | Reference date / scope |
| --- | --- | --- |
| Project scope | [Product backlog](PRODUCT_BACKLOG.md), [Sprint 1 user stories](sprint-1/sprint1-user-story.md) | Markdown references prepared 14 November; activity dates above were provided retrospectively by the contributor. |
| Project foundation and UI design | `3d8696e`, `4713391` | Commits dated 13 November; they do not independently verify the earlier startup/design dates. |
| Backend and integration | `4713391`, `5569083`, `4b2a6ac` | Commits dated 13 November. |
| Refinement and cleanup | `44b8214`, `23e31f6`, `f2e4b75`, `e397df8` | Commits dated 14 November; selected fixes from `e397df8` were integrated into main as `8efa56e` on 15 November. The old branch was subsequently removed. |
| Latest Work implementation | `39eaa8c`, [test report](sprint-1/sprint1-test-report.md#latest-work-verification--15-november-2026) | 15 November; homepage preview, publication timestamp migration and automated/database verification. |
| Remaining verification | [VERIFICATION.md](VERIFICATION.md) | Consult the recorded limits and outstanding live acceptance checks. |

### Follow-up

| Item | Next step | Status |
| --- | --- | --- |
| Stand-up evidence | Add actual meeting attendance and duration if available. | Not recorded |
| Kanban and burndown/burnup | Maintain [Projects](https://github.com/users/phangsx25/projects/1) and [burndown](sprint-1/sprint1-burndown.md); count only fully Done stories. | Hourly burndown sync active; 27 Sprint 1 subtasks (#35–#61) tracked on the Kanban |
| Testing and acceptance | Awwab runs the remaining acceptance tests: US01 [#58](https://github.com/phangsx25/ThenFrame_AppForge/issues/58), US02 [#60](https://github.com/phangsx25/ThenFrame_AppForge/issues/60), US03 [#52](https://github.com/phangsx25/ThenFrame_AppForge/issues/52), US04 [#61](https://github.com/phangsx25/ThenFrame_AppForge/issues/61); record results in the [test report](sprint-1/sprint1-test-report.md). | In progress; password recovery routing confirmed |
| 16–18 November | Record testing, user feedback, review and retrospective after they occur. | Planned |

## Sprint 2 — 19 November–9 December 2026

Entries before 19 November are early development for Sprint 2 scope, before the planned sprint start. They do not establish Sprint 2 Planning, commitment or acceptance.

| Date (2026) | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |
| 15 November | US05 Initial Enquiry Development | Develop the customer enquiry form on sprint-2-us05-enquiry: service, event type, preferred date, contact name/phone, colour/style and additional requirements. Save enquiries with a reference and Pending status; let customers view their own enquiry history. Add input validation, ownership restrictions and retry handling to avoid duplicate submissions. Push the implementation to GitHub as c0e9a44. | Phang | Review the form in a real browser and confirm remaining enquiry fields and package options with the studio. | 69 development tests, lint/build and transactional database checks passed. The additive enquiry table is applied to shared Supabase. Package options, WhatsApp and US06 management are not implemented; US05 is not merged into main or production. |
| 16 November | US05 Phone Input and References | Accept compact Malaysian phone input with or without its leading zero; validate and normalize it automatically. Replace the displayed UUID with a database-assigned TF-ENQ reference and retain UUID-based retry protection. Add references to existing enquiries without replacing customer data. | Phang | Complete real-browser acceptance on the US05 branch. | Development checks and transactional database assertions are recorded in VERIFICATION.md; formal acceptance remains pending. Reference sequences may have gaps after unsuccessful transactions. |
| 16 November | US06 Booking and Consultation Development | Create sprint-2-us06-booking-management from the US05 branch. Develop Admin enquiry list/details, search/status/date filters, review updates, timed availability, atomic booking confirmation and online/offline consultation scheduling. Show saved booking/consultation details in the customer account. | Phang | Complete real-browser and concurrent-client acceptance with the studio; agree remaining cancellation and consultation rules. | 122 application tests, 3 burndown tests, lint/build and transactional database assertions passed. Shared Supabase has the additive booking schema. No formal acceptance or production feature merge is claimed. |
| 16 November | Plan Alignment and Pull Requests | Compare the project with the product backlog and Sprint 2 stories. Make the heritage route public so visitors can open it without logging in (US07 criterion 1); it shows a no-content message until the guide is written. Remove README references to the nonexistent sprint-2 branch and the already integrated fix/sprint1-completion work. Commit and push the US06 work, then open PR #4 (US05 to main) and PR #5 (US06 to the US05 branch). | Phang | Merge #4 first, then retarget #5 to main. Complete browser acceptance for US05 and US06. | 122 application tests, 3 burndown tests, lint and build passed. Heritage content is not written yet. Formal acceptance rows remain Not run; no merge to main yet. |

## Sprint 3 — 10–23 December 2026

No activity entries recorded yet.

| Date | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |

## Sprint 4 — 24 December 2026–6 January 2027

No activity entries recorded yet.

| Date | Focus | Work summary | Responsible person | Next action | Blockers / outstanding checks |
| --- | --- | --- | --- | --- | --- |
