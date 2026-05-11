import { useState, useEffect, useRef, useCallback } from 'react';
import { loadDraft, saveDraft, clearDraft, submitResponse, loadSubmitted } from './storage';


const SECTIONS = [
  {
    id: 'event',
    title: 'Event Overview',
    subtitle: 'General details about the ceremony and how the DJ set fits into the larger celebration',
    icon: '✦',
    fields: [
      { key: 'event_date', label: 'Event Date', placeholder: 'Date and day of week', type: 'text' },
      { key: 'ceremony_start', label: 'Ceremony Start Time', placeholder: 'When does the Roce ceremony begin?', type: 'text' },
      { key: 'dj_window', label: 'DJ Set Window', placeholder: 'What time should the DJ start and end? Any breaks?', type: 'text' },
      { key: 'guest_count', label: 'Approximate Guest Count', placeholder: 'e.g. 150 guests', type: 'text' },
      { key: 'event_flow', label: 'Event Flow', placeholder: 'Where does the DJ set fall in the ceremony timeline? Before/during/after the anointing?', type: 'textarea' },
      { key: 'other_performances', label: 'Other Performances', placeholder: 'Live musicians, MCs, traditional Voviyos singers, or other acts to coordinate with?', type: 'textarea' },
      { key: 'dress_code', label: 'Dress Code', placeholder: 'Formal, semi-formal, cultural attire, etc.', type: 'text' },
    ],
  },
  {
    id: 'venue',
    title: 'Venue & Room',
    subtitle: 'Critical for determining speaker count, placement, and overall audio strategy',
    icon: '◈',
    fields: [
      { key: 'venue_name', label: 'Venue Name & Address', placeholder: 'Full address in Nashville', type: 'text' },
      { key: 'room_dimensions', label: 'Room Dimensions', placeholder: 'Length × width × ceiling height, approx. sq. footage', type: 'text' },
      { key: 'room_shape', label: 'Room Shape & Layout', placeholder: 'Rectangular, L-shaped, open floor plan, pillars, alcoves...', type: 'text' },
      { key: 'flooring', label: 'Flooring Material', placeholder: 'Hardwood, carpet, tile, concrete?', type: 'text' },
      { key: 'wall_material', label: 'Wall Material', placeholder: 'Drywall, glass, brick, curtains/drapes?', type: 'text' },
      { key: 'ceiling_type', label: 'Ceiling Type', placeholder: 'Drop ceiling, exposed, vaulted, acoustic tile?', type: 'text' },
      { key: 'indoor_outdoor', label: 'Indoor / Outdoor', placeholder: 'Fully indoor, partially open, tent, etc.', type: 'text' },
      { key: 'dj_location', label: 'DJ Booth Location', placeholder: 'Stage, corner, designated area? Distance from power?', type: 'text' },
      { key: 'power_access', label: 'Power Access', placeholder: 'Dedicated circuit? How many outlets near DJ position?', type: 'text' },
    ],
  },
  {
    id: 'audio',
    title: 'Audio & Acoustics',
    subtitle: "Understanding the room's sound profile to plan the right speaker configuration and EQ strategy",
    icon: '◉',
    fields: [
      { key: 'venue_pa', label: 'Venue PA System', placeholder: 'Does the venue provide speakers? Brand/model if known?', type: 'text' },
      { key: 'speaker_estimate', label: 'Speaker Count Estimate', placeholder: 'Based on room size, any estimate from the venue?', type: 'text' },
      { key: 'sub_needs', label: 'Subwoofer Needs', placeholder: 'Is bass-heavy sound expected? Is there a dance floor area?', type: 'text' },
      { key: 'acoustic_treatment', label: 'Existing Acoustic Treatment', placeholder: 'Any curtains, panels, soft furnishings that absorb sound?', type: 'textarea' },
      { key: 'soundcheck_window', label: 'Sound Check Window', placeholder: 'How much time before guests arrive for setup and room ringing?', type: 'text' },
      { key: 'volume_restrictions', label: 'Volume Restrictions', placeholder: 'Decibel limits, noise curfew, neighbor concerns?', type: 'text' },
      { key: 'mic_needs', label: 'Microphone Needs', placeholder: 'Will anyone need a wireless mic for speeches, toasts, or prayers?', type: 'text' },
    ],
  },
  {
    id: 'music',
    title: 'Music Direction',
    subtitle: '"Bollywood fusion" can mean many things — the more specific, the better the set',
    icon: '♦',
    fields: [
      { key: 'primary_genre', label: 'Primary Genre / Fusion Style', placeholder: 'Bollywood fusion with what? House, hip-hop, EDM, R&B, Konkani folk?', type: 'text' },
      { key: 'bollywood_era', label: 'Bollywood Era Preference', placeholder: 'Classic Bollywood, 90s/2000s golden era, contemporary hits?', type: 'text' },
      { key: 'regional_pref', label: 'Regional / Language Preferences', placeholder: 'Konkani, Punjabi, Tamil, Telugu, Hindi pop, Gujarati garba?', type: 'text' },
      { key: 'fusion_approach', label: 'Fusion Approach', placeholder: 'Bollywood remixes, mashups with Western tracks, or alternating sets?', type: 'text' },
      { key: 'energy_arc', label: 'Desired Energy Arc', placeholder: 'Chill/ambient start building to dance? High energy throughout? Ceremonial then party?', type: 'textarea' },
      { key: 'dance_floor', label: 'Dance Floor', placeholder: 'Is there a dedicated dance floor? Will guests be dancing?', type: 'text' },
      { key: 'ceremony_songs', label: 'Ceremony-Specific Music', placeholder: 'Any traditional songs tied to the Roce ritual, Voviyos, or family traditions?', type: 'textarea' },
    ],
  },
  {
    id: 'playlist',
    title: 'Must-Play & Do-Not-Play',
    subtitle: 'Share specific track requests from the couple or family — even partial lists help shape the set',
    icon: '✧',
    fields: [
      { key: 'must_play', label: 'Must-Play Songs', placeholder: 'List any songs the couple absolutely wants to hear (artist — title format preferred)', type: 'textarea' },
      { key: 'do_not_play', label: 'Do-Not-Play Songs', placeholder: 'Any tracks, artists, or entire genres to avoid', type: 'textarea' },
      { key: 'dedication_songs', label: 'Dedication / Moment Songs', placeholder: 'Any songs tied to specific moments, people, or traditions during the event?', type: 'textarea' },
      { key: 'guest_requests', label: 'Guest Requests Policy', placeholder: 'Should the DJ take live requests, or stick to the curated setlist?', type: 'text' },
    ],
  },
  {
    id: 'logistics',
    title: 'Logistics & Setup',
    subtitle: 'Practical details for smooth load-in, setup, performance, and breakdown',
    icon: '◆',
    fields: [
      { key: 'load_in_time', label: 'Load-In Time', placeholder: 'When can the DJ access the venue for setup?', type: 'text' },
      { key: 'load_in_access', label: 'Load-In Access', placeholder: 'Loading dock, elevator, stairs, distance from parking?', type: 'text' },
      { key: 'setup_duration', label: 'Setup Duration', placeholder: 'How much time is allocated for DJ setup?', type: 'text' },
      { key: 'breakdown_window', label: 'Breakdown Window', placeholder: 'How quickly does the DJ need to break down after the event?', type: 'text' },
      { key: 'table_riser', label: 'DJ Table / Riser', placeholder: 'Is there a DJ table provided, or should one be brought?', type: 'text' },
      { key: 'lighting', label: 'Lighting', placeholder: 'Any lighting setup, or should the DJ bring lighting?', type: 'text' },
      { key: 'onsite_contact', label: 'Day-Of Contact', placeholder: 'Name and phone number for the venue coordinator', type: 'text' },
      { key: 'parking', label: 'Parking', placeholder: 'Where should the DJ park? Loading zone available?', type: 'text' },
      { key: 'additional_notes', label: 'Anything Else', placeholder: 'Any other details, concerns, or special requests?', type: 'textarea' },
    ],
  },
];

