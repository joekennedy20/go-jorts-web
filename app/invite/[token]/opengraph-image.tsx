/**
 * The link preview for an invite — what a group text shows when the
 * plan's link is pasted into it. See invite-card.tsx for why.
 *
 * The metadata beside this (page.tsx) carries the same facts as words;
 * this is the half that gets looked at.
 */
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';

import { getPlanSummary } from './invite-data';
import { BODY, DISPLAY, SIZE, inviteCard } from './invite-card';

/** NOT edge, deliberately. The documented way to give Satori a font is
 *  `fetch(new URL('./x.ttf', import.meta.url))`, and it throws
 *  "fetch failed" in the dev edge sandbox — the asset URL webpack emits
 *  isn't reachable from inside it. It is reported to work once
 *  deployed, which is a quality of code you cannot check before
 *  shipping it, so this reads the file instead and runs where files
 *  exist. The fonts are ~200KB and cached after the first render. */
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
  return new ImageResponse(inviteCard(plan), {
    ...size,
    fonts: await cardFonts(),
  });
}

/** Read off disk at request time. The path is spelled out as literals
 *  so `outputFileTracingIncludes` in next.config.js can keep these two
 *  files in the deployed function — nothing imports them, so without
 *  that entry the tracer has no reason to think they are needed. */
async function cardFonts() {
  const dir = join(process.cwd(), 'app', 'invite', '[token]', 'fonts');
  const [display, body] = await Promise.all([
    readFile(join(dir, 'Anton-Regular.ttf')),
    readFile(join(dir, 'Poppins-Regular.ttf')),
  ]);
  return [
    { name: DISPLAY, data: display, style: 'normal' as const },
    { name: BODY, data: body, style: 'normal' as const },
  ];
}
