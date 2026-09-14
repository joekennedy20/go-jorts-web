/**
 * Resolving a group link for the landing page.
 *
 * Public and unauthenticated: most people a group link reaches don't
 * have Jorts. The API answers with the sign on the door — name, emoji,
 * who runs it, how many are in — and nothing about the plans or the
 * people inside.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export interface GroupLinkPreview {
  group_name: string;
  emoji: string | null;
  /** First name of whoever runs the group. */
  inviter_name: string | null;
  member_count: number;
}

export async function resolveGroupLink(
  token: string,
): Promise<GroupLinkPreview | null> {
  try {
    const res = await fetch(`${API_URL}/v1/groups/join/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
