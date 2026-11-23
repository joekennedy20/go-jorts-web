'use client';

/**
 * Picking a night and a place, on the invite page.
 *
 * Joe, 2026-11-23: the host sends the group a few days/times and
 * places, "and they can tap what they want or change it themselves".
 * So a guest taps every option that works (not one vote — finding the
 * overlap is the point), can add their own night or place when the
 * host allows it, and sends their picks under a typed name — the same
 * identity the RSVP on this page uses. The host locks the winner in
 * the app; once that happens this component isn't rendered and the
 * page is an ordinary invite again.
 *
 * Your own earlier picks are found by looking for your name among each
 * option's voters, so coming back to the link shows what you chose.
 */

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import { API_URL } from '@/app/api-url';
import type { PlanOptions, PlanOptionItem } from './invite-data';
import { loadGuestName, saveGuestName, shareToThread } from './live-plan';

const norm = (s: string) => s.toLowerCase().split(/\s+/).filter(Boolean).join(' ');

function mine(items: PlanOptionItem[], name: string): Set<string> {
  const me = norm(name);
  if (!me) return new Set();
  return new Set(
    items.filter((i) => i.voters.some((v) => norm(v.name ?? '') === me)).map((i) => i.id)
  );
}

function initials(name: string | null) {
  return (name ?? '?').trim().charAt(0).toUpperCase() || '?';
}

function Faces({ voters }: { voters: PlanOptionItem['voters'] }) {
  if (!voters.length) return null;
  const shown = voters.slice(0, 3);
  return (
    <span className="flex flex-none items-center -space-x-1.5">
      {shown.map((v, i) => (
        <span
          key={`${v.name}-${i}`}
          title={v.name ?? ''}
          className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[10px] font-bold"
          style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--ink)', boxShadow: '0 0 0 2px var(--card)' }}
        >
          {initials(v.name)}
        </span>
      ))}
      {voters.length > shown.length && (
        <span className="pl-2.5 text-[11px] font-bold" style={{ color: 'var(--sub)' }}>
          +{voters.length - shown.length}
        </span>
      )}
    </span>
  );
}

function Row({
  on,
  title,
  sub,
  voters,
  onToggle,
}: {
  on: boolean;
  title: string;
  sub?: string | null;
  voters: PlanOptionItem['voters'];
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-pressed={on}
      className="mt-2 flex w-full items-center gap-3 rounded-xl border-[1.5px] px-3.5 py-3 text-left transition-colors"
      style={{
        borderColor: on ? 'var(--accent)' : 'var(--ghost)',
        backgroundColor: on ? 'var(--accent-soft)' : 'var(--field)',
      }}
    >
      <span
        className="flex h-[20px] w-[20px] flex-none items-center justify-center rounded-md border-[1.5px] text-[13px] font-bold"
        style={{
          borderColor: on ? 'var(--accent)' : 'var(--sub)',
          backgroundColor: on ? 'var(--accent)' : 'transparent',
          color: 'var(--on-accent)',
        }}
      >
        {on ? '✓' : ''}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-[14.5px] font-semibold" style={{ color: 'var(--ink)' }}>
          {title}
        </span>
        {sub ? (
          <span className="block text-[11.5px]" style={{ color: 'var(--sub)' }}>
            {sub}
          </span>
        ) : null}
      </span>
      <Faces voters={voters} />
    </button>
  );
}

const fieldStyle = {
  borderColor: 'var(--ghost)',
  color: 'var(--ink)',
  backgroundColor: 'var(--field)',
} as const;

