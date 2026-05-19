/**
 * /join/[token] — Public landing page for a shareable Jorts hang.
 *
 * Mirrors the architecture of /invite/[token]: server-side fetch of
 * a public preview endpoint, render the hang info, give the user a
 * way into the app.
 *
 * Three audiences land here:
 *   1. Someone tapping the link in iMessage / Instagram / Slack with
 *      Jorts installed → iOS Universal Links intercept BEFORE this
 *      page loads, opens the app directly. (They never actually see
 *      this page.)
 *   2. Same audience but Jorts isn't installed → page renders, they
 *      tap "Get Jorts" → App Store. Future-Airbridge-deferred-deeplink
 *      work will auto-join them in the app post-install.
 *   3. Anyone who manually pasted the URL into Safari — iOS shows
 *      the Smart App Banner (via the apple-itunes-app meta tag) and
 *      they can tap that to open in the app. Same Get Jorts fallback
 *      for non-installers.
 */
import type { Metadata } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://jorts-api-944215515278.us-central1.run.app';
const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';
const APP_STORE_ID = '6759267210';

interface InvitePreview {
  crew_id: string;
  name: string;
  host_name: string | null;
  host_picture: string | null;
  going_count: number;
  expires_at: string;
  is_active: boolean;
}

async function fetchPreview(token: string): Promise<InvitePreview | null> {
  try {
    const res = await fetch(`${API_URL}/v1/crews/join-invite/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Generates Open Graph / Twitter / Apple Smart Banner metadata so the
// link unfurls beautifully in iMessage / Instagram / Slack / Twitter
// AND triggers the native "Open in Jorts" banner on iPhone Safari.
export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const preview = await fetchPreview(params.token);

  const title = preview
    ? `Join ${preview.host_name ?? 'a friend'}'s hang on Jorts`
    : 'Join the hang on Jorts';
  const description = preview
    ? `${preview.going_count} ${
        preview.going_count === 1 ? 'person is' : 'people are'
      } in. Tap to join the group hang.`
    : 'Tap to open in the Jorts app.';
  const ogImage = preview?.host_picture ?? undefined;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [{ url: ogImage }] : undefined,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : undefined,
    },
    other: {
      // Smart App Banner — iOS Safari shows "Open in Jorts" at the
      // top of the page when this meta tag is present and the app
      // is installed. Costs nothing to include even when the user
      // doesn't have Jorts (banner just doesn't render).
      'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=${
        params.token
      }`,
    },
  };
}

function formatExpiresAt(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
}

export default async function JoinPage({
  params,
}: {
  params: { token: string };
}) {
  const preview = await fetchPreview(params.token);

  // Token not found at all (bad URL, never existed) — render a
  // neutral "Get Jorts" page so the link still has SOMETHING useful.
  if (!preview) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <span className="text-3xl font-bold tracking-tight">jorts</span>
        <p className="text-white/60 text-lg text-center mt-8">
          This hang invite isn&apos;t available.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-8 inline-block bg-gold text-navy font-bold rounded-full px-8 py-4"
        >
          Get Jorts
        </a>
      </main>
    );
  }

  // Token resolved but the hang is no longer accepting joins
  // (ended/expired/revoked). Still render the hang title for context,
  // but make the CTA "Get Jorts" since there's nothing to join.
  if (!preview.is_active) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <span className="text-3xl font-bold tracking-tight">jorts</span>
        <h1 className="text-white font-bold text-[28px] text-center mt-8 leading-tight">
          {preview.name}
        </h1>
        <p className="text-white/60 text-base text-center mt-3">
          This hang has wrapped.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-8 inline-block bg-gold text-navy font-bold rounded-full px-8 py-4"
        >
          Get Jorts
        </a>
      </main>
    );
  }

  // Active hang — render preview + "Open in Jorts" + App Store fallback.
  const hostFirstName = preview.host_name?.split(' ')[0];
  return (
    <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-12 pb-16">
      <div className="text-center mb-10">
        <span className="text-3xl font-bold tracking-tight">jorts</span>
      </div>

      {/* Host avatar — falls back to a gold dot if no picture */}
      {preview.host_picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={preview.host_picture}
          alt={preview.host_name ?? 'host'}
          width={88}
          height={88}
          className="rounded-full mb-6 object-cover"
        />
      ) : (
        <div className="w-[88px] h-[88px] rounded-full bg-gold mb-6" />
      )}

      <p className="text-gold text-base mb-2">
        {hostFirstName ? `${hostFirstName} invited you` : 'You&rsquo;re invited'}
      </p>
      <h1 className="text-white font-bold text-[32px] text-center leading-tight">
        {preview.name}
      </h1>
      <p className="text-white/70 text-base mt-4">
        {preview.going_count}{' '}
        {preview.going_count === 1 ? 'person is' : 'people are'} in
      </p>
      <p className="text-white/40 text-sm mt-1">
        Wraps {formatExpiresAt(preview.expires_at)}
      </p>

      <div className="w-full max-w-sm mt-12 flex flex-col gap-3">
        {/*
          The "Open in Jorts" CTA is the canonical Universal Link URL
          — same as the current page. When tapped from iMessage / IG /
          Slack with the app installed, iOS Universal Links intercept
          and open the app directly. From Safari itself, this just
          reloads — which is mostly fine because the Smart App Banner
          (via the apple-itunes-app meta tag) is the actual open-in-
          app affordance in Safari.
        */}
        <a
          href={`https://jortsapp.com/join/${params.token}`}
          className="bg-gold text-navy font-bold rounded-full px-8 py-4 text-center text-lg"
        >
          Open in Jorts
        </a>
        <a
          href={APP_STORE_URL}
          className="bg-white/10 text-white font-semibold rounded-full px-8 py-4 text-center text-base"
        >
          Don&apos;t have it? Get Jorts
        </a>
      </div>
    </main>
  );
}
