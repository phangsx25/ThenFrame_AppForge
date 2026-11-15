# Sprint 2 — User Story Details

Booking Enquiries, Booking and Consultation Management, and Heritage Education

- Period: 19 November–9 December 2026, including the agreed holiday extension.
- Stories: US05–US07; 19 planned story points (8 + 8 + 3).
- Goal: customers submit service enquiries; admins review availability, arrange consultations and confirm details; visitors access a public Malay wedding heritage guide.
- Basis: contributor-supplied refined backlog dated 11 November 2026, aligned locally on 15 November. Dates follow the confirmed project schedule.
- Approval: pending team and Product Owner confirmation. Requirements are not implementation or test evidence.
- References: [Product backlog](../PRODUCT_BACKLOG.md), [test report](sprint2-test-report.md), [refinement record](sprint2-refinement.md).

The previous US07 consultation story is merged into US06. Current US07 is heritage education. No owners or completed tasks are inferred from blank fields in the supplied refinement.

## US05 — Service and booking enquiries

**User story:** As a customer, I want to submit a photography service enquiry with my event details, preferred style, and package requirements so that ThenFrame can understand my needs and recommend suitable services.

**Priority:** Must · **Estimate:** 8 points · **Evidence:** INT01 · **Owner:** TBD on Kanban

**Evidence / assumption:** INT01 – The studio reported problems with manual booking management and client communication. The studio's existing enquiry form collects service type, event type, photography style, and referral source. Additional booking and package details require confirmation.

### Acceptance criteria

| ID | Criterion |
| --- | --- |
| US05-AC01 | Customers can select Photography, Videography, or Combo Photo & Video services. |
| US05-AC02 | Customers can select their event type. |
| US05-AC03 | Customers can provide their preferred event date and contact information. |
| US05-AC04 | Customers can select their preferred photography colour or style. |
| US05-AC05 | Customers can enter additional requirements and select available package options if provided by the studio. |
| US05-AC06 | The system displays an error when required information is missing or invalid. |
| US05-AC07 | Successfully submitted enquiries are saved, and a confirmation message is displayed. |
| US05-AC08 | Failed submissions display an error message without creating duplicate enquiries. |

**Dependencies and risks:**

- Requires the studio's existing enquiry requirements and confirmed service information.
- Requires a booking enquiry database.
- Package options and customization details need confirmation from ThenFrame.
- Booking availability checking depends on US06.
- Customer information must be stored securely.

### Tasks

| Task | Owner | Completion evidence |
| --- | --- | --- |
| Review the existing ThenFrame enquiry form | TBD on Kanban | Confirmed form requirements |
| Design service and booking enquiry pages | TBD on Kanban | UI screenshots |
| Create booking enquiry database structure | TBD on Kanban | Database schema |
| Develop service, event type and style selection | TBD on Kanban | Working enquiry form |
| Implement enquiry submission and data storage | TBD on Kanban | Saved enquiry records |
| Test form validation and submission | TBD on Kanban | Test results |

## US06 — Booking and consultation management

**User story:** As a ThenFrame studio admin, I want to review customer enquiries, check booking availability, and schedule consultations so that I can manage bookings efficiently and confirm details with customers.

**Priority:** Must · **Estimate:** 8 points · **Evidence:** INT01 · **Owner:** TBD on Kanban

**Evidence / assumption:** INT01 – The studio reported problems with manual booking management and client communication. The existing enquiry form collects service type, event type, preferred style, and referral source. Online booking management and consultation scheduling are proposed features. The detailed booking confirmation process requires further confirmation from ThenFrame.

### Acceptance criteria

| ID | Criterion |
| --- | --- |
| US06-AC01 | Admin can view incoming customer booking enquiries and their details. |
| US06-AC02 | Admin can view the selected service, event type, preferred style, event date, and additional requirements. |
| US06-AC03 | Admin can check booking availability and identify potential scheduling conflicts. |
| US06-AC04 | Admin can update booking enquiry statuses, such as Pending, Under Review, Confirmed, or Rejected. |
| US06-AC05 | Admin can schedule online or offline consultations with customers. |
| US06-AC06 | Admin can update consultation details and confirm booking information. |
| US06-AC07 | Booking and consultation updates are saved in the database. |
| US06-AC08 | Unauthorized users cannot access booking management functions. |

**Dependencies and risks:**

