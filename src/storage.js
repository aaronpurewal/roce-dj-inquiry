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

// ── Submitted response (localStorage — only visible in this browser) ──

const SUBMITTED_KEY = 'roce-submitted';

export async function submitResponse(data) {
  const payload = {
    data,
    submitted: true,
    submitted_at: new Date().toISOString(),
  };
  try {
    localStorage.setItem(SUBMITTED_KEY, JSON.stringify(payload));
  } catch {
    throw new Error('Failed to save submission');
  }
  return payload;
}

export async function loadSubmitted() {
  try {
    const raw = localStorage.getItem(SUBMITTED_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearSubmitted() {
  localStorage.removeItem(SUBMITTED_KEY);
}
