# CyberNova Analytics — Supabase SQL Schema

> Reference document for wiring the Supabase PostgreSQL backend.
> All tables use Row Level Security (RLS). All timestamps are `timestamptz` defaulting to `now()`.
> Run migrations in the order they appear — later tables reference earlier ones via foreign keys.

---

## Table Overview

| Table | Description |
|---|---|
| `profiles` | Admin users (extends Supabase Auth `auth.users`) |
| `tickets` | Contact form submissions / service requests |
| `ticket_history` | Status change audit trail per ticket |
| `blog_posts` | Blog articles (draft / published) |
| `testimonials` | Client reviews (pending / approved / rejected) |
| `gallery_events` | Gallery event entries |
| `chat_sessions` | AI chatbot conversation sessions |
| `chat_messages` | Individual messages within a chat session |

---

## 1. `profiles`

Extends Supabase Auth. One row per admin user. Created automatically via trigger on `auth.users` insert.

```sql
create table public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  full_name   text,
  role        text not null default 'analyst'
                check (role in ('admin', 'analyst')),
  created_at  timestamptz not null default now()
);

-- Trigger: auto-create profile on new auth user
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name');
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

### RLS

```sql
alter table public.profiles enable row level security;

-- Admins can read all profiles; analysts can only read their own
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);
```

---

## 2. `tickets`

Core table. One row per contact form submission.

```sql
create table public.tickets (
  id              uuid primary key default gen_random_uuid(),

  -- Human-readable reference, e.g. CN-2025-0048
  ref             text not null unique,

  -- Submitter details (from contact form)
  full_name       text not null,
  email           text not null,
  phone           text,
  organisation    text not null,
  country         text not null,
  job_title       text,

  -- Request details
  issue_type      text not null
                    check (issue_type in (
                      'Active Incident / Breach',
                      'Ransomware / Malware',
                      'Phishing / Social Engineering',
                      'Vulnerability Assessment',
                      'Penetration Testing',
                      'Compliance Assessment (POPIA/PCI-DSS)',
                      'SOC-as-a-Service Enquiry',
                      'General Security Advisory',
                      'Other'
                    )),
  description     text not null,

  -- File attachment (Supabase Storage object path)
  attachment_path text,

  -- Workflow
  status          text not null default 'Pending'
                    check (status in ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Archived')),
  assigned_to     uuid references public.profiles(id) on delete set null,

  -- AI-generated summary (FR-10)
  ai_summary      text,

  -- UUID token embedded in tracking email link (FR-07, FR-08)
  tracking_token  uuid not null default gen_random_uuid() unique,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Auto-update updated_at on any row change
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger tickets_updated_at
  before update on public.tickets
  for each row execute procedure public.set_updated_at();

-- Auto-generate ref: CN-YYYY-NNNN (zero-padded sequence per year)
create sequence if not exists ticket_seq;

create or replace function public.generate_ticket_ref()
returns trigger language plpgsql as $$
begin
  new.ref := 'CN-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('ticket_seq')::text, 4, '0');
  return new;
end;
$$;

create trigger tickets_ref
  before insert on public.tickets
  for each row execute procedure public.generate_ticket_ref();
```

### RLS

```sql
alter table public.tickets enable row level security;

-- Public can insert (contact form)
create policy "tickets_insert_public" on public.tickets
  for insert with check (true);

-- Public can read their own ticket via tracking_token (used by /track/[token])
create policy "tickets_select_by_token" on public.tickets
  for select using (tracking_token = current_setting('app.tracking_token', true)::uuid);

-- Authenticated admins/analysts can read all tickets
create policy "tickets_select_admin" on public.tickets
  for select using (auth.role() = 'authenticated');

-- Only authenticated users can update
create policy "tickets_update_admin" on public.tickets
  for update using (auth.role() = 'authenticated');
```

---

## 3. `ticket_history`

Append-only audit log of every status change or note added to a ticket.

```sql
create table public.ticket_history (
  id          uuid primary key default gen_random_uuid(),
  ticket_id   uuid not null references public.tickets(id) on delete cascade,
  status      text not null
                check (status in ('Pending', 'Assigned', 'In Progress', 'Resolved', 'Archived')),
  note        text,
  changed_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz not null default now()
);
```

### RLS

```sql
alter table public.ticket_history enable row level security;

-- Admins/analysts can insert and read history
create policy "history_select_admin" on public.ticket_history
  for select using (auth.role() = 'authenticated');

create policy "history_insert_admin" on public.ticket_history
  for insert with check (auth.role() = 'authenticated');

-- Public can read history rows for a ticket they can access via tracking_token
create policy "history_select_by_token" on public.ticket_history
  for select using (
    exists (
      select 1 from public.tickets t
      where t.id = ticket_id
        and t.tracking_token = current_setting('app.tracking_token', true)::uuid
    )
  );
```

---

## 4. `blog_posts`

Articles authored and managed by admins.

```sql
create table public.blog_posts (
  id           uuid primary key default gen_random_uuid(),
  slug         text not null unique,
  title        text not null,
  excerpt      text,
  body         text,                   -- full markdown / rich text
  tag          text not null
                 check (tag in (
                   'Threat Intelligence',
                   'Technical',
                   'Compliance',
                   'Architecture',
                   'Awareness'
                 )),
  author_name  text not null,          -- display string, e.g. "CyberNova SOC"
  status       text not null default 'Draft'
                 check (status in ('Draft', 'Published')),
  read_time    text,                   -- e.g. "8 min read"
  published_at timestamptz,
  created_by   uuid references public.profiles(id) on delete set null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create trigger blog_posts_updated_at
  before update on public.blog_posts
  for each row execute procedure public.set_updated_at();
```

### RLS

```sql
alter table public.blog_posts enable row level security;

-- Public can read published posts only
create policy "blog_select_published" on public.blog_posts
  for select using (status = 'Published');

-- Authenticated users can read all (including drafts)
create policy "blog_select_admin" on public.blog_posts
  for select using (auth.role() = 'authenticated');

-- Only authenticated users can insert / update / delete
create policy "blog_write_admin" on public.blog_posts
  for all using (auth.role() = 'authenticated');
```

---

## 5. `testimonials`

Client-submitted reviews, admin-moderated before going live.

```sql
create table public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  author_name text not null,
  job_title   text,
  organisation text not null,
  tag         text not null
                check (tag in ('Government', 'Financial', 'SME')),
  rating      smallint not null
                check (rating between 1 and 5),
  quote       text not null,
  status      text not null default 'Pending'
                check (status in ('Pending', 'Approved', 'Rejected')),
  reviewed_by uuid references public.profiles(id) on delete set null,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);
```

### RLS

```sql
alter table public.testimonials enable row level security;

-- Public can submit a testimonial
create policy "testimonials_insert_public" on public.testimonials
  for insert with check (true);

-- Public can read approved testimonials only
create policy "testimonials_select_approved" on public.testimonials
  for select using (status = 'Approved');

-- Admins can read all (including pending/rejected)
create policy "testimonials_select_admin" on public.testimonials
  for select using (auth.role() = 'authenticated');

-- Admins can update status (approve / reject)
create policy "testimonials_update_admin" on public.testimonials
  for update using (auth.role() = 'authenticated');
```

---

## 6. `gallery_events`

Event entries shown in the gallery page.

```sql
create table public.gallery_events (
  id          uuid primary key default gen_random_uuid(),
  title       text not null,
  event_type  text not null
                check (event_type in ('Workshop', 'Conference', 'Training')),
  year        smallint not null,
  photo_count smallint not null default 0,
  -- Supabase Storage folder path for this event's photos
  storage_folder text,
  created_at  timestamptz not null default now()
);
```

### RLS

```sql
alter table public.gallery_events enable row level security;

-- Public can read all gallery events
create policy "gallery_select_public" on public.gallery_events
  for select using (true);

-- Only admins can insert / update / delete
create policy "gallery_write_admin" on public.gallery_events
  for all using (auth.role() = 'authenticated');
```

---

## 7. `chat_sessions`

One row per AI chatbot conversation initiated by a visitor.

```sql
create table public.chat_sessions (
  id         uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now()
);
```

### RLS

```sql
alter table public.chat_sessions enable row level security;

-- Anyone can create a session
create policy "chat_sessions_insert" on public.chat_sessions
  for insert with check (true);

-- Session owner identified by session id — managed in application layer
create policy "chat_sessions_select" on public.chat_sessions
  for select using (true);
```

---

## 8. `chat_messages`

Individual messages within a chat session.

```sql
create table public.chat_messages (
  id         uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.chat_sessions(id) on delete cascade,
  role       text not null
               check (role in ('user', 'assistant')),
  content    text not null,
  created_at timestamptz not null default now()
);
```

### RLS

```sql
alter table public.chat_messages enable row level security;

-- Anyone can insert messages (server-side API validates session)
create policy "chat_messages_insert" on public.chat_messages
  for insert with check (true);

-- Anyone can read messages from a session they hold the id for
create policy "chat_messages_select" on public.chat_messages
  for select using (true);
```

---

## Supabase Storage Buckets

| Bucket | Access | Purpose |
|---|---|---|
| `ticket-attachments` | Private (admin only) | Files uploaded via contact form |
| `gallery-photos` | Public (read) | Event photos shown in gallery |

```sql
-- Run in Supabase SQL editor or via CLI
insert into storage.buckets (id, name, public)
values
  ('ticket-attachments', 'ticket-attachments', false),
  ('gallery-photos',     'gallery-photos',     true);
```

---

## Indexes

```sql
-- Tickets
create index tickets_status_idx       on public.tickets(status);
create index tickets_issue_type_idx   on public.tickets(issue_type);
create index tickets_country_idx      on public.tickets(country);
create index tickets_assigned_idx     on public.tickets(assigned_to);
create index tickets_created_idx      on public.tickets(created_at desc);
create index tickets_tracking_idx     on public.tickets(tracking_token);

-- Ticket history
create index history_ticket_idx       on public.ticket_history(ticket_id);

-- Blog
create index blog_status_idx          on public.blog_posts(status);
create index blog_published_idx       on public.blog_posts(published_at desc);
create index blog_slug_idx            on public.blog_posts(slug);

-- Testimonials
create index testimonials_status_idx  on public.testimonials(status);

-- Gallery
create index gallery_year_idx         on public.gallery_events(year desc);
create index gallery_type_idx         on public.gallery_events(event_type);

-- Chat
create index chat_messages_session_idx on public.chat_messages(session_id);
```

---

## Environment Variables Required

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=       # server-side only — never expose to client
DEEPSEEK_API_KEY=                # server-side only
RESEND_API_KEY=                  # server-side only
CLOUDFLARE_TURNSTILE_SECRET=     # server-side only
NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY=
```

---

## Notes

- **Ticket ref generation** uses a PostgreSQL sequence (`ticket_seq`) + trigger so refs are always unique and sequential, even under concurrent inserts.
- **Tracking token** (`tickets.tracking_token`) is the UUID embedded in the emailed link — `/track/[token]`. The app sets `app.tracking_token` as a session-level setting before querying, which is what the RLS policy checks.
- **`profiles.role`** controls UI permissions in the admin panel (`admin` can delete/manage users; `analyst` can only work tickets and blog).
- **AI summary** (`tickets.ai_summary`) is populated server-side via DeepSeek API after ticket insert, then stored here — never re-generated on read.
- **POPIA / GDPR**: `tickets` table holds PII. Do not expose via any public RLS policy. Purge records older than retention period via a scheduled Supabase Edge Function.

---

## Supabase MCP (Model Context Protocol) Guide

The Supabase MCP server lets AI tools like Cursor interact with your Supabase project directly — querying tables, applying migrations, generating types, and more — without leaving the IDE.

> **Security first:** Never connect MCP to a production project. Use a dedicated development project with non-production data.

---

### Step 1: Configure Cursor

In Cursor, go to **Settings > Cursor Settings > Tools & MCP** and add the following to your MCP config:

**Standard (browser OAuth — recommended for local dev):**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF"
    }
  }
}
```

Replace `YOUR_PROJECT_REF` with your Supabase project ref (found in your project URL: `https://supabase.com/dashboard/project/<ref>`).

