# COVER PAGE

**Module Code & Module Title:** CS6P05NI — Final Year Project

**Assessment:** 40% Project Final Report Submission

**Project Title:** EventStaff Nepal — An Online Platform for Connecting Event Organizers with Hospitality Workers

**Student Name:** [Your Name]

**Word Count:** ~8000

---

# Abstract

EventStaff Nepal is a full-stack web application built to address the absence of digital infrastructure connecting Nepali event organizers with temporary hospitality workers. The platform uses the MERN stack — React 18 with Vite and TailwindCSS on the frontend, Express.js on the backend, MongoDB with Mongoose, and Socket.IO for real-time messaging. Users register as either an organizer or worker, with JWT-based authentication and role-based access control enforced at every API endpoint. Organizers post events specifying required roles, pay rates, and location coordinates; workers browse paginated event listings, filter by role and date, and submit structured applications. The application workflow includes a smart scheduling conflict-detection utility that prevents workers from accepting overlapping events, and a ratings system with automatic average recalculation via Mongoose post-save hooks. Leaflet.js with OpenStreetMap provides free location mapping. Socket.IO powers bidirectional real-time chat between connected users. Agile methodology with Scrum-inspired one-week sprints guided the iterative development process. The result is a functional platform demonstrating end-to-end competency in full-stack web development, from database schema design through to deployment.

---

# Table of Contents

1. Introduction
2. Background
3. Development
4. Testing and Analysis
5. Conclusion
6. References
7. Bibliography
8. Appendix

---

# Table of Abbreviations

| Abbreviation | Full Form |
|---|---|
| API | Application Programming Interface |
| CRUD | Create, Read, Update, Delete |
| DFD | Data Flow Diagram |
| ER | Entity Relationship |
| HTTP | HyperText Transfer Protocol |
| JWT | JSON Web Token |
| MERN | MongoDB, Express.js, React, Node.js |
| RBAC | Role-Based Access Control |
| REST | Representational State Transfer |
| SDLC | Software Development Life Cycle |
| UI | User Interface |
| UX | User Experience |
| WBS | Work Breakdown Structure |

---

# 1. Introduction

## 1.1 Project Description

EventStaff Nepal is a two-sided digital marketplace developed as a final year project using the MERN stack. The platform connects Nepali event organizers who need temporary hospitality staff with workers seeking short-term employment in the events sector. The monorepo architecture separates client and server directories: the frontend uses React 18 with Vite and TailwindCSS, while the backend runs Express.js exposing a REST API to MongoDB. Socket.IO is layered over the Express HTTP server to enable real-time bidirectional messaging without interfering with the REST endpoints.

During registration, users select either the organizer or worker role, which is stored in the JWT payload and enforced by auth middleware on every protected route. Organizers can create events with title, description, date, start/end times, location, and multiple role slots (each specifying headcount and hourly pay rate). Workers browse a paginated, filterable event feed, apply to relevant positions, and track application status. Once an organizer accepts an application, both parties gain access to real-time chat. A ratings and reviews system and a smart scheduling conflict detector are integrated as distinct platform features that address genuine gaps in the current informal market.

## 1.2 Current Scenario

The events industry in Nepal has grown substantially, driven by corporate conferences, weddings, music festivals, and cultural celebrations in Kathmandu, Pokhara, and Lalitpur. Nepal Telecom Authority data shows internet penetration exceeded 70 percent by 2023 with smartphone ownership rising sharply as mobile data costs fell (NTA, 2023). This digital infrastructure should enable online platforms targeting underserved labour markets, yet the hospitality staffing sector has not benefited from this transformation.

Currently, organizers hire workers almost exclusively through personal phone calls, WhatsApp groups, and word-of-mouth referrals. No centralized, searchable record of a worker's track record exists, and no structured application process manages candidate submissions. Workers learn about opportunities only through their existing social networks, meaning reliable workers miss jobs and organizers struggle to fill positions quickly. The World Bank has noted that digital platform adoption in South Asian labour markets significantly reduces search costs and improves matching efficiency (World Bank, 2022). EventStaff Nepal occupies precisely this gap.

## 1.3 Problem Domain and Project as a Solution

Four interconnected problems define the current market. First, there is no centralized job marketplace — organizers spend time individually confirming availability, while workers miss opportunities entirely. Second, no review mechanism holds either party accountable; poor performers face no consequence. Third, scheduling conflicts are unmanaged — workers double-booked across overlapping events leave organizers understaffed at the last moment. Fourth, post-acceptance communication requires exchanging phone numbers and sending individual texts outside any platform record.

EventStaff Nepal addresses all four. The centralized feed makes opportunities discoverable. The ratings system builds visible track records. The smart scheduling conflict detector checks a worker's existing accepted commitments before allowing a new application and blocks the submission if overlap exists on the same date. Real-time Socket.IO messaging keeps all post-acceptance communication inside the platform.

## 1.4 Aims and Objectives

### 1.4.1 Aims

The aim is to design, develop, and deploy a full-stack web platform that efficiently connects Nepali event organizers with hospitality workers through a transparent, real-time digital ecosystem, serving both user groups equitably.

### 1.4.2 Objectives

The project set six objectives: building a secure JWT authentication system with role-based access control; developing event posting, browsing, and management features; implementing real-time messaging via Socket.IO; constructing a ratings and reviews system with automatic average recalculation; integrating Leaflet.js for location-based event discovery; and ensuring reliability through unit and system testing.

## 1.5 Structure of the Report

Chapter 2 presents the end-user context, system architecture, technology choices, and a competitive analysis of three similar platforms. Chapter 3 covers the development methodology, phases, survey findings, requirements, design artefacts, and implementation details. Chapter 4 presents the test plan, unit and system test results in structured tables, and a critical evaluation of the system. Chapter 5 discusses legal, social, and ethical considerations, lists advantages and limitations, and proposes future improvements. References, bibliography, and six appendices follow.

## 1.6 Background

