/**
 * /my/<feed token>.ics — one person's own Jorts plans as a calendar
 * subscription (the plans they said yes to, and the ones they're a
 * maybe on). What Apple and Google Calendar poll after "Put your plans
 * in your calendar" in the app.
 *
 * A pass-through to GET /v1/calendar/feed/<token>.ics, served from this
 * domain so the URL in someone's calendar survives an API move. Same
 * rules as the group feed next door (/cal/): not under a path the AASA
 * claims, so a tap reaches Calendar rather than Jorts, and a reset link
 * gets the API's empty "turned off" calendar passed straight through.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export const dynamic = 'force-dynamic';

const TOKEN = /^[A-Za-z0-9_-]{8,64}$/;

export async function GET(_req: Request, { params }: { params: { feed: string } }) {
  const token = params.feed.replace(/\.ics$/i, '');
  if (!TOKEN.test(token)) {
    return new Response('Not found', { status: 404 });
  }

  let upstream: Response;
  try {
    upstream = await fetch(`${API_URL}/v1/calendar/feed/${token}.ics`, { cache: 'no-store' });
  } catch {
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
      'Content-Disposition': 'inline; filename="jorts.ics"',
      'Cache-Control': 'private, max-age=300',
    },
  });
}
