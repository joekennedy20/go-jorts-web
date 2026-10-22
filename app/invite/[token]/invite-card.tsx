/**
 * The card a Jorts invite becomes when it lands in a group text.
 *
 * The page's metadata has always said the right things — "Kemper's —
 * Thursday", "hosted by Joe — 8:30 PM · Kemper's — 3 going" — and with
 * no image beside them iMessage renders the lot as a grey row that
 * looks like every spam link anyone has ever been sent. The plan was
 * already in the thread; nobody could see it.
 *
 * So this is the payoff, drawn: the one thing the group is arguing
 * about, big enough to read without tapping, for five people who
 * installed nothing. And because a fresh card renders every time the
 * link is pasted, the thread keeps a running picture of the plan as it
 * moves.
 *
 * Kept apart from opengraph-image.tsx so it can be rendered from a
 * script with fixture data — a card you have only seen in your own
 * head is not a card you have checked.
 */
import type { PlanSummary } from './invite-data';
import { attendanceText, formatDay } from './invite-data';

/** Satori has no system fonts: without these loaded every `fontWeight`
 *  is silently ignored and the whole card renders at one weight — which
 *  is exactly how the first proof of this came out. The two faces ship
 *  with the invite page already. */
export const DISPLAY = 'Anton';
export const BODY = 'Poppins';

export const NAVY = '#0D1F2D';
export const GOLD = '#E8A020';
export const SIZE = { width: 1200, height: 630 };

/** "Thursday, October 22" → "Thursday" once a time sits beside it.
 *  The long form is for a page you are reading; a card is glanced at. */
function dayWord(day: string): string {
  return formatDay(day).split(',')[0] || formatDay(day);
}

export function inviteCard(plan: PlanSummary | null) {
  if (!plan) {
    // A token the API wouldn't resolve. Still a card, still obviously
    // Jorts — a broken preview in a group text is worse than a plain one.
    return (
      <div style={{ ...shell, justifyContent: 'center' }}>
        <div style={wordmark}>jorts</div>
        <div style={{ ...title, fontSize: 76 }}>{'You\u2019re invited'}</div>
        <div style={{ display: 'flex', marginTop: 40 }}>
          <div style={pill}>tap to see the plan</div>
        </div>
      </div>
    );
  }

  const name = plan.name?.trim() || 'The plan';
  const when = [dayWord(plan.day), plan.time?.trim()].filter(Boolean).join('  ·  ');
  const who = attendanceText(plan.confirmed_names ?? []);
  // Plans are very often named after the place — "Kemper's" at
  // Kemper's — and printing it twice reads as a bug in the card
  // rather than a fact about the night.
  const place = plan.location?.trim();
  const showPlace =
    place && place.toLowerCase() !== name.toLowerCase() ? place : null;

  return (
    <div style={shell}>
      <div style={wordmark}>jorts</div>

      <div
        style={{
          ...title,
          // The name is the headline and it is user-typed, so it has to
          // survive "dinner" and "Auburn homecoming tailgate thing".
          fontSize: name.length > 34 ? 68 : name.length > 20 ? 86 : 104,
        }}
      >
        {name}
      </div>

      <div style={when_}>{when}</div>

      {showPlace ? <div style={where}>{showPlace}</div> : null}

      <div style={{ display: 'flex', marginTop: 'auto' }}>
        <div style={pill}>{who ?? 'tap to say you\u2019re in'}</div>
      </div>
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
  alignItems: 'flex-start',
  backgroundColor: NAVY,
  padding: '64px 72px',
};

const wordmark: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  fontSize: 34,
  color: GOLD,
  letterSpacing: -1,
  marginBottom: 36,
};

const title: React.CSSProperties = {
  display: 'flex',
  fontFamily: DISPLAY,
  color: '#FFFFFF',
  lineHeight: 1.05,
  letterSpacing: -2,
  maxWidth: 1040,
};

const when_: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  marginTop: 28,
  fontSize: 44,
  color: GOLD,
};

const where: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  marginTop: 10,
  fontSize: 38,
  color: 'rgba(255,255,255,0.72)',
};

const pill: React.CSSProperties = {
  display: 'flex',
  fontFamily: BODY,
  alignItems: 'center',
  backgroundColor: 'rgba(232,160,32,0.16)',
  borderRadius: 999,
  padding: '14px 32px',
  fontSize: 30,
  color: GOLD,
};
