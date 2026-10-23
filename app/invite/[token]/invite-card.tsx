/**
 * The card a Jorts invite becomes when it lands in a group text.
 *
 * The page's metadata has always said the right things — "Kemper's —
 * Thursday", "hosted by Joe — 8:30 PM · Kemper's" — and with no image
 * beside them iMessage renders the lot as a grey row that looks like
 * every spam link anyone has ever been sent. The plan was already in
 * the thread; nobody could see it.
 *
 * A pass: the date in a navy block on the left, the plan on paper
 * beside it. Picked out of three directions (Joe, 2026-10-23) and
 * it is the right one for the place this lives. A link preview is
 * read at a glance, half-scrolled, in a thread moving past it — and
 * the day number is the one thing on this card that survives being
 * shrunk into a message bubble. The name tells you what; the 22
 * tells you whether you care.
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

export const SIZE = { width: 1200, height: 630 };
/** The date block. Wide enough for a two-digit day at 176px. */
const BLOCK_W = 330;
/** The host's own card is 9:16, so at full bleed down the left edge
 *  it is this wide. It takes the date block's place rather than
 *  sitting beside it — the poster already says when. */
const POSTER_W = Math.round((SIZE.height * 9) / 16);

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
  return {
    weekday: rest ? weekday : '',
    dayNum,
    month: rest ? month : '',
  };
}

export function inviteCard(
  plan: PlanSummary | null,
  mark: string | null,
  /** The host's designed card, already fetched and inlined — see
   *  poster.ts. Null whenever they didn't make one or anything at
   *  all went wrong, and the date block takes the space back. */
  poster: string | null = null,
) {
  const name = plan?.name?.trim() || 'You’re invited';
  const { weekday, dayNum, month } = datePieces(plan);
  const time = plan?.time?.trim() || '';

  // Plans are very often named after the place — "Kemper's" at
  // Kemper's — and printing it twice reads as a bug in the card
  // rather than a fact about the night.
  const place = plan?.location?.trim();
  const showPlace =
    place && place.toLowerCase() !== name.toLowerCase() ? place : null;

  if (poster) {
    // They designed a card. It IS the invite — the words beside it
    // are the part a thumbnail can still read when the artwork
    // cannot.
    return (
      <div style={shell}>
        <img
          src={poster}
          width={POSTER_W}
          height={SIZE.height}
          style={{ width: POSTER_W, height: SIZE.height }}
        />
        <div style={{ ...body, width: SIZE.width - POSTER_W }}>
          <div
            style={{
              ...title,
              fontSize: name.length > 32 ? 58 : name.length > 22 ? 70 : 88,
            }}
          >
            {name}
          </div>
          <div style={timeText}>
            {[weekday, dayNum && month ? `${month} ${dayNum}` : '', time]
              .filter(Boolean)
              .join('  ·  ')}
          </div>
          {showPlace ? (
            <div style={whereRow}>
              <div style={pin} />
              <div style={where}>{showPlace}</div>
            </div>
          ) : null}
        </div>
        {mark ? (
          <img src={mark} width={104} height={95} style={signoffSmall} />
        ) : null}
      </div>
    );
  }

  return (
    <div style={shell}>
      <div style={block}>
        {dayNum ? (
          // A real box, not a fragment: Satori laid the fragment's
          // three children out in a ROW and overflowed the block.
          <div style={stack}>
            <div style={weekdayText}>{weekday.slice(0, 3).toUpperCase()}</div>
            <div style={dayText}>{dayNum}</div>
            <div style={monthText}>{month}</div>
          </div>
        ) : (
          // No date to put here — an unresolvable token, or a plan
          // saved without one. The mark fills the block rather than
          // leaving a navy hole with a dash in it.
          mark ? (
            // On white. The mark is navy and the block is navy, so
            // dropped straight in it all but disappeared.
            <div style={markBadge}>
              <img
                src={mark}
                width={146}
                height={134}
                style={{ width: 146, height: 134 }}
              />
            </div>
          ) : null
        )}
      </div>

      <div style={body}>
        <div
          style={{
            ...title,
            // User-typed, so it has to survive "dinner" and "Auburn
            // homecoming tailgate thing" in the same box.
            fontSize: name.length > 32 ? 62 : name.length > 22 ? 76 : 96,
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
        <img src={mark} width={118} height={108} style={signoff} />
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
  backgroundColor: PAPER,
  position: 'relative',
};

const block: React.CSSProperties = {
  width: BLOCK_W,
  height: SIZE.height,
  backgroundColor: NAVY,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
};

const weekdayText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 34,
  letterSpacing: 5,
  color: GOLD,
};

const dayText: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  fontSize: 176,
  color: '#FFFFFF',
  lineHeight: 1,
  marginTop: 6,
};

const monthText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 34,
  color: 'rgba(255,255,255,0.74)',
  marginTop: 8,
};

const body: React.CSSProperties = {
  width: SIZE.width - BLOCK_W,
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 64px',
};

const title: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  color: INK,
  lineHeight: 1.04,
  letterSpacing: -1.5,
};

const timeText: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 44,
  color: INK_SOFT,
  marginTop: 20,
};

const whereRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  marginTop: 12,
};

const pin: React.CSSProperties = {
  display: 'flex',
  width: 15,
  height: 15,
  borderRadius: 8,
  backgroundColor: GOLD,
  marginRight: 13,
};

const where: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 38,
  color: INK_SOFT,
};

const markBadge: React.CSSProperties = {
  width: 196,
  height: 184,
  borderRadius: 40,
  backgroundColor: '#FFFFFF',
  alignItems: 'center',
  justifyContent: 'center',
  display: 'flex',
};

const stack: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const signoffSmall: React.CSSProperties = {
  position: 'absolute',
  right: 46,
  bottom: 40,
  width: 104,
  height: 95,
};

const signoff: React.CSSProperties = {
  position: 'absolute',
  right: 54,
  bottom: 46,
  // The box has to be stated here too — on the attributes alone the
  // mark drew at its natural size and ran off the bottom corner.
  width: 118,
  height: 108,
};
