# CyberNova Analytics — Project Report

**Student:** Bakang O. Raditedu  
**Programme:** BSc Computer Systems Engineering  
**Module:** CET333 Product Development  
**Assessor:** Dr Barnali Das  
**Delivery date:** May 2026

---

## Overview

CyberNova Analytics Ltd is an AI-driven cybersecurity startup headquartered in Gaborone, Botswana, serving government agencies, financial institutions, and SMEs across Southern Africa. This report documents the design and delivery of their web platform: a publicly accessible technical website integrated with a password-protected admin backend.

---

## What Was Built

### Public Website

A fully responsive, multi-page marketing and service portal built with Next.js 14 App Router and Tailwind CSS.

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Hero, stats bar, service overview, testimonials teaser, CTA |
| Services | `/services` | Service packages segmented by Government, Financial, SME |
| Case Studies | `/case-studies` | Threat mitigation projects in Problem / Solution / Outcome format |
| Blog | `/blog` | Published cybersecurity risk articles, fetched from Supabase with ISR |
| Testimonials | `/testimonials` | Client reviews with 1–5 star ratings, admin-approved |
| Gallery | `/gallery` | Event photos filtered by type (Workshop, Conference, Training) and year |
| Contact | `/contact` | Full service request form with CAPTCHA, AI summary, and email confirmation |
| Ticket Tracker | `/track/[token]` | Public-facing ticket status page accessed via emailed UUID link |

### Contact Form (FR-06 through FR-10)

The contact form collects: Full Name, Email, Phone, Organisation, Country, Job Title, Issue Type (dropdown), Problem Description, and optional file upload. Submission flow:

1. Cloudflare Turnstile CAPTCHA verified server-side before any DB write
2. Ticket inserted into Supabase `tickets` table with a unique reference ID and UUID tracking token
3. DeepSeek API generates a concise security issue summary (FR-10)
4. Resend sends a confirmation email with the AI summary and a tokenised tracking link (FR-07)
5. Success screen displays the reference ID and a link to the tracker

### AI Chatbot — CyberBot (FR-09)

A floating chat widget powered by the DeepSeek API (`deepseek-chat` model). Runs entirely server-side via `/api/chat`. System-prompted to act as a cybersecurity assistant for CyberNova. Responds within 5 seconds under normal load. Markdown responses are parsed and rendered client-side (bold, italic, code, lists, headings). When the user asks to submit a request or fill in a form, the bot appends a `[CONTACT_FORM]` marker which the client renders as a direct link to `/contact`.

### Admin Panel (FR-11 through FR-15)

A fully separate backend portal at `/admin` with its own layout and no public navigation.

**Authentication** (FR-11):
- Step 1: Email and password via Supabase Auth
- Step 2: TOTP 6-digit code from an authenticator app (Google Authenticator, Authy)
- First-time setup: `/admin/mfa-setup` generates a QR code, the user scans it, enters the first code to verify, and the factor is enrolled permanently
- Middleware enforces authentication on all `/admin/*` routes

**Ticket Management** (FR-12, FR-13):
- Full table of all submissions with real-time filters: issue type, country, submission date, assigned team member, status
- Individual ticket detail view with uploaded file access
- Status workflow: Pending → Assigned → In Progress → Resolved → Archived
- Every status change is recorded in a `ticket_history` audit log with timestamp and actor
- Assign to team members; toast notifications confirm every action

**Content Management** (FR-13):
- Blog management: create, publish/unpublish, delete posts with markdown body support
- Testimonial review queue: approve or reject pending submissions before public display
- AI-generated security incident analysis reports on the analytics dashboard

**Analytics Dashboard** (FR-14):
- Stats cards: Open Tickets, Active Incidents, Average Response Time, Resolved This Week
- Recharts bar and pie charts: ticket status distribution, issue type frequency
- Geographic demand chart covering 10 Southern African countries
- Filter by service type or country; generate AI-written executive summary report

**Data Export** (FR-15):
- CSV export of filtered ticket data (filename includes date)
- PDF export via jsPDF and html2canvas for analytics reports

---

## Design System

### Brand Identity

**Personality:** Precise. Commanding. Fortress.  
**Visual references:** Sophos (enterprise polish) + SANS Institute (institutional weight)  
**Mode:** Light mode primary. Dark mode deferred to Phase 2.

The visual language communicates authority and technical credibility — targeting CISOs, IT directors, and government procurement officers across Southern Africa.

### Colour Tokens

