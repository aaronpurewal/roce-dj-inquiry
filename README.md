# The Roce — DJ Services Inquiry

A form for wedding planners to provide venue, audio, music, and logistics details for a Roce ceremony DJ performance.

## Architecture

- **Frontend**: Vite + React, deployed on Vercel
- **Draft saving**: `localStorage` — survives tab close, per-browser
- **Submissions**: POSTed as JSON to a webhook URL of your choice (Formspree, Sheet.best, Zapier, etc.). No database, no backend code.

Each submission is sent as a JSON object with all the form fields plus a `submitted_at` ISO timestamp.

## Setup

Pick **one** of the following destinations for submissions.

### Option A — Email per submission (Formspree, 2 min) ★ recommended

1. Sign up at [formspree.io](https://formspree.io) (free tier: 50 submissions/month).
2. Create a new form. Copy its endpoint URL — looks like `https://formspree.io/f/xxxxxxxx`.
3. Use that URL as `VITE_FORM_ENDPOINT` (see "Run locally" below).

You'll get an email for every submission with all the fields laid out. View the full history any time in the Formspree dashboard.

### Option B — Rows in a Google Sheet (Sheet.best, 5 min)

1. Create a new Google Sheet. Put each form field key (`event_date`, `ceremony_start`, etc.) as a column header in row 1, plus a `submitted_at` column. The field keys are the `key` values in `SECTIONS` in `src/App.jsx`.
2. Sign up at [sheet.best](https://sheet.best), connect your sheet, copy the API URL.
3. Use that URL as `VITE_FORM_ENDPOINT`.

Each submission appends a new row. Review everything in the sheet.

### Option C — Anywhere else

Any webhook that accepts a JSON POST works. Examples:
- **Zapier** → Catch Hook → forward to Slack/Notion/Airtable/email
- **Make.com / n8n** → same idea
- **Your own serverless function** (Vercel/Cloudflare/Lambda)

## Run locally

```bash
git clone <your-repo-url>
cd roce-dj-inquiry
npm install
cp .env.example .env
```

Edit `.env` and set your endpoint:
```
VITE_FORM_ENDPOINT=https://formspree.io/f/xxxxxxxx
```

Then:
```bash
npm run dev
```

## Deploy to Vercel

Push to GitHub, then in Vercel:
1. Import the repo.
2. Add an environment variable: `VITE_FORM_ENDPOINT` = your webhook URL.
3. Deploy.

Or via CLI:
```bash
npx vercel --prod
```

## How it works

1. Planner fills out the form. Progress is auto-saved to their browser's `localStorage`, so they can close the tab and come back later.
2. When they submit, the entire form payload is POSTed as JSON to `VITE_FORM_ENDPOINT`.
3. You review submissions wherever the webhook routes them — your inbox, a Google Sheet, Slack, etc.

Each planner who opens the link in their own browser gets their own draft and submits independently — you'll see one delivery per submission on your end.

## Payload shape

```json
{
  "submitted_at": "2026-05-11T18:23:45.123Z",
  "event_date": "...",
  "ceremony_start": "...",
  "venue_name": "...",
  "...": "..."
}
```

Field keys are defined in `SECTIONS` in `src/App.jsx`.
