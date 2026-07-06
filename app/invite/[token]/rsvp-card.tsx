'use client';

import { useState } from 'react';
import { AddToCalendar } from './add-to-calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

interface RSVPCardProps {
  token: string;
  contactName: string;
  initialStatus: string;
  planName: string;
  planDay: string;
  planTime: string | null;
  planLocation: string | null;
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
      <div className="w-full mt-5 flex flex-col items-center">
        {/* Checkmark */}
        <div className="w-11 h-11 rounded-full flex items-center justify-center mb-3"
          style={{ backgroundColor: 'var(--accent-soft, rgba(232,160,32,0.2))' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--accent, #E8A020)' }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-white font-bold text-[20px] text-center">
          {CONFIRM_MSG[confirmedStatus]}
        </p>

        {confirmedStatus !== 'no' && (
          <AddToCalendar
            planName={planName}
            day={planDay}
            time={planTime}
            location={planLocation}
          />
        )}

        {/* Change answer */}
        <button
          onClick={() => setShowButtons(true)}
          className="mt-4 text-white/40 text-[13px] underline underline-offset-2"
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
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Idle state — show buttons
  return (
    <div className="w-full mt-5">
      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f95a3]">
        My RSVP
      </p>
      <p className="text-white/85 text-[14px] mt-1.5">
        Hey {contactName.split(' ')[0]}, are you in?
      </p>

      <div className="flex flex-col gap-2.5 mt-3">
        <button
          onClick={() => handleRSVP('in')}
          className="h-12 rounded-xl text-white font-bold text-[15px] active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--accent, #E8A020)' }}
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
            className="h-11 flex-1 rounded-xl border-[1.5px] border-white/15 text-white/60 text-[13.5px] active:opacity-80 transition-opacity"
          >
            Can't make it
          </button>
        </div>
      </div>
    </div>
  );
}
