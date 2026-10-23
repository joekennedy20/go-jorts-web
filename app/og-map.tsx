/**
 * The map under a link preview — drawn, not fetched.
 *
 * This started as a real Google Static Map of the venue, which
 * needed the plan's coordinates on a public payload, an API enabled
 * on the billing account, a timeout, a cache and a failure path. It
 * answered the wrong question. The card is not trying to show you
 * where the bar is; the page one tap away does that, with a real
 * map. It is trying to say there is a map here with your friends on
 * it and you cannot see it from out there (Joe, 2026-10-23: "all we
 * are trying to do is hint at the fact that you can't see the map
 * if you don't have jorts").
 *
 * A picture of somebody's actual street says "here is a bar". Pins
 * with nobody named on them says "there are people on this, and you
 * are not looking at them yet". The second one is the product.
 *
 * So: plain divs. Satori renders them natively, which means no
 * asset to ship, no SVG support to gamble on, no network call that
 * can fail inside ImageResponse and take the whole card with it,
 * and nothing to pay. It is also themeable — the colours come from
 * the same two constants as everything else.
 *
 * Everything lives in the RIGHT half. The plan's name, time and
 * place occupy the left, and the card had a dead third on the end
 * of it; the cluster fills that instead of sitting under the words.
 */
import { GOLD, NAVY } from '@/app/og-fonts';

const W = 1200;
const H = 630;

/** Irregular on purpose. An even grid reads as graph paper. */
const AVENUES = [52, 178, 300, 468, 596, 724, 884, 1016, 1142];
const STREETS = [64, 158, 252, 348, 442, 548];

/** Blocks, a touch lighter than the ground they sit on. */
const BLOCKS = [
  { x: 596, y: 158, w: 128, h: 94 },
  { x: 884, y: 252, w: 132, h: 96 },
  { x: 724, y: 442, w: 160, h: 106 },
  { x: 1016, y: 64, w: 126, h: 94 },
];

/** The cluster. No names, no faces — the point is that you can't
 *  see who they are. The big one is the plan itself. */
const PINS = [
  { x: 836, y: 214, r: 11 },
  { x: 988, y: 162, r: 10 },
  { x: 1074, y: 302, r: 10 },
  { x: 790, y: 388, r: 10 },
];
const HERE = { x: 912, y: 318, r: 17 };

const INK = 'rgba(255,255,255,';

/** Empty on purpose — a preview that quoted real chat would be a
 *  leak, and a blank shape is the better tease anyway. */
const BUBBLES = [
  { x: 1004, y: 190, w: 94, h: 32, ink: '0.11' },
  { x: 846, y: 436, w: 68, h: 28, ink: '0.085' },
];

export function ogMap() {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: W,
        height: H,
        display: 'flex',
      }}
    >
      {AVENUES.map(x => (
        <div
          key={`a${x}`}
          style={{
            position: 'absolute',
            left: x,
            top: 0,
            width: 2,
            height: H,
            backgroundColor: `${INK}0.075)`,
          }}
        />
      ))}
      {STREETS.map(y => (
        <div
          key={`s${y}`}
          style={{
            position: 'absolute',
            left: 0,
            top: y,
            width: W,
            height: 2,
            backgroundColor: `${INK}0.075)`,
          }}
        />
      ))}
      {BLOCKS.map(b => (
        <div
          key={`b${b.x}-${b.y}`}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            backgroundColor: `${INK}0.03)`,
          }}
        />
      ))}

      {/* A faint route along the streets, from the far pin in to the
          plan. Two rectangles rather than a diagonal: people walk
          the blocks, and a straight line across them would read as a
          chart. */}
      <div
        style={{
          position: 'absolute',
          left: 790,
          top: 316,
          width: 124,
          height: 4,
          backgroundColor: 'rgba(232,160,32,0.16)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 788,
          top: 316,
          width: 4,
          height: 74,
          backgroundColor: 'rgba(232,160,32,0.16)',
          display: 'flex',
        }}
      />

      {PINS.map(p => (
        <div
          key={`p${p.x}`}
          style={{
            position: 'absolute',
            left: p.x - p.r,
            top: p.y - p.r,
            width: p.r * 2,
            height: p.r * 2,
            borderRadius: p.r,
            backgroundColor: 'rgba(232,160,32,0.74)',
            border: `3px solid ${NAVY}`,
            display: 'flex',
          }}
        />
      ))}

      {/* The plan's own pin, with the ring a live one carries. */}
      <div
        style={{
          position: 'absolute',
          left: HERE.x - HERE.r * 2.6,
          top: HERE.y - HERE.r * 2.6,
          width: HERE.r * 5.2,
          height: HERE.r * 5.2,
          borderRadius: HERE.r * 2.6,
          backgroundColor: 'rgba(232,160,32,0.10)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: HERE.x - HERE.r,
          top: HERE.y - HERE.r,
          width: HERE.r * 2,
          height: HERE.r * 2,
          borderRadius: HERE.r,
          backgroundColor: GOLD,
          border: `4px solid ${NAVY}`,
          display: 'flex',
        }}
      />

      {/* Two somebody-said-something bubbles. Empty, like the pins:
          a preview that quoted real chat would be a leak, and the
          blank shape is the more honest tease anyway. */}
      {BUBBLES.map(b => (
        <div
          key={`m${b.x}`}
          style={{ position: 'absolute', left: b.x, top: b.y, display: 'flex' }}
        >
          <div
            style={{
              width: b.w,
              height: b.h,
              borderRadius: b.h / 2,
              backgroundColor: `${INK}${b.ink})`,
              display: 'flex',
            }}
          />
          {/* The two descending dots that make a rounded rectangle
              read as something somebody said. */}
          <div
            style={{
              position: 'absolute',
              left: 6,
              top: b.h - 4,
              width: 10,
              height: 10,
              borderRadius: 5,
              backgroundColor: `${INK}${b.ink})`,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: 1,
              top: b.h + 5,
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: `${INK}${b.ink})`,
              display: 'flex',
            }}
          />
        </div>
      ))}
    </div>
  );
}
