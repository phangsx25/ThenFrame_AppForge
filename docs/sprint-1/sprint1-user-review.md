# Sprint 1 — User Review and Feedback

**Planned date:** 17 November 2026. **Actual date:** 18 November 2026.  
**Status:** Review held with the studio owner (Product Owner). Feedback is recorded below as paraphrased by the team; the owner’s exact words were not recorded.  
**Goal:** Demonstrate the working Sprint 1 increment to the actual user and collect evidence for the class demo on 19–20 November.

## Session details and recording consent

| Field | Value |
| --- | --- |
| Actual session date / time | 18 November 2026; time not recorded |
| Actual user / role | ThenFrame studio owner (Product Owner) |
| Team attendees / facilitator | Not recorded |
| Session method | Not recorded |
| Tested deployment URL / commit | https://then-frame-app-forge.vercel.app (production, `main`) |
| Recording consent obtained before recording | No recording made |
| Consent evidence / permitted sharing audience | Not applicable |
| Recording link and access restrictions | Not applicable |

## Review scenarios

The owner reviewed the deployed website. The individual tasks the owner performed were not recorded, so the scenarios below record only what the feedback covered.

| Scenario | User action | Observation / difficulty | User feedback | Evidence |
| --- | --- | --- | --- | --- |
| Overall design (US03, US04) | Reviewed the website | Some icons and text are hard to tell apart because their colours are too similar | Design is good overall; would like lighter colours and noted that some shading or font combinations do not suit | Owner’s feedback (FB01) |
| Customer account (US01) | Reviewed the customer sign-up and login | Not recorded | Customers do not need an account | Owner’s feedback (FB02) |
| Admin access (US02) | Not recorded | Not recorded | Not recorded | — |
| Public portfolio (US04) | Reviewed the public site | Not recorded | The PWA is mainly a portfolio to show the studio’s work | Owner’s feedback (FB03) |

## Feedback and follow-up

| ID | Actual comment / observed problem | Related US | Proposed action | Priority | Owner | GitHub card / status |
| --- | --- | --- | --- | --- | --- | --- |
| FB01 | (Paraphrased) The design is good, but some shading or font combinations do not suit, and some icons and text are hard to read because their colours are too close. The owner would like lighter colours. | US03, US04 | Darken helper text on light backgrounds for contrast, remove unnecessary descriptions, then ask the owner which screens and icons he meant | Not set by the owner | Frontend | Helper text and descriptions changed on branch `ui/readable-text`; owner to confirm the result |
| FB02 | (Paraphrased) Customers do not need to register an account, because a wedding is usually booked once. The owner prefers a one-time booking form that sends the enquiry to the studio’s email, after which the studio follows up on WhatsApp. | US01, US05 | Remove customer accounts from the website; build a guest booking form with email notification and a WhatsApp follow-up link in Sprint 2 | Not set by the owner | Team | Customer accounts removed on branch `ui/readable-text`; booking form planned for Sprint 2 (US05) |
| FB03 | (Paraphrased) The owner sees the PWA mainly as a portfolio to show the studio’s work. | US04 | Keep the portfolio as the main experience; keep the studio login small; confirm with the owner which later features (photo delivery, ratings) are still wanted | Not set by the owner | Team | Open |

Separate the user's actual words from the team's interpretation. Add feedback to the GitHub backlog and record Product Owner prioritization; do not silently expand current sprint scope.

## Outcome

- What the user could complete: Not recorded.
- What needs improvement: colour contrast and readability (FB01); customer accounts replaced by a guest booking form with email and WhatsApp follow-up (FB02).
- User / Product Owner acceptance decision: Not recorded (not assumed).
- Evidence prepared for presentation: Not recorded; no recording or screenshots from the session are stored.
- Next review / follow-up date: Not set. Follow-up questions for the owner: whether the colour changes solve FB01 and which screens he meant; the email address and WhatsApp number for booking enquiries; whether photo delivery and selection (US08–US09) and ratings (US12) are still wanted; the scope of the heritage guide (US07).
- Backlog changes made from this review are recorded in [Sprint 1 refinement](sprint1-refinement.md#refinement-2--18-november-2026-after-the-sprint-1-user-review).
