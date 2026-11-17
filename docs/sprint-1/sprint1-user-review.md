# Sprint 1 — User Review and Feedback

**Planned date:** 17 November 2026. **Actual date:** 17 November 2026.  
**Status:** Review held with the ThenFrame studio manager. Feedback is summarised below by the team; the session recording holds the manager’s exact words.  
**Goal:** Demonstrate the working Sprint 1 increment to the actual user and collect evidence for the class demo on 19–20 November.

## Session details and recording consent

| Field | Value |
| --- | --- |
| Actual session date / time | 17 November 2026; time not recorded |
| Actual user / role | ThenFrame studio manager |
| Team attendees / facilitator | Facilitator: Naqyuddin |
| Session method | Online meeting |
| Tested deployment URL / commit | https://then-frame-app-forge.vercel.app (production, `main`) |
| Recording consent obtained before recording | Yes, the manager agreed to the recording |
| Consent evidence / permitted sharing audience | Recorded in the session; currently shared with the team only |
| Recording link and access restrictions | Stored in the team’s group chat; where to upload it will be decided later. The video is not committed to this repository |

## Review scenarios

The manager reviewed the deployed website. The individual tasks the manager performed were not recorded, so the scenarios below record only what the feedback covered.

| Scenario | User action | Observation / difficulty | User feedback | Evidence |
| --- | --- | --- | --- | --- |
| Overall design (US03, US04) | Reviewed the website | Some icons and text are hard to tell apart because their colours are too similar | Design is good overall; would like lighter colours and noted that some shading or font combinations do not suit | Manager’s feedback (FB01) |
| Customer account (US01) | Reviewed the customer sign-up and login | Not recorded | Customers do not need an account | Manager’s feedback (FB02) |
| Admin access (US02) | Not recorded | Not recorded | Not recorded | — |
| Public portfolio (US04) | Reviewed the public site | Not recorded | The PWA is mainly a portfolio to show the studio’s work | Manager’s feedback (FB03) |

## Feedback and follow-up

| ID | Actual comment / observed problem | Related US | Proposed action | Priority | Owner | GitHub card / status |
| --- | --- | --- | --- | --- | --- | --- |
| FB01 | (Paraphrased) The design is good, but some shading or font combinations do not suit, and some icons and text are hard to read because their colours are too close. The manager would like lighter colours. | US03, US04 | Darken helper text on light backgrounds for contrast, remove unnecessary descriptions, then ask the manager which screens and icons were meant | Not set by the manager | Frontend | Helper text and descriptions changed on branch `ui/readable-text`; manager to confirm the result |
| FB02 | (Paraphrased) Customers do not need to register an account, because a wedding is usually booked once. The manager prefers a one-time booking form that sends the enquiry to the studio’s email, after which the studio follows up on WhatsApp. | US01, US05 | Remove customer accounts from the website; build a guest booking form with email notification and a WhatsApp follow-up link in Sprint 2 | Not set by the manager | Team | Customer accounts removed on branch `ui/readable-text`; booking form planned for Sprint 2 (US05) |
| FB03 | (Paraphrased) The manager sees the PWA mainly as a portfolio to show the studio’s work. | US04 | Keep the portfolio as the main experience; keep the studio login small; confirm with the manager which later features (photo delivery, ratings) are still wanted | Not set by the manager | Team | Open |

Separate the user's actual words from the team's interpretation. Add feedback to the GitHub backlog and record Product Owner prioritization; do not silently expand current sprint scope.

## Outcome

The website was updated based on the manager’s requests:

- Helper text is darker and easier to read, and unnecessary descriptions were removed (FB01).
- Customer accounts were removed. Customers browse and book without an account; booking buttons lead to a Coming soon page until the booking form with email and WhatsApp follow-up is ready in Sprint 2 (FB02).
- The portfolio remains the main experience, with a small studio login icon in the header (FB03).

The resulting backlog changes are recorded in [Sprint 1 refinement](sprint1-refinement.md#refinement-2--18-november-2026-after-the-sprint-1-user-review).
