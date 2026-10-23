/**
 * The link preview for a night page — what a group text, a Slack or
 * an IG DM shows when an /out/{token} URL is pasted.
 *
 * Same navy/gold system as the invite preview, and now actually
 * drawn in it: this card asked for `fontWeight: 700` in three places
 * and loaded no fonts, and Satori has none of its own — so every
 * weight was silently dropped and the whole thing rendered flat in
 * one face. It had looked like that since the day it shipped.
 */
import { ImageResponse } from 'next/og';

import { getNightPage, headlineFor } from './night-data';
import { BODY, DISPLAY, GOLD, NAVY, ogFonts } from '@/app/og-fonts';

/** NOT edge, deliberately — see app/og-fonts.ts for why. */
export const runtime = 'nodejs';
export const alt = 'Out tonight on Jorts';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default async function Image({
  params,
}: {
  params: { token: string };
}) {
  // A page we can't read still gets a card. A broken preview in a
  // thread is worse than a plain one.
  let page = null;
  try {
    page = await getNightPage(params.token);
  } catch {
    page = null;
  }
  const active = page?.is_active ?? false;

  const headline = page && active ? headlineFor(page) : 'Out tonight';
  const sub = active ? 'tap to tell them you’re out too' : 'catch the next one';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: NAVY,
          padding: '60px 80px',
        }}
      >
        <div
          style={{
            display: 'flex',
            fontFamily: BODY,
            fontSize: 36,
            color: GOLD,
            letterSpacing: -1,
            marginBottom: 40,
          }}
        >
          jorts
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: DISPLAY,
            // Anton is a condensed face and fits far more per line
            // than the old fallback did, so the break points moved
            // with it.
            fontSize: headline.length > 34 ? 68 : 86,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.1,
            letterSpacing: -1,
            maxWidth: 1000,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: BODY,
            alignItems: 'center',
            marginTop: 44,
            backgroundColor: 'rgba(232,160,32,0.16)',
            borderRadius: 999,
            padding: '16px 36px',
            fontSize: 30,
            color: GOLD,
          }}
        >
          {sub}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  );
}
