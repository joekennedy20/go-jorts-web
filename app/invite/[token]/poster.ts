/**
 * The card the host actually designed, fetched for the link preview.
 *
 * Fetched HERE and inlined rather than handed to Satori as a remote
 * `<img src="https://...">`, for one reason: if that fetch fails
 * inside ImageResponse the whole card throws, and this card's entire
 * job is to never render broken in a group text. A slow bucket must
 * cost the poster, not the preview. So every failure — missing, a
 * timeout, a non-200, something that isn't an image — returns null
 * and the card falls back to the date block.
 *
 * Same lesson the map taught, kept after the map went.
 */

/** A 1080x1920 PNG is around 1-3MB. Anything far past that is not a
 *  card and is not worth holding in memory to draw at 354px. */
const MAX_BYTES = 8 * 1024 * 1024;

export async function posterImage(url?: string | null): Promise<string | null> {
  if (!url || !/^https:\/\//.test(url)) {
    return null;
  }
  const controller = new AbortController();
  const bail = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      // The same link gets pasted all evening and the poster is fixed
      // once the plan is made. A day of cache is a day of not
      // re-fetching it per paste.
      next: { revalidate: 86400 },
    });
    if (!res.ok) {
      return null;
    }
    const type = res.headers.get('content-type') || '';
    if (!type.startsWith('image/')) {
      return null;
    }
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.byteLength < 1024 || buf.byteLength > MAX_BYTES) {
      return null;
    }
    return `data:${type.split(';')[0]};base64,${buf.toString('base64')}`;
  } catch {
    return null;
  } finally {
    clearTimeout(bail);
  }
}
