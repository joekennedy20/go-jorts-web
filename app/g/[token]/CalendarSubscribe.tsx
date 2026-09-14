'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

/**
 * "Add to your calendar" — a SUBSCRIPTION, not a one-off event.
 *
 * The invite page's add-to-calendar drops one plan in once; if the plan
 * moves, the calendar is wrong. This subscribes to the whole group, so
 * every plan it makes lands in the calendar people already look at and
 * follows the plan when it changes. For somebody who will never install
 * Jorts, that is what being in the group means day to day.
 *
 *   Apple    — the webcal:// link opens Calendar's Subscribe sheet on
 *              iPhone and Mac.
 *   Google   — calendar.google.com's add-by-URL page. Google only does
 *              this on a computer; on a phone we say so rather than
 *              send people to a page that won't do it.
 *   Anything — copy the https link (Outlook, Fastmail, …).
 */

interface Props {
  groupName: string;
  url: string;
  webcalUrl: string;
  googleUrl: string;
  serif: CSSProperties;
  sans: CSSProperties;
}

type Platform = 'ios' | 'android' | 'desktop' | null;

export function CalendarSubscribe({ groupName, url, webcalUrl, googleUrl, serif, sans }: Props) {
  const [copied, setCopied] = useState(false);
  // A webcal:// link does nothing visible in a browser with no calendar
  // app registered for it — Chrome on a Mac, often — so on a computer we
  // follow the tap with how to do it by hand (Joe, 2026-09-14).
  const [triedApple, setTriedApple] = useState(false);
  const [platform, setPlatform] = useState<Platform>(null);

  useEffect(() => {
    const ua = navigator.userAgent;
    if (/iPhone|iPad|iPod/i.test(ua)) setPlatform('ios');
    else if (/Android/i.test(ua)) setPlatform('android');
    else setPlatform('desktop');
  }, []);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // Older Safari without clipboard permission: fall back to a
      // selected textarea and execCommand.
      const ta = document.createElement('textarea');
      ta.value = url;
      ta.setAttribute('readonly', '');
      ta.style.position = 'absolute';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      try {
        document.execCommand('copy');
      } catch {
        /* nothing more we can do */
      }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const onPhone = platform === 'ios' || platform === 'android';
  const apple = (
    <a
      key="apple"
      href={webcalUrl}
      onClick={() => {
        if (platform === 'desktop') {
          setTriedApple(true);
          void copy();
        }
      }}
      style={{ ...s.button, ...(platform === 'android' ? s.secondary : s.primary), ...sans }}
    >
      <CalendarIcon /> Apple Calendar
    </a>
  );
  const google = (
    <a
      key="google"
      href={googleUrl}
      target="_blank"
      rel="noopener noreferrer"
      style={{ ...s.button, ...(platform === 'android' ? s.primary : s.secondary), ...sans }}
    >
      <CalendarIcon /> Google Calendar
    </a>
  );

  return (
    <section style={s.section}>
      <div style={s.card}>
        <p style={{ ...s.eyebrow, ...sans }}>ADD TO YOUR CALENDAR</p>
        <h2 style={{ ...s.title, ...serif }}>Get {groupName}&apos;s plans in your calendar</h2>
        <p style={{ ...s.body, ...sans }}>
          Every plan the group makes shows up in the calendar you already use,
          and moves when the plan does. No app needed.
        </p>

        <div style={s.buttons}>
          {platform === 'android' ? [google, apple] : [apple, google]}
          <button type="button" onClick={copy} style={{ ...s.button, ...s.secondary, ...sans }}>
            {copied ? 'Copied' : 'Copy calendar link'}
          </button>
        </div>

        {triedApple && (
          <p style={{ ...s.hint, ...sans }}>
            Calendar didn&apos;t open? The link is copied. In the Calendar app,
            choose <b>File → New Calendar Subscription</b> and paste it.
          </p>
        )}
        {onPhone && (
          <p style={{ ...s.hint, ...sans }}>
            Using Google Calendar? Google only adds calendars from its website
            on a computer — copy the link and add it there under
            “Other calendars → From URL”.
          </p>
        )}
        <p style={{ ...s.hint, ...sans }}>
          Anyone with this calendar link can see the group&apos;s plans. Changes
          can take a few hours to reach Google Calendar.
        </p>
      </div>
    </section>
  );
}

function CalendarIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ flexShrink: 0 }}
    >
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

const s: Record<string, CSSProperties> = {
  section: { marginTop: 22 },
  card: {
    background: '#16222C',
    border: '1px solid rgba(201,162,75,0.35)',
    borderRadius: 20,
    padding: '24px 20px 20px',
  },
  eyebrow: {
    margin: 0,
    fontSize: 11.5,
    letterSpacing: '0.16em',
    fontWeight: 700,
    color: '#C9A24B',
  },
  title: { margin: '10px 0 0', fontSize: 24, lineHeight: 1.2, color: '#F6F1E8', fontWeight: 400 },
  body: {
    margin: '10px 0 0',
    fontSize: 14.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.72)',
    fontWeight: 500,
  },
  buttons: { display: 'flex', flexDirection: 'column', gap: 10, marginTop: 18 },
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
    padding: '13px 16px',
    borderRadius: 12,
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  primary: { background: '#F4B941', color: '#0B141D', border: '1px solid #F4B941' },
  secondary: {
    background: 'transparent',
    color: '#F6F1E8',
    border: '1px solid rgba(246,241,232,0.22)',
  },
  hint: {
    margin: '12px 0 0',
    fontSize: 12.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.5)',
    fontWeight: 500,
  },
};
