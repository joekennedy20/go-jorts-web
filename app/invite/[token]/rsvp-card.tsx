'use client';

import { useState } from 'react';
import { AddToCalendar } from './add-to-calendar';
import { GetTheApp } from './get-the-app';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

interface RSVPCardProps {
  token: string;
  contactName: string;
  initialStatus: string;
  planName: string;
  planDay: string;
  planTime: string | null;
  planLocation: string | null;
  /** First names already confirmed — names who's waiting in the chat. */
  guestNames?: string[];
  /** Slim variant for the card-hero tab — single-row buttons, no labels. */
  compact?: boolean;
}

type RSVPStatus = 'in' | 'maybe' | 'no';

const CONFIRM_MSG: Record<RSVPStatus, string> = {
  in: "You're in!",
  maybe: 'Got it \u2014 maybe!',
  no: "No worries, we'll miss you",
};

export function RSVPCard({
  token,
  contactName,
  initialStatus,
  planName,
  planDay,
  planTime,
  planLocation,
  guestNames,
  compact,
}: RSVPCardProps) {
  const [state, setState] = useState<'idle' | 'submitting' | 'confirmed'>(
    initialStatus !== 'pending' ? 'confirmed' : 'idle',
  );
  const [confirmedStatus, setConfirmedStatus] = useState<RSVPStatus | null>(
    initialStatus !== 'pending' ? (initialStatus as RSVPStatus) : null,
  );
  const [showButtons, setShowButtons] = useState(initialStatus === 'pending');

  const handleRSVP = async (status: RSVPStatus) => {
    setState('submitting');
    try {
      const res = await fetch(`${API_URL}/v1/invites/${token}/rsvp`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed');
      setConfirmedStatus(status);
      setState('confirmed');
      setShowButtons(false);
    } catch {
      setState('idle');
    }
  };

  // Confirmed state
  if (state === 'confirmed' && confirmedStatus && !showButtons) {
    return (
      <div className={compact ? 'w-full flex flex-col items-center' : 'w-full mt-5 flex flex-col items-center'}>
        {/* Checkmark */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'var(--accent-soft, rgba(232,160,32,0.2))' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--accent, #E8A020)' }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-center text-[20px] font-bold" style={{ color: 'var(--ink, #fff)' }}>
          {CONFIRM_MSG[confirmedStatus]}
        </p>

        {confirmedStatus !== 'no' && (
          <>
            {/* The download leads: they just said yes to a real plan,
                and everything that happens next happens in the app. */}
            <GetTheApp token={token} guests={guestNames} />
            <AddToCalendar
              planName={planName}
              day={planDay}
              time={planTime}
              location={planLocation}
            />
          </>
        )}

        {/* Change answer */}
        <button
          onClick={() => setShowButtons(true)}
          className="mt-4 text-[13px] underline underline-offset-2"
          style={{ color: 'var(--sub, rgba(255,255,255,0.4))' }}
        >
          tap to change your answer
        </button>
      </div>
    );
  }

  // Submitting state
  if (state === 'submitting') {
    return (
      <div className="w-full mt-10 flex justify-center">
        <div
          className="h-8 w-8 animate-spin rounded-full border-2"
          style={{ borderColor: 'var(--hair, rgba(255,255,255,0.3))', borderTopColor: 'var(--accent, #E8A020)' }}
        />
      </div>
    );
  }

  // Idle state — show buttons
  if (compact) {
    return (
      <div className="w-full">
        <p className="text-[12.5px] font-semibold" style={{ color: 'var(--ink, rgba(255,255,255,0.85))' }}>
          Hey {contactName.split(' ')[0]} — you in?
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleRSVP('in')}
            className="h-10 flex-[1.4] rounded-lg font-bold text-[13px] active:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #fff)' }}
          >
            I'm in
          </button>
          <button
            onClick={() => handleRSVP('maybe')}
            className="h-10 flex-1 rounded-lg border-[1.5px] font-bold text-[12px] active:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent, #E8A020)', color: 'var(--accent, #E8A020)' }}
          >
            Maybe
          </button>
          <button
            onClick={() => handleRSVP('no')}
            className="h-10 flex-1 rounded-lg border-[1.5px] text-[12px] active:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--sub, rgba(255,255,255,0.6))' }}
          >
            Can't
          </button>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full mt-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--sub, #7f95a3)' }}>
        My RSVP
      </p>
      <p className="mt-1.5 text-[14px]" style={{ color: 'var(--ink, rgba(255,255,255,0.85))' }}>
        Hey {contactName.split(' ')[0]}, are you in?
      </p>

      <div className="flex flex-col gap-2.5 mt-3">
        <button
          onClick={() => handleRSVP('in')}
          className="h-12 rounded-xl font-bold text-[15px] shadow-[0_6px_18px_rgba(0,0,0,0.15)] active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #fff)' }}
        >
          I'm in
        </button>
        <div className="flex gap-2.5">
          <button
            onClick={() => handleRSVP('maybe')}
            className="h-11 flex-1 rounded-xl border-[1.5px] font-bold text-[13.5px] active:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--accent, #E8A020)', color: 'var(--accent, #E8A020)' }}
          >
            Maybe
          </button>
          <button
            onClick={() => handleRSVP('no')}
            className="h-11 flex-1 rounded-xl border-[1.5px] text-[13.5px] active:opacity-80 transition-opacity"
            style={{ borderColor: 'var(--ghost, rgba(255,255,255,0.15))', color: 'var(--sub, rgba(255,255,255,0.6))' }}
          >
            Can't make it
          </button>
        </div>
      </div>
    </div>
  );
}
