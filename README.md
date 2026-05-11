# The Roce — DJ Services Inquiry

A form for wedding planners to provide venue, audio, music, and logistics details for a Roce ceremony DJ performance.

## Architecture

- **Frontend**: Vite + React, deployed on Vercel
- **Draft saving**: `localStorage` — survives tab close, per-browser
- **Submissions**: POSTed as JSON to a webhook URL of your choice (Formspree, Sheet.best, Zapier, etc.). No database, no backend code.

Each submission is sent as a JSON object with all the form fields plus a `submitted_at` ISO timestamp.

## Where submissions go

Submissions are POSTed to a Formspree endpoint that's hardcoded in `src/storage.js`. Each submission lands in the inbox associated with that Formspree form, and you can also browse the full history in the Formspree dashboard.

To change the destination, either:
- Edit `FORM_ENDPOINT` in `src/storage.js`, or
- Set `VITE_FORM_ENDPOINT` to override at build time.

Any webhook that accepts a JSON POST works — Formspree, Sheet.best (Google Sheets), Zapier, Make, your own serverless function, etc.

## Run locally

```bash
git clone <your-repo-url>
cd roce-dj-inquiry
npm install
npm run dev
```

No env vars required — the endpoint is already wired up.

## Deploy to Vercel

Push to GitHub, then import the repo in Vercel. No environment variables needed.

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