export function PlanOptionsPicker({
  token,
  planName,
  options,
}: {
  token: string;
  planName: string;
  options: PlanOptions;
}) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [times, setTimes] = useState<Set<string>>(new Set());
  const [places, setPlaces] = useState<Set<string>>(new Set());
  const [touched, setTouched] = useState(false);
  const [adding, setAdding] = useState<'time' | 'place' | null>(null);
  const [newDay, setNewDay] = useState('');
  const [newTime, setNewTime] = useState('');
  const [newPlace, setNewPlace] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName((n) => n || loadGuestName());
  }, []);

  // What you picked last time, once we know who you are — until you
  // start tapping, at which point your taps win.
  const earlierTimes = useMemo(() => mine(options.times, name), [options.times, name]);
  const earlierPlaces = useMemo(() => mine(options.places, name), [options.places, name]);
  useEffect(() => {
    if (!touched) {
      setTimes(earlierTimes);
      setPlaces(earlierPlaces);
    }
  }, [earlierTimes, earlierPlaces, touched]);

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    setTouched(true);
    setSent(false);
    const next = new Set(set);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setter(next);
  };

  const needName = name.trim().length < 2;
  const voterNote =
    options.voter_count === 0
      ? 'Be the first to pick'
      : `${options.voter_count} ${options.voter_count === 1 ? 'person has' : 'people have'} picked`;

  const send = async () => {
    if (needName) {
      setError('Add your name so the group knows who picked');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`${API_URL}/v1/invites/${token}/options/picks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), times: Array.from(times), places: Array.from(places) }),
      });
      if (!res.ok) {
        throw new Error((await res.json().catch(() => null))?.detail || "Couldn't send your picks");
      }
      saveGuestName(name);
      setSent(true);
      setTouched(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't send your picks");
    } finally {
      setBusy(false);
    }
  };

  const suggest = async () => {
    if (needName) {
      setError('Add your name so the group knows who suggested it');
      return;
    }
    const body =
      adding === 'time'
        ? { name: name.trim(), kind: 'time', day: newDay, time: newTime.trim() || null }
        : { name: name.trim(), kind: 'place', place_name: newPlace.trim() };
    if ((adding === 'time' && !newDay) || (adding === 'place' && !newPlace.trim())) {
      setError(adding === 'time' ? 'Pick a day' : 'Name the place');
      return;
    }
    setBusy(true);
    setError('');
    try {
      // Taps you haven't sent yet go first. The suggestion is added to
      // your picks on the server and the page reloads them from there,
      // so anything still only on this screen would be lost.
      if (touched && (times.size || places.size)) {
        const sentPicks = await fetch(`${API_URL}/v1/invites/${token}/options/picks`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: name.trim(), times: Array.from(times), places: Array.from(places) }),
        });
        if (!sentPicks.ok) throw new Error("Couldn't save your picks");
      }
      const res = await fetch(`${API_URL}/v1/invites/${token}/options/suggest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        throw new Error((await res.json().catch(() => null))?.detail || "Couldn't add that");
      }
      saveGuestName(name);
      setAdding(null);
      setNewDay('');
      setNewTime('');
      setNewPlace('');
      // The server counts a suggestion as your pick; take the page's
      // word for it rather than guessing the new option's id here.
      setTouched(false);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Couldn't add that");
    } finally {
      setBusy(false);
    }
  };

  const shareLine = () => {
    const t = options.times.filter((x) => times.has(x.id)).map((x) => x.label);
    const p = options.places.filter((x) => places.has(x.id)).map((x) => x.name);
    const picked = [...t, ...p].join(', ');
    return `${picked ? `I picked ${picked} for ${planName}` : `Picking a night for ${planName}`} — tap yours: https://go-jorts-web.vercel.app/invite/${token}`;
  };

  const label = (s: string) => (
    <p className="mt-5 text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sub)' }}>
      {s}
    </p>
  );

  return (
    <div className="mt-4">
      <p className="text-[13px]" style={{ color: 'var(--sub)' }}>
        Tap everything that works for you · {voterNote}
      </p>

      {options.times.length > 0 && (
        <>
          {label('When')}
          {options.times.map((t) => (
            <Row
              key={t.id}
              on={times.has(t.id)}
              title={t.label}
              sub={t.added_by ? `added by ${t.added_by}` : null}
              voters={t.voters}
              onToggle={() => toggle(times, setTimes, t.id)}
            />
          ))}
        </>
      )}
      {options.allow_suggestions && options.times.length > 0 && adding !== 'time' && (
        <button
          type="button"
          onClick={() => setAdding('time')}
          className="mt-2 w-full rounded-xl border border-dashed px-3.5 py-2.5 text-left text-[13px] font-semibold"
          style={{ borderColor: 'var(--ghost)', color: 'var(--sub)' }}
        >
          + Suggest another time
        </button>
      )}
      {adding === 'time' && (
        <div className="mt-2 flex gap-2">
          <input type="date" value={newDay} onChange={(e) => setNewDay(e.target.value)}
            className="h-11 min-w-0 flex-1 rounded-xl border px-3 text-[14px] focus:outline-none" style={fieldStyle} />
          <input type="text" placeholder="8 PM" value={newTime} maxLength={50}
            onChange={(e) => setNewTime(e.target.value)}
            className="h-11 w-[88px] rounded-xl border px-3 text-[14px] focus:outline-none" style={fieldStyle} />
        </div>
      )}

      {options.places.length > 0 && (
        <>
          {label('Where')}
          {options.places.map((p) => (
            <Row
              key={p.id}
              on={places.has(p.id)}
              title={p.name}
              sub={p.added_by ? `added by ${p.added_by}` : p.address}
              voters={p.voters}
              onToggle={() => toggle(places, setPlaces, p.id)}
            />
          ))}
        </>
      )}
      {options.allow_suggestions && options.places.length > 0 && adding !== 'place' && (
        <button
          type="button"
          onClick={() => setAdding('place')}
          className="mt-2 w-full rounded-xl border border-dashed px-3.5 py-2.5 text-left text-[13px] font-semibold"
          style={{ borderColor: 'var(--ghost)', color: 'var(--sub)' }}
        >
          + Suggest another place
        </button>
      )}
      {adding === 'place' && (
        <input type="text" placeholder="Where?" value={newPlace} maxLength={200}
          onChange={(e) => setNewPlace(e.target.value)}
          className="mt-2 h-11 w-full rounded-xl border px-3.5 text-[14px] focus:outline-none" style={fieldStyle} />
      )}

      <input
        type="text"
        placeholder="Your name"
        value={name}
        maxLength={50}
        onChange={(e) => {
          setName(e.target.value);
          setError('');
        }}
        className="mt-5 h-11 w-full rounded-xl border px-3.5 text-[14px] placeholder:text-[color:var(--sub)] focus:outline-none"
        style={fieldStyle}
      />
      {error && (
        <p className="mt-1.5 text-[12px] font-semibold" style={{ color: 'var(--accent)' }}>
          {error}
        </p>
      )}

      {adding ? (
        <div className="mt-2.5 flex gap-2">
          <button onClick={suggest} disabled={busy}
            className="h-12 flex-[1.6] rounded-xl text-[15px] font-bold disabled:opacity-50"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--on-accent)' }}>
            {busy ? 'Adding…' : `Add ${adding === 'time' ? 'this time' : 'this place'}`}
          </button>
          <button onClick={() => { setAdding(null); setError(''); }} disabled={busy}
            className="h-12 flex-1 rounded-xl border-[1.5px] text-[13px] font-bold"
            style={{ borderColor: 'var(--ghost)', color: 'var(--sub)' }}>
            Never mind
          </button>
        </div>
      ) : sent ? (
        <>
          <p className="mt-3 text-[13px] font-semibold" style={{ color: 'var(--ink)' }}>
            Picks sent ✓ The host locks in the winner.
          </p>
          <button onClick={() => shareToThread(shareLine())}
            className="mt-2 h-12 w-full rounded-xl text-[15px] font-bold"
            style={{ backgroundColor: 'var(--accent)', color: 'var(--on-accent)' }}>
            Tell the group
          </button>
        </>
      ) : (
        <button onClick={send} disabled={busy}
          className="mt-2.5 h-12 w-full rounded-xl text-[15px] font-bold disabled:opacity-50"
          style={{ backgroundColor: 'var(--accent)', color: 'var(--on-accent)' }}>
          {busy ? 'Sending…' : 'Send my picks'}
        </button>
      )}
    </div>
  );
}
