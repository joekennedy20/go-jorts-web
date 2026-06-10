/**
 * Shared data layer for the night page (/out/[token]) — the live
 * public page behind an "I'm out" IG story share. Used by the page,
 * its Open Graph metadata, and the generated preview image.
 */

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

export interface NightPage {
  first_name: string;
  picture: string | null;
  city: string | null;
  event_name: string | null;
  started_at: string;
  expires_at: string;
  is_active: boolean;
  response_count: number;
  responses: { name: string; type: string }[];
}

export async function getNightPage(token: string): Promise<NightPage | null> {
  try {
    const res = await fetch(`${API_URL}/v1/night/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

/** "Joe's out in Nashville" / "Joe's going to Knicks game" */
export function headlineFor(page: NightPage): string {
  if (page.event_name) return `${page.first_name}'s going to ${page.event_name}`;
  if (page.city) return `${page.first_name}'s out in ${page.city}`;
  return `${page.first_name}'s out tonight`;
}

/** "started 9:42 PM" in Eastern time, matching the user base. */
export function startedLine(iso: string): string {
  try {
    const d = new Date(iso);
    return `started ${d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      timeZone: 'America/New_York',
    })}`;
  } catch {
    return '';
  }
}

/** "Mia said they're out too" / "Mia and 2 others are out too" */
export function responsesLine(page: NightPage): string | null {
  const outToo = page.responses.filter(r => r.type === 'out_too');
  if (outToo.length === 0) return null;
  const first = outToo[0]?.name;
  if (outToo.length === 1) return `${first} is out too`;
  return `${first} and ${outToo.length - 1} other${
    outToo.length - 1 > 1 ? 's' : ''
  } are out too`;
}
