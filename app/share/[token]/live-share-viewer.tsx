'use client';

/**
 * LiveShareViewer — the actual map experience.
 *
 * Hydrated with the initial state from the server. Polls the backend
 * every 5s to pick up new coords. Renders a single Google Maps pin
 * that smoothly recenters on each update.
 *
 * The render hierarchy:
 *   - Top banner with owner name, last-updated, expires-in
 *   - Map fills the rest of the viewport
 *   - Privacy footnote at the bottom
 *
 * No "Powered by Jorts" footer (intentional — recipient experience
 * is meant to feel like a Google Maps share, not Jorts marketing).
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';
const MAPS_KEY =
  process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

const POLL_INTERVAL_MS = 5_000;

interface ShareState {
  status: 'active' | 'expired' | 'revoked';
  owner_display_name: string;
  owner_picture_url: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  last_updated_at: string | null;
  expires_at: string;
}

// Optional Google Maps Map ID — required by AdvancedMarker. Free to
// create at https://console.cloud.google.com/google/maps-apis/studio/maps
// then set NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID in Vercel. Without it, the
// AdvancedMarker renders but a console warning fires; the avatar still
// shows up on the map regardless.
const MAP_ID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID || undefined;

// Avatar pin diameter in pixels. 56 felt chunky on the map (Joe's
// feedback); 40 sits closer to Find My / Glympse proportions and
// still keeps the face legible at street zoom. Tune here — every
// downstream measurement (initial-letter font size, white ring,
// translate-up offset for the bottom-edge anchor) is computed from
// this single constant.
const AVATAR_PIN_SIZE = 40;

interface Props {
  token: string;
  initial: ShareState;
}

// ──────────────────────────────────────────────────────────────────
// Top banner — owner name + "Last updated 5s ago" + countdown
// ──────────────────────────────────────────────────────────────────

function formatRelativeAgo(iso: string | null): string {
  if (!iso) return 'never';
  const then = new Date(iso).getTime();
  const now = Date.now();
  const seconds = Math.max(0, Math.floor((now - then) / 1000));
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
}

function formatCountdown(expiresIso: string): string {
  const ms = new Date(expiresIso).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const totalMins = Math.floor(ms / 60_000);
  if (totalMins < 1) return 'less than a minute';
  if (totalMins < 60) return `${totalMins}m`;
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
}

function StatusBanner({ share }: { share: ShareState }) {
  // Recompute relative timestamps every second so "5s ago" actually
  // ticks. Doesn't trigger a re-fetch, just a re-render.
  const [, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  if (share.status === 'expired' || share.status === 'revoked') {
    const verb = share.status === 'revoked' ? 'stopped sharing' : 'is no longer sharing';
    return (
      <div className="absolute top-0 left-0 right-0 z-10 bg-navy/95 text-white px-5 py-4 backdrop-blur">
        <p className="text-base font-semibold">
          {share.owner_display_name} {verb}.
        </p>
        <p className="text-sm text-white/70 mt-1">
          You won&apos;t see further updates on this link.
        </p>
      </div>
    );
  }

  return (
    <div className="absolute top-0 left-0 right-0 z-10 bg-navy/95 text-white px-5 py-4 backdrop-blur shadow-lg">
      <p className="text-base font-semibold">
        {share.owner_display_name} is sharing their location
      </p>
      <p className="text-sm text-white/70 mt-1">
        Last updated {formatRelativeAgo(share.last_updated_at)} ·
        {' '}Auto-expires in {formatCountdown(share.expires_at)}
      </p>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────
// Map — recenters whenever the share's coords change. The Marker
// component uses the legacy gMap API which is sufficient + smaller
// bundle than AdvancedMarker for our single-pin use case.
// ──────────────────────────────────────────────────────────────────

function RecenteringMap({ share }: { share: ShareState }) {
  const map = useMap();
  const lat = share.current_latitude;
  const lng = share.current_longitude;

  // Smoothly pan to the new coord whenever it changes. We avoid
  // setting the map's initial `center` prop on each render because
  // that would block user pinch/drag — instead, imperatively call
  // panTo. The map only follows the marker; the user can still drag
  // away and we won't fight them.
  const lastPannedRef = useRef<{ lat: number; lng: number } | null>(null);
  useEffect(() => {
    if (!map || lat == null || lng == null) return;
    const last = lastPannedRef.current;
    if (last && last.lat === lat && last.lng === lng) return;
    map.panTo({ lat, lng });
    lastPannedRef.current = { lat, lng };
  }, [map, lat, lng]);

  if (lat == null || lng == null) return null;

  // Find My / Glympse-style avatar marker: circular photo + small
  // name pill below it, both centered on the position. The avatar
  // sits ON the location (its center marks the actual coord) and
  // the name pill hangs below — same convention iOS Find My uses
  // for friends-on-the-map.
  //
  // If the user has no avatar, fall back to a navy circle with
  // their first initial.
  const initial = (share.owner_display_name?.[0] || '?').toUpperCase();

  return (
    <AdvancedMarker
      position={{ lat, lng }}
      title={share.owner_display_name}>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          // Don't intercept map drags — pointer-events on the
          // avatar/name aren't needed for any interaction; the
          // recipient just looks at the map.
          pointerEvents: 'none',
        }}
      >
        {/* Circular avatar with navy border + white halo */}
        <div
          style={{
            width: AVATAR_PIN_SIZE,
            height: AVATAR_PIN_SIZE,
            borderRadius: '50%',
            border: '3px solid #0D1F2D',
            backgroundColor: '#1B4965',
            backgroundImage: share.owner_picture_url
              ? `url("${share.owner_picture_url}")`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            boxShadow:
              '0 2px 8px rgba(0,0,0,0.3), 0 0 0 4px rgba(255,255,255,0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            fontWeight: 600,
            fontSize: AVATAR_PIN_SIZE * 0.38,
          }}
        >
          {/* Initial fallback — only renders when no picture URL set,
              since the background image will cover it otherwise. */}
          {!share.owner_picture_url && <span>{initial}</span>}
        </div>

        {/* Name pill — small white capsule with navy text. Centered
            below the avatar with a 6px gap. white-space:nowrap so
            it stays one line even for longer first names. */}
        <div
          style={{
            marginTop: 6,
            padding: '2px 9px',
            borderRadius: 999,
            backgroundColor: 'rgba(255, 255, 255, 0.97)',
            color: '#0D1F2D',
            fontSize: 11,
            fontWeight: 600,
            lineHeight: 1.4,
            fontFamily:
              '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
            whiteSpace: 'nowrap',
            // Tiny letter-spacing for legibility at small size.
            letterSpacing: 0.1,
          }}
        >
          {share.owner_display_name}
        </div>
      </div>
    </AdvancedMarker>
  );
}

