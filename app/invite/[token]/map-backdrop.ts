/**
 * The map behind the plan on the link preview.
 *
 * Fetched HERE and inlined as a data URI rather than handed to
 * Satori as a `<img src="https://...">`, for one reason: if that
 * fetch fails inside ImageResponse the whole card throws, and this
 * card's entire job is to never render broken in a group text. A
 * Google hiccup must cost the map, not the preview. So every failure
 * — no key, a timeout, a non-200, a rate limit — returns null and
 * the card draws exactly as it did before there was a map.
 *
 * The key never reaches a browser. This runs on the node runtime
 * during the OG render; the URL with the key in it is built, used
 * and dropped server-side.
 */

/** 1200x630 at scale 2 — the card's own size, so it lands pixel for
 *  pixel and Satori never has to resample it. */
const W = 600;
const H = 315;

/** Texture, not a map you read. Labels off because a headline is
 *  already sitting on top of it and street names underneath read as
 *  a rendering fault; desaturated and darkened so the navy scrim
 *  over it has something quiet to sit on. */
const STYLE = [
  'feature:all|element:labels|visibility:off',
  'feature:all|saturation:-100',
  'feature:all|lightness:-72',
  'feature:water|lightness:-82',
  'feature:road|lightness:-45',
];

export async function mapBackdrop(
  latitude?: number | null,
  longitude?: number | null,
): Promise<string | null> {
  const key =
    process.env.GOOGLE_MAPS_API_KEY ||
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  if (!key || typeof latitude !== 'number' || typeof longitude !== 'number') {
    return null;
  }

  const url = new URL('https://maps.googleapis.com/maps/api/staticmap');
  url.searchParams.set('center', `${latitude},${longitude}`);
  // Close enough to recognise the blocks, wide enough that the card
  // is not a picture of somebody's doorstep.
  url.searchParams.set('zoom', '15');
  url.searchParams.set('size', `${W}x${H}`);
  url.searchParams.set('scale', '2');
  url.searchParams.set('maptype', 'roadmap');
  for (const s of STYLE) {
    url.searchParams.append('style', s);
  }
  url.searchParams.set('key', key);

  // The plan's place rarely moves, and the same link gets pasted all
  // evening — a day of cache is a day of not paying Google per paste.
  const controller = new AbortController();
  const bail = setTimeout(() => controller.abort(), 2500);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    // An error from Static Maps can still arrive as a 200 with a tiny
    // body; a real 1200x630 PNG is never this small.
    if (buf.byteLength < 2048) {
      return null;
    }
    return `data:image/png;base64,${buf.toString('base64')}`;
  } catch {
    return null;
  } finally {
    clearTimeout(bail);
  }
}
