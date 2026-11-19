# Sprint 2 — User Story Details

Booking Enquiry Form, Enquiry List and Status, and Heritage Education

- Stories: US05–US07
- Planned dates: 19 November 2026 – 9 December 2026 (including the agreed holiday extension).
- Source: contributor-supplied refined backlog dated 11 November 2026.
- Reference: [Product backlog](../PRODUCT_BACKLOG.md).
- Requirements and templates do not establish implementation or acceptance. Track evidence in [VERIFICATION.md](../VERIFICATION.md).

Sprint goal: customers submit service enquiries; admins review availability, arrange consultations and confirm details; visitors access a public Malay wedding heritage guide. Planned total: 19 points (8 + 8 + 3). Team and Product Owner approval remains pending.

The previous US07 consultation story is merged into US06. Current US07 is heritage education. No owners or completed tasks are inferred from blank fields in the supplied refinement.

## US05 — Booking enquiry form

**Updated 19 November 2026** ([Refinement 3](../sprint-1/sprint1-refinement.md#refinement-3--19-november-2026-studio-follow-up)): renamed and simplified after the studio follow-up. The enquiry is saved in the system and then opens the studio's WhatsApp; the admin tracks each enquiry's status. The acceptance criteria below are from the earlier version and will be revised at Sprint 2 planning.

**Test results:** [US05 test report](sprint2-test-report.md#us05--booking-enquiry-form). Expected evidence remains in the task table; record actual outcomes in the linked report.

**User story:** As a customer, I want to send a booking enquiry with my event details without creating an account, so that the studio gets everything it needs in one message and can reply on WhatsApp.

**Priority:** Must · **Estimate:** 8 points · **Evidence:** INT01

### Acceptance criteria

1. Customers can select Photography, Videography, or Combo Photo & Video services.
2. Customers can select their event type.
3. Customers can provide their preferred event date and contact information.
4. Customers can select their preferred photography colour or style.
5. Customers can enter additional requirements and select available package options if provided by the studio.
6. The system displays an error when required information is missing or invalid.
7. Successfully submitted enquiries are saved, and a confirmation message is displayed.
8. Failed submissions display an error message without creating duplicate enquiries.

**Dependencies and risks:**

- Requires the studio's existing enquiry requirements and confirmed service information.
- Requires a booking enquiry database.
- Package options and customization details need confirmation from ThenFrame.
- Booking availability checking depends on US06.
- Customer information must be stored securely.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Review the existing ThenFrame enquiry form | TBD on Kanban | Confirmed form requirements |
| Design service and booking enquiry pages | TBD on Kanban | UI screenshots |
| Create booking enquiry database structure | TBD on Kanban | Database schema |
| Develop service, event type and style selection | TBD on Kanban | Working enquiry form |
| Implement enquiry submission and data storage | TBD on Kanban | Saved enquiry records |
| Test form validation and submission | TBD on Kanban | Test results |

## US06 — Enquiry list and status

**Updated 19 November 2026** ([Refinement 3](../sprint-1/sprint1-refinement.md#refinement-3--19-november-2026-studio-follow-up)): renamed and simplified after the studio follow-up. The enquiry is saved in the system and then opens the studio's WhatsApp; the admin tracks each enquiry's status. The acceptance criteria below are from the earlier version and will be revised at Sprint 2 planning.

**Test results:** [US06 test report](sprint2-test-report.md#us06--enquiry-list-and-status). Expected evidence remains in the task table; record actual outcomes in the linked report.

**User story:** As the ThenFrame studio admin, I want to see all booking enquiries in one list and update their status, so that I do not miss any customer.

**Priority:** Must · **Estimate:** 8 points · **Evidence:** INT01

### Acceptance criteria

1. Admin can view incoming customer booking enquiries and their details.
2. Admin can view the selected service, event type, preferred style, event date, and additional requirements.
3. Admin can check booking availability and identify potential scheduling conflicts.
4. Admin can update booking enquiry statuses, such as Pending, Under Review, Confirmed, or Rejected.
5. Admin can schedule online or offline consultations with customers.
6. Admin can update consultation details and confirm booking information.
7. Booking and consultation updates are saved in the database.
8. Unauthorized users cannot access booking management functions.

**Dependencies and risks:**

- Requires submitted customer enquiries from US05.
- Requires secure admin authentication.
- Requires booking and consultation database structures.
- Booking availability rules and consultation arrangements need confirmation from ThenFrame.
- Incorrect booking status or scheduling information may cause conflicts.
- Customer contact details must be protected from unauthorized access.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Design booking and consultation management pages | TBD on Kanban | UI screenshots |
| Create booking and consultation database structures | TBD on Kanban | Database schema |
| Develop enquiry list and details | TBD on Kanban | Working booking dashboard |
| Implement availability checking and status updates | TBD on Kanban | Working availability and status functions |
| Develop consultation scheduling and confirmation | TBD on Kanban | Working consultation form |
| Test booking management and access control | TBD on Kanban | Test results |

## US07 — Traditional Malay wedding heritage guide

**Test results:** [US07 test report](sprint2-test-report.md#us07--traditional-malay-wedding-heritage-guide). Expected evidence remains in the task table; record actual outcomes in the linked report.

**User story:** As a visitor or customer from any cultural background, I want to browse and learn about traditional Malay wedding attire and heritage stories on the website so that I can appreciate local Malay customs and explore traditional Malay wedding photography styles.

**Priority:** Should · **Estimate:** 3 points · **Evidence:** SULAM01

### Acceptance criteria

1. Visitors can access the heritage guide without logging in.
2. Visitors can browse information about traditional Malay wedding attire and customs.
3. Visitors can read descriptions explaining the meaning of different wedding traditions.
4. The content is organized into clear sections for easy browsing.
5. Text and images display correctly on mobile and desktop devices.
6. The system displays an appropriate message if no heritage content is available.
7. Heritage information is checked for accuracy before publication.

**Dependencies and risks:**

- Requires reliable information about traditional Malay wedding attire and customs.
- Requires suitable images and permission to use them.
- Cultural information must be reviewed to avoid inaccurate explanations.
- Content preparation may require feedback from ThenFrame or knowledgeable sources.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Research traditional Malay wedding attire and customs | TBD on Kanban | Research notes and sources |
| Design the heritage guide page | TBD on Kanban | UI screenshots |
| Develop the heritage guide | TBD on Kanban | Working heritage guide |
| Add educational content and approved images | TBD on Kanban | Displayed heritage content |
| Review accuracy and test responsiveness | TBD on Kanban | Review and test results |

## Evidence context

- **US05:** INT01 – The studio reported problems with manual booking management and client communication. The studio's existing enquiry form collects service type, event type, photography style, and referral source. Additional booking and package details require confirmation.
- **US06:** INT01 – The studio reported problems with manual booking management and client communication. The existing enquiry form collects service type, event type, preferred style, and referral source. Online booking management and consultation scheduling are proposed features. The detailed booking confirmation process requires further confirmation from ThenFrame.
- **US07:** SULAM01 – The project aims to provide educational content about traditional Malay wedding knowledge to the community. The heritage guide is a proposed feature, and its content requires reliable sources and review.

## Enquiry phone and reference rules

- Customers may enter Malaysian mobile numbers without spaces, including a missing leading zero. For example, `0181234567` and `181234567` identify the same number; the form displays `0181234567` after validation. Existing `+60` and formatted inputs remain supported. Valid international numbers require an explicit country code.
- Save normalized phone numbers with their country code, and display Malaysian numbers locally without spaces. Phone validation checks numbering format; it is not an OTP or ownership check.
- Display a server-assigned reference such as `TF-ENQ-000001`. The database sequence produces unique, increasing references; gaps can occur after failed or retried transactions. Customers cannot select or overwrite a reference.
- Existing enquiries receive references without changing their UUIDs or rewriting existing contact information. Retrying the same saved enquiry retains its reference. UUIDs remain internal retry keys and are not shown as the customer reference.

## Booking availability and management rules

- Confirmed by the contributor on 16 November 2026: check event time intervals, not whole-day capacity. Overlapping confirmed events are rejected; adjacent bookings may share an end/start boundary. Times are entered and displayed in Asia/Kuala_Lumpur.
- Pending enquiries and consultations do not reserve event capacity. An admin supplies a future start and later end when confirming. Each enquiry currently has one continuous reserved window, including its full reserved span for a multi-day event.
- The database enforces non-overlap and saves the reservation and Confirmed status together. Version checks reject stale admin edits. A failed confirmation or reschedule leaves the previously saved record intact.
- Admins can review Pending, Under review and Rejected enquiries; confirmed records remain Confirmed while their event times can be rescheduled without conflicts. Cancellation/reopening of confirmed bookings is not implemented in this increment.
- One consultation record per enquiry supports Online/Offline and Scheduled/Completed/Cancelled. Online requires a manually supplied HTTPS meeting link; Offline requires a location. Changes are saved and visible only to admins and the enquiry's customer.
- Initial implementation allows manual booking confirmation without enforcing consultation completion. The studio's final consultation prerequisite, travel buffers, split multi-day slots and booking-cancellation rules still require agreement. No automatic WhatsApp/email notification or meeting-link generation is included.

## Clarifications before implementation

- **US05:** confirm required fields, event-date handling, budget/currency, referral sources and colour/style options with the studio. Service options are Photography, Videography and Combo Photo & Video. Videography selection does not require video uploads. Photography style is an enquiry preference, separate from portfolio event types.
- **Packages:** show options only if supplied by the studio. The refinement does not establish a full package-catalogue editor, automatic pricing, payments or deposits.
- **WhatsApp:** the supplied form was described as a WhatsApp enquiry flow. Confirm whether the website also offers a manual prefilled-message handoff, which number it uses and which details it shares. Automatic sending/delivery is not assumed.
- **US06:** timed non-overlap and Malaysia-time display are confirmed; agree travel buffers, split multi-day events and cancellation rules. Pending, Under Review, Confirmed and Rejected are examples in the supplied criteria; final transition rules require agreement.
- **Consultations and confirmation:** agree required online/offline details, rescheduling/cancellation rules and whether a completed consultation is mandatory. Confirm how customers see status and receive confirmation, as described in the MVP workflow.
- **US07:** identify reliable cultural sources, a content reviewer and permitted images. Public educational content must be checked before publication. A CMS/admin heritage editor is not specified by this refinement.

## Verification and completion

Use the linked test report to record actual steps, results and evidence. Cover saved/reloaded enquiries, invalid submissions, duplicate prevention, admin access restrictions, scheduling conflicts and public heritage content on phone/desktop. Confirm customers cannot access other customers' information. Keep proposed additional checks separate from the supplied criteria; do not mark unexecuted cases Pass.

Apply the [Definition of Done](../PRODUCT_BACKLOG.md#definition-of-done): criteria including errors/access, Vitest and appropriate actual integration/manual checks, reviewed PR merged to main, responsive operation, staging deployment, no private client data in Git, and Product Owner acceptance. No approval or completed user session is claimed here.
