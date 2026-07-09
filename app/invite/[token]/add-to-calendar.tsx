'use client';

/**
 * AddToCalendar — post-RSVP "add to calendar" button.
 *
 * Generates an .ics on the fly (no deps, no server round-trip) and
 * triggers a download; iOS Safari opens it straight into the Calendar
 * add-event sheet, which is where most invite recipients are.
 *
 * The plan's `time` is free text ("8pm", "around 9", "8:30 PM") so we
 * parse the common shapes and fall back to an all-day event with the
 * raw text preserved in the notes — a slightly vaguer calendar entry
 * beats a wrong one. Times are written as floating local (no TZID):
 * "8pm Friday" means 8pm on the reader's clock, matching how the
 * invite reads.
 */

interface AddToCalendarProps {
  planName: string;
  day: string; // YYYY-MM-DD
  time: string | null;
  location: string | null;
}

const DEFAULT_DURATION_HOURS = 3;

/** "8pm" / "8:30 PM" / "20:00" → [hour, minute]; null when unparseable. */
function parseTime(raw: string): [number, number] | null {
  const m = raw.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/i);
  if (!m) return null;
  let hour = parseInt(m[1], 10);
  const minute = m[2] ? parseInt(m[2], 10) : 0;
  const meridiem = m[3]?.toLowerCase().replace(/\./g, '');
  if (hour > 23 || minute > 59) return null;
  if (meridiem === 'pm' && hour < 12) hour += 12;
  else if (meridiem === 'am' && hour === 12) hour = 0;
  // No am/pm and no colon ("8", "around 9"): too ambiguous — the raw
  // text still lands in the event notes via the all-day fallback.
  else if (!meridiem && !m[2]) return null;
  // No am/pm but has a colon: 24h if 13+ ("20:00"); evening app, so
  // small hours with minutes ("8:30") read as PM.
  else if (!meridiem && hour >= 1 && hour <= 11) hour += 12;
  return [hour, minute];
}

const pad = (n: number) => String(n).padStart(2, '0');

function icsDate(d: Date): string {
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
}

/** Escape ICS text values (RFC 5545): backslash, semicolon, comma, newline. */
function esc(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

function buildIcs({ planName, day, time, location }: AddToCalendarProps): string {
  const [y, mo, d] = day.split('-').map(Number);
  const parsed = time ? parseTime(time) : null;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Jorts//Invite//EN',
    'BEGIN:VEVENT',
    `UID:${day}-${planName.replace(/\W/g, '').slice(0, 24)}@jorts`,
    `SUMMARY:${esc(planName)}`,
  ];

  if (parsed) {
    const start = new Date(y, mo - 1, d, parsed[0], parsed[1]);
    const end = new Date(start.getTime() + DEFAULT_DURATION_HOURS * 3600_000);
    lines.push(`DTSTART:${icsDate(start)}`, `DTEND:${icsDate(end)}`);
  } else {
    const next = new Date(y, mo - 1, d + 1);
    lines.push(
      `DTSTART;VALUE=DATE:${y}${pad(mo)}${pad(d)}`,
      `DTEND;VALUE=DATE:${next.getFullYear()}${pad(next.getMonth() + 1)}${pad(next.getDate())}`,
    );
    if (time) lines.push(`DESCRIPTION:${esc(`Time: ${time}`)}`);
  }

  if (location) lines.push(`LOCATION:${esc(location)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}

export function AddToCalendar(props: AddToCalendarProps) {
  const download = () => {
    const blob = new Blob([buildIcs(props)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'jorts-invite.ics';
    document.body.appendChild(a);
    a.click();
    a.remove();
    // Give the browser a beat to start the download before revoking.
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
  };

  return (
    <button
      onClick={download}
      className="mt-5 flex items-center gap-2 text-[15px] font-bold active:opacity-70 transition-opacity"
      style={{ color: 'var(--ink, rgba(255,255,255,0.8))' }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
        <line x1="12" y1="14" x2="12" y2="18" />
        <line x1="10" y1="16" x2="14" y2="16" />
      </svg>
      add to calendar
    </button>
  );
}
