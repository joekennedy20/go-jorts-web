/**
 * /share/[token] — public viewer for a live-location share.
 *
 * Server component shell: fetches the initial state once on the
 * server (so the recipient sees content immediately on first paint
 * instead of a loading spinner), then hands off to the client
 * <LiveShareViewer> which polls and re-renders the map.
 *
 * Mirrors the structure of /invite/[token] and /join/[token].
 *
 * URL pattern: https://go-jorts-web.vercel.app/share/{token}
 * The mobile app builds this URL via the backend's share_url field.
 */

import { Metadata } from 'next';
import { LiveShareViewer } from './live-share-viewer';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

interface SharePublicResponse {
  status: 'active' | 'expired' | 'revoked';
  owner_display_name: string;
  current_latitude: number | null;
  current_longitude: number | null;
  last_updated_at: string | null;
  expires_at: string;
}

async function fetchInitialShare(
  token: string,
): Promise<SharePublicResponse | null> {
  try {
    // No cache — every visit should hit the live state. This is a
    // privacy-friendly default too: avoids CDN caches surfacing a
    // stale location after the owner has stopped sharing.
    const res = await fetch(
      `${API_URL}/v1/public/location-shares/${encodeURIComponent(token)}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const share = await fetchInitialShare(params.token);

  // Even on failure we want a sensible iMessage / WhatsApp preview
  // (no orphan "404 Not Found" link card in someone's chat). Default
  // to the friendly fallback.
  const title = share
    ? `${share.owner_display_name} is sharing their location`
    : 'Live location';
  const description = share
    ? `Tap to see ${share.owner_display_name} on a live map.`
    : 'A live location was shared with you on Jorts.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
  };
}

export default async function SharePage({
  params,
}: {
  params: { token: string };
}) {
  const initial = await fetchInitialShare(params.token);

  if (!initial) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-2xl font-semibold mb-3">
          This share link has expired or doesn&apos;t exist.
        </h1>
        <p className="text-white/70 max-w-sm">
          Ask the person who sent it to share their location again.
        </p>
      </main>
    );
  }

  return <LiveShareViewer token={params.token} initial={initial} />;
}
