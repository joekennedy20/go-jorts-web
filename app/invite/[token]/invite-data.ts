/**
 * Shared data layer for the invite page, its Open Graph metadata, and
 * the generated preview image. All three need the same plan summary,
 * so the fetch + formatting helpers live here once.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export interface PlanSummary {
  name: string;
  day: string;
  time: string | null;
  location: string | null;
  confirmed_names: string[];
}

export interface ResolveResult {
  type: 'contact' | 'group';
  token?: string;
  plan_id?: string;
  plan?: PlanSummary;
}

export interface ContactInviteData {
  contact_name: string;
  rsvp_status: string;
  plan: PlanSummary;
}

export async function resolveToken(
  token: string
): Promise<ResolveResult | null> {
  try {
    const res = await fetch(`${API_URL}/v1/invites/resolve/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

export async function getContactInvite(
  token: string
): Promise<ContactInviteData | null> {
  try {
    const res = await fetch(`${API_URL}/v1/invites/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/**
 * One call that works for both invite types — used by generateMetadata
 * and the OG image, which only need the plan, not the RSVP state.
 */
export async function getPlanSummary(
  token: string
): Promise<PlanSummary | null> {
  const resolved = await resolveToken(token);
  if (!resolved) return null;
  if (resolved.type === 'group' && resolved.plan) return resolved.plan;
  if (resolved.type === 'contact') {
    const invite = await getContactInvite(token);
    return invite?.plan ?? null;
  }
  return null;
}

export function formatDay(dayStr: string): string {
  try {
    const [y, m, d] = dayStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dayStr;
  }
}

export function attendanceText(names: string[]): string | null {
  if (names.length === 0) return null;
  if (names.length === 1) return `${names[0]} is in`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are in`;
  return `${names[0]}, ${names[1]}, and ${names.length - 2} other${
    names.length - 2 > 1 ? 's' : ''
  } are in`;
}
