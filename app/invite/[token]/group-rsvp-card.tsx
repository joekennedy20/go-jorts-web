'use client';

import { useState } from 'react';
import { AddToCalendar } from './add-to-calendar';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

type RSVPStatus = 'in' | 'maybe' | 'no';

const CONFIRM_MSG: Record<RSVPStatus, string> = {
  in: "You're in!",
  maybe: 'Got it \u2014 maybe!',
  no: "No worries, we'll miss you",
};

interface GroupRSVPCardProps {
  token: string;
  planName: string;
  planDay: string;
  planTime: string | null;
  planLocation: string | null;
  /** Slim variant for the card-hero tab — inline name row, single-row buttons. */
  compact?: boolean;
}

export function GroupRSVPCard({
  token,
  planName,
  planDay,
  planTime,
  planLocation,
  compact,
}: GroupRSVPCardProps) {
  const [step, setStep] = useState<'name' | 'rsvp' | 'submitting' | 'confirmed'>('name');
  const [name, setName] = useState('');
  const [confirmedStatus, setConfirmedStatus] = useState<RSVPStatus | null>(null);

  const handleContinue = () => {
    if (name.trim().length >= 2) {
      setStep('rsvp');
    }
  };

  const handleRSVP = async (status: RSVPStatus) => {
    setStep('submitting');
    try {
      const res = await fetch(`${API_URL}/v1/invites/group-rsvp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, name: name.trim(), response: status }),
      });
      if (!res.ok) throw new Error('Failed');
      setConfirmedStatus(status);
      setStep('confirmed');
    } catch {
      setStep('rsvp');
    }
  };

  // Step 1: Name entry
  if (step === 'name' && compact) {
    return (
      <div className="w-full">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder="Your name — so the group knows"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-10 min-w-0 flex-1 rounded-lg border border-white/15 bg-white/10 px-3 text-[13px] text-white placeholder-white/35 focus:outline-none focus:border-white/40"
            maxLength={50}
          />
          <button
            onClick={handleContinue}
            disabled={name.trim().length < 2}
            className="h-10 flex-none rounded-lg px-4 text-white font-bold text-[13px] disabled:opacity-40 transition-opacity"
            style={{ backgroundColor: 'var(--accent, #E8A020)' }}
          >
            Next
          </button>
        </div>
      </div>
    );
  }
  if (step === 'name') {
    return (
      <div className="w-full mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f95a3]">
          My RSVP
        </p>
        <p className="text-white/85 text-[14px] mt-1.5">
          What&apos;s your name? So the group knows who&apos;s in.
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full mt-3 rounded-xl border border-white/15 bg-white/10 px-4 py-3 text-[15px] text-white placeholder-white/35 focus:outline-none focus:border-white/40"
          maxLength={50}
        />
        <button
          onClick={handleContinue}
          disabled={name.trim().length < 2}
          className="w-full mt-2.5 h-12 rounded-xl text-white font-bold text-[15px] disabled:opacity-40 transition-opacity"
          style={{ backgroundColor: 'var(--accent, #E8A020)' }}
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 2: RSVP buttons
  if (step === 'rsvp' && compact) {
    return (
      <div className="w-full">
        <p className="text-white/85 text-[12.5px] font-semibold">
          Hey {name.split(' ')[0]} — you in?
        </p>
        <div className="mt-2 flex gap-2">
          <button
            onClick={() => handleRSVP('in')}
            className="h-10 flex-[1.4] rounded-lg text-white font-bold text-[13px] active:opacity-80 transition-opacity"
            style={{ backgroundColor: 'var(--accent, #E8A020)' }}
          >
            I&apos;m in
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
            className="h-10 flex-1 rounded-lg border-[1.5px] border-white/15 text-white/60 text-[12px] active:opacity-80 transition-opacity"
          >
            Can&apos;t
          </button>
        </div>
      </div>
    );
  }
  if (step === 'rsvp') {
    return (
      <div className="w-full mt-5">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f95a3]">
          My RSVP
        </p>
        <p className="text-white/85 text-[14px] mt-1.5">
          Hey {name.split(' ')[0]}, are you in?
        </p>
        <div className="flex flex-col gap-2.5 mt-3">
          <button
            onClick={() => handleRSVP('in')}
            className="h-12 rounded-xl text-white font-bold text-[15px] active:opacity-80 transition-opacity"
          style={{ backgroundColor: 'var(--accent, #E8A020)' }}
          >
            I&apos;m in
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
              Can&apos;t make it
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Submitting
  if (step === 'submitting') {
    return (
      <div className="w-full mt-10 flex justify-center">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  // Confirmed
  if (step === 'confirmed' && confirmedStatus) {
    return (
      <div className={compact ? 'w-full flex flex-col items-center' : 'w-full mt-5 flex flex-col items-center'}>
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
      </div>
    );
  }

  return null;
}
