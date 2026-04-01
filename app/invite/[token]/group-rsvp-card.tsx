'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';
const TESTFLIGHT_URL = 'https://testflight.apple.com/join/Cqdz46jE';

type RSVPStatus = 'in' | 'maybe' | 'no';

const CONFIRM_MSG: Record<RSVPStatus, string> = {
  in: "You're in!",
  maybe: 'Got it \u2014 maybe!',
  no: "No worries, we'll miss you",
};

interface GroupRSVPCardProps {
  token: string;
  planName: string;
}

export function GroupRSVPCard({ token, planName }: GroupRSVPCardProps) {
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
  if (step === 'name') {
    return (
      <div className="w-full mt-6 flex flex-col items-center">
        <h2 className="text-white font-bold text-[22px] mb-2">
          What&apos;s your name?
        </h2>
        <p className="text-gray-400 text-[15px] mb-6">
          So the group knows who&apos;s in
        </p>
        <input
          type="text"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full border border-gray-300 rounded-xl px-4 py-3.5 text-base text-navy bg-white focus:outline-none focus:border-navy-light"
          maxLength={50}
          autoFocus
        />
        <button
          onClick={handleContinue}
          disabled={name.trim().length < 2}
          className="w-full mt-4 h-[52px] rounded-lg bg-navy-light text-white font-bold text-base disabled:opacity-40 transition-opacity"
        >
          Continue
        </button>
      </div>
    );
  }

  // Step 2: RSVP buttons
  if (step === 'rsvp') {
    return (
      <div className="w-full mt-6">
        <p className="text-white text-lg text-center mb-6">
          Hey {name.split(' ')[0]}, are you in?
        </p>
        <div className="flex flex-col gap-4 mx-8">
          <button
            onClick={() => handleRSVP('in')}
            className="h-14 rounded-xl bg-gold text-white font-bold text-[17px] active:opacity-80 transition-opacity"
          >
            I&apos;m in
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
            Can&apos;t make it
          </button>
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
      <div className="w-full mt-6 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white font-bold text-[22px] text-center">
          {CONFIRM_MSG[confirmedStatus]}
        </p>
        <p className="text-white/60 text-base mt-2 text-center">{planName}</p>
        <div className="mt-12 text-center">
          <p className="text-[#AAAAAA] text-[13px]">Want the full experience?</p>
          <a
            href={TESTFLIGHT_URL}
            className="text-gold font-bold text-[15px] mt-1.5 inline-block"
          >
            Get Jorts &rarr;
          </a>
        </div>
      </div>
    );
  }

  return null;
}
