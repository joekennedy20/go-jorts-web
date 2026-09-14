'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import type { GroupPlan } from './group-link-data';

/**
 * What the group is doing — the part of the group page that makes it a
 * group for people without the app, rather than an ad for the app.
 *
 * Every plan's "I'm in" goes to that plan's own invite page, the RSVP
 * flow that already works (19 of 22 people who answered a link said
 * yes). There is no second RSVP system here and there shouldn't be.
 *
 * A client component only so "Today" and "Tomorrow" are read off the
 * VIEWER's clock. The server renders the plain date first; the relative
 * word swaps in after mount, so a page served from a UTC box never
 * tells somebody in California that tomorrow is today.
 */

const GOLD = '#F4B941';
const INK = '#F6F1E8';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function parseDay(day: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(day);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
}

function absoluteLabel(day: string): string {
  const d = parseDay(day);
  if (!d) return day;
  return `${WEEKDAYS[d.getDay()]} ${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

function localToday(): string {
  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function relativeLabel(day: string, today: string | null): string {
  if (today) {
    const d = parseDay(day);
    const t = parseDay(today);
    if (d && t) {
      const diff = Math.round((d.getTime() - t.getTime()) / 86_400_000);
      if (diff === 0) return 'Today';
      if (diff === 1) return 'Tomorrow';
      // Still up after midnight — the plan-feed rule keeps last
      // night's plans until 6 AM Eastern.
      if (diff === -1) return 'Last night';
    }
  }
  return absoluteLabel(day);
}

/** "Joe is in", "Joe and Sam are in", "Joe, Sam +3 in" — short enough to
 * sit beside the button on a phone. */
function goingLine(names: string[], count: number): string | null {
  if (count <= 0) return null;
  const shown = names.slice(0, 2);
  const rest = count - shown.length;
  if (shown.length === 0) return `${count} in`;
  if (rest <= 0) {
    return shown.length === 1 ? `${shown[0]} is in` : `${shown[0]} and ${shown[1]} are in`;
  }
  return `${shown.join(', ')} +${rest} in`;
}

interface Props {
  groupName: string;
  plans: GroupPlan[];
  serif: CSSProperties;
  sans: CSSProperties;
}

export function GroupPlans({ groupName, plans, serif, sans }: Props) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(localToday()), []);

  if (plans.length === 0) {
    return (
      <section style={s.section}>
        <p style={{ ...s.eyebrow, ...sans }}>COMING UP</p>
        <div style={s.empty}>
          <p style={{ ...s.emptyTitle, ...serif }}>Nothing planned yet</p>
          <p style={{ ...s.emptyBody, ...sans }}>
            When someone makes a plan for {groupName}, it shows up here — and
            in your calendar, if you add it below.
          </p>
        </div>
      </section>
    );
  }

  // Plans arrive in time order; group them under one heading per day.
  const days: { day: string; plans: GroupPlan[] }[] = [];
  for (const p of plans) {
    const last = days[days.length - 1];
    if (last && last.day === p.day) last.plans.push(p);
    else days.push({ day: p.day, plans: [p] });
  }

  return (
    <section style={s.section}>
      <p style={{ ...s.eyebrow, ...sans }}>COMING UP</p>
      {days.map(({ day, plans: dayPlans }) => (
        <div key={day} style={s.day}>
          <p style={{ ...s.dayLabel, ...sans }}>{relativeLabel(day, today)}</p>
          {dayPlans.map((p, i) => {
            const detail = [p.time, p.location].filter(Boolean).join(' · ');
            const going = goingLine(p.going_names, p.going_count);
            return (
              <article key={p.invite_token ?? `${day}-${i}`} style={s.card}>
                <h3 style={{ ...s.planName, ...serif }}>{p.name || 'A plan'}</h3>
                {detail && <p style={{ ...s.detail, ...sans }}>{detail}</p>}
                <div style={s.row}>
                  <div style={s.going}>
                    {p.going_names.slice(0, 3).map((n, j) => (
                      <span
                        key={`${n}-${j}`}
                        aria-hidden
                        style={{ ...s.face, ...sans, marginLeft: j === 0 ? 0 : -7 }}
                      >
                        {n.charAt(0).toUpperCase()}
                      </span>
                    ))}
                    <span style={{ ...s.goingText, ...sans }}>
                      {going ?? 'Nobody’s said yes yet'}
                    </span>
                  </div>
                  {p.invite_token && (
                    <a
                      href={`/invite/${encodeURIComponent(p.invite_token)}`}
                      style={{ ...s.imIn, ...sans }}
                    >
                      I&apos;m in
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      ))}
    </section>
  );
}

const s: Record<string, CSSProperties> = {
  section: { marginTop: 28 },
  eyebrow: {
    margin: '0 0 4px 4px',
    fontSize: 11.5,
    letterSpacing: '0.16em',
    fontWeight: 700,
    color: '#C9A24B',
  },
  day: { marginTop: 14 },
  dayLabel: {
    margin: '0 0 8px 4px',
    fontSize: 13,
    fontWeight: 700,
    color: 'rgba(246,241,232,0.62)',
  },
  card: {
    background: '#16222C',
    border: '1px solid rgba(246,241,232,0.10)',
    borderRadius: 16,
    padding: '16px 16px 14px',
    marginBottom: 10,
  },
  planName: { margin: 0, fontSize: 21, lineHeight: 1.2, color: INK, fontWeight: 400 },
  detail: {
    margin: '5px 0 0',
    fontSize: 14,
    color: 'rgba(246,241,232,0.72)',
    fontWeight: 500,
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 14,
  },
  going: { display: 'flex', alignItems: 'center', minWidth: 0 },
  face: {
    width: 24,
    height: 24,
    borderRadius: 999,
    background: '#243441',
    border: '2px solid #16222C',
    color: GOLD,
    fontSize: 11,
    fontWeight: 700,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  goingText: {
    marginLeft: 8,
    fontSize: 13,
    color: 'rgba(246,241,232,0.62)',
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  imIn: {
    flexShrink: 0,
    padding: '9px 18px',
    borderRadius: 999,
    background: GOLD,
    color: '#0B141D',
    fontSize: 14.5,
    fontWeight: 700,
    textDecoration: 'none',
  },
  empty: {
    marginTop: 10,
    padding: '20px 18px',
    borderRadius: 16,
    border: '1px dashed rgba(246,241,232,0.18)',
  },
  emptyTitle: { margin: 0, fontSize: 20, color: INK },
  emptyBody: {
    margin: '8px 0 0',
    fontSize: 14,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.62)',
    fontWeight: 500,
  },
};
