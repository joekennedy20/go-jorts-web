/**
 * The link preview for an invite — what a group text shows when the
 * plan's link is pasted into it. See invite-card.tsx for why.
 *
 * The metadata beside this (page.tsx) carries the same facts as words;
 * this is the half that gets looked at.
 *
 * 1080x1920, which is the shape the app's cards are. See
 * invite-card.tsx for why the frame moved to meet them rather than
 * the other way round.
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
  // A card the host designed is served AS ITSELF — the app captures
  // at exactly 1080x1920 and the frame is 1080x1920, so there is
  // nothing to fit, letterbox, crop or fill around. That is the whole
  // reason the preview is tall.
  const poster = await posterImage(plan?.card);
  if (poster) {
    return new ImageResponse(
      (
        <img
          src={poster}
          width={size.width}
          height={size.height}
          style={{ width: size.width, height: size.height }}
        />
      ),
      size,
    );
  }
  return new ImageResponse(inviteCard(plan, await jortsMark()), {
    ...size,
    fonts: await ogFonts(),
  });
}
