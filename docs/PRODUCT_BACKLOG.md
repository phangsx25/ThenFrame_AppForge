# ThenFrame — Product Backlog and MVP Plan

## Overview

ThenFrame's product backlog covers US01–US12, their priorities, estimates, dependencies and four-sprint delivery plan. The MVP includes US01–US07.

Use the sprint documents for detailed requirements and tasks, [GitHub Projects](https://github.com/users/phangsx25/projects/1) for current ownership and status, and [VERIFICATION.md](VERIFICATION.md) for implementation and test evidence.

## Product outcome and evidence

ThenFrame: Wedding Photography Portfolio & Gallery Management Website serves couples, visitors and ThenFrame Photography Studio administrators. The intended outcome is one system for exploring photography, customized booking enquiries, studio management and eventual photo selection/delivery, with traditional Malay wedding education.

Partner: ThenFrame Photography Studio; contact: Encik Izzudin, studio owner, via WhatsApp.

| Evidence ID | Source | Planning implication / qualification |
| --- | --- | --- |
| INT01 | Written owner interview in the “ThenFrame AD Stakeholder” WhatsApp group, 28 October 2026 | Manual booking, communication, photo organization and final delivery take too much time. Supports US03, US05–US06 and US08–US09. Consultation scheduling and confirmation are included in US06. |
| OBS01 | Planned studio observation on 19 November 2026 in the supplied refinement; partner availability remains to be confirmed | Pending. Record response/delivery baselines and verify actual tools; findings may change US05–US06 ordering. |
| ASM01 | Team assumption, not confirmed in INT01 | Customer accounts, public browsing, AI summaries, AI FAQ and customer feedback need owner validation at Sprint 1 Review. |
| ASM02 | S02 assumption, not confirmed in INT01 | WhatsApp, calls, Google Drive and hard disks are assumed current tools; verify through OBS01. |
| SULAM01 | Course community objective | Supports US07; course goal rather than partner evidence. |

## Ordered backlog

Detailed stories and refinement templates by sprint:

- [Sprint 1 — US01–US04](sprint-1/sprint1-user-story.md): acceptance criteria and task allocation.
- [Sprint 2 — US05–US07](sprint-2/sprint2-user-story.md): refined stories, acceptance criteria and tasks.
- [Sprint 3 — US08–US09](sprint-3/sprint3-user-story.md): private client albums, selection and download templates.
- [Sprint 4 — US10–US12](sprint-4/sprint4-user-story.md): AI summaries, FAQ and feedback templates.

Estimates use Fibonacci story points (1, 2, 3, 5, 8, 13), representing relative effort, complexity and uncertainty, not hours. Sprint allocation is a forecast and may change with progress and partner feedback.

| Order / ID | Feature | Priority | Points | Planned sprint | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 / US01 | Customer registration and login | Must | 3 | 1 | ASM01 |
| 2 / US02 | Secure administrator login | Must | 3 | 1 | Security assumption |
| 3 / US03 | Gallery upload and management | Must | 5 | 1 | INT01 |
| 4 / US04 | Public portfolio browsing | Must | 5 | 1 | ASM01 |
| 5 / US05 | Service and booking enquiries | Must | 8 | 2 | INT01 |
| 6 / US06 | Booking and consultation management | Must | 8 | 2 | INT01 |
| 7 / US07 | Traditional Malay wedding heritage guide | Should | 3 | 2 | SULAM01 |
| 8 / US08 | Private client albums and final photo delivery management | Should | 8 | 3 | INT01 |
| 9 / US09 | Customer private album viewing, selection and download | Must | 8 | 3 | INT01 |
| 10 / US10 | AI booking enquiry summaries | Must | 5 | 4 | ASM01 |
| 11 / US11 | AI FAQ assistant | Could | 5 | 4 | ASM01 |
| 12 / US12 | Customer ratings and feedback | Could | 3 | 4 | ASM01 |

**Refined forecast:** 12 stories, 64 points: Sprint 1 = 16, Sprint 2 = 19, Sprint 3 = 16, Sprint 4 = 13. These are planned estimates, not completed or committed work. US05 is allocated to Sprint 2; its earlier 1–2 label is superseded.

### User stories

- **US01:** As a newlywed couple or new user, I want to register a secure account and log in, so that my personal details and booking history are saved and tracked.
- **US02:** As a ThenFrame studio admin, I want to log in securely with administrator credentials, so that I can access the backend dashboard without unauthorized users breaking in.
- **US03:** As a ThenFrame studio admin, I want to upload and manage wedding photos in the gallery, so that I can organize and display my photography collections online.
- **US04:** As a visitor or newlywed couple, I want to browse wedding events and collections, so that I can find ideas for my wedding before deciding to book.
- **US05:** As a customer, I want to submit a photography service enquiry with my event details, preferred style, and package requirements so that ThenFrame can understand my needs and recommend suitable services.
- **US06:** As a ThenFrame studio admin, I want to review customer enquiries, check booking availability, and schedule consultations so that I can manage bookings efficiently and confirm details with customers.
- **US07:** As a visitor or customer from any cultural background, I want to browse and learn about traditional Malay wedding attire and heritage stories on the website so that I can appreciate local Malay customs and explore traditional Malay wedding photography styles.
- **US08:** As a ThenFrame studio admin, I want to upload and organize client wedding photos into private albums and provide final edited photos for delivery, so that I can manage photo selection and delivery in one system.
- **US09:** As a customer, I want to view my private wedding album, select my preferred photos and download the final edited photos, so that I can receive my wedding photos conveniently.
- **US10:** As a ThenFrame studio admin, I want the system to use AI to summarize customer booking enquiries, so that I can quickly understand customer needs and respond more efficiently.
- **US11:** As a newlywed couple or visitor, I want to interact with an AI assistant to get instant answers to common questions (FAQ) about packages and studio information, so that I can get quick information anytime without waiting for manual replies.
- **US12:** As a newlywed couple, I want to submit ratings and feedback after our photo session, so that I can share my experience and help improve future services.

### Epics and dependencies

| Epic | Stories | Outcome |
| --- | --- | --- |
| 1. Customer Experience & Booking | US01, US04, US05 | Browse, register and submit customized enquiries. |
| 2. Studio Operations & Management | US02, US03, US06 | Secure management, galleries, requests, availability and consultations. |
| 3. Client Photo Management and Delivery | US08, US09 | Private albums, selection and final photo download. |
| 4. AI-Powered Automation & Support | US10, US11 | Booking enquiry summaries and service FAQ answers. |
| 5. Customer Feedback and Cultural Heritage | US07, US12 | Feedback and traditional Malay wedding knowledge. |

US02 enables US03; US03 supplies US04. US05 supplies enquiries for US06 and US10. US06 includes review, availability, consultations and booking confirmation. US08 supplies private albums for US09 in Sprint 3. US07 provides the public heritage guide in Sprint 2; US10–US12 follow in Sprint 4. Risks include authentication, uploads, private access, storage, booking conflicts, package requirements, cultural content accuracy and AI integration.

## Sprint 1 acceptance criteria

These are requirement lists, not completed checklists. Record results and evidence separately.

### US01 — Customer registration and login

1. New users can register with a name, unique username, email address and valid password.
2. Registered users log in with their username and password.
3. Incorrect login details display an error message.
4. The system prevents duplicate email registration and enforces unique, case-insensitive usernames.
5. Users can log out and cannot access protected account pages after logging out.

**Dependencies and risks:**

- Requires a user database and authentication system.
- Passwords must be stored securely.
- Authentication errors may prevent users from accessing their accounts.
- Booking history depends on the booking function planned for Sprint 2 (US05).

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Design registration/login pages | Phang, Munif | UI screenshots |
| Create user database structure | Naqyuddin, Ezz, Munif | Database schema |
| Develop registration/login/logout | Awwab, Ezz | Working authentication |
| Test valid/invalid login access | Munif, Phang | Test results |

### US02 — Administrator login

1. Authorized admins log in with their username and password.
2. Successful admin login redirects to the admin dashboard.
3. Incorrect login details display an error message.
4. Regular customers cannot access admin-only pages.
5. Admins can log out, and protected dashboard pages cannot be accessed after logout.
6. Public users cannot register themselves as administrators.

**Dependencies and risks:**

- Requires the authentication system and user database.
- Requires admin roles and access permissions.
- Incorrect access control may expose private studio information.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Design admin login/dashboard | Ezz, Phang | UI screenshots |
| Set up authorized accounts/roles | Awwab, Ezz | Database records and role configuration |
| Develop admin login/dashboard access | Phang, Munif, Naqyuddin | Working admin dashboard |
| Test invalid login/unauthorized access | Munif, Naqyuddin | Test results |

### US03 — Gallery management

1. Logged-in admins can upload wedding photos to the system.
2. Admins can create a gallery collection with a title, description and event type.
3. Admins can add uploaded photos to a selected collection.
4. Admins can view, edit and delete their uploaded photos and collections.
5. The system accepts JPG/JPEG, PNG and WebP images up to 8 MB (8,388,608 bytes) per file, and rejects unsupported file types or larger files.
6. Uploaded photos and collection details remain saved after refreshing the page.
7. Regular customers and visitors cannot access photo upload or gallery management functions.

**Dependencies and risks:**

- Requires secure admin login (US02).
- Requires photo storage and a gallery database.
- Requires wedding photographs and permission from ThenFrame to display them.
- Large images may increase storage usage and loading time.
- Photo editing and deletion must be handled carefully to avoid accidental data loss.
- The per-file upload limit is 8 MB (8,388,608 bytes), with JPG/JPEG, PNG and WebP supported.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Design upload/gallery management pages | Phang, Munif | UI screenshots |
| Create photo/collection database structures | Awwab, Ezz | Database schema |
| Implement upload/file validation | Naqyuddin, Ezz | Working upload function |
| Implement collection creation/editing/deletion | Munif, Phang | Working gallery management |

### US04 — Public portfolio browsing

1. Visitors can browse public wedding photography collections without logging in.
2. Visitors can open a collection to view its wedding photos and details.
3. Visitors can browse and filter collections by event type.
4. Only photos and collections marked as public are displayed to visitors.
5. The gallery works properly on both mobile and desktop screens.
6. The system displays a message when a collection has no photos.
7. Visitors cannot upload, edit or delete gallery photos or collections.
8. The homepage displays the three most recently published public collections in Latest Work, with links to each collection and View All; private collections are excluded and ordinary edits do not change publication order.

**Dependencies and risks:**

- Requires gallery management (US03).
- Requires collections and photos uploaded by the admin.
- Requires permission from ThenFrame to display selected photographs publicly.
- Large images may affect page loading speed.
- Incorrect access permissions may expose private photographs.

**Tasks:**

| Task | Responsible member(s) | Completion evidence |
| --- | --- | --- |
| Design portfolio/collection pages | Phang, Awwab | UI screenshots |
| Develop browsing/photo viewing | Naqyuddin, Munif | Working portfolio pages |
| Connect portfolio to gallery database | Ezz, Awwab | Displayed gallery data |
| Implement public access/visibility rules | Phang, Munif, Naqyuddin | Access-control test results |
| Test gallery across device screens | Naqyuddin, Awwab | Responsive test results |

## MVP scope and validation

**Included MVP:** US01–US07. Customers browse collections, register/log in, specify services, event details and preferences, select available package options if supplied, submit an enquiry and receive confirmation after consultation. Admins log in, manage galleries, review enquiries, check availability, schedule consultations and confirm bookings. Package options are included only when provided by the studio; an admin package-catalogue editor is not an agreed requirement. Visitors can access the Malay wedding heritage guide without logging in.

**Deferred beyond MVP:** US08–US09 (private albums, selection and download in Sprint 3), US10 (AI enquiry summaries), US11 (FAQ assistant) and US12 (ratings/feedback) in Sprint 4. Deferred does not mean removed from the backlog.

| Success measure | Proposed target | Method |
| --- | --- | --- |
| Booking enquiry submission | 90% successful completion; users complete without help | Task-based user testing |
| Admin booking management | Review a booking without critical errors | Partner demonstration |
| Portfolio accessibility | Functional on mobile and desktop | Responsive testing |
| User satisfaction | Average 4/5 | Post-testing feedback form |
| Heritage guide usefulness | Average 4/5 | Community user feedback during Sprint 2 |
| Reliability | No critical errors in core workflows | Functional testing |

Enquiry response time and photo delivery time targets must be agreed after OBS01 baseline collection.

Partner validation plan: calendar schedules user review/feedback on 17 November, internal Sprint Review on 18 November and class demos on 19–20 November 2026; partner participation and OBS01 timing remain to be confirmed; MVP demonstration after Sprint 2; studio testing of gallery/booking management; simulated enquiries and consultations; interviews/usability feedback; improvements ordered by partner feedback. Collect community feedback on the heritage guide during Sprint 2. These are proposed activities subject to partner availability/agreement, not recorded completed events.

Feasibility requirements: desktop/mobile browser access, development/test environment before public deployment, customer/admin roles, secure authentication, restricted management access, protection of customer information/private photos, advance coordination of partner sessions and core booking before AI/advanced photo management.

## Four-sprint schedule

Sprint 2 includes a one-week holiday extension. Sprints 3 and 4 each run for two weeks.

| Sprint | Current dates | Stories | Usable increment / review |
| --- | --- | --- | --- |
| 1 | 5–18 November 2026 | US01–US04 | Registration/login, admin upload/collections and public portfolio. |
| 2 | 19 November–9 December 2026 | US05–US07 | Enquiries, booking/consultation management and heritage education. |
| 3 | 10–23 December 2026 | US08–US09 | Private client albums, customer photo selection and final download. |
| 4 | 24 December 2026–6 January 2027 | US10–US12 | AI enquiry summaries, AI FAQ and customer ratings/feedback. |

## Sprint 1 calendar and completion rules

Selected scope: US01–US04, 16 points. Setup/database work belongs within US01/US02 rather than a separate story.

| Date (2026) | Planned activity / output |
| --- | --- |
| 5 November | Sprint start and planning: agree goals, scope and tasks. |
| 6–15 November | Development; 9 November is marked as the Deepavali public holiday in the supplied calendar. |
| 11 November | Backlog refinement. |
| 16 November | Testing and refinement. |
| 17 November | User review and feedback; video recording required. |
| 18 November | Sprint end, internal Sprint Review and finalize MVP (calendar wording). |
| 19 and 20 November, 08:00–10:00 | Sprint 1 class demo and presentation, after Sprint 1 ends; Sprint 2 begins 19 November. |

The calendar's “finalize MVP” wording does not change the product MVP boundary of US01–US07 across Sprints 1–2. User review, partner attendance and acceptance are planned activities, not completed evidence.

Calendar routine: daily stand-up of 10–15 minutes; working dates listed are 5–6, 10, 12–13 and 16–18 November. Backlog refinement is scheduled on 11 November. Maintain Kanban and burndown/up regularly.

Burndown starts at 16 points; only fully Done stories burn points. Scrum Master updates after each Daily Scrum. New requirements/partner suggestions enter the product backlog; in-sprint scope changes require Product Owner agreement and a dated change log with change/reason. A separate retrospective follows review; its exact date is not specified in the supplied calendar.

### Definition of Done

1. Acceptance criteria met, including error and access cases.
2. Agreed automated feature tests pass; test-framework alignment is listed below.
3. Pull request reviewed and merged to main.
4. Works at phone and desktop width.
5. Deployed to staging.
6. No client data or private photos in Git.
7. Accepted by the Product Owner.

Review scenario: owner logs in as admin, creates a collection and uploads sample photos; opens the public portfolio on a phone without login; checks that a customer account cannot open the admin page. Feedback receives a `feedback` tag and Product Owner ordering at Sprint 2 Planning. A separate Start/Stop/Continue retrospective agrees one improvement action, for example PR review within 24 hours.

## Latest Work

The homepage automatically displays the three most recently published public collections, with links to each collection and View All for the complete portfolio. Collections are sorted by `published_at` descending. Changing Private to Public records a new publication time; editing an already public collection does not promote it. Private collections remain excluded. For public collections predating this feature, creation time is used as a historical fallback because their original publication time was not recorded.

## Portfolio event types

Portfolio collections are classified by event type, not photography style or ethnicity: Akad / Nikah, Reception, Akad & Reception, Engagement, Pre/Post Wedding, Others. This supports the studio's range of wedding activities. Services such as Photography, Videography and Combo belong to booking enquiries, not the portfolio category list. The portfolio currently supports photographs only. Existing custom categories are retained until the owner assigns an appropriate event type.

## Username login

Customers and admins use a unique username and password. Usernames have 3–40 characters, start with a letter and contain only letters, numbers or underscores; comparison is case-insensitive. Email remains required for confirmation and password recovery. Existing accounts have usernames assigned and can change them in Account settings. Email is not offered as a website login method. Username changes affect only the current account and never its role.

## Items to refine

- **US05–US07:** refined criteria are documented; confirm remaining package, availability, consultation and heritage-content decisions before implementation.
- **US08–US12:** detail templates remain pending refinement.
- **US03 upload acceptance:** verify JPG/JPEG, PNG and WebP uploads at or below 8 MB, and rejection of unsupported formats and files above 8 MB.
- **Test framework:** use Vitest and actual manual/integration checks for this React/Vite project; the earlier Pest reference is superseded.
- **Partner validation:** confirm observation and review sessions, and use findings to refine the backlog.

Record approved scope changes and their reasons in the relevant sprint refinement document.

## Backlog refinement and story mapping

The contributor supplied a refined backlog dated 11 November 2026. Local documentation was aligned on 15 November; this is not evidence of a meeting or team/Product Owner approval. Approval remains pending team and Product Owner confirmation. Calendar dates follow the previously confirmed project schedule above.

| Previous story | Refined story | Change |
| --- | --- | --- |
| US06 + US07 | US06 | Merge booking review, availability, consultations and confirmation; 8 points. |
| US13 | US07 | Move heritage education into Sprint 2; 3 points, Should. |
| US09 | US08 | Private client albums in Sprint 3; 8 points, Should. |
| US10 | US09 | Customer selection/download in Sprint 3; 8 points, Must. |
| US08 | US10 | AI summaries in Sprint 4; 5 points, Must. |
| US11–US12 | US11–US12 | Retain FAQ and feedback in Sprint 4. |

Sprint 1 remains US01–US04. Retain subsequent agreed details: username-only login, 8 MB image limit, event-type portfolio filtering and Latest Work. Historical evidence may use previous IDs; interpret it using this mapping. GitHub Projects has not been updated by this local documentation change.