All colours are defined as Tailwind custom tokens in `tailwind.config.ts` and referenced consistently across every component. No hardcoded hex values in component code.

| Token | Hex | Tailwind class | Role |
|-------|-----|----------------|------|
| Navy 900 | `#0B1F3A` | `bg-navy-900` | Navigation bar, page headers, section backgrounds, headings |
| Navy 700 | `#1A3560` | `bg-navy-700` | Footer, secondary dark surfaces |
| Navy 500 | `#2A4A7F` | `bg-navy-500` | Mid-range accent |
| Navy 100 | `#E8EEF8` | `bg-navy-100` | Tinted backgrounds |
| Nova 500 | `#005CE6` | `bg-nova-500` | Primary CTA buttons, active links, key interactive elements |
| Nova 400 | `#1A7AFF` | `bg-nova-400` | Hover states on primary buttons |
| Nova 100 | `#E8F0FE` | `bg-nova-100` | Accent backgrounds, icon containers, info panels |
| Surface | `#F5F7FA` | `bg-surface` | Page background, card surfaces, admin panel background |
| Secure | `#059669` | `text-secure` | Resolved status, active indicators, success states |
| Threat | `#DC2626` | `text-threat` | Alerts, threat indicators, error messages, required field markers |
| Pending | `#D97706` | `text-pending` | Pending/warning status badges |
| Text Muted | `#64748B` | `text-text-muted` | Body copy labels, subtext, meta information |
| Border | `#E2E8F0` | `border-border` | Dividers, input outlines, card borders |

**Status colour logic:**  
The Secure / Threat / Pending trio maps directly to the ticket workflow:
- **Pending** → amber `#D97706`
- **In Progress / Assigned** → nova blue `#005CE6`
- **Resolved** → secure green `#059669`
- **Archived** → muted grey

### Typography

**Font family:** Inter (Google Fonts, variable weight, loaded via `next/font/google`)

| Element | Weight | Style |
|---------|--------|-------|
| Page headings (H1) | Bold 700 | Large, tracked slightly |
| Section headings (H2–H3) | SemiBold 600 | Standard tracking |
| Body copy | Regular 400 | 16px base, 1.6 line-height |
| Labels / eyebrow text | Medium 500 | `tracking-widest`, `uppercase` |
| Monospace (ref IDs, code) | Mono | Ticket reference numbers, TOTP input |

Inter was chosen over Poppins or DM Sans because it reads at high legibility on dense data tables (admin panel) while remaining approachable on the public marketing pages.

### Logo

Geometric shield mark with navy fill and nova-500 stroke. A circuit-trace "N" sits inside the shield; a 4-pointed star spark anchors the apex. Wordmark: "CYBERNOVA" in Semi-Bold tracked wide, "ANALYTICS" in Regular at a smaller size in muted colour.

Stored as `logotransparent.png` in `/public`. Used at consistent sizes in:
- Navbar (desktop + mobile): 120 × 34 px on dark pill background
- Footer: 100 × 28 px
- Admin sidebar: 120 × 34 px
- Admin login page: 148 × 42 px on navy card

No CSS colour filters or tinting are applied to the logo — the file is rendered as-is.

### Circuit Board Pattern

`CircuitPattern.tsx` — a reusable SVG component that renders geometric circuit board traces with contour/topographic lines. Applied at **15% opacity** as an `absolute inset-0` overlay on all `bg-navy-900` surfaces:

- Hero section
- Page header banners (Contact, Services, Blog, etc.)
- CTA banner
- Footer
- Admin sidebar

The pattern creates a distinctive tech/cybersecurity aesthetic without overwhelming the text content above it. It is rendered inline as SVG (no external image request) and scales to fit any container.

### Component Architecture

Components follow a strict three-layer structure:

```
src/components/
  ui/           ← shadcn/ui primitives + custom atoms (Button, Input, Card, Chatbot, etc.)
  layout/       ← Navbar, Footer, Logo — shared across all public pages
  home/         ← Marketing-specific sections (Hero, StatsBar, CTABanner, etc.)
  admin/        ← Admin-only components (AdminShell, TicketActions, DashboardCharts, etc.)
```

shadcn/ui component overrides are kept minimal — extended via Tailwind token classes only, never by modifying the base component source. This keeps upgrades safe.

### Motion & Interaction Design

Animations are defined as CSS keyframes in `globals.css` and applied as utility classes:

