// ── Draft storage (localStorage — stays in planner's browser) ──

export function loadDraft() {
  try {
    const raw = localStorage.getItem('roce-draft');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveDraft(data) {
  try {
    localStorage.setItem('roce-draft', JSON.stringify({ data, saved_at: new Date().toISOString() }));
  } catch {}
}

export function clearDraft() {
  localStorage.removeItem('roce-draft');
}

// ── Submitted marker (so a planner who reopens the page sees the thank-you screen) ──

const SUBMITTED_KEY = 'roce-submitted';

export async function loadSubmitted() {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// ── Submit (POST to Formspree — override with VITE_FORM_ENDPOINT if needed) ──

const FORM_ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT || 'https://formspree.io/f/mlgzaddq';

export async function submitResponse(data) {
  const submitted_at = new Date().toISOString();

  const res = await fetch(FORM_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({ submitted_at, ...data }),
  });

  if (!res.ok) throw new Error('Failed to submit');

  const payload = { data, submitted: true, submitted_at };
  try {
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(payload));
  } catch {}
  return payload;
}
