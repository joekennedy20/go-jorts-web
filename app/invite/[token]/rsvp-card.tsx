'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';
const APP_STORE_URL = 'https://testflight.apple.com/join/Cqdz46jE';

interface RSVPCardProps {
  token: string;
  contactName: string;
  initialStatus: string;
  planName: string;
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
      <div className="w-full mt-6 flex flex-col items-center">
        {/* Checkmark */}
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>

        <p className="text-white font-bold text-[22px] text-center">
          {CONFIRM_MSG[confirmedStatus]}
        </p>
        <p className="text-white/60 text-base mt-2 text-center">{planName}</p>

        {/* Change answer */}
        <button
          onClick={() => setShowButtons(true)}
          className="mt-4 text-white/40 text-[15px] underline underline-offset-2"
        >
          tap to change your answer
        </button>

        {/* App Store CTA */}
        <div className="mt-12 text-center">
          <p className="text-[#AAAAAA] text-[13px]">Want the full experience?</p>
          <a
            href={APP_STORE_URL}
            className="text-gold font-bold text-[15px] mt-1.5 inline-block"
          >
            Get Jorts &rarr;
          </a>
        </div>
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
    <div className="w-full mt-6">
      <p className="text-white text-lg text-center mb-6">
        Hey {contactName.split(' ')[0]}, are you in?
      </p>

      <div className="flex flex-col gap-4 mx-8">
        <button
          onClick={() => handleRSVP('in')}
          className="h-14 rounded-xl bg-gold text-white font-bold text-[17px] active:opacity-80 transition-opacity"
        >
          I'm in
        </button>
        <button
          onClick={() => handleRSVP('maybe')}
          className="h-14 rounded-xl bg-navy-light text-white font-bold text-[17px] active:opacity-80 transition-opacity"
        >
          Maybe
        </button>
        <button
          onClick={() => handleRSVP('no')}
          className="h-14 rounded-xl bg-white/10 text-white text-[17px] active:opacity-80 transition-opacity"
        >
          Can't make it
        </button>
      </div>
    </div>
  );
}