| Class | Keyframe | Use |
|-------|----------|-----|
| `animate-enter` | `fade-in-up` 0.38s spring | Every page `<main>` on navigation |
| `animate-fade` | `fade-in` 0.25s | Error banners, TOTP step transitions |
| `animate-slide-left` | `slide-in-left` 0.28s spring | Admin mobile drawer |
| `animate-scale-in` | `scale-in` 0.2s spring | Login card step transitions |

All spring curves use `cubic-bezier(0.16, 1, 0.3, 1)` (fast out, minimal overshoot). Transitions on interactive elements (buttons, links, badges) use Tailwind's `transition-colors duration-150` to ensure hover states feel instant.

Toast notifications (Sonner) fire on all user-initiated mutations — form submission, ticket updates, blog publish/delete, testimonial review — with `richColors` enabled so success (green) and error (red) states are immediately distinguishable.

---

## Technical Stack

| Layer | Technology | Justification |
|-------|-----------|---------------|
| Framework | Next.js 14 (App Router) | SSR/SSG/ISR, file-based routing, API routes, middleware |
| Language | TypeScript 5 | Type safety, IDE support, fewer runtime errors |
| UI | React 18 + Tailwind CSS | Component model, utility-first styling, responsive by default |
| Components | shadcn/ui + Base UI | Accessible, unstyled primitives extended with custom Tailwind tokens |
| Database | Supabase (PostgreSQL) | Managed Postgres, Row Level Security, free tier, global CDN |
| Auth | Supabase Auth + TOTP MFA | Built-in TOTP support, no external auth service needed |
| AI | DeepSeek API (`deepseek-chat`) | Server-side only, cost-effective, strong reasoning for security context |
| Email | Resend | Simple API, reliable delivery, free tier adequate |
| CAPTCHA | Cloudflare Turnstile | Privacy-respecting alternative to reCAPTCHA, free |
| Charts | Recharts | React-native charting, well-maintained |
| Export | jsPDF + html2canvas | Client-side PDF without server rendering overhead |
| Toasts | Sonner | Lightweight, accessible, rich-colour toasts |
| Hosting | Vercel (Hobby tier) | Zero-config Next.js deployment, global CDN, free |

---

## Database Schema

Five tables in Supabase PostgreSQL, all with Row Level Security enforced:

```
tickets
  id              uuid PRIMARY KEY
  ref             text UNIQUE          -- e.g. CN-20260501-XXXX
  full_name       text
  email           text
  phone           text
  organisation    text
  country         text
  job_title       text
  issue_type      text
  description     text
  status          text                 -- Pending | Assigned | In Progress | Resolved | Archived
  assigned_to     uuid REFERENCES profiles(id)
  tracking_token  uuid UNIQUE
  ai_summary      text
  created_at      timestamptz
  updated_at      timestamptz

ticket_history
  id          uuid PRIMARY KEY
  ticket_id   uuid REFERENCES tickets(id)
  status      text
  note        text
  changed_by  uuid
  created_at  timestamptz

blog_posts
  id           uuid PRIMARY KEY
  slug         text UNIQUE
  title        text
  excerpt      text
  body         text                   -- markdown
  tag          text
  author_name  text
  status       text                   -- Draft | Published
  read_time    integer
  published_at timestamptz
  created_at   timestamptz

testimonials
  id            uuid PRIMARY KEY
  author_name   text
  job_title     text
  organisation  text
  tag           text                  -- Government | Financial | SME
  rating        integer               -- 1–5
  quote         text
  status        text                  -- Pending | Approved | Rejected
  reviewed_by   uuid
  reviewed_at   timestamptz
  created_at    timestamptz

profiles
  id          uuid PRIMARY KEY        -- matches Supabase auth.users.id
  full_name   text
  email       text
  role        text
  created_at  timestamptz
```

---

## Security Implementation

| Concern | Implementation |
|---------|---------------|
| Admin authentication | Email/password + TOTP MFA (AAL2) |
| Route protection | Next.js middleware checks Supabase session on every `/admin/*` request |
| API key isolation | DeepSeek, Resend, Supabase service role keys are server-side env vars only |
| Bot prevention | Cloudflare Turnstile verified server-side before any DB write |
| SQL injection | Supabase client uses parameterised queries by default |
| XSS | User input rendered as plain text; only AI responses rendered as HTML with entity escaping |
| Data integrity | RLS policies prevent cross-tenant data access; no `service_role` key exposed client-side |
| Privacy | POPIA/GDPR notice on contact form; no PII shared with third parties |

