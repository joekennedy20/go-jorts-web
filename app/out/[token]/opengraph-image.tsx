/**
 * Generated Open Graph image for night-page links — shown when the
 * /out/{token} URL is pasted into iMessage / Slack / IG DMs. Same
 * navy/gold system as the invite preview.
 */
import { ImageResponse } from 'next/og';
import { getNightPage, headlineFor } from './night-data';

export const runtime = 'edge';
export const alt = 'Out tonight on Jorts';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#0D1F2D';
const GOLD = '#E8A020';

export default async function Image({
  params,
}: {
  params: { token: string };
}) {
  const page = await getNightPage(params.token);
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
            fontSize: 36,
            fontWeight: 700,
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
            fontSize: headline.length > 28 ? 54 : 68,
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.15,
            maxWidth: 1000,
          }}
        >
          {headline}
        </div>
        <div
          style={{
            display: 'flex',
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
    size
  );
}