export default function App() {
  const [mode, setMode] = useState('loading');
  const [formData, setFormData] = useState({});
  const [agreed, setAgreed] = useState(false);
  const [saved, setSaved] = useState(null);
  const [toast, setToast] = useState('');
  const [activeSection, setActiveSection] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [saveStatus, setSaveStatus] = useState('idle');
  const [hasDraft, setHasDraft] = useState(false);
  const sectionRefs = useRef([]);
  const saveTimer = useRef(null);

  // ── Load on mount ──
  useEffect(() => {
    (async () => {
      // 1. Check if already submitted (localStorage)
      const sub = await loadSubmitted();
      if (sub) {
        setSaved(sub);
        setFormData(sub.data || {});
        setMode('submitted');
        return;
      }

      // 2. Check for draft (localStorage)
      const draft = loadDraft();
      if (draft?.data && Object.keys(draft.data).length > 0) {
        setFormData(draft.data);
        setHasDraft(true);
      }

      setMode('form');
    })();
  }, []);

  // ── Auto-save draft (debounced 800ms) ──
  const debouncedSave = useCallback((data) => {
    setSaveStatus('saving');
    saveDraft(data);
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  }, []);

  function handleChange(key, value) {
    setFormData((prev) => {
      const next = { ...prev, [key]: value };
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => debouncedSave(next), 800);
      return next;
    });
    if (!hasDraft) setHasDraft(true);
  }

  function handleClearDraft() {
    clearDraft();
    setFormData({});
    setHasDraft(false);
    setAgreed(false);
  }

  async function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    try {
      const payload = await submitResponse(formData);
      clearDraft();
      setSaved(payload);
      setMode('submitted');
      showToast('Submitted successfully!');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch {
      showToast('Error saving. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  const totalFields = SECTIONS.reduce((a, s) => a + s.fields.length, 0);
  const filledFields = Object.values(formData).filter((v) => v && v.trim()).length;
  const progress = (filledFields / totalFields) * 100;
  const canSubmit = filledFields > 0 && agreed;

  useEffect(() => {
    if (mode !== 'form') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = sectionRefs.current.indexOf(entry.target);
            if (idx !== -1) setActiveSection(idx);
          }
        });
      },
      { threshold: 0.3 }
    );
    sectionRefs.current.forEach((el) => el && observer.observe(el));
    return () => observer.disconnect();
  }, [mode]);

  if (mode === 'loading') {
    return (
      <div className="app-wrapper">
        <div className="bg-pattern" />
        <div className="bg-glow bg-glow-1" />
        <div className="bg-glow bg-glow-2" />
        <div className="loading-screen">Loading...</div>
      </div>
    );
  }

  return (
    <div className="app-wrapper">
      <div className="bg-pattern" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      {mode === 'form' && <div className="progress-bar" style={{ width: `${progress}%` }} />}

      {/* Auto-save indicator */}
      {mode === 'form' && filledFields > 0 && (
        <div className={`autosave-indicator ${saveStatus}`}>
          <span className="autosave-dot" />
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Draft saved' : 'Auto-saves as you type'}
        </div>
      )}

      {/* Header for form + submitted */}
      <div className="header">
        <div className="header-ornament">✦ ◈ ✦</div>
        <h1>The <em>Roce</em></h1>
        <div className="header-sub">DJ Services Inquiry</div>
        <div className="header-line" />
        {mode === 'form' && (
          <p className="header-desc">
            Please fill out as much detail as you can below so I can plan the perfect sound
            for the ceremony. Every detail helps — from room dimensions to must-play tracks.
            Your progress is saved automatically, so feel free to close this and come back anytime.
          </p>
        )}
        <div className="prepared-by">Prepared by <strong>Aaron Purewal</strong></div>
      </div>

      {/* FORM MODE */}
      {mode === 'form' && (
        <>
          <div className="nav-dots">
            {SECTIONS.map((s, i) => (
              <div
                key={s.id}
                className={`nav-dot ${activeSection === i ? 'active' : ''}`}
                data-label={s.title}
                onClick={() => sectionRefs.current[i]?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              />
            ))}
          </div>

          {hasDraft && filledFields > 0 && (
            <div className="draft-banner">
              <div className="draft-banner-inner">
                <span className="draft-banner-text">
                  <strong>Welcome back!</strong> Your previous progress ({filledFields} of {totalFields} fields) has been restored.
                </span>
                <button className="draft-clear-btn" onClick={handleClearDraft}>Start over</button>
              </div>
            </div>
          )}

          <div className="form-container">
            {SECTIONS.map((section, si) => (
              <div
                key={section.id}
                className="section"
                ref={(el) => (sectionRefs.current[si] = el)}
                style={{ animationDelay: `${si * 0.08}s` }}
              >
                <div className="section-header">
                  <span className="section-icon">{section.icon}</span>
                  <h2 className="section-title">{section.title}</h2>
                </div>
                <p className="section-subtitle">{section.subtitle}</p>
                {section.fields.map((field) => (
                  <div className="field-group" key={field.key}>
                    <label className="field-label">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea
                        className={`field-input ${formData[field.key] ? 'filled' : ''}`}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    ) : (
                      <input
                        type="text"
                        className={`field-input ${formData[field.key] ? 'filled' : ''}`}
                        placeholder={field.placeholder}
                        value={formData[field.key] || ''}
                        onChange={(e) => handleChange(field.key, e.target.value)}
                      />
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="agreement-area">
            <div className="agreement-box">
              <label className="agreement-label">
                <input
                  type="checkbox"
                  className="agreement-checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                />
                <span className="agreement-text">
                  <strong>By checking this box, I confirm that all information provided above is accurate
                  and complete to the best of my knowledge.</strong> I understand this information will be
                  used to plan audio equipment, music selection, and logistics for the Roce ceremony
                  DJ performance. Any changes after submission should be communicated directly to Aaron Purewal.
                </span>
              </label>
            </div>
          </div>

          <div className="submit-area">
            <button className="submit-btn" onClick={handleSubmit} disabled={!canSubmit || submitting}>
              {submitting ? 'Submitting…' : 'Submit Responses ✦'}
            </button>
            <p className="submit-hint">
              {filledFields} of {totalFields} fields completed
              {filledFields > 0 && !agreed && ' — please check the agreement box above'}
            </p>
          </div>
        </>
      )}

      {/* SUBMITTED */}
      {mode === 'submitted' && (
        <div className="success-screen">
          <div className="success-icon">✓</div>
          <h2 className="success-title">Thank You</h2>
          <p className="success-sub">
            Your responses have been submitted successfully. Aaron will review everything
            and follow up with an equipment plan, proposed set structure, and final logistics.
            If anything changes, please reach out directly.
          </p>
          {saved?.submitted_at && (
            <div className="success-timestamp">
              Submitted {new Date(saved.submitted_at).toLocaleDateString('en-US', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                hour: 'numeric', minute: '2-digit',
              })}
            </div>
          )}
        </div>
      )}

      <div className={`toast ${toast ? 'show' : ''}`}>{toast}</div>
    </div>
  );
}
