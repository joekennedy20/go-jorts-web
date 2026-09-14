/**
 * /cal/<feed token>.ics — a group's calendar subscription.
 *
 * What Apple Calendar and Google Calendar poll after somebody taps
 * "Add to your calendar" on a group page. A pass-through to the API's
 * GET /v1/groups/feed/<token>.ics, served from this domain so the URL
 * people paste into their calendar never changes when the API's host
 * does.
 *
 * Deliberately NOT under /g/: the AASA claims /g/* for the app, and a
 * subscription link tapped on an iPhone has to reach Calendar, not open
 * Jorts.
 *
 * The API answers a feed that was reset (the group's link was rotated)
 * with an empty calendar rather than a 404 — that's what clears the old
 * plans out of a subscriber's calendar — so status and body are passed
 * through untouched.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export const dynamic = 'force-dynamic';

// Feed tokens are 32 hex chars today; allow some slack, nothing else.
const TOKEN = /^[A-Za-z0-9_-]{8,64}$/;

export async function GET(_req: Request, { params }: { params: { feed: string } }) {
  const token = params.feed.replace(/\.ics$/i, '');
  if (!TOKEN.test(token)) {
    return new Response('Not found', { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/v1/groups/feed/${token}.ics`, {
      cache: 'no-store',
    });
  } catch {
    // A calendar app keeps what it already has on a 5xx and retries,
    // which is exactly right for a blip.
    return new Response('Calendar temporarily unavailable', { status: 503 });
  }

  if (!upstream.ok) {
    return new Response(upstream.status === 404 ? 'Not found' : 'Calendar temporarily unavailable', {
      status: upstream.status === 404 ? 404 : 503,
    });
  }

  return new Response(await upstream.text(), {
    status: 200,
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'inline; filename="jorts-group.ics"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