**Scoped + read-only (safer for shared machines):**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF&read_only=true"
    }
  }
}
```

**CI / headless environment (Personal Access Token):**

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp?project_ref=YOUR_PROJECT_REF",
      "headers": {
        "Authorization": "Bearer YOUR_SUPABASE_ACCESS_TOKEN"
      }
    }
  }
}
```

Generate a PAT at: [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens)

---

### Step 2: Authenticate

On first use, Cursor will open a browser window. Log in to your Supabase account and select the **organisation** that contains your CyberNova dev project. After granting access, restart Cursor if the tools are not immediately detected.

---

### Step 3: Verify the connection

Ask Cursor (or any MCP client):

> "What tables are there in the database? Use MCP tools."

It should return the list of tables defined in this schema.

---

### Available MCP Tools for This Project

| Group | Tools | Use for CyberNova |
|---|---|---|
| **Database** | `list_tables`, `execute_sql`, `apply_migration`, `list_migrations` | Apply schema, query tickets, debug RLS |
| **Development** | `get_project_url`, `get_publishable_keys`, `generate_typescript_types` | Generate TS types from schema for type-safe Supabase client |
| **Debugging** | `get_logs`, `get_advisors` | Inspect Postgres/Auth/API logs, security advisors |
| **Edge Functions** | `list_edge_functions`, `deploy_edge_function` | Deploy POPIA retention purge function |
| **Docs** | `search_docs` | Look up Supabase RLS / Auth docs in-context |
| **Storage** | `list_storage_buckets` | Verify `ticket-attachments` and `gallery-photos` buckets *(disabled by default — enable via `features=storage`)* |