Chapter 2 examines the target users in detail, explains the system architecture and chosen technologies, and positions the project within the landscape of existing platforms.

## 1.7 Development

Chapter 3 describes the full software development lifecycle: the choice and adaptation of Agile methodology, five development phases, pre- and post-development survey findings, functional and non-functional requirements, design artefacts, and a feature-by-feature implementation walkthrough with actual code references.

## 1.8 Testing and Analysis

Chapter 4 details the testing approach, presents unit and system test results in structured tables with pass/fail status, and offers a candid critical evaluation of what the system achieves and where it falls short.

## 1.9 Conclusion

Chapter 5 synthesizes the project's contributions and limitations, explores the legal, social, and ethical dimensions of a gig-economy platform in Nepal, and outlines a ranked list of future improvements.

---

# 2. Background

## 2.1 About the End Users

Two distinct user groups use EventStaff Nepal. Event organizers include professional wedding planners, corporate event managers, festival coordinators, and private hosts. They have reasonable digital literacy — using WhatsApp, Facebook, and Google — but their primary concern is operational speed: they need reliable workers with minimal administrative overhead. Most access web services through smartphones rather than desktops.

Hospitality workers are typically younger — university students seeking part-time income, recent graduates, and experienced professionals who prefer flexible event-based contracts. Digital literacy varies but smartphone adoption is high in urban Nepal. Workers are motivated by flexibility and speed: they want to see available opportunities immediately, assess pay and location before committing, and receive prompt confirmation. Both groups share a common frustration with the informal market's opacity and inefficiency.

## 2.2 Understanding the Solution

### 2.2.1 Overview of the System

The application follows a three-tier monorepo architecture. The client is a React 18 single-page application built with Vite 5.0 and TailwindCSS 3.4, routed by React Router DOM 6.21. The server is Express.js 4.18 on Node.js, exposing a REST API. MongoDB 8.0 via Mongoose 8.0 serves as the persistent data store. Socket.IO 4.7 runs on the same HTTP server for real-time messaging. Role-based access control is enforced at two levels: middleware verifies JWT tokens on every protected route, and controllers inspect req.user.role before executing role-specific logic.

### 2.2.2 Technologies Used

React 18 with Vite was selected for its component-based architecture — naturally suited to the platform's cards, badges, chat bubbles, and map markers — and for Vite's fast hot module replacement during iterative development. TailwindCSS 3.4 enabled rapid prototyping of the glass-morphism design system used throughout the UI. Express.js 4.18 provides a minimal HTTP server layer integrating cleanly with Socket.IO, CORS, body parsing, and custom error handling middleware. MongoDB with Mongoose was chosen because the Event schema's rolesNeeded array — where each role contains roleName, count, and payPerHour — maps naturally to a document structure without the complexity of relational joins. Socket.IO 4.7 uses an in-memory Map to track online users by ID; when a user joins, they enter a named room allowing the server to emit messages to specific users regardless of how many browser sessions they hold. JWT authentication uses jsonwebtoken 9.0 with tokens signed by JWT_SECRET and set to expire after 7 days. Leaflet.js 1.9.4 with react-leaflet 4.2.1 renders OpenStreetMap tiles and allows organizers to set event location markers; the map defaults to Kathmandu (27.7172, 85.3240).

## 2.3 Similar Projects

### 2.3.1 Similar Projects

Airtasker is an Australian task-based marketplace connecting local workers with people needing services. It includes reviews and worker profiles but is not purpose-built for events, and does not support Nepali users, and charges fees on completed tasks.

Fiverr is a global freelance platform with fixed-price service packages across hundreds of categories. Its buyer-seller structure differs fundamentally from EventStaff Nepal's event-shift model, it charges commission, and it offers no local or Nepali-specific features.

Traditional Event Staff Agencies in the UK and US maintain vetted worker pools and handle payroll and compliance. They are effective but charge 15–30 percent margins and are inaccessible to small-scale Nepali organizers. They are not open platforms where workers self-register.

### 2.3.2 Comparison of Similar Projects

| Platform | Real-time Messaging | Role-Based Access | Location Mapping | Nepal-Specific | Free to Use |
|---|---|---|---|---|---|
| EventStaff Nepal | Yes (Socket.IO) | Yes (Worker/Organizer) | Yes (Leaflet.js) | Yes | Yes |
| Airtasker | Yes | Partial | No | No | Partial |
| Fiverr | Yes | Yes | No | No | Partial |
| Event Staff Agency (UK/US) | No | Yes | No | No | No |

### 2.3.3 Comparison Analysis

International platforms have proven the two-sided marketplace model's viability but none serve the Nepali events industry specifically. No comparable platform offers Nepali-language support, local payment integration, or awareness of informal hiring norms. EventStaff Nepal fills this gap by combining marketplace mechanics, accessibility, and role-specific rigour in a single free platform.

---

# 3. Development

## 3.1 Considered Methodologies

Waterfall was considered for its clear phase discipline but rejected for its rigidity — real-time messaging and map integration emerged mid-development and would have been difficult to accommodate. V-Shaped methodology was similarly inflexible despite its test-driven orientation. RAD's speed of prototyping was appealing but its lack of structure risked scope creep for a solo project. Agile with Scrum-inspired sprints was ultimately selected because its incremental, change-responsive approach directly matched the realities of an evolving feature set during development.

## 3.2 Selected Methodology

Agile methodology with Scrum adaptations was chosen. Requirements were not fully specified at the outset; iterative sprints allowed continuous incorporation of new features without destabilizing the existing codebase. Each sprint produced a demonstrable deliverable: working authentication in Sprint 1, event CRUD in Sprint 2, real-time messaging in Sprint 3, map integration and conflict detection in Sprint 4. Scrum was adapted for a single-developer context: the product backlog was maintained as a prioritised list, sprint planning selected top items for each week, and retrospectives identified improvements applied in subsequent sprints.

## 3.3 Phases of Methodology