- Requires submitted customer enquiries from US05.
- Requires secure admin authentication.
- Requires booking and consultation database structures.
- Booking availability rules and consultation arrangements need confirmation from ThenFrame.
- Incorrect booking status or scheduling information may cause conflicts.
- Customer contact details must be protected from unauthorized access.

### Tasks

| Task | Owner | Completion evidence |
| --- | --- | --- |
| Design booking and consultation management pages | TBD on Kanban | UI screenshots |
| Create booking and consultation database structures | TBD on Kanban | Database schema |
| Develop enquiry list and details | TBD on Kanban | Working booking dashboard |
| Implement availability checking and status updates | TBD on Kanban | Working availability and status functions |
| Develop consultation scheduling and confirmation | TBD on Kanban | Working consultation form |
| Test booking management and access control | TBD on Kanban | Test results |

## US07 — Traditional Malay wedding heritage guide

**User story:** As a visitor or customer from any cultural background, I want to browse and learn about traditional Malay wedding attire and heritage stories on the website so that I can appreciate local Malay customs and explore traditional Malay wedding photography styles.

**Priority:** Should · **Estimate:** 3 points · **Evidence:** SULAM01 · **Owner:** TBD on Kanban

**Evidence / assumption:** SULAM01 – The project aims to provide educational content about traditional Malay wedding knowledge to the community. The heritage guide is a proposed feature, and its content requires reliable sources and review.

### Acceptance criteria

| ID | Criterion |
| --- | --- |
| US07-AC01 | Visitors can access the heritage guide without logging in. |
| US07-AC02 | Visitors can browse information about traditional Malay wedding attire and customs. |
| US07-AC03 | Visitors can read descriptions explaining the meaning of different wedding traditions. |
| US07-AC04 | The content is organized into clear sections for easy browsing. |
| US07-AC05 | Text and images display correctly on mobile and desktop devices. |
| US07-AC06 | The system displays an appropriate message if no heritage content is available. |
| US07-AC07 | Heritage information is checked for accuracy before publication. |

**Dependencies and risks:**

- Requires reliable information about traditional Malay wedding attire and customs.
- Requires suitable images and permission to use them.
- Cultural information must be reviewed to avoid inaccurate explanations.
- Content preparation may require feedback from ThenFrame or knowledgeable sources.

### Tasks

| Task | Owner | Completion evidence |
| --- | --- | --- |
| Research traditional Malay wedding attire and customs | TBD on Kanban | Research notes and sources |
| Design the heritage guide page | TBD on Kanban | UI screenshots |
| Develop the heritage guide | TBD on Kanban | Working heritage guide |
| Add educational content and approved images | TBD on Kanban | Displayed heritage content |
| Review accuracy and test responsiveness | TBD on Kanban | Review and test results |

## Clarifications before implementation

- **US05:** confirm required fields, event-date handling, budget/currency, referral sources and colour/style options with the studio. Service options are Photography, Videography and Combo Photo & Video. Videography selection does not require video uploads. Photography style is an enquiry preference, separate from portfolio event types.
- **Packages:** show options only if supplied by the studio. The refinement does not establish a full package-catalogue editor, automatic pricing, payments or deposits.
- **WhatsApp:** the supplied form was described as a WhatsApp enquiry flow. Confirm whether the website also offers a manual prefilled-message handoff, which number it uses and which details it shares. Automatic sending/delivery is not assumed.
- **US06:** confirm booking capacity, whole-day versus timed availability, multi-day events, timezone and conflict rules. Pending, Under Review, Confirmed and Rejected are examples in the supplied criteria; final transition rules require agreement.
- **Consultations and confirmation:** agree required online/offline details, rescheduling/cancellation rules and whether a completed consultation is mandatory. Confirm how customers see status and receive confirmation, as described in the MVP workflow.
- **US07:** identify reliable cultural sources, a content reviewer and permitted images. Public educational content must be checked before publication. A CMS/admin heritage editor is not specified by this refinement.

## Verification and completion

Use the linked test report to record actual steps, results and evidence. Cover saved/reloaded enquiries, invalid submissions, duplicate prevention, admin access restrictions, scheduling conflicts and public heritage content on phone/desktop. Confirm customers cannot access other customers' information. Keep proposed additional checks separate from the supplied criteria; do not mark unexecuted cases Pass.

Apply the [Definition of Done](../PRODUCT_BACKLOG.md#definition-of-done): criteria including errors/access, Vitest and appropriate actual integration/manual checks, reviewed PR merged to main, responsive operation, staging deployment, no private client data in Git, and Product Owner acceptance. No approval or completed user session is claimed here.
