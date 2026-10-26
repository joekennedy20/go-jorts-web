/**
 * The card a Jorts invite becomes when it lands in a group text.
 *
 * TALL, like the cards the app makes. The preview used to be
 * 1200x630 because that is what an OG image conventionally is, and
 * everything after that was a consequence of the mismatch: a 9:16
 * card designed in the app had to be letterboxed into a landscape
 * frame, put in a panel with the plan's words beside it, or blown
 * up and blurred to fill the space around itself. All three are
 * ways of apologising for the shape (Joe, 2026-10-26: "can we make
 * all be 9:16?").
 *
 * So the frame is the card's shape and nothing has to be fitted
 * into anything. A designed card is served as itself, pixel for
 * pixel — the app captures at exactly 1080x1920. A plan with no
 * design gets this: the same pass, stood up.
 *
 * Nothing here says who is in or out. A preview is a frozen PNG and
 * attendance changes all evening, so a card saying "8 going" is a
 * card that will be wrong by nine o'clock. The page one tap away is
 * live and can say it truthfully.
 *
 * Kept apart from opengraph-image.tsx so it can be rendered from a
 * script with fixture data — a card you have only seen in your own
 * head is not a card you have checked.
 */
import type { PlanSummary } from './invite-data';
import { formatDay } from './invite-data';
import { BODY, DISPLAY } from '@/app/og-fonts';

export const SIZE = { width: 1080, height: 1920 };
/** The date, across the top. Just over half, because 9:16 is a lot
 *  of card and three lines of plan will not fill the rest of it —
 *  at 700 the paper had a dead band above the name wider than the
 *  name itself. */
const BLOCK_H = 980;

const NAVY = '#0D1F2D';
const INK = '#16212C';
const INK_SOFT = '#5C6873';
const GOLD = '#E8A020';
const PAPER = '#F6F4EF';

/**
 * Weekday, day number and month, each independently optional.
 *
 * `formatDay` returns the raw string it was given when it can't
 * parse one, so every piece here is taken defensively: the day
 * NUMBER comes off the ISO date rather than out of the formatted
 * string, because it is the biggest thing on the card and the one
 * worth being sure of.
 */
function datePieces(plan: PlanSummary | null) {
  if (!plan?.day) {
    return { weekday: '', dayNum: '', month: '' };
  }
  const long = formatDay(plan.day);
  const [weekday, rest] = long.split(', ');
  const [month] = (rest || '').split(' ');
  const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(plan.day);
  const dayNum = iso ? String(Number(iso[3])) : (rest || '').split(' ')[1] || '';
  return { weekday: rest ? weekday : '', dayNum, month: rest ? month : '' };
}

export function inviteCard(plan: PlanSummary | null, mark: string | null) {
  const name = plan?.name?.trim() || 'You’re invited';
  const { weekday, dayNum, month } = datePieces(plan);
  const time = plan?.time?.trim() || '';

  // Plans are very often named after the place — "Kemper's" at
  // Kemper's — and printing it twice reads as a bug in the card
  // rather than a fact about the night.
  const place = plan?.location?.trim();
  const showPlace =
    place && place.toLowerCase() !== name.toLowerCase() ? place : null;

  return (
    <div style={shell}>
      <div style={block}>
        {dayNum ? (
          // A real box, not a fragment: Satori lays a fragment's
          // children out in a ROW whatever the parent says.
          <div style={stack}>
            <div style={weekdayText}>{weekday.slice(0, 3).toUpperCase()}</div>
            <div style={dayText}>{dayNum}</div>
            <div style={monthText}>{month}</div>
          </div>
        ) : mark ? (
          // No date — an unresolvable token, or a plan saved without
          // one. On white, because the mark is navy and so is this.
          <div style={markBadge}>
            <img
              src={mark}
              width={230}
              height={211}
              style={{ width: 230, height: 211 }}
            />
          </div>
        ) : null}
      </div>

      <div style={body}>
        <div
          style={{
            ...title,
            // User-typed, so it has to survive "dinner" and "Auburn
            // homecoming tailgate thing" in the same box.
            fontSize: name.length > 30 ? 118 : name.length > 18 ? 146 : 184,
          }}
        >
          {name}
        </div>

        {time ? <div style={timeText}>{time}</div> : null}

        {showPlace ? (
          <div style={whereRow}>
            <div style={pin} />
            <div style={where}>{showPlace}</div>
          </div>
        ) : null}

        {!time && !showPlace ? (
          <div style={timeText}>tap to see the plan</div>
        ) : null}
      </div>

      {/* The sign-off. Only when the block isn't already carrying it. */}
      {mark && dayNum ? (
        <img src={mark} width={150} height={138} style={signoff} />
      ) : null}
    </div>
  );
}

// Satori needs explicit display:flex on anything with children, and no
// shorthand it can't resolve — these are plain objects for that reason.
const shell: React.CSSProperties = {
  width: '100%',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  backgroundColor: PAPER,
  position: 'relative',
};

const block: React.CSSProperties = {
  width: SIZE.width,
  height: BLOCK_H,
  backgroundColor: NAVY,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const stack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const markBadge: React.CSSProperties = {
  width: 300,
  height: 282,
  borderRadius: 60,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
};

const weekdayText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 54,
  letterSpacing: 8,
  color: GOLD,
};

const dayText: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  fontSize: 400,
  color: '#FFFFFF',
  lineHeight: 1,
  marginTop: 10,
};

const monthText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 54,
  color: 'rgba(255,255,255,0.74)',
  marginTop: 14,
};

const body: React.CSSProperties = {
  width: SIZE.width,
  height: SIZE.height - BLOCK_H,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 88px',
};

const title: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  color: INK,
  lineHeight: 1.03,
  letterSpacing: -3,
};

const timeText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 76,
  color: INK_SOFT,
  marginTop: 40,
};

const whereRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 22,
};

const pin: React.CSSProperties = {
  display: 'flex',
  width: 24,
  height: 24,
  borderRadius: 12,
  backgroundColor: GOLD,
  marginRight: 22,
};

const where: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 64,
  color: INK_SOFT,
};

const signoff: React.CSSProperties = {
  position: 'absolute',
  right: 72,
  bottom: 72,
  width: 150,
  height: 138,
};