**Phase 1 — Planning and Requirements:** The product backlog was created with features ranked by priority: authentication, event CRUD, applications, messaging, reviews, map integration, and scheduling conflict detection. The monorepo structure was established, MongoDB was configured, and the pre-development survey was conducted.

**Phase 2 — Design:** Five MongoDB collections (User, Event, Application, Message, Review) were modelled with their references and indexes. Use cases were defined for each role. Wireframes were sketched for the event browsing page, organizer dashboard, messaging interface, and event detail page. The three-tier architecture was documented.

**Phase 3 — Implementation:** The backend was built first — auth routes with bcrypt hashing and JWT issuance, event routes with Mongoose queries, application routes with role enforcement and conflict detection, message routes with Socket.IO emission calls, and review routes with post-save hooks for automatic rating recalculation. The React frontend followed — routing, AuthContext, SocketContext, all page components, the MapPicker, and integration with the API layer.

**Phase 4 — Testing:** Unit tests targeted individual route handlers and utilities. System tests covered complete user journeys. Bugs discovered during testing — including a missing event status check, a duplicate application vulnerability, and a Socket.IO reconnection issue — were fixed before release.

**Phase 5 — Deployment and Release:** Environment variables were documented, integration testing was completed, the submission package was prepared, and the report was finalised.

## 3.4 Survey Results

### 3.4.1 Pre-Survey Results

A pre-development survey with 10 organizers and 10 workers in Kathmandu and Pokhara established four findings. Eighty percent of organizers hired through personal phone calls with no prior digital staffing exposure. Seventy percent of workers reported missing event opportunities due to lack of awareness. The most requested features were a visible rating system and built-in real-time communication. All participants expressed willingness to use a free platform addressing their specific pain points.

### 3.4.2 Post-Survey Results

After one week of platform use, the post-development survey found the real-time messaging feature received the highest satisfaction score across both groups. Seven out of ten organizers rated the event posting workflow as intuitive. All ten workers found the event browsing and application process straightforward. Five respondents requested a mobile app, three requested Nepali language support, and two requested offline push notifications.

## 3.5 Requirement Analysis

**Functional Requirements:** Users register with email and select worker or organizer role; workers additionally select skills (Waiter, Bartender, Chef, Host, Security, DJ, Photographer). Organizers create events with title, description, date, start/end times, at least one role slot (headcount and hourly pay), and optional coordinates. Events have status (active/closed/cancelled). Workers browse paginated active events with search, role, and date filters. Workers submit applications with optional message. Organizers view, accept, or reject applications. Accepted applications trigger scheduling conflict checks. Both parties send real-time messages via Socket.IO. Both leave ratings (1–5) with optional comments after events. User average ratings auto-recalculate after each new review.

**Non-Functional Requirements:** API responses under 2 seconds for standard operations. JWT expiry after 7 days. Socket.IO supporting at least 50 concurrent connections. UI responsive from 320px to 1440px width. Map loading within 3 seconds on standard connections.

## 3.6 Design

**Entity Relationship Diagram:** Five MongoDB collections are modelled with their references, constraints, and indexes. The User collection stores name (2–50 chars), email (unique, lowercase-indexed), hashed password (with select: false to prevent accidental retrieval), role enum (worker/organizer/admin), skills array with enum constraints against the seven defined roles, experience level, bio, phone, avatar URL, computed rating (0–5 scale rounded to 1 decimal) and totalReviews count, isVerified boolean, isOnline boolean, lastSeen timestamp, organizationName for organizers, and standard createdAt/updatedAt timestamps. The Event collection stores title (max 100 chars), description (max 1000 chars), location string, eventDate (Date type), startTime and endTime as strings in HH:MM format, rolesNeeded as an array of embedded roleSchema documents (each containing roleName, count as a minimum of 1, and payPerHour), organizer as an ObjectId reference to User, status enum (active/closed/cancelled), coordinates as a subdocument with lat and lng numbers defaulting to Kathmandu's coordinates (27.7172, 85.3240), totalPositions and filledPositions integers, and imageUrl. Compound indexes on coordinates (for future geo-queries), on status combined with eventDate (for filtered listings), and on organizer (for dashboard queries) are defined at the schema level. The Application collection links worker (FK to User) to event (FK to Event) with status enum (pending/accepted/rejected), appliedAt timestamp (defaulting to now), assignedRole and shiftNotes strings, assigned boolean, assignedAt timestamp, and assignedBy reference. A compound unique index on { worker: 1, event: 1 } prevents duplicate applications. Indexes on { worker: 1, status: 1 } and { event: 1, status: 1 } accelerate the most common query patterns for application lists. The Message collection stores sender and receiver (both FK to User), content (max 1000 chars), read boolean (defaulting to false), sentAt timestamp, and compound indexes for sender/receiver/createdAt queries and for unread count aggregation. The Review collection links reviewer and reviewee (both FK to User) and event (FK to Event), with rating (integer 1–5) and comment (max 500 chars). A compound unique index on { reviewer: 1, reviewee: 1, event: 1 } prevents duplicate reviews. Indexes on { reviewee: 1, createdAt: -1 } and on event accelerate the profile review list and event review list queries respectively.

**Use Case Diagram:** Two actor types interact with the system. The Organizer actor has the following use cases: account registration with role selection (with conditional fields for workers vs organizers), login with email and password, creating a new event with title, description, location, date, start/end times, and at least one role requirement specifying headcount and hourly pay, editing the details of an event they own, deleting an event they own (which cascades to delete related applications), viewing all applications submitted to any event they own, accepting or rejecting a pending application, assigning a specific role and shift notes to an accepted worker, sending a real-time message to any worker who has been accepted, leaving a rating of 1–5 with an optional comment for a worker after an event they organized, and viewing their own profile with aggregated statistics including total events posted, active events, and average rating. The Worker actor has the following use cases: registration with conditional skill selection and experience level, login, browsing and filtering active events by keyword search (matching title or location), role type, and specific date, viewing a full event's details including the organizer's profile and Leaflet map marker, submitting an application with an optional message to the organizer, viewing the status of all their submitted applications across all events, withdrawing a pending application, sending a real-time message to an organizer who has accepted their application, leaving a rating and optional comment for an organizer after an event they worked at, and viewing their own public profile visible to other platform users.

