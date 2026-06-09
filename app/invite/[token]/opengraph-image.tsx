/**
 * Generated Open Graph image for invite links — this is the big card
 * art that iMessage / Slack / IG DMs show when an invite URL is
 * pasted into a chat. Rendered per-plan with the real name, day, and
 * who's in, on the brand navy with gold accents.
 *
 * Next.js file convention: opengraph-image.tsx next to page.tsx is
 * picked up automatically and wired into the page's <meta og:image>.
 */
import { ImageResponse } from 'next/og';
import { getPlanSummary, formatDay, attendanceText } from './invite-data';

export const runtime = 'edge';
export const alt = "You're invited to a hang on Jorts";
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

const NAVY = '#0D1F2D';
const GOLD = '#E8A020';

export default async function Image({
  params,
}: {
  params: { token: string };
}) {
  const plan = await getPlanSummary(params.token);

  const detailLine = plan
    ? [plan.time, plan.location].filter(Boolean).join('  ·  ')
    : null;
  const attendance = plan ? attendanceText(plan.confirmed_names) : null;

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
            marginBottom: 36,
          }}
        >
          jorts
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: plan && plan.name.length > 24 ? 56 : 72,
            fontWeight: 700,
            color: '#FFFFFF',
            textAlign: 'center',
            lineHeight: 1.1,
            maxWidth: 1000,
          }}
        >
          {plan ? plan.name : "You're invited"}
        </div>
        <div
          style={{
            display: 'flex',
            fontSize: 38,
            color: GOLD,
            marginTop: 28,
          }}
        >
          {plan ? formatDay(plan.day) : 'Tap to see the plan'}
        </div>
        {detailLine ? (
          <div
            style={{
              display: 'flex',
              fontSize: 30,
              color: 'rgba(255,255,255,0.65)',
              marginTop: 14,
            }}
          >
            {detailLine}
          </div>
        ) : null}
        {attendance ? (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 40,
              backgroundColor: 'rgba(255,255,255,0.08)',
              borderRadius: 999,
              padding: '14px 32px',
              fontSize: 30,
              color: 'rgba(255,255,255,0.9)',
            }}
          >
            {attendance}
          </div>
        ) : null}
      </div>
    ),
    size
  );
}
