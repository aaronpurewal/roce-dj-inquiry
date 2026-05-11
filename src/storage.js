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

// ── Submitted responses (Supabase — shared between planner and DJ) ──

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

const headers = () => ({
  'Content-Type': 'application/json',
  'apikey': SUPABASE_ANON_KEY,
  'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
});

export async function submitResponse(data) {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase not configured');
  }

  const payload = {
    id: 'roce-response',
    response_data: data,
    submitted_at: new Date().toISOString(),
  };

  // Upsert: insert or update the single row
  const res = await fetch(`${SUPABASE_URL}/rest/v1/responses`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Prefer': 'return=representation,resolution=merge-duplicates',
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) throw new Error('Failed to submit');
  return { data, submitted: true, submitted_at: payload.submitted_at };
}

export async function loadSubmitted() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return null;

  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/responses?id=eq.roce-response&select=*`,
      { headers: headers() }
    );
    if (!res.ok) return null;
    const rows = await res.json();
    if (rows.length === 0) return null;
    const row = rows[0];
    return {
      data: row.response_data,
      submitted: true,
      submitted_at: row.submitted_at,
    };
  } catch {
    return null;
  }
}
