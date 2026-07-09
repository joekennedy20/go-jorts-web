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
      <p className="mt-8 text-center text-base" style={{ color: 'var(--sub, rgba(255,255,255,0.6))' }}>
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
        <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full" style={{ backgroundColor: 'var(--accent-soft, rgba(232,160,32,0.2))' }}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" style={{ stroke: 'var(--accent, #E8A020)' }} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-center text-[22px] font-bold" style={{ color: 'var(--ink, #fff)' }}>
          {firstName} will see your message
        </p>
        <p className="mt-3 text-center text-base" style={{ color: 'var(--sub, rgba(255,255,255,0.6))' }}>
          you&apos;re out too — tell your people
        </p>
        <button
          onClick={postMyOwn}
          disabled={sharing}
          className="mt-6 w-full rounded-full px-8 py-4 text-center text-lg font-bold shadow-[0_8px_24px_rgba(0,0,0,0.3)] disabled:opacity-60"
          style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #1A2E3D)' }}
        >
          {sharing ? 'getting your story…' : 'post your own story'}
        </button>
        <p className="mt-2 text-center text-xs" style={{ color: 'var(--sub, rgba(255,255,255,0.4))' }}>
          the same I&apos;M OUT look, ready for your story
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-4 w-full rounded-full border px-8 py-3.5 text-center text-base font-semibold"
          style={{ borderColor: 'var(--sub, rgba(255,255,255,0.25))', color: 'var(--ink, #fff)' }}
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
        className="w-full rounded-xl border border-white/15 bg-white/10 px-4 py-3.5 text-base outline-none placeholder:text-white/40"
        style={{ color: 'var(--ink, #fff)' }}
      />
      {error && <p className="text-sm font-semibold" style={{ color: 'var(--accent, #E8A020)' }}>{error}</p>}
      <button
        onClick={() => respond('out_too')}
        disabled={state === 'submitting'}
        className="rounded-full px-8 py-4 text-lg font-bold shadow-[0_8px_24px_rgba(0,0,0,0.3)] disabled:opacity-60"
        style={{ backgroundColor: 'var(--accent, #E8A020)', color: 'var(--on-accent, #1A2E3D)' }}
      >
        I&apos;m out too 🍻
      </button>
      <button
        onClick={() => respond('where_you_at')}
        disabled={state === 'submitting'}
        className="rounded-full border bg-white/5 px-8 py-4 text-base font-semibold disabled:opacity-60"
        style={{ borderColor: 'var(--sub, rgba(255,255,255,0.25))', color: 'var(--ink, #fff)' }}
      >
        where you at?
      </button>
    </div>
  );
}
