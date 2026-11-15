# ThenFrame — Product Backlog and MVP Plan

## Overview

ThenFrame's product backlog covers US01–US13, their priorities, estimates, dependencies and four-sprint delivery plan. The MVP includes US01–US07.

Use the sprint documents for detailed requirements and tasks, [GitHub Projects](https://github.com/users/phangsx25/projects/1) for current ownership and status, and [VERIFICATION.md](VERIFICATION.md) for implementation and test evidence.

## Product outcome and evidence

ThenFrame: Wedding Photography Portfolio & Gallery Management Website serves couples, visitors and ThenFrame Photography Studio administrators. The intended outcome is one system for exploring photography, customized booking enquiries, studio management and eventual photo selection/delivery, with traditional Malay wedding education.

Partner: ThenFrame Photography Studio; contact: Encik Izzudin, studio owner, via WhatsApp.

| Evidence ID | Source | Planning implication / qualification |
| --- | --- | --- |
| INT01 | Written owner interview in the “ThenFrame AD Stakeholder” WhatsApp group, 28 October 2026 | Manual booking, communication, photo organization and final delivery take too much time. Supports US03, US05–US07 and US09–US10. |
| OBS01 | Planned studio observation; session date to be confirmed | Pending. Record response/delivery baselines and verify actual tools; findings may change US05–US07 ordering. |
| ASM01 | Team assumption, not confirmed in INT01 | Customer accounts, public browsing, AI summaries, AI FAQ and customer feedback need owner validation at Sprint 1 Review. |
| ASM02 | S02 assumption, not confirmed in INT01 | WhatsApp, calls, Google Drive and hard disks are assumed current tools; verify through OBS01. |
| SULAM01 | Course community objective | Supports US13; course goal rather than partner evidence. |

## Ordered backlog

Detailed stories and refinement templates by sprint:

- [Sprint 1 — US01–US04](sprint-1/sprint1-user-story.md): acceptance criteria and task allocation.
- [Sprint 2 — US05–US07](sprint-2/sprint2-user-story.md): user stories and detail templates.
- [Sprint 3 — US08–US10](sprint-3/sprint3-user-story.md): user stories and detail templates.
- [Sprint 4 — US10–US13](sprint-4/sprint4-user-story.md): user stories and detail templates; US10 continues from Sprint 3.

Estimates use Fibonacci story points (1, 2, 3, 5, 8, 13), representing relative effort, complexity and uncertainty, not hours. Sprint allocation is a forecast and may change with progress and partner feedback.

| Order / ID | Feature | Priority | Points | Planned sprint | Evidence |
| --- | --- | --- | --- | --- | --- |
| 1 / US01 | Customer registration and login | Must | 3 | 1 | ASM01 |
| 2 / US02 | Secure administrator login | Must | 3 | 1 | Security assumption |
| 3 / US03 | Gallery upload and management | Must | 5 | 1 | INT01 |
| 4 / US04 | Public portfolio browsing | Must | 5 | 1 | ASM01 |
| 5 / US05 | Customized booking enquiries | Must | 8 | 2 | INT01 |
| 6 / US06 | Booking review and calendar availability | Must | 5 | 2 | INT01 |
| 7 / US07 | Consultation scheduling and booking confirmation | Must | 5 | 2 | INT01 |
| 8 / US08 | AI booking enquiry summaries | Should | 5 | 3 | ASM01 |
| 9 / US09 | Private client albums and final photo delivery management | Must | 8 | 3 | INT01 |
| 10 / US10 | Customer private album viewing, selection and download | Must | 8 | 3–4 | INT01 |
| 11 / US11 | AI FAQ assistant | Could | 5 | 4 | ASM01 |
| 12 / US12 | Customer ratings and feedback | Could | 3 | 4 | ASM01 |
| 13 / US13 | Traditional Malay wedding heritage content | Should | 3 | 4 | SULAM01 |

### User stories

- **US01:** As a newlywed couple or new user, I want to register a secure account and log in, so that my personal details and booking history are saved and tracked.
- **US02:** As a ThenFrame studio admin, I want to log in securely with administrator credentials, so that I can access the backend dashboard without unauthorized users breaking in.
- **US03:** As a ThenFrame studio admin, I want to upload and manage wedding photos in the gallery, so that I can organize and display my photography collections online.
- **US04:** As a visitor or newlywed couple, I want to browse wedding styles and collections, so that I can find ideas for my wedding before deciding to book.
- **US05:** As a customer, I want to submit booking enquiries online and customize photography packages, so that I can choose services that suit my needs and budget.
- **US06:** As a ThenFrame studio admin, I want to review incoming booking requests and check studio calendar availability, so that I can avoid booking conflicts and manage customer enquiries efficiently.
- **US07:** As a ThenFrame studio admin, I want to schedule online or offline consultations and confirm booking details with clients, so that I can finalize bookings and keep customers informed.
- **US08:** As a ThenFrame studio admin, I want the system to use AI to summarize customer booking enquiries, so that I can quickly understand customer needs and respond more efficiently.
- **US09:** As a ThenFrame studio admin, I want to upload and organize client wedding photos into private albums and provide final edited photos for delivery, so that I can manage photo selection and delivery in one system.
- **US10:** As a customer, I want to view my private wedding album, select my preferred photos and download the final edited photos, so that I can receive my wedding photos conveniently.
- **US11:** As a newlywed couple or visitor, I want to interact with an AI assistant to get instant answers to common questions (FAQ) about packages and studio information, so that I can get quick information anytime without waiting for manual replies.
- **US12:** As a newlywed couple, I want to submit ratings and feedback after our photo session, so that I can share my experience and help improve future services.
- **US13:** As a visitor or customer from any cultural background, I want to browse and learn about traditional Malay wedding attire and heritage stories on the website, so that I can appreciate local Malay customs and choose to experience a cross-cultural traditional Malay photoshoot.

### Epics and dependencies

| Epic | Stories | Outcome |
| --- | --- | --- |
| 1. Customer Experience & Booking | US01, US04, US05 | Browse, register and submit customized enquiries. |
| 2. Studio Operations & Management | US02, US03, US06, US07 | Secure management, galleries, requests, availability and consultations. |
| 3. Client Photo Management and Delivery | US09, US10 | Private albums, selection and final photo download. |
| 4. AI-Powered Automation & Support | US08, US11 | Booking enquiry summaries and service FAQ answers. |
| 5. Customer Feedback and Cultural Heritage | US12, US13 | Feedback and traditional Malay wedding knowledge. |

US02 enables US03; US03 supplies US04. US05 supplies enquiries for US06 and US08; US07 supports consultation and confirmation. US09 supplies private albums for US10. Private photo delivery follows core login, gallery and booking work. Risks include authentication, upload performance, private access, storage, booking conflicts, package customization and AI integration.

## Sprint 1 acceptance criteria

These are requirement lists, not completed checklists. Record results and evidence separately.

### US01 — Customer registration and login

1. New users can register with a name, unique username, email address and valid password.
2. Registered users log in with their username and password.
3. Incorrect login details display an error message.
4. The system prevents duplicate email registration and enforces unique, case-insensitive usernames.
5. Users can log out and cannot access protected account pages after logging out.

Dependencies/risks: user database and authentication; secure password storage; authentication failures can prevent access. Booking history depends on US05 in Sprint 2.

### US02 — Administrator login

1. Authorized admins log in with their username and password.
2. Successful admin login redirects to the admin dashboard.
3. Incorrect login details display an error message.
4. Regular customers cannot access admin-only pages.
5. Admins can log out, and protected dashboard pages cannot be accessed after logout.
6. Public users cannot register themselves as administrators.

Dependencies/risks: authentication, user database, roles and access permissions. Incorrect controls may expose private studio information.

### US03 — Gallery management

1. Logged-in admins can upload wedding photos to the system.
2. Admins can create a gallery collection with a title and description.
3. Admins can add uploaded photos to a selected collection.
4. Admins can view, edit and delete their uploaded photos and collections.
5. The system accepts JPG/JPEG, PNG and WebP images up to 8 MB (8,388,608 bytes) per file, and rejects unsupported file types or larger files.
6. Uploaded photos and collection details remain saved after refreshing the page.
7. Regular customers and visitors cannot access photo upload or gallery management functions.

Dependencies/risks: US02, photo storage, gallery database, wedding photographs and permission to display them. Large images affect storage/loading; editing and deletion must avoid accidental loss. The agreed per-file upload limit is 8 MB (8,388,608 bytes), with JPG/JPEG, PNG and WebP supported.

### US04 — Public portfolio browsing

1. Visitors can browse public wedding photography collections without logging in.
2. Visitors can open a collection to view its wedding photos and details.
3. Visitors can view different wedding photography styles and collections.
4. Only photos and collections marked as public are displayed to visitors.
5. The gallery works properly on both mobile and desktop screens.
6. The system displays a message when a collection has no photos.
7. Visitors cannot upload, edit or delete gallery photos or collections.

Dependencies/risks: US03, uploaded collections/photos and studio permission for public display. Large images affect loading; incorrect permissions may expose private photos.

### Sprint 1 task allocation

| Story | Task | Members | Expected evidence |
| --- | --- | --- | --- |
| US01 | Design registration/login pages | Phang, Munif | UI screenshots |
| US01 | Create user database structure | Naqyuddin, Ezz, Munif | Database schema |
| US01 | Develop registration/login/logout | Awwab, Ezz | Working authentication |
| US01 | Test valid/invalid login access | Munif, Phang | Test results |
| US02 | Design admin login/dashboard | Ezz, Phang | UI screenshots |
| US02 | Set up authorized accounts/roles | Awwab, Ezz | Database records and role configuration |
| US02 | Develop admin login/dashboard access | Phang, Munif, Naqyuddin | Working admin dashboard |
| US02 | Test invalid login/unauthorized access | Munif, Naqyuddin | Test results |
| US03 | Design upload/gallery management pages | Phang, Munif | UI screenshots |
| US03 | Create photo/collection database structures | Awwab, Ezz | Database schema |
| US03 | Implement upload/file validation | Naqyuddin, Ezz | Working upload function |
| US03 | Implement collection creation/editing/deletion | Munif, Phang | Working gallery management |
| US04 | Design portfolio/collection pages | Phang, Awwab | UI screenshots |
| US04 | Develop browsing/photo viewing | Naqyuddin, Munif | Working portfolio pages |
| US04 | Connect portfolio to gallery database | Ezz, Awwab | Displayed gallery data |
| US04 | Implement public access/visibility rules | Phang, Munif, Naqyuddin | Access-control test results |
| US04 | Test gallery across device screens | Naqyuddin, Awwab | Responsive test results |

## MVP scope and validation

**Included MVP:** US01–US07. Customers browse collections, register/log in, select/customize a package, submit an enquiry and receive confirmation after consultation. Admins log in, manage galleries/packages, review enquiries, check availability, schedule consultations and confirm bookings.

**Deferred beyond MVP:** US08 (AI/data dependency), US09–US10 (login/gallery/booking prerequisites; Sprints 3–4), US11 (additional AI), US12 (after core booking), US13 (additional heritage content). Deferred does not mean removed from the product backlog.

| Success measure | Proposed target | Method |
| --- | --- | --- |
| Booking enquiry submission | 90% successful completion; users complete without help | Task-based user testing |
| Admin booking management | Review a booking without critical errors | Partner demonstration |
| Portfolio accessibility | Functional on mobile and desktop | Responsive testing |
| User satisfaction | Average 4/5 | Post-testing feedback form |
| Reliability | No critical errors in core workflows | Functional testing |

Enquiry response time and photo delivery time targets must be agreed after OBS01 baseline collection.

Partner validation plan: calendar schedules user review/feedback on 17 November, internal Sprint Review on 18 November and class demos on 19–20 November 2026; partner participation and OBS01 timing remain to be confirmed; MVP demonstration after Sprint 2; studio testing of gallery/booking management; simulated enquiries and consultations; interviews/usability feedback; improvements ordered by partner feedback. These are proposed activities subject to partner availability/agreement, not recorded completed events.

Feasibility requirements: desktop/mobile browser access, development/test environment before public deployment, customer/admin roles, secure authentication, restricted management access, protection of customer information/private photos, advance coordination of partner sessions and core booking before AI/advanced photo management.

## Four-sprint schedule

Sprint 2 includes a one-week holiday extension. Sprints 3 and 4 each run for two weeks.

| Sprint | Current dates | Stories | Usable increment / review |
| --- | --- | --- | --- |
| 1 | 5–18 November 2026 | US01–US04 | Registration/login, admin upload/collections and public portfolio. |
| 2 | 19 November–9 December 2026 | US05–US07 | Customized enquiries, request review, availability and consultations. |
| 3 | 10–23 December 2026 | US08–US10 | AI enquiry summaries and private client album management. |
| 4 | 24 December 2026–6 January 2027 | US10–US13 | Complete photo selection/download, FAQ, feedback and heritage. |

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

## Username login

Customers and admins use a unique username and password. Usernames have 3–40 characters, start with a letter and contain only letters, numbers or underscores; comparison is case-insensitive. Email remains required for confirmation and password recovery. Existing accounts have usernames assigned and can change them in Account settings. Email is not offered as a website login method. Username changes affect only the current account and never its role.

## Items to refine

- **US05–US13:** agree detailed acceptance criteria before implementation and acceptance.
- **US03 upload acceptance:** verify JPG/JPEG, PNG and WebP uploads at or below 8 MB, and rejection of unsupported formats and files above 8 MB.
- **Test framework:** the original plan specified Pest; the repository uses Vitest plus manual testing. Record the team's agreed testing approach.
- **Partner validation:** confirm observation and review sessions, and use findings to refine the backlog.

Record approved scope changes and their reasons in the relevant sprint refinement document.
