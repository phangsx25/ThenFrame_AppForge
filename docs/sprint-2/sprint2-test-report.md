# Sprint 2 — Test Report

**Sprint:** 19 November–9 December 2026 · US05–US07.
**Status:** Manual acceptance cases prepared; US05 automated and live database checks are recorded below. Full acceptance remains pending.
**Requirements:** [Sprint stories](sprint2-user-story.md). Criteria below match the supplied refinement; team/Product Owner confirmation and actual execution are pending.

| Session field | Value |
| --- | --- |
| Actual date / tester(s) | TBD |
| Branch / commit / deployment | TBD |
| Browser / device / viewport | TBD |
| Account roles and test data | TBD (no secrets) |

Tests are grouped by user story and reference the numbered acceptance criteria in the story document. Record actual execution dates and testers for each case; leave unexecuted cases as **Not run**. Existing supporting checks retain their original scope and do not automatically pass an acceptance criterion.

## US05 — Service and booking enquiries

Requirements: [US05 acceptance criteria](sprint2-user-story.md#us05--service-and-booking-enquiries).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US05-AC01 | 1 | TBD | Customers can select Photography, Videography, or Combo Photo & Video services. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC02 | 2 | TBD | Customers can select their event type. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC03 | 3 | TBD | Customers can provide their preferred event date and contact information. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC04 | 4 | TBD | Customers can select their preferred photography colour or style. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC05 | 5 | TBD | Customers can enter additional requirements and select available package options if provided by the studio. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC06 | 6 | TBD | The system displays an error when required information is missing or invalid. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC07 | 7 | TBD | Successfully submitted enquiries are saved, and a confirmation message is displayed. | Not recorded | Not run | TBD | TBD | TBD |
| US05-AC08 | 8 | TBD | Failed submissions display an error message without creating duplicate enquiries. | Not recorded | Not run | TBD | TBD | TBD |

### US05 initial increment — 15 November 2026

**Branch:** `sprint-2-us05-enquiry` (local work; not merged or deployed).

Implemented customer-only service enquiries: service, event type, preferred date, contact name/phone, preferred colour/style and optional additional requirements. Saved records appear in the customer's enquiry history with Pending status and a reference. No date reservation or booking confirmation is implied. Package catalogue, budget/referral fields, WhatsApp handoff, multi-date scheduling and admin management are outside this initial increment.

| Verification | Actual result | Scope / limitation |
| --- | --- | --- |
| Automated suite | 69 tests passed; lint and production/PWA build passed. | Includes 13 new enquiry validation, retry and component cases. Component transport is mocked. |
| Input validation | Unsupported choices, invalid/past calendar dates, invalid phone/name and overlong requirements rejected; only permitted customer fields serialized. | JavaScript validation tests; live database also rejects past-date inserts. |
| Submission failure and retry | Form values retained after failure; unchanged retry reuses the same request ID; success shows reference/history and resets the form. Duplicate-reference recovery requires identical saved fields. | Component and request tests with mocked transport. Request ID is retained in the mounted form, not across reload/navigation. Editing creates a new submission intent. |
| Live database ownership | Authenticated customer could insert/read an own enquiry. A different subject could neither read it nor insert using its owner's ID. | Real Postgres authenticated-role/JWT-subject assertions, not an actual browser login or REST test. |
| Live database restrictions | Duplicate primary key, customer status updates/deletion, anonymous reads and past-date inserts were denied. | Transactional assertions passed; all fixture rows rolled back. No saved test enquiries remain. |
| Schema and security | Applied `20261115151212_booking_enquiries.sql`; RLS enabled, owner-scoped insert/read, admin read, no customer update/delete privileges. | Additive table in shared Supabase; main application source is unchanged. Security advisor returned no finding for the new table/function; pre-existing advisor findings are unchanged. |
| Browser / studio acceptance | Not run. | Phone/desktop review, actual customer login → real API submit → reload, email/contact usability and Product Owner acceptance remain pending. |

The US05 acceptance table above is not marked Pass based solely on these narrower checks. This increment implements part of US05; it does not complete US06 or US07.

## US06 — Booking and consultation management

Requirements: [US06 acceptance criteria](sprint2-user-story.md#us06--booking-and-consultation-management).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US06-AC01 | 1 | TBD | Admin can view incoming customer booking enquiries and their details. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC02 | 2 | TBD | Admin can view the selected service, event type, preferred style, event date, and additional requirements. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC03 | 3 | TBD | Admin can check booking availability and identify potential scheduling conflicts. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC04 | 4 | TBD | Admin can update booking enquiry statuses, such as Pending, Under Review, Confirmed, or Rejected. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC05 | 5 | TBD | Admin can schedule online or offline consultations with customers. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC06 | 6 | TBD | Admin can update consultation details and confirm booking information. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC07 | 7 | TBD | Booking and consultation updates are saved in the database. | Not recorded | Not run | TBD | TBD | TBD |
| US06-AC08 | 8 | TBD | Unauthorized users cannot access booking management functions. | Not recorded | Not run | TBD | TBD | TBD |

## US07 — Traditional Malay wedding heritage guide

Requirements: [US07 acceptance criteria](sprint2-user-story.md#us07--traditional-malay-wedding-heritage-guide).

### Acceptance test results

| Test ID | AC no. | Steps / test data | Expected result | Actual result | Status | Tester | Execution date | Evidence / defect |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| US07-AC01 | 1 | TBD | Visitors can access the heritage guide without logging in. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC02 | 2 | TBD | Visitors can browse information about traditional Malay wedding attire and customs. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC03 | 3 | TBD | Visitors can read descriptions explaining the meaning of different wedding traditions. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC04 | 4 | TBD | The content is organized into clear sections for easy browsing. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC05 | 5 | TBD | Text and images display correctly on mobile and desktop devices. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC06 | 6 | TBD | The system displays an appropriate message if no heritage content is available. | Not recorded | Not run | TBD | TBD | TBD |
| US07-AC07 | 7 | TBD | Heritage information is checked for accuracy before publication. | Not recorded | Not run | TBD | TBD | TBD |

## Session outcome and follow-up

Record cleanup, defects, fix commits and retest outcomes. Summarize passes, failures, outstanding checks and the actual acceptance decision after execution. Include invalid inputs, failure handling, role restrictions and phone/desktop checks. Shared development evidence remains in [VERIFICATION.md](../VERIFICATION.md).
