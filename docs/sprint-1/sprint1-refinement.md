# Sprint 1 — Backlog Refinement Record

**Sprint:** 5–18 November 2026 · US01–US04.
**Status:** Two refinements recorded: the scheduled refinement on 11 November and a refinement on 18 November after the Sprint 1 user review.
**Source:** [Sprint stories](sprint1-user-story.md), [product backlog](../PRODUCT_BACKLOG.md), [user review](sprint1-user-review.md).

## Refinement 1 — 11 November 2026 (no meeting held)

| Session field | Value |
| --- | --- |
| Actual date | 11 November 2026 |
| Participants | No refinement meeting was held. A refined backlog dated 11 November was supplied and aligned in the documentation on 15 November. |
| Sprint goal / progress reviewed | Sprint 1 scope kept as US01–US04; later stories re-mapped |

| Item / US | Previous requirement or priority | Proposed change | Reason / evidence | Product Owner decision | Owner / follow-up |
| --- | --- | --- | --- | --- | --- |
| US06 + US07 | Separate booking review and consultation stories | Merged into US06 (8 points) | Consultation is part of the booking workflow | Not recorded | Team |
| US13 | Heritage education in a later sprint | Becomes US07, moved to Sprint 2 (3 points, Should) | SULAM community value earlier in the project | Not recorded | Team |
| US08–US12 | Previous IDs and order | Renumbered: albums US08, selection/download US09, AI summaries US10, FAQ US11, feedback US12 | Order by dependency and priority | Not recorded | Team |

The full mapping is in [Backlog refinement and story mapping](../PRODUCT_BACKLOG.md#backlog-refinement-and-story-mapping).

## Refinement 2 — 18 November 2026 (after the Sprint 1 user review)

| Session field | Value |
| --- | --- |
| Actual date | 18 November 2026 |
| Basis | The studio owner’s feedback from the Sprint 1 user review |
| Sprint goal / progress reviewed | All four stories built and deployed; acceptance testing incomplete; owner feedback received |

| Item / US | Previous requirement or priority | Proposed change | Reason / evidence | Product Owner decision | Owner / follow-up |
| --- | --- | --- | --- | --- | --- |
| US01 | Customers register and log in with an account | Retired: customer accounts, registration and the customer dashboard removed from the website | Owner: a wedding is usually booked once, so customers do not need an account. Team assumption ASM01 (customer accounts) was not confirmed | Requested by the owner | Branch `ui/readable-text`; US01 acceptance rows no longer apply |
| US02 | Customer/Admin login picker; admins register, then receive the admin role | Studio-only login; admin accounts created by the project owner in Supabase; login entry is a small icon in the header | Follows from retiring customer accounts; no public sign-up | Owner to confirm | Branch `ui/readable-text` |
| US03, US04 | Grey helper text (4.0:1 contrast) and descriptive subtitles | Darker helper text (8.7:1); unnecessary descriptions removed; “tf” replaced by “ThenFrame” | Owner: icons and text are hard to read | Owner to confirm the result | Frontend; ask the owner which screens he meant |
| US04 | “Create your customer account” calls to action | Point to “Book your date” (Coming soon until US05 is ready); new Track booking tab (Coming soon) | Customers book without an account | Owner to confirm | US05 in Sprint 2 |

Changes to later stories (US05 guest booking form with email and WhatsApp follow-up, US06, US07, US08–US09, US12) are refined in Sprint 2.

Record actual outcomes, including a decision to make no changes. Add approved requirement changes to the shared backlog and task changes to [GitHub Projects](https://github.com/users/phangsx25/projects/1). New suggestions do not automatically change current sprint scope.
