'use client';

/**
 * Live Plan — the group-edit surface on the invite page.
 *
 * The plan lives in the group text: anyone with the link can move the
 * time or place (backend PR #125), no app, no login. This component
 * renders (a) the "what's changed" trail, (b) the inline change
 * editor attributed to a typed name, and (c) the echo — a prewritten
 * update line the changer sends back into the thread, which is what
 * keeps the group text alive without any SMS backend.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PlanChange } from './invite-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

/** Shared with the RSVP card so "tap your name" works across both. */
export const GUEST_NAME_KEY = 'jorts_guest_name';

export function loadGuestName(): string {
  try {
    return localStorage.getItem(GUEST_NAME_KEY) ?? '';
  } catch {
    return '';
  }
}

export function saveGuestName(name: string) {
  try {
    localStorage.setItem(GUEST_NAME_KEY, name.trim());
  } catch {
    /* private mode — chips just won't persist */
  }
}

/**
 * Hand `text` to the phone's share sheet (best on iOS — lands straight
 * in Messages), falling back to an sms: draft. Never sends anything
 * itself; the human taps send in their own thread.
 */
export function shareToThread(text: string) {
  if (typeof navigator !== 'undefined' && navigator.share) {
    navigator.share({ text }).catch(() => {
      /* user closed the sheet — fine */
    });
    return;
  }
  window.location.href = `sms:?&body=${encodeURIComponent(text)}`;
}

function timeAgo(iso: string | null): string {
  if (!iso) return '';
  const mins = Math.max(0, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

/** The "what's changed" trail — groups negotiate; seeing it is trust. */
export function ChangeTrail({ changes }: { changes: PlanChange[] }) {
  if (!changes.length) return null;
  return (
    <div className="mt-3 space-y-1">
      {changes.slice(0, 3).map((c) => (
        <p key={c.id} className="text-[11px]" style={{ color: 'var(--sub, #7f95a3)' }}>
          {c.field === 'time' ? '⏰' : '📍'}{' '}
          <span className="font-semibold" style={{ color: 'var(--ink, rgba(255,255,255,0.85))' }}>
            {c.new}
          </span>
          {c.old ? <span className="line-through opacity-60"> {c.old}</span> : null}
          {' · '}
          {c.changed_by}
          {c.created_at ? `, ${timeAgo(c.created_at)}` : ''}
        </p>
      ))}
    </div>
  );
}

interface LivePlanProps {
  token: string;
  planTime: string | null;
  planLocation: string | null;
  changes: PlanChange[];
  locked: boolean;
  ended: boolean;
}

type Step = 'idle' | 'editing' | 'submitting' | 'done';

export function LivePlan({
  token,
  planTime,
  planLocation,
  changes,
  locked,
  ended,
}: LivePlanProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>('idle');
  const [name, setName] = useState('');
  const [time, setTime] = useState(planTime ?? '');
  const [location, setLocation] = useState(planLocation ?? '');
  const [shareText, setShareText] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setName(loadGuestName());
  }, []);

  if (ended) return <ChangeTrail changes={changes} />;

  const dirty =
    (time.trim() && time.trim() !== (planTime ?? '')) ||
    (location.trim() && location.trim() !== (planLocation ?? ''));

  const submit = async () => {
    if (!dirty || name.trim().length < 2) return;
    setStep('submitting');
    setError('');
    try {
      const body: Record<string, string> = { name: name.trim() };
      if (time.trim() && time.trim() !== (planTime ?? '')) body.time = time.trim();
      if (location.trim() && location.trim() !== (planLocation ?? ''))
        body.location_name = location.trim();
      const res = await fetch(`${API_URL}/v1/invites/${token}/propose-change`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const detail = (await res.json().catch(() => null))?.detail;
        throw new Error(detail || 'Could not update the plan');
      }
      const data = await res.json();
      saveGuestName(name);
      setShareText(data.share_text ?? '');
      setStep('done');
      router.refresh(); // re-render the server card with the new details
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update the plan');
      setStep('editing');
    }
  };

  // Done — the change landed; now the echo back into the thread.
  if (step === 'done') {
    return (
      <div className="mt-3">
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--ink, rgba(255,255,255,0.85))' }}>
          Plan updated ✓ Now tell the group:
        </p>
        <button
          onClick={() => shareToThread(shareText)}
          className="mt-2 h-11 w-full rounded-xl font-bold text-[14px] active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #fff)' }}
        >
          📣 Text the group the update
        </button>
        <ChangeTrail changes={changes} />
      </div>
    );
  }

  if (step === 'editing' || step === 'submitting') {
    return (
      <div className="mt-3">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sub, #7f95a3)' }}>
          Change the plan
        </p>
        <input
          type="text"
          placeholder={planTime ? `Time — now ${planTime}` : 'Time — e.g. 9:30 PM'}
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-2.5 text-[14px] placeholder:text-[color:var(--sub,rgba(255,255,255,0.35))] focus:outline-none"
          style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--ink, #fff)', backgroundColor: 'var(--field, rgba(255,255,255,0.1))' }}
          maxLength={50}
        />
        <input
          type="text"
          placeholder={planLocation ? `Place — now ${planLocation}` : 'Place — e.g. The docks'}
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-2.5 text-[14px] placeholder:text-[color:var(--sub,rgba(255,255,255,0.35))] focus:outline-none"
          style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--ink, #fff)', backgroundColor: 'var(--field, rgba(255,255,255,0.1))' }}
          maxLength={200}
        />
        <input
          type="text"
          placeholder="Your name — so the group knows who moved it"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-2 w-full rounded-xl border px-4 py-2.5 text-[14px] placeholder:text-[color:var(--sub,rgba(255,255,255,0.35))] focus:outline-none"
          style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--ink, #fff)', backgroundColor: 'var(--field, rgba(255,255,255,0.1))' }}
          maxLength={50}
        />
        {error && (
          <p className="mt-1.5 text-[11.5px] font-semibold" style={{ color: 'var(--accent, #E8A020)' }}>
            {error}
          </p>
        )}
        <div className="mt-2.5 flex gap-2">
          <button
            onClick={submit}
            disabled={step === 'submitting' || !dirty || name.trim().length < 2}
            className="h-11 flex-[1.6] rounded-xl font-bold text-[14px] disabled:opacity-40 active:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #fff)' }}
          >
            {step === 'submitting' ? 'Updating…' : 'Update the plan'}
          </button>
          <button
            onClick={() => {
              setStep('idle');
              setError('');
              setTime(planTime ?? '');
              setLocation(planLocation ?? '');
            }}
            disabled={step === 'submitting'}
            className="h-11 flex-1 rounded-xl border-[1.5px] font-bold text-[13px] active:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--sub, rgba(255,255,255,0.6))' }}
          >
            Never mind
          </button>
        </div>
      </div>
    );
  }

  // Idle — the trail plus the affordance (hidden when the host locked it)
  return (
    <div>
      <ChangeTrail changes={changes} />
      {!locked && (
        <button
          onClick={() => setStep('editing')}
          className="mt-2.5 text-[12px] font-bold active:opacity-70 transition-opacity"
          style={{ color: 'var(--accent, #E8A020)' }}
        >
          ✏️ Change the time or place
        </button>
      )}
    </div>
  );
}
