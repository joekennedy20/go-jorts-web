'use client';

import { useState } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';
const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';

interface RespondCardProps {
  token: string;
  firstName: string;
}

type ResponseType = 'out_too' | 'where_you_at';

export function RespondCard({ token, firstName }: RespondCardProps) {
  const [name, setName] = useState('');
  const [state, setState] = useState<'idle' | 'submitting' | 'done' | 'ended'>(
    'idle',
  );
  const [sharing, setSharing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const respond = async (type: ResponseType) => {
    if (!name.trim()) {
      setError('add your name so they know who you are');
      return;
    }
    setError(null);
    setState('submitting');
    try {
      const res = await fetch(`${API_URL}/v1/night/${token}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), type }),
      });
      if (res.status === 410) {
        setState('ended');
        return;
      }
      if (!res.ok) throw new Error('failed');
      setState('done');
    } catch {
      setError("couldn't send — try again");
      setState('idle');
    }
  };

  if (state === 'ended') {
    return (
      <p className="text-white/60 text-base mt-8 text-center">
        the night&apos;s over — this page has expired.
      </p>
    );
  }

  const postMyOwn = async () => {
    if (sharing) return;
    setSharing(true);
    try {
      const res = await fetch(`${API_URL}/v1/night/${token}/story-image`);
      if (!res.ok) throw new Error('render failed');
      const blob = await res.blob();
      const file = new File([blob], 'jorts-story.png', {type: 'image/png'});
      // iOS Safari supports sharing files — Instagram appears in the
      // sheet and takes the image straight to a story. Fallback for
      // browsers without file-share: open the image so the user can
      // long-press → save → add to their story manually.
      const nav = navigator as Navigator & {
        canShare?: (d: {files: File[]}) => boolean;
      };
      if (nav.canShare?.({files: [file]})) {
        await navigator.share({files: [file]} as ShareData);
      } else {
        window.open(URL.createObjectURL(blob), '_blank');
      }
    } catch {
      // User cancelled the share sheet or render failed — both fine,
      // they can tap again.
    } finally {
      setSharing(false);
    }
  };

  if (state === 'done') {
    return (
      <div className="w-full max-w-sm mt-8 flex flex-col items-center">
        <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center mb-4">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#E8A020" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-white font-bold text-[22px] text-center">
          {firstName} will see your message
        </p>
        <p className="text-white/60 text-base mt-3 text-center">
          you&apos;re out too — tell your people
        </p>
        <button
          onClick={postMyOwn}
          disabled={sharing}
          className="mt-6 bg-gold text-navy font-bold rounded-full px-8 py-4 text-center text-lg w-full disabled:opacity-60"
        >
          {sharing ? 'getting your story…' : 'post your own story'}
        </button>
        <p className="text-white/40 text-xs mt-2 text-center">
          the same I&apos;M OUT look, ready for your story
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-4 border border-white/25 text-white font-semibold rounded-full px-8 py-3.5 text-center text-base w-full"
        >
          Get Jorts
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-sm mt-8 flex flex-col gap-3">
      <input
        type="text"
        value={name}
        onChange={e => setName(e.target.value)}
        placeholder="your name"
        maxLength={40}
        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3.5 text-white placeholder-white/40 text-base outline-none focus:border-gold"
      />
      {error && <p className="text-gold text-sm">{error}</p>}
      <button
        onClick={() => respond('out_too')}
        disabled={state === 'submitting'}
        className="bg-gold text-navy font-bold rounded-full px-8 py-4 text-lg disabled:opacity-60"
      >
        I&apos;m out too 🍻
      </button>
      <button
        onClick={() => respond('where_you_at')}
        disabled={state === 'submitting'}
        className="bg-white/10 text-white font-semibold rounded-full px-8 py-4 text-base disabled:opacity-60"
      >
        where you at?
      </button>
    </div>
  );
}