Enable only the groups you need:

```
https://mcp.supabase.com/mcp?project_ref=YOUR_REF&features=database,development,debugging
```

---

### Recommended Workflow for Applying This Schema

1. Open Cursor with MCP connected to your **dev** Supabase project.
2. Paste the SQL from each section of this file and ask:
   > "Apply this migration to the database using MCP."
3. After all tables are created, ask:
   > "Generate TypeScript types from the current schema and save to `src/lib/database.types.ts`."
4. Use the generated types in your Supabase client calls throughout the app.

---

### URL Parameter Reference

| Parameter | Description | Example |
|---|---|---|
| `project_ref=<id>` | Scope to one project only (disables account-level tools) | `?project_ref=abc123` |
| `read_only=true` | All queries run as read-only Postgres user | `?read_only=true` |
| `features=<groups>` | Enable only specific tool groups (comma-separated) | `?features=database,docs` |

Parameters can be combined:
```
https://mcp.supabase.com/mcp?project_ref=abc123&read_only=true&features=database,debugging
```

For local Supabase CLI development, the MCP server runs at:
```
http://localhost:54321/mcp
```

---

### Security Rules for This Project

Because `tickets` contains PII (names, emails, organisations) and `ticket_history` contains case notes, follow these rules strictly:

| Rule | Reason |
|---|---|
| **Dev project only** | Never point MCP at the production Supabase project |
| **Use `read_only=true`** when reviewing data | Prevents accidental writes/deletes via LLM tool calls |
| **Always review tool calls before approving** | Cursor prompts you before each MCP execution — read it carefully |
| **Scope with `project_ref`** | Prevents the LLM from accessing other projects in your account |
| **Disable Storage group** unless needed | Reduces attack surface; re-enable only when working on gallery/attachments |
| **Rotate PAT after CI use** | Personal access tokens used in CI should be scoped and rotated regularly |

> MCP is a **developer tool** — never expose it to end users or embed credentials in the client-side app.
