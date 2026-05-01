# CyberNova Analytics — Project Context

## Product
Public-facing cybersecurity website + password-protected admin backend for CyberNova Analytics Ltd, Gaborone, Botswana. Serves government agencies, financial institutions, and SMEs across Southern Africa.

## Stack
- **Framework:** Next.js 14 (App Router, SSR/SSG)
- **UI:** React 18, Tailwind CSS, shadcn/ui
- **Backend/DB:** Supabase (PostgreSQL, RLS, Auth + TOTP MFA)
- **AI:** DeepSeek API (server-side only)
- **Email:** Resend
- **CAPTCHA:** Cloudflare Turnstile
- **Charts:** Recharts + React Simple Maps
- **Hosting:** Vercel free/hobby tier

## Design System

### Brand
**Personality:** Precise. Commanding. Fortress.
**References:** sophos.com (enterprise polish) + sans.org (institutional weight)
**Mode:** Light mode primary. Dark mode deferred to P2.

### Colour Tokens
| Token | Hex | Tailwind class | Use |
|---|---|---|---|
| Navy 900 | `#0B1F3A` | `bg-navy-900` | Nav, headings, structure |
| Navy 700 | `#1A3560` | `bg-navy-700` | Footer, secondary surfaces |
| Nova 500 | `#005CE6` | `bg-nova-500` | Primary CTA, links, active |
| Nova 400 | `#1A7AFF` | `bg-nova-400` | Hover states |
| Nova 100 | `#E8F0FE` | `bg-nova-100` | Accent backgrounds |
| Surface | `#F5F7FA` | `bg-surface` | Cards, panels |
| Secure | `#059669` | `text-secure` | Resolved / Active status |
| Threat | `#DC2626` | `text-threat` | Alerts, threat indicators |
| Pending | `#D97706` | `text-pending` | Pending / Warning status |
| Text Muted | `#64748B` | `text-text-muted` | Labels, subtext |
| Border | `#E2E8F0` | `border-border` | Dividers, inputs |

### Typography
- **Font:** Inter (Google Fonts, variable)
- **Headings:** Inter Semi-Bold / Bold, tracked out
- **Body:** Inter Regular, 16px base
- **Labels/caps:** Inter Medium, letter-spacing widest

### Logo
Geometric shield mark — navy fill, nova-500 stroke. Circuit-trace "N" inside. 4-pointed star spark at apex. Wordmark: "CYBERNOVA" Semi-Bold tracked-wide / "ANALYTICS" Regular smaller, muted.

**File:** `logotransparent.png` in `/public` — used everywhere (navbar, footer, admin sidebar) at consistent sizes without color filters.

### Visual Patterns
**Circuit Board Pattern** (`CircuitPattern.tsx`) — SVG-based geometric circuit board traces with contour/topographic lines. Applied to all navy-900 backgrounds (footer, page headers, CTA sections, admin sidebar, hero) at 15% opacity. Creates tech/cybersecurity aesthetic without overwhelming content.

## Project Structure
```
src/
  app/
    layout.tsx              # Root layout (Navbar + Footer)
    page.tsx                # Homepage
    services/page.tsx
    case-studies/page.tsx
    blog/page.tsx
    testimonials/page.tsx
    gallery/page.tsx
    contact/page.tsx
    track/[token]/page.tsx  # Ticket tracking (UUID link)
    admin/
      layout.tsx            # Admin layout (no public nav)
      page.tsx              # Dashboard
      tickets/page.tsx
      blog/page.tsx
      analytics/page.tsx
  components/
    layout/
      Navbar.tsx
      Footer.tsx
      Logo.tsx
    home/
      Hero.tsx
      StatsBar.tsx
      ServicesSection.tsx
      CaseStudiesTeaser.tsx
      TestimonialsTeaser.tsx
      CTABanner.tsx
    ui/                     # shadcn/ui components
      CircuitPattern.tsx    # Reusable circuit board SVG pattern
  lib/
    utils.ts
```

## Key Functional Requirements (FR)
- FR-01 Services by client type (Gov / Financial / SME)
- FR-02 Case studies (Problem / Solution / Outcome)
- FR-03 Blog (published articles, no auth to read)
- FR-04 Testimonials with 1–5 star ratings (admin-approved)
- FR-05 Event photo gallery (by type/year)
- FR-06 Contact form (Name, Email, Phone, Org, Country, Job Title, Issue Type, Description, file upload) + Cloudflare Turnstile
- FR-07 Ticket Reference ID + UUID email tracking link on submission
- FR-08 Ticket status page via emailed link
- FR-09 AI Chatbot (DeepSeek, server-side, ≤5s)
- FR-10 AI summary on ticket confirmation
- FR-11 Admin MFA (TOTP)
- FR-12–15 Admin: tickets, assign, blog, analytics, export, archive

## NFR Summary
- HTTPS (TLS 1.2+), all API keys server-side env vars
- Supabase RLS on all tables
- Public pages ≤3s load, admin queries ≤2s, AI ≤5s
- POPIA + GDPR compliant (privacy notice on form)
- WCAG AA contrast ratios
- Responsive: desktop, tablet, mobile (Chrome, Firefox, Edge, Safari)

## Dev Rules
- No client-side API keys — DeepSeek, Supabase service key, Resend key are server-side only
- Validate + sanitise all form inputs server-side (SQL injection, XSS, CSRF)
- Supabase RLS enforced on every table — never bypass
- Keep shadcn component overrides minimal; extend via Tailwind tokens
- No comments explaining what code does; only add comments for non-obvious WHY
