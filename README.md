# The Roce — DJ Services Inquiry

A form for wedding planners to provide venue, audio, music, and logistics details for a Roce ceremony DJ performance.

## Architecture

- **Frontend**: Vite + React, deployed on Vercel
- **Draft saving**: localStorage (planner's browser — survives tab close)
- **Submitted responses**: Supabase Postgres (shared — DJ can read from any device)
- **DJ Portal**: Hidden link at bottom of page, PIN-protected (default: `0508`)

## Setup

### 1. Create a Supabase project (free, 2 min)

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Once the project is ready, go to **SQL Editor** and run this:

```sql
create table responses (
  id text primary key,
  response_data jsonb not null,
  submitted_at timestamptz not null default now()
);

-- Allow public read/write (fine for a single-use form)
alter table responses enable row level security;

create policy "Allow public access"
  on responses for all
  using (true)
  with check (true);
```

3. Go to **Settings → API** and copy:
   - **Project URL** (looks like `https://abcdefg.supabase.co`)
   - **anon public** key

### 2. Clone and configure

```bash
git clone <your-repo-url>
cd roce-dj-inquiry
npm install
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://abcdefg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 3. Run locally

```bash
npm run dev
```

### 4. Deploy to Vercel

Push to GitHub, then:

1. Go to [vercel.com](https://vercel.com) → Import Project → select this repo
2. Add two environment variables:
   - `VITE_SUPABASE_URL` = your project URL
   - `VITE_SUPABASE_ANON_KEY` = your anon key
3. Deploy

Or via CLI:
```bash
npx vercel --prod
```

## How it works

**Wedding planner** opens the link and fills out the form. Progress auto-saves to their browser's localStorage. They can close the tab, come back days later, and pick up where they left off. When they submit, a new row is inserted into Supabase with a unique ID, that ID is stored in their browser, and they see a success screen. They cannot view other planners' submissions. If they want to submit again (for testing), the success screen has a "Submit another response" button that resets the local state.

**DJ (you)** opens the same link, scrolls to the very bottom, clicks the nearly-invisible "dj portal" text, enters PIN `0508`, and sees a list of every submission ordered by most-recent-first. Click any row to see the full response and a "Copy All" button. Each row also has an `×` to delete that submission (use to clean up test entries).

## Changing the PIN

In `src/App.jsx`, find `const DJ_PIN = '0508'` and change it.

## Checking responses directly in Supabase

You can also see the raw data anytime at:
**Supabase Dashboard → Table Editor → responses**
