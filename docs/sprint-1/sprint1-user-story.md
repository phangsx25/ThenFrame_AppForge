# Sprint 1 — User Story Details

Authentication, Gallery and Public Portfolio

- Stories: US01–US04
- Planned dates: 5 November 2026 – 18 November 2026 (two weeks).
- Source: `S04-02-G03-AppForge.pdf`, version 1.0, 4 November 2026.
- Reference: [Product backlog](../PRODUCT_BACKLOG.md).
- Requirements and templates do not establish implementation or acceptance. Track evidence in [VERIFICATION.md](../VERIFICATION.md).

Schedule basis: user-provided Sprint 1 calendar, adopted 14 November 2026. Sprint 1 runs 5–18 November; Sprint 2 runs 19 November–9 December, extended by one week for a holiday per user clarification (specific holiday dates not supplied). Sprints 3–4 continue from 10 December in consecutive 14-day blocks, replacing the PDF date forecast. Later-sprint dates are extrapolated, not additional dates shown in the calendar.


The source provides detailed stories and acceptance criteria on pp. 7–10. Original task assignments are historical; current ownership belongs on Kanban.

## US01 — Customer registration and login

**User story:** As a newlywed couple or new user, I want to register a secure account and log in, so that my personal details and booking history are saved and tracked.

**Priority:** Must · **Estimate:** 3 points · **Evidence:** ASM01

### Acceptance criteria

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

## US02 — Administrator login

**User story:** As a ThenFrame studio admin, I want to log in securely with administrator credentials, so that I can access the backend dashboard without unauthorized users breaking in.

**Priority:** Must · **Estimate:** 3 points · **Evidence:** Security assumption

### Acceptance criteria

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

## US03 — Gallery management

**User story:** As a ThenFrame studio admin, I want to upload and manage wedding photos in the gallery, so that I can organize and display my photography collections online.

**Priority:** Must · **Estimate:** 5 points · **Evidence:** INT01

### Acceptance criteria

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

## US04 — Public portfolio browsing

**User story:** As a visitor or newlywed couple, I want to browse wedding events and collections, so that I can find ideas for my wedding before deciding to book.

**Priority:** Must · **Estimate:** 5 points · **Evidence:** ASM01

### Acceptance criteria

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


## Original task allocation

| Story | Task | Original members | Expected evidence |
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

## Completion rules

Use the [Definition of Done](../PRODUCT_BACKLOG.md#definition-of-done). It includes acceptance/error/access cases, tests, reviewed PR merged to main, phone/desktop operation, staging deployment, no private client data in Git and Product Owner acceptance. Use Vitest plus appropriate actual manual/integration checks for this project.

## Sprint 1 calendar activities

| Date (2026) | Activity |
| --- | --- |
| 5 November | Sprint start and planning: goals, scope and tasks. |
| 6–15 November | Development; 9 November is marked as the Deepavali public holiday in the supplied calendar. |
| 11 November | Backlog refinement. |
| 16 November | Testing and refinement. |
| 17 November | User review and feedback; video recording required. |
| 18 November | Sprint end, internal Sprint Review and finalize MVP (calendar wording). |
| 19 and 20 November, 08:00–10:00 | Sprint 1 demo and presentation during class; these dates fall after Sprint 1 ends. |

Sprint 2 starts on 19 November. The calendar phrase “finalize MVP” does not change the backlog scope: the full MVP includes US01–US07 across Sprints 1–2. Partner availability and actual acceptance still need evidence.