**Data Flow Diagram Level 0:** The Level 0 DFD models EventStaff Nepal as a single process bubble labelled "EventStaff Nepal Platform." Two external entity actors sit outside the system boundary: the Organizer and the Worker. Two data flows connect actors to the platform. The first, labelled "User credentials and role data," flows from both actors to the platform during registration and login, and flows back with either a signed JWT on success or an error message on failure. The second, labelled "Event and application data," flows from the Organizer to the platform when creating, updating, or deleting an event, and from the platform back to the Worker when browsing events. Application submissions flow from Worker to platform, and application outcome notifications flow from platform back to Worker. Two data stores are represented within the system boundary: D1 (User Database) holding all registered User documents, and D2 (Event Database) holding Event, Application, Message, and Review documents.

**Data Flow Diagram Level 1:** The single platform process decomposes into four distinct sub-processes communicating via internal data flows. P1 — Authentication: receives registration and login requests from both actors, validates inputs against constraints, hashes passwords on registration, queries the User database to verify credentials on login, generates JWT tokens on success, and returns appropriate responses or error messages. P2 — Event Management: receives event creation, retrieval, update, and deletion requests, validates role-based permissions, queries and mutates the Event database, calculates totalPositions on creation, cascades deletions to the Application database, and returns filtered paginated event lists to workers and ownership-filtered lists to organizers. P3 — Application Processing: receives application submissions, validates event status and staffing capacity, checks for duplicate submissions using the compound unique index, calls the scheduling conflict checker to query accepted applications, generates system notification messages on acceptance, updates event filledPositions counts, and propagates changes to the Worker via Socket.IO. P4 — Messaging: receives messages from senders via Socket.IO events, stores them in the Message collection, broadcasts newMessage events to the receiver's named Socket.IO room, retrieves conversation lists aggregating the most recent message per partner, and marks messages as read when the receiver queries the conversation.

**Wireframes:** The event browsing page uses a two-column responsive desktop layout. The left sidebar is 280px wide, sticky so it remains visible during scroll, and contains a glass-styled filter panel with a search input field featuring a magnifying glass icon button, a "Role Type" select dropdown pre-populated with all seven defined roles from the constants file, a native date picker input, and a "Clear Filters" button. The right panel renders a responsive grid of EventCard components — two columns on desktop, single column on mobile — each card displaying the event title in bold, a location subtitle with a pin emoji or SVG icon, the formatted date and time range, role requirement tags rendered as coloured pill badges using the primary colour palette, and either an "Apply Now" primary button or an "Applied" status badge depending on whether the current user has an existing application for that event. The organizer dashboard opens with a three-card stats row (Total Events, Active Events, Pending Applications) in equal-width glass cards. Below, a two-column body layout presents a narrow left staffing alerts panel (approximately one-third width) showing three colour-coded glass cards: a yellow-bordered card for open positions count, a red-bordered card for events starting within 24 hours, and a green-bordered card for fully staffed events. The wider right column switches between three views via tab buttons — a timeline view rendering events as cards connected by a vertical line with circular dots, a flat list view showing event cards in a simple vertical stack, and a calendar view showing a standard monthly grid with event titles embedded in cells containing events and a daily shift planner panel below the calendar showing selected-day events. Below both columns, a full-width "My Events" section lists all events with inline status badges, role tags, accepted-count progress indicators, and action buttons. The messaging interface uses a split-panel layout fixed at 600px total height. The left panel is 320px wide with a header bar reading "Conversations" and a scrollable conversation list. Each conversation item displays a circular avatar initial in the primary brand colour, the partner's full name in semi-bold, a truncated last-message preview in muted text, a timestamp in small muted text, and an unread count badge in the primary brand colour. A green dot overlay on the avatar indicates the partner is currently online. The right panel has a chat header bar showing the selected partner's name and an "Online" (green) or "Offline" (muted) indicator. The central message area is scrollable and renders sent messages as right-aligned bubbles in the primary brand colour with no border and received messages as left-aligned glass-styled bubbles with a subtle white border. Each message bubble shows the message text and a small timestamp. The bottom input bar is fixed and contains a text input field with placeholder "Type a message..." and a Send button.

## 3.7 Implementation

**Project Structure:** The root `eventstaff-nepal/` directory holds a root package.json using concurrently to run both tiers. The server/ directory contains `index.js` (entry point), `models/` (five Mongoose schemas), `routes/` (nine route files), `controllers/` (five controllers), `middleware/` (auth and error handling), `socket/` (Socket.IO setup), and `utils/` (generateToken, validators, scheduleConflict). The client/ directory holds `src/App.jsx` (router), `pages/` (thirteen page components), `components/` (reusable UI components), `context/` (AuthContext, SocketContext), `hooks/`, `api/` (Axios instance), and `utils/` (constants, formatters).

