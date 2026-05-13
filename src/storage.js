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

// ── Per-browser submission ID (so each planner sees only their own submission) ──

const SUBMISSION_ID_KEY = 'roce-my-submission-id';

export function getMySubmissionId() {
  return localStorage.getItem(SUBMISSION_ID_KEY);
}

function setMySubmissionId(id) {
  localStorage.setItem(SUBMISSION_ID_KEY, id);
}

export function clearMySubmissionId() {
  localStorage.removeItem(SUBMISSION_ID_KEY);
}

function newSubmissionId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `roce-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// ── Submitted responses (Supabase — shared between planner and DJ) ──

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
});

function ensureConfigured() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.');
  }
}

export async function submitResponse(data) {
  ensureConfigured();

  const id = newSubmissionId();
  const payload = {
    id,
    response_data: data,
    submitted_at: new Date().toISOString(),
  };

  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Supabase returned ${res.status}: ${txt || res.statusText}`);
  }

  setMySubmissionId(id);
  return { id, data, submitted: true, submitted_at: payload.submitted_at };
}

export async function loadMySubmission() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;
  const id = getMySubmissionId();
  if (!id) return null;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?id=eq.${encodeURIComponent(id)}&select=*`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      id: row.id,
      data: row.response_data,
      submitted: true,
      submitted_at: row.submitted_at,
    };
  } catch {
    return null;
  }
}

export async function loadAllSubmissions() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?select=*&order=submitted_at.desc`,
      { headers: headers() }
    );
    if (!res.ok) return [];
    const rows = await res.json();
    return rows.map((row) => ({
      id: row.id,
      data: row.response_data,
      submitted: true,
      submitted_at: row.submitted_at,
    }));
  } catch {
    return [];
  }
}

export async function deleteSubmission(id) {
  ensureConfigured();
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/responses?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: headers() }
  );
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Supabase returned ${res.status}: ${txt || res.statusText}`);
  }
}