// ──────────────────────────────────────────────────────────────────
// Main viewer
// ──────────────────────────────────────────────────────────────────

export function LiveShareViewer({ token, initial }: Props) {
  const [share, setShare] = useState<ShareState>(initial);

  // Poll backend for fresh coords. Stops polling once the share
  // is no longer active — there's nothing more to learn after that.
  const fetchShare = useCallback(async () => {
    try {
      const res = await fetch(
        `${API_URL}/v1/public/location-shares/${encodeURIComponent(token)}`,
        { cache: 'no-store' },
      );
      if (!res.ok) return;
      const next: ShareState = await res.json();
      setShare(next);
    } catch {
      // Network blip — silently retry on the next interval. Don't
      // surface transient errors to the recipient; an angry red toast
      // for a 1s WiFi hiccup is worse UX than a 5s-stale pin.
    }
  }, [token]);

  useEffect(() => {
    if (share.status !== 'active') return;
    const id = setInterval(fetchShare, POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [share.status, fetchShare]);

  // Default map center: the share's current coords if we have them;
  // otherwise NYC. NYC is arbitrary but matches Jorts's brand center.
  const defaultCenter = useMemo(
    () => ({
      lat: share.current_latitude ?? 40.7128,
      lng: share.current_longitude ?? -74.006,
    }),
    // Intentionally only computed on first mount — subsequent updates
    // are handled by RecenteringMap's panTo.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  if (!MAPS_KEY) {
    // Friendlier than a blank Google Maps "Oops!" overlay. Only fires
    // in dev / preview deploys missing the env var. Production sets
    // NEXT_PUBLIC_GOOGLE_MAPS_API_KEY on Vercel.
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-6 text-center text-white">
        <h1 className="text-xl font-semibold mb-2">Map unavailable</h1>
        <p className="text-white/70">
          The map can&apos;t load right now. Please try again later.
        </p>
      </main>
    );
  }

  return (
    <main className="relative h-screen w-screen overflow-hidden">
      <StatusBanner share={share} />

      <APIProvider apiKey={MAPS_KEY}>
        <Map
          mapId={MAP_ID}
          defaultCenter={defaultCenter}
          defaultZoom={15}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={false}
          style={{ width: '100%', height: '100%' }}
        >
          <RecenteringMap share={share} />
        </Map>
      </APIProvider>

      {/* Privacy footnote — bottom of viewport, subtle. Per Joe's
          spec we removed the "Powered by Jorts" mark so this feels
          like a generic location share rather than an ad surface. */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-navy/90 text-white/70 text-xs px-5 py-3 backdrop-blur">
        Auto-expires {new Date(share.expires_at).toLocaleString()}.{' '}
        {share.owner_display_name} can stop sharing at any time.
      </div>
    </main>
  );
}