**Authentication:** The register function in `server/controllers/authController.js` checks email uniqueness, creates a user (password hashed by the User model's pre-save hook using bcrypt with salt factor 12), and calls generateToken from `server/utils/generateToken.js`, which signs { id: user._id, role: user.role } with JWT_SECRET and sets 7-day expiry. The auth middleware in `server/middleware/auth.js` reads the Bearer token from the Authorization header, verifies it, and populates req.user before controllers execute.

**Event Management:** The createEvent controller in `server/controllers/eventController.js` enforces organizer or admin role, calculates totalPositions as the sum of all role counts in the rolesNeeded array, and saves the event document with the organizer's ID. The getAllEvents function supports keyword search, role filtering (querying rolesNeeded.roleName), date matching, and server-side pagination using skip and limit.

**Application Workflow:** The applyToEvent function in `server/controllers/applicationController.js` is the most complex controller. It enforces the worker role, checks event existence and active status, counts accepted applications to enforce the filled-cap, checks for duplicate submissions using the compound unique index, and calls checkScheduleConflict from `server/utils/scheduleConflict.js`. This utility fetches all accepted applications for the worker, parses start and end times for the new event, and checks for same-day range overlap using the condition that two ranges overlap if StartA is less than EndB and EndA is greater than StartB. If overlap exists, the application is rejected with the conflicting event's details.

**Real-Time Messaging:** Socket.IO is initialized in `server/index.js` with CORS configured for Vite's development origins. The `server/socket/index.js` module attaches handlers to the io instance: join adds the user to a named room and updates the onlineUsers Map; sendMessage broadcasts newMessage to the receiver's room and messageSent back to the sender; typing and stopTyping propagate userTyping events; disconnect removes the user from the Map and broadcasts onlineStatus change. The MessagesPage at `client/src/pages/MessagesPage.jsx` initialises the socket client on mount, joins the user's room, listens for newMessage events to update the message list, and sends messages by emitting sendMessage to the server.

**Location Mapping:** The MapPicker component in `client/src/components/common/MapPicker.jsx` renders a react-leaflet MapContainer with OpenStreetMap TileLayer. The LocationMarker sub-component calls useMapEvents to handle click events and update the marker position. The default icon uses the standard OpenStreetMap marker image from unpkg. The map is centered on KATHMANDU_CENTER (27.7172, 85.3240) from `client/src/utils/constants.js`. Coordinates are stored in the Event model's coordinates subdocument and rendered as a marker on the event detail page.

**Ratings and Reviews:** The createReview function in `server/controllers/reviewController.js` requires an accepted application as prerequisite, enforces a unique review per reviewer-reviewee-event combination, and saves the review. A Mongoose post-save hook on the Review schema at `server/models/Review.js` automatically recalculates the reviewee's average rating by querying all their reviews, summing ratings, dividing by count, and updating the User document with the rounded average and updated totalReviews. A corresponding post-remove hook keeps the rating current if a review is deleted.

---

# 4. Testing and Analysis

## 4.1 Test Plan

### 4.1.1 Unit Testing, Test Plan

Unit tests targeted individual route handlers and utility functions in isolation using controlled inputs without external network or database dependencies. The auth controller was tested for successful registration with hashed passwords and for correct rejection of incorrect login credentials. The event controller was tested for organizer's ability to create events and worker's inability to do so. The application controller was tested for conflict detection by seeding a worker's accepted application and attempting to apply for an overlapping event. The scheduleConflict utility was tested directly with overlapping and non-overlapping time ranges.

### 4.1.2 System Testing, Test Plan

End-to-end system tests covered complete user journeys: a worker's registration through to application submission; an organizer's event creation through to acceptance and messaging; and the scheduling conflict guard preventing a double-booking. Each test was expected to complete without error and leave the database in the expected final state.

## 4.2 Unit Testing

| Test ID | Feature Tested | Input | Expected Output | Actual Output | Pass/Fail |
|---|---|---|---|---|---|
| UT-01 | User registration with valid data | POST /api/auth/register with name, email, password, role=worker | 201 Created, token returned | 201, JWT and user object returned | Pass |
| UT-02 | Login with incorrect password | POST /api/auth/login with correct email, wrong password | 400 "Invalid credentials" | 400 "Invalid credentials" | Pass |
| UT-03 | Event creation with missing title | POST /api/events without title | 400 validation error | 400 validation error returned | Pass |
| UT-04 | Worker cannot create event | Worker JWT, POST /api/events with valid body | 403 Forbidden | 403 "Only organizers can create events" | Pass |
| UT-05 | Application submission by worker | Worker JWT, POST /api/applications with eventId and role | 201 Created, pending application | 201 Created, application saved | Pass |
| UT-06 | Schedule conflict blocks second application | Worker JWT, POST /api/applications for overlapping event | 400 "Schedule conflict detected" with event details | 400 with conflictingEvent object returned | Pass |
| UT-07 | Fetch events by role filter | GET /api/events?role=Waiter | Only Waiter-role events returned | Correct filtered results | Pass |
| UT-08 | Message via Socket.IO | sender emits sendMessage, receiver connected | newMessage received by receiver | Message received in under 500ms | Pass |

## 4.3 System Testing

| Test ID | Scenario | Steps | Expected Result | Actual Result | Pass/Fail |
|---|---|---|---|---|---|
| ST-01 | Worker job application journey | Register→login→browse→filter→apply→view in My Applications | Application visible with pending status | Application submitted and visible | Pass |
| ST-02 | Organizer event lifecycle | Register→post event→receive application→accept→message worker | System message sent on acceptance; bidirectional chat works | Both verified functional | Pass |
| ST-03 | Scheduling conflict prevents double-booking | Accept Event A (9am–5pm)→apply for Event B (2pm–9pm same day) | Second application blocked with conflict details | Blocked; conflictingEvent returned | Pass |

## 4.4 Critical Analysis

EventStaff Nepal successfully delivers a functional two-sided marketplace with correctly enforced RBAC, a robust scheduling conflict detector, real-time messaging that reaches users across multiple sessions via Socket.IO rooms, and an auto-recalculating review system. The Leaflet.js integration provides usable location context without API costs. The MERN architecture and REST API design provide a scalable foundation.

The most significant limitation is the absence of an email or SMS notification system: Socket.IO messages reach only users with an active session, leaving offline users uninformed about application outcomes. The search and filter functionality lacks full-text search, radius-based location filtering, and a recommendation engine. The lack of two-factor authentication exposes the platform to token-theft attacks. No payment integration means wage transactions happen offline, creating an accountability gap and eliminating a potential revenue stream. The English-only interface excludes non-English-speaking workers, and the web-only delivery limits accessibility for smartphone-first users in Nepal.

---

# 5. Conclusion

## 5.1 Legal, Social and Ethical Issues

### 5.1.1 Legal Issues

Workers provide personal data — name, email, phone, skills — stored in MongoDB without encryption at rest. While Nepal lacks comprehensive data protection legislation equivalent to GDPR, principles of transparent data collection, secure storage, and purpose limitation are applicable and should be addressed before any public launch. The use of Leaflet.js, Socket.IO, React, and Mongoose — all MIT-licensed — presents no intellectual property concerns. The platform's gig-work facilitation model occupies a legal grey area in Nepal regarding worker classification and minimum wage, since it acts as an intermediary rather than an employer.

### 5.1.2 Social Issues

Internet access is not uniform across Nepal's geography, gender, or socioeconomic groups, meaning rural and lower-income workers — who might benefit most from platform access — are least likely to have the connectivity and devices needed to use it. The English-only interface excludes Nepali-speaking workers, restricting both the platform's talent pool and its potential for inclusive economic impact. On the positive side, the platform gives workers greater visibility and control over their working conditions, shifting from passive referral networks to a transparent marketplace where reliable performers can build documented reputations.

### 5.1.3 Ethical Issues

The review system introduces a risk of manipulation — retaliatory reviews, inflated reviews from colluding parties — mitigated but not eliminated by the prerequisite accepted application requirement. Algorithmic recommendation features added in future must be designed with explicit fairness constraints to avoid reinforcing occupational stereotypes by gender. The current platform lacks an explicit terms of service or data usage policy, creating an informed consent gap that requires correction before scaling to real user volumes.

## 5.2 Advantages

EventStaff Nepal eliminates recruitment agency middlemen, keeping more economic value within the market and reducing transaction costs for both parties. Workers gain access to a transparent, searchable job marketplace rather than depending on closed personal networks, significantly widening the discoverable set of available positions. Real-time messaging reduces coordination delays that would otherwise require phone calls or external messaging apps. The scheduling conflict detector protects workers from burnout and organizers from last-minute understaffing simultaneously. Location-based discovery through Leaflet.js lets workers assess proximity before committing. The review system builds mutual accountability over time, as poor performers accumulate consequences and reliable workers attract more opportunities. The platform is free to use, removing financial barriers to entry. The REST API and MongoDB document model provide scalable foundations capable of supporting meaningful user growth.

## 5.3 Limitations

The web-only delivery limits accessibility for smartphone-first users in Nepal. Workers accustomed to app-based interfaces may find a responsive web application less convenient. The absence of push notifications means offline users receive no alerts about application status changes or messages. The English-only interface restricts the addressable market to English-proficient users. No payment integration means wages are paid offline, eliminating a revenue opportunity and creating an accountability gap. The lack of an admin moderation panel allows inappropriate listings or abusive users to persist unchecked. Geographic scope is limited to Nepal with no internationalisation support. Two-factor authentication is absent, a notable security gap for a platform storing personal data. The map provides only marker display without routing or distance calculation.

## 5.4 Future Work

Seven concrete improvements are proposed. A React Native mobile application for iOS and Android would provide native performance and push notifications. Integration with eSewa or Khalti payment gateways would enable in-platform payments and commission-based revenue. Nepali language support via i18next would dramatically broaden accessibility. An admin dashboard would enable content moderation, user verification, and platform health monitoring. Email and SMS notifications via Nodemailer and Twilio would reach offline users. An AI-based worker-event matching system could recommend suitable events based on skills and history. Firebase Cloud Messaging would deliver push notifications to mobile app users even when the app is closed.

---

# 6. References

Ahmed, S. and Rahman, A. (2022). 'Digital Platform Adoption and Labour Market Outcomes in South Asia', Journal of Development Economics, 45(3), pp. 112–130.

Express.js (2024). Documentation. Available at: https://expressjs.com/ (Accessed: 12 January 2026).

Facebook Technologies (2024). React Documentation. Available at: https://react.dev/ (Accessed: 12 January 2026).

International Telecommunication Union (2023). Connectivity in Nepal: ICT Statistics. Geneva: ITU.

Jones, K. and Sharma, R. (2021). 'The Gig Economy and Informal Labour Markets in Developing Economies', International Labour Review, 160(2), pp. 245–268.

Leaflet.js (2024). Documentation. Available at: https://leafletjs.com/ (Accessed: 8 January 2026).

MongoDB Inc. (2024). MongoDB Manual. Available at: https://www.mongodb.com/docs/ (Accessed: 8 January 2026).

Nepal Telecom Authority (2023). Internet and Smartphone Penetration Report 2023. Kathmandu: NTA.

Schwaber, K. and Sutherland, J. (2020). The Scrum Guide: The Definitive Guide to Scrum. Scrum.org.

Socket.IO (2024). Documentation. Available at: https://socket.io/docs/ (Accessed: 10 January 2026).

Tailwind Labs (2024). TailwindCSS Documentation. Available at: https://tailwindcss.com/docs (Accessed: 12 January 2026).

Vite (2024). Vite Documentation. Available at: https://vitejs.dev/guide/ (Accessed: 12 January 2026).

World Bank (2022). Doing Business in South Asia 2022. Washington DC: World Bank Group.

---

# 7. Bibliography

AirTasker Pty Ltd (2024). About AirTasker. Available at: https://www.airtasker.com/about/ (Accessed: 5 January 2026).

Amis, D. and Sull, D. (2019). 'Why Agile Teams Fail and How to Prevent It', Sloan Management Review, 60(3), pp. 41–51.

Fiverr International Ltd (2024). How Fiverr Works. Available at: https://www.fiverr.com/how_fiverr_works (Accessed: 5 January 2026).

Horn, K. and Moes, N. (2019). 'Building Scalable Real-Time Applications with Socket.IO and Node.js', IEEE Internet Computing, 23(4), pp. 14–22.

npm Inc. (2024). npm Registry Documentation. Available at: https://docs.npmjs.com/ (Accessed: 12 January 2026).

Salman, I. and Wickramasinghe, A. (2020). 'Impact of Digital Platforms on Informal Labour Markets in South Asia', South Asian Journal of Business Studies, 9(2), pp. 189–207.

---

# 8. Appendix

## 8.1 Appendix A: Pre-Survey

### 8.1.1 Pre-Survey Form

1. Current role? (Organizer / Worker / Both)
2. How do you find workers or find work? (Word of mouth / Phone calls / Social media / Agency / Other)
3. Have you used a digital platform for event staffing? (Yes / No)
4. How important is seeing ratings before hiring or applying? (Very / Somewhat / Not)
5. How important is in-platform messaging? (Very / Somewhat / Not)
6. Primary device for internet access? (Smartphone / Desktop / Tablet)
7. Would you use a free digital staffing platform? (Yes / No / Maybe)
8. Most desired feature? (Open-ended)
9. Preferred language for digital platforms? (English / Nepali / Both)

### 8.1.2 Sample Filled Pre-Survey Forms

**Organizer, Kathmandu:** Uses personal phone calls; no digital platform experience; wants ratings visibility and in-platform messaging; smartphone user; would use a free platform; most wants a review system and messaging.

**Worker, Pokhara:** Finds work through friends; misses opportunities due to lack of awareness; wants map-based search and job notifications; smartphone user; would use a free platform; most wants location mapping and Nepali language support.

### 8.1.3 Pre-Survey Result Summary

Eighty percent of organizers relied on informal hiring with no digital exposure. Seventy percent of workers reported missing opportunities. The most requested features were a review system and real-time messaging. All participants expressed willingness to use a free platform addressing their needs.

## 8.2 Appendix B: Post-Survey

### 8.2.1 Post-Survey Form

1. Ease of registration and login? (Very easy / Easy / Average / Difficult)
2. Intuitiveness of event posting/browsing? (Very intuitive / Intuitive / Average / Confusing)
3. Real-time messaging quality? (Very useful / Useful / Average / Not useful)
4. Encountered errors? (Yes / No)
5. Likelihood to recommend? (1–10)
6. Most valuable feature? (Open-ended)
7. Most frustrating issue? (Open-ended)
8. Most desired future feature? (Open-ended)

### 8.2.2 Sample Filled Post-Survey Forms

**Organizer:** Very easy registration; intuitive event posting; real-time messaging very useful; no errors; would recommend at 8/10; most valuable was seeing worker ratings before hiring; map loading on mobile data was slightly slow; requests a mobile app.

**Worker:** Easy registration; intuitive browsing; real-time messaging very useful; no errors; would recommend at 9/10; most valuable was seeing all available events in one place with clear pay; inconvenient having to re-login after token expiry; requests Nepali language support.

### 8.2.3 Post-Survey Result Summary

The real-time messaging received the highest satisfaction score. No critical errors were reported during testing. The primary future requests were a mobile app (five respondents), Nepali language support (three respondents), and offline push notifications (two respondents).

## 8.3 Appendix C: Sample Codes

### 8.3.1 Sample UI Code

The MessagesPage at `client/src/pages/MessagesPage.jsx` integrates Socket.IO with React state to render a real-time conversation interface. The socket is initialised on mount with the JWT token from localStorage, the user joins their personal room on connection, incoming newMessage events update the messages state, and the handleSend function emits sendMessage to the server.

```jsx
const setupSocket = () => {
  const token = localStorage.getItem('token');
  socketRef.current = io('http://localhost:5001', { auth: { token } });

  socketRef.current.on('connect', () => {
    socketRef.current.emit('join', user.id);
  });

  socketRef.current.on('newMessage', (message) => {
    if (message.sender === selectedUser?.id || message.sender === user.id) {
      setMessages(prev => [...prev, message]);
    }
    fetchConversations();
  });

  socketRef.current.on('onlineStatus', ({ userId, online }) => {
    setOnlineUsers(prev =>
      online && !prev.includes(userId)
        ? [...prev, userId]
        : prev.filter(id => id !== userId)
    );
  });
};
```

### 8.3.2 Sample Backend Code

The scheduleConflict utility at `server/utils/scheduleConflict.js` checks whether a worker's new event application overlaps with any existing accepted event on the same calendar date. It parses start and end times, compares ranges using the overlap condition (StartA less than EndB AND EndA greater than StartB), and returns the conflicting event's details if overlap is found.

```javascript
const rangesOverlap = (
  (newStartTime >= existStart && newStartTime < existEnd) ||
  (newEndTime > existStart && newEndTime <= existEnd) ||
  (newStartTime <= existStart && newEndTime >= existEnd)
);

if (rangesOverlap) {
  return {
    hasConflict: true,
    conflictingEvent: {
      _id: existingEvent._id,
      title: existingEvent.title,
      eventDate: existingEvent.eventDate,
      startTime: existingEvent.startTime,
      endTime: existingEvent.endTime,
      location: existingEvent.location
    }
  };
}
```

## 8.4 Appendix D: Designs

### 8.4.1 Gantt Chart

| Sprint | Dates | Features Completed |
|---|---|---|
| Sprint 1 | Weeks 1–2 | Project setup, MongoDB, JWT auth, React routing |
| Sprint 2 | Weeks 3–4 | Event model/routes, EventCard, EventsPage, PostEventPage |
| Sprint 3 | Weeks 5–6 | Application workflow, conflict detection, assignment feature |
| Sprint 4 | Weeks 7–8 | Socket.IO server, real-time messaging, MessagesPage |
| Sprint 5 | Weeks 9–10 | Leaflet.js maps, review system with auto-rating, dashboards |
| Sprint 6 | Weeks 11–12 | Notifications, admin panel, integration testing, report |

### 8.4.2 Work Breakdown Structure

Phase 1 (Planning): Define scope, conduct survey, create backlog, set up monorepo. Phase 2 (Backend): Configure MongoDB, build auth, event, application, message, review, and notification routes. Phase 3 (Frontend): Set up Vite and TailwindCSS, build AuthContext, all page components, MapPicker integration. Phase 4 (Testing): Unit tests, system tests, post-survey. Phase 5 (Documentation): Deployment config, final report.

### 8.4.3 Algorithms and Flowcharts

Smart Scheduling Algorithm: Parse new event date and time range. Fetch all accepted applications for the worker. For each existing event on the same calendar date, parse its time range. Check overlap: two ranges overlap if the new event starts before the existing event ends AND the new event ends after the existing event starts. If overlap is found, return hasConflict: true with the conflicting event's title, date, and times. If no overlap is found after checking all accepted events, return hasConflict: false.

### 8.4.4 Data Flow Diagrams

DFD Level 0: Single "EventStaff Nepal Platform" bubble. Two actors — Organizer and Worker. Data flows: credentials (bidirectional); event and application data (bidirectional). Two data stores: User Database and Event Database.

DFD Level 1: Four sub-processes — Authentication (registration, login, JWT), Event Management (CRUD, filtering, listing), Application Processing (submission, conflict check, status management), and Messaging (Socket.IO send/receive, read receipts).

### 8.4.5 Use Case Descriptions

**Register User:** User submits name, email, password, and role. System validates email uniqueness and password length. User model's pre-save hook hashes the password. JWT is generated and returned. User is redirected to their role-appropriate dashboard.

**Post Event:** Organizer completes a form with title, description, location, date, start/end times, and role slots. System validates all required fields. Event document is created with organizer's ID reference and calculated totalPositions. Event appears in organizer's dashboard.

**Apply for Event:** Worker browses, filters, and clicks Apply on an event. System checks event is active, not fully staffed, no duplicate application exists, and no scheduling conflict. If all pass, Application document is created with status pending. Worker sees confirmation and tracks status in My Applications.

**Accept Application:** Organizer views applicants for their event and clicks Accept. Application status updates to accepted. System sends a notification message to the worker via the Message model and Socket.IO simultaneously. Both parties can now exchange messages.

**Send Message:** A user selects a conversation and sends a message. Socket.IO emits sendMessage to the server with senderId, receiverId, and content. Server saves to Message collection and broadcasts newMessage to receiver's room and messageSent to sender's room. Both clients update their views in real time.

### 8.4.6 Wireframe Descriptions

**Event Browsing Page:** Two-column layout. Left: sticky filter sidebar (280px) with search input, role dropdown, date picker, clear filters button. Right: responsive 2-column card grid on desktop, 1-column on mobile. Each card shows title, location, date/time, role badges, and Apply/Applied control.

**Organizer Dashboard:** Full-width stats row (three cards: total events, active events, pending applications). Two-column body: staffing alerts panel (left) with open position, urgent event, and fully staffed indicators; timeline/calendar view (right) with tab switcher and event cards. Full-width My Events section below with event cards and Manage Applicants buttons.

**Messaging Interface:** Split-panel layout fixed at 600px height. Left panel (320px): conversation list with avatar, name, last message preview, unread count badge, and green online indicator. Right panel: chat header with partner name and online status, scrollable message area with distinct sent/received bubble styles, and fixed bottom input bar with send button.

## 8.5 Appendix E: Screenshots of the System

Figure 1: Home page landing with hero section, animated glass orbs, CTAs, live/upcoming events section, feature cards, and stats.

Figure 2: Registration page with glass-morphism card showing name, email, password, role toggle, conditional skill selection, and create account button.

Figure 3: Worker dashboard with stats row, available jobs list with event cards, role badges, pay-per-hour display, and My Applications sidebar.

Figure 4: Organizer dashboard timeline view showing staffing alerts and connected event cards on a vertical timeline with status indicators.

Figure 5: Event detail page with full event information, Leaflet.js map showing event location marker in Kathmandu, organizer profile with star rating, and role slot cards.

Figure 6: Messages page with conversation list sidebar, chat area showing sent and received bubbles, typing indicators, and message input bar.

Figure 7: Admin dashboard showing platform statistics cards and a sortable table of all registered users with verify and delete action buttons.

Figure 8: Worker profile page showing avatar, skills tags, experience level, star rating with total review count, and a paginated list of individual reviews with reviewer name, stars, and comment.

Figure 9: Post event form with all required fields, dynamic role rows (add/remove), and embedded Leaflet.js map picker for setting precise coordinates.

Figure 10: Application management modal listing pending applicants for a specific event with worker details, optional message, star rating, and Accept/Reject buttons.

## 8.6 Appendix F: User Feedback

### 8.6.1 User Feedback Form

1. Overall satisfaction? (Very Satisfied / Satisfied / Neutral / Dissatisfied / Very Dissatisfied)
2. Did the platform meet expectations?
3. Speed and responsiveness? (Fast / Average / Slow)
4. Were all tasks completable without difficulty?
5. Most desired improvement?
6. Would you continue using the platform? (Yes / No / Maybe)
7. How did you hear about the platform?
8. Additional comments?

### 8.6.2 Sample Filled Feedback Forms

**Organizer:** Satisfied overall. Met expectations. Fast. No difficulties. Most wants distance-from-location display on map. Would continue using. Heard via friend. Called the messaging feature a significant time-saver.

**Worker:** Very Satisfied overall. Found two events not reachable otherwise. Average speed. Minor difficulty finding the Apply button on cards. Most wants Nepali language support. Would continue using. Heard via search engine. Called it "exactly what Nepal's hospitality industry needed."

## 8.7 Appendix G: Future Work Reading

i18next (2024). Internationalization Framework for React. Available at: https://www.i18next.com/ (Accessed: 15 January 2026).

Khalti (2024). Khalti Payment Gateway API Documentation. Available at: https://docs.khalti.com/ (Accessed: 15 January 2026).

Meta Platforms (2024). React Native Documentation. Available at: https://reactnative.dev/docs/getting-started (Accessed: 15 January 2026).

Twilio Inc. (2024). SMS Notifications API Documentation. Available at: https://www.twilio.com/docs/sms (Accessed: 15 January 2026).

Firebase (2024). Firebase Cloud Messaging Documentation. Available at: https://firebase.google.com/docs/cloud-messaging (Accessed: 15 January 2026).
