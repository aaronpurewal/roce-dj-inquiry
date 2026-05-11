# The Roce — DJ Services Inquiry

A form for wedding planners to provide venue, audio, music, and logistics details for a Roce ceremony DJ performance.

## Architecture

- **Frontend**: Vite + React, deployed on Vercel
- **Storage**: `localStorage` only — drafts and submitted responses both live in the browser. No backend.
- **DJ Portal**: Hidden link at bottom of page, PIN-protected (default: `0508`)

> **Heads up:** Because responses are stored in `localStorage`, the DJ portal only shows submissions made **in the same browser**. If the planner submits on their laptop, you won't see those responses on your phone. Use this when the form will be filled out on the same device you'll review on, or have the planner share their screen / send a screenshot of the response review page.

## Setup

```bash
git clone <your-repo-url>
cd roce-dj-inquiry
npm install
npm run dev
```

No environment variables or external services required.

## Deploy to Vercel

Push to GitHub, then import the repo in Vercel — no environment variables needed.

Or via CLI:
```bash
npx vercel --prod
```

## How it works

**Wedding planner** opens the link and fills out the form. Progress auto-saves to their browser's `localStorage`. They can close the tab, come back days later, and pick up where they left off. When they submit, the response is saved to `localStorage` and they see a confirmation screen.

**DJ (you)** opens the same browser, scrolls to the very bottom, clicks the nearly-invisible "dj portal" text, enters PIN `0508`, and sees the submitted response with a "Copy All" button.

## Changing the PIN

In `src/App.jsx`, find `const DJ_PIN = '0508'` and change it.

## Clearing stored data

The submitted response lives under the `roce-submitted` key in `localStorage`, and the in-progress draft lives under `roce-draft`. Clearing the site's storage in browser devtools wipes both.