---

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| POST | `/api/contact` | Validate form, verify CAPTCHA, create ticket, send email, trigger AI summary |
| POST | `/api/testimonials` | Submit new testimonial (status: Pending) |
| POST | `/api/chat` | DeepSeek chatbot proxy |
| POST | `/api/auth/signout` | Sign out and redirect to login |
| POST | `/api/admin/blog` | Create blog post |
| PATCH | `/api/admin/blog` | Update/publish/unpublish blog post |
| DELETE | `/api/admin/blog` | Delete blog post |
| PATCH | `/api/admin/testimonials` | Approve or reject testimonial |
| PATCH | `/api/admin/tickets/[id]` | Update ticket status, assignment, note |
| GET | `/api/admin/tickets/export` | Export all tickets as CSV |
| POST | `/api/admin/analytics/report` | Generate AI security incident report |

---

## Non-Functional Requirements Met

| NFR | Requirement | Status |
|-----|-------------|--------|
| NFR-01 | MFA, strong password, brute-force protection | MFA ✅ — Supabase handles password policy and rate limiting |
| NFR-02 | HTTPS, server-side API keys, RLS | ✅ All keys in `.env.local`, Supabase RLS on all tables |
| NFR-03 | Public ≤3s, admin ≤2s, AI ≤5s | ✅ ISR on public pages, revalidate:0 on admin, 8s AI timeout |
| NFR-04 | 100% data integrity, 99.5% uptime | ✅ Supabase managed infra + Vercel CDN |
| NFR-05 | Responsive, 3-click admin workflows | ✅ Mobile-first design, filters → table → action = 3 clicks |
| NFR-06 | POPIA/GDPR, no third-party sharing | ✅ Privacy notice on contact form |

---

## Deployment

**Prerequisites:** Node.js 18+, npm, Supabase project, accounts for DeepSeek, Resend, Cloudflare Turnstile.

**Environment variables (`.env.local`):**

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
DEEPSEEK_API_KEY=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=
CLOUDFLARE_TURNSTILE_SECRET=
NEXT_PUBLIC_SITE_URL=
```

**Local development:**

```bash
npm install
# copy .env.local and fill values
npm run dev
# site at http://localhost:3000
```

**Production:** Push to GitHub. Connect repo to Vercel. Add all env vars in Vercel dashboard. Vercel auto-deploys on every push to `main`.

**First admin login:**
1. Create a user in Supabase Authentication dashboard with email and password
2. Navigate to `/admin/login`, sign in with those credentials
3. You will be redirected to `/admin/mfa-setup` — scan the QR code with an authenticator app and enter the first code to activate MFA
4. All subsequent logins require the TOTP code after password

---

## Functional Requirements Coverage

| FR | Requirement | Status |
|----|-------------|--------|
| FR-01 | Services by client type | ✅ |
| FR-02 | Case studies P/S/O | ✅ |
| FR-03 | Technical blog | ✅ |
| FR-04 | Testimonials with ratings + admin approval | ✅ |
| FR-05 | Event photo gallery | ✅ |
| FR-06 | Contact form with all fields + CAPTCHA | ✅ |
| FR-07 | Ticket reference ID + UUID tracking link | ✅ |
| FR-08 | Public ticket status page | ✅ |
| FR-09 | AI chatbot (DeepSeek) | ✅ |
| FR-10 | AI summary on ticket confirmation | ✅ |
| FR-11 | Admin MFA (TOTP) | ✅ |
| FR-12 | View/filter tickets | ✅ |
| FR-13 | Assign tickets, audit log, blog publish | ✅ |
| FR-14 | Analytics dashboard + geographic charts | ✅ |
| FR-15 | CSV/PDF export, archive/delete | ✅ |

**15 / 15 functional requirements met.**

---

## Constraints Addressed

- **No mobile app:** Fully responsive web platform works across all device sizes (375px to 1440px+), tested on Chrome, Firefox, Edge, Safari.
- **Vercel Hobby tier:** Serverless functions, no persistent compute needed. All heavy lifting via Supabase and third-party APIs.
- **Supabase free tier:** File uploads stored in Supabase Storage; metadata only in DB rows; storage usage kept minimal.
- **12-week timeline:** Agile phased delivery. Core public site and contact form in Phase 1; admin panel, analytics, and AI features in Phase 2.
- **Single developer:** Bakang responsible for all design, frontend, and backend work.

---

*Delivered to Botswana Accountancy College — client sign-off obtained 07 April 2026.*
