/**
 * Resolving a group link for the group page.
 *
 * Public and unauthenticated: most people a group link reaches don't
 * have Jorts, and for them this page IS the group.
 *
 * Two reads, tried in order:
 *
 *   /v1/groups/join/<token>/plans — the group, its OWN upcoming plans
 *     (each with the invite link people already RSVP on), and the
 *     calendar subscription. Never busy time, never the roster.
 *   /v1/groups/join/<token> — the sign on the door alone. The fallback,
 *     so this page still works as a plain landing page against an API
 *     that doesn't serve the plans read yet.
 */
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export interface GroupLinkPreview {
  group_name: string;
  emoji: string | null;
  /** First name of whoever runs the group. */
  inviter_name: string | null;
  member_count: number;
}

export interface GroupPlan {
  name: string | null;
  /** YYYY-MM-DD */
  day: string;
  /** Free text, exactly as typed: "7pm", "Late", or null. */
  time: string | null;
  start_minute: number | null;
  duration_minutes: number | null;
  location: string | null;
  activity: string | null;
  going_count: number;
  /** First names only. */
  going_names: string[];
  /** The plan's own invite token — "I'm in" goes to /invite/<token>. */
  invite_token: string | null;
  invite_url: string | null;
}

export interface GroupCalendarFeed {
  token: string;
  url: string;
  webcal_url: string;
  google_url: string;
}

export interface GroupPage extends GroupLinkPreview {
  /** null when the API only answered the preview. */
  plans: GroupPlan[] | null;
  calendar: GroupCalendarFeed | null;
}

export async function resolveGroupLink(
  token: string,
): Promise<GroupLinkPreview | null> {
  try {
    const res = await fetch(`${API_URL}/v1/groups/join/${encodeURIComponent(token)}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function resolveGroupPage(token: string): Promise<GroupPage | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/groups/join/${encodeURIComponent(token)}/plans`,
      { cache: 'no-store' },
    );
    if (res.ok) {
      const body = await res.json();
      return { ...body, plans: body.plans ?? [], calendar: body.calendar ?? null };
    }
  } catch {
    /* fall through to the preview */
  }
  // Any failure — including a 404 — asks the preview. A dead link 404s
  // there too and the page says so; an API that simply predates the
  // plans read (and 404s the path) still gets the landing page.
  const preview = await resolveGroupLink(token);
  return preview ? { ...preview, plans: null, calendar: null } : null;
}

/** The calendar subscription, rebuilt on whatever host served this page.
 *
 * The API hands back production URLs. Rebuilding them on the request's
 * own host keeps a preview deploy's page subscribing to that preview's
 * feed — and the path is the same /cal/<token>.ics everywhere. */
export function feedLinks(feedToken: string, host: string | null, proto: string | null) {
  const origin = host
    ? `${proto || 'https'}://${host}`
    : 'https://go-jorts-web.vercel.app';
  const url = `${origin}/cal/${feedToken}.ics`;
  const webcal = url.replace(/^https?:\/\//, 'webcal://');
  return {
    url,
    webcal_url: webcal,
    google_url: `https://calendar.google.com/calendar/render?cid=${encodeURIComponent(webcal)}`,
  };
}
