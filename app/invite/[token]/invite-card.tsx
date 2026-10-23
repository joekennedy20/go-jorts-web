/**
 * The card a Jorts invite becomes when it lands in a group text.
 *
 * The page's metadata has always said the right things — "Kemper's —
 * Thursday", "hosted by Joe — 8:30 PM · Kemper's" — and with no image
 * beside them iMessage renders the lot as a grey row that looks like
 * every spam link anyone has ever been sent. The plan was already in
 * the thread; nobody could see it.
 *
 * Two zones, after the shape Joe picked out (2026-10-23): a faded map
 * band across the top with the Jorts mark in the corner, and the plan
 * underneath it in the clear.
 *
 * The plan's own words are the hero. The map is behind them and
 * deliberately nowhere — see og-map.tsx. And nothing here says who is
 * in or out: that changes all evening and a preview is a frozen PNG,
 * so a card claiming "8 going" is a card that will be wrong by nine
 * o'clock. The page one tap away is live and can say it truthfully.
 *
 * Kept apart from opengraph-image.tsx so it can be rendered from a
 * script with fixture data — a card you have only seen in your own
 * head is not a card you have checked.
 */
import type { PlanSummary } from './invite-data';
import { formatDay } from './invite-data';
import { BODY, DISPLAY } from '@/app/og-fonts';
import { ogMap } from '@/app/og-map';

export const SIZE = { width: 1200, height: 630 };
/** How much of the card the map gets. The rest is the plan. */
const MAP_H = 288;

const INK = '#16212C';
const INK_SOFT = '#5C6873';
const GOLD = '#E8A020';
const PAPER = '#F6F4EF';

/** "Thursday, October 22" → "Thursday" once a time sits beside it.
 *  The long form is for a page you are reading; a card is glanced at. */
function dayWord(day: string): string {
  return formatDay(day).split(',')[0] || formatDay(day);
}

export function inviteCard(plan: PlanSummary | null, mark: string | null) {
  const name = plan?.name?.trim() || 'You\u2019re invited';
  const when = plan
    ? [dayWord(plan.day), plan.time?.trim()].filter(Boolean).join('  ·  ')
    : 'tap to see the plan';

  // Plans are very often named after the place — "Kemper's" at
  // Kemper's — and printing it twice reads as a bug in the card
  // rather than a fact about the night.
  const place = plan?.location?.trim();
  const showPlace =
    place && place.toLowerCase() !== name.toLowerCase() ? place : null;

  return (
    <div style={shell}>
      {ogMap(MAP_H)}

      {mark ? (
        <div style={badge}>
          <img src={mark} width={84} height={77} />
        </div>
      ) : null}

      <div style={sheet}>
        <div
          style={{
            ...title,
            // User-typed, so it has to survive "dinner" and "Auburn
            // homecoming tailgate thing" in the same box.
            fontSize: name.length > 30 ? 74 : name.length > 18 ? 92 : 108,
          }}
        >
          {name}
        </div>

        <div style={when_}>{when}</div>

        {showPlace ? (
          <div style={whereRow}>
            <div style={pin} />
            <div style={where}>{showPlace}</div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Satori needs explicit display:flex on anything with children, and no
// shorthand it can't resolve — these are plain objects for that reason.
// It also has no z-index: later siblings paint over earlier ones, which
// is the whole of the stacking here.
const shell: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: PAPER,
  position: 'relative',
};

/** The mark, over the map's top-left corner. */
const badge: React.CSSProperties = {
  position: 'absolute',
  left: 44,
  top: 30,
  width: 116,
  height: 108,
  borderRadius: 26,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
};

/** The plan, in the clear under the map. */
const sheet: React.CSSProperties = {
  position: 'absolute',
  left: 0,
  top: MAP_H,
  width: SIZE.width,
  height: SIZE.height - MAP_H,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 68px',
  backgroundColor: PAPER,
};

const title: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  color: INK,
  lineHeight: 1.04,
  letterSpacing: -1.5,
  maxWidth: 1060,
};

const when_: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  marginTop: 22,
  fontSize: 42,
  color: INK_SOFT,
};

const whereRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 12,
};

const pin: React.CSSProperties = {
  display: 'flex',
  width: 16,
  height: 16,
  borderRadius: 8,
  backgroundColor: GOLD,
  marginRight: 14,
};

const where: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 38,
  color: INK_SOFT,
};
