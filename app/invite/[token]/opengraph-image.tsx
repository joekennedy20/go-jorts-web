/**
 * Generated Open Graph image for invite links — the card art that
 * iMessage / Slack / IG DMs show when an invite URL is pasted into a
 * chat. Rendered per-plan with the real name, day, and who's in, in a
 * vibe theme (see card-themes.tsx).
 *
 * Next.js file convention: opengraph-image.tsx next to page.tsx is
 * picked up automatically and wired into the page's <meta og:image>.
 *
 * Node runtime (not edge) so we can read the display fonts off disk
 * with fs — the `fetch(new URL(..., import.meta.url))` asset pattern
 * fails under `next dev`, and disk reads work in dev and on Vercel
 * (the fonts are force-included via outputFileTracingIncludes in
 * next.config.js).
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { ImageResponse } from 'next/og';
import { getPlanSummary } from './invite-data';
import { pickTheme, InviteCard } from './card-themes';

export const runtime = 'nodejs';
export const alt = "You're invited to a hang on Jorts";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const FONT_DIR = join(process.cwd(), 'app', 'invite', '[token]', 'fonts');
const ANTON = readFileSync(join(FONT_DIR, 'Anton-Regular.ttf'));
const SERIF = readFileSync(join(FONT_DIR, 'DMSerifDisplay-Regular.ttf'));
const SERIF_ITALIC = readFileSync(join(FONT_DIR, 'DMSerifDisplay-Italic.ttf'));
const SANS = readFileSync(join(FONT_DIR, 'Poppins-Regular.ttf'));

export default async function Image({
  params,
}: {
  params: { token: string };
}) {
  const plan = await getPlanSummary(params.token);
  const theme = pickTheme(plan);

  return new ImageResponse(<InviteCard plan={plan} theme={theme} />, {
    ...size,
    fonts: [
      { name: 'Anton', data: ANTON, weight: 400, style: 'normal' },
      { name: 'Serif', data: SERIF, weight: 400, style: 'normal' },
      { name: 'Serif', data: SERIF_ITALIC, weight: 400, style: 'italic' },
      { name: 'Sans', data: SANS, weight: 400, style: 'normal' },
    ],
  });
}
