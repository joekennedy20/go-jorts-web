/**
 * Resolving a map invite for the landing page.
 *
 * Public and unauthenticated on purpose: the audience for this page is
 * people who don't have Jorts, which is most of who a steward invites.
 *
 * Resolving deliberately does NOT consume the invite — the API keeps
 * that separate from claiming. It has to: iMessage fetches link
 * previews unprompted, and a link that died to a preview would be
 * unexplainable to the person who sent it.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export interface MapInvite {
  map_name: string | null;
  emoji: string | null;
  school: string | null;
  /** First name of whoever runs the map. */
  inviter_name: string | null;
  /** Who it was addressed to, when it was minted from contacts. */
  invited_name: string | null;
  status: 'pending' | 'accepted' | 'revoked';
}

export async function resolveMapInvite(
  token: string,
): Promise<MapInvite | null> {
  try {
    const res = await fetch(
      `${API_URL}/v1/sandboxes/invites/resolve/${token}`,
      { cache: 'no-store' },
    );
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
