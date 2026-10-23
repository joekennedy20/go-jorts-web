/**
 * The link preview for an invite — what a group text shows when the
 * plan's link is pasted into it. See invite-card.tsx for why.
 *
 * The metadata beside this (page.tsx) carries the same facts as words;
 * this is the half that gets looked at.
 */
import { ImageResponse } from 'next/og';

import { getPlanSummary } from './invite-data';
import { SIZE, inviteCard } from './invite-card';
import { ogFonts } from '@/app/og-fonts';
import { jortsMark } from '@/app/og-mark';
import { posterImage } from './poster';

/** NOT edge, deliberately — see app/og-fonts.ts for why. */
export const runtime = 'nodejs';
export const alt = 'A plan on Jorts';
export const size = SIZE;
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { token: string };
}) {
  // A plan we can't read still gets a card — see inviteCard's null
  // branch. Nothing here is allowed to render a broken preview.
  let plan = null;
  try {
    plan = await getPlanSummary(params.token);
  } catch {
    plan = null;
  }
  const [mark, poster] = await Promise.all([
    jortsMark(),
    posterImage(plan?.card),
  ]);
  return new ImageResponse(inviteCard(plan, mark, poster), {
    ...size,
    fonts: await ogFonts(),
  });
}
