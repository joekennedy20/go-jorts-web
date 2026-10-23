/**
 * The map across the top of a link preview — drawn, not fetched.
 *
 * It is NOT the venue. It is deliberately nowhere: a real map of
 * the actual street would put a city somebody doesn't recognise on
 * the card and read as a mistake (Joe, 2026-10-23: "fade the map -
 * it would be confusing to have a different city"). What it says
 * is that there is a map here with people on it and you cannot see
 * them from out there.
 *
 * Plain divs, which Satori renders natively — no asset to ship, no
 * SVG support to gamble on, no network call that can fail inside
 * ImageResponse and take the whole card with it, and nothing to pay
 * per render. It began as a real Google Static Map and that cost
 * coordinates on a public payload, an API on the billing account, a
 * key, a timeout, a cache and a failure path.
 *
 * Faded on purpose, and only ever a band at the top: the plan's own
 * words are the hero and this is the texture behind them.
 */
const W = 1200;

/** Pale, warm, and low contrast — a map you register rather than read. */
const GROUND = '#E5E8E2';
const ROAD = '#FFFFFF';
const BLOCK = '#F1F2EE';
const BLOCK_ALT = '#ECEEE9';
const PARK = '#DBE7D4';
const WATER = '#D2E1EE';

/** Irregular on purpose, and several of them stop. An even grid of
 *  full-width lines reads as a spreadsheet, which is exactly what
 *  the first version of this looked like. */
const AVENUES = [
  { x: 86, y: 0, h: 1 },
  { x: 203, y: 0, h: 0.62 },
  { x: 331, y: 0, h: 1 },
  { x: 418, y: 0.38, h: 0.62 },
  { x: 520, y: 0, h: 1 },
  { x: 648, y: 0, h: 0.46 },
  { x: 735, y: 0, h: 1 },
  { x: 869, y: 0.3, h: 0.7 },
  { x: 958, y: 0, h: 1 },
  { x: 1086, y: 0, h: 0.54 },
];
const STREETS = [
  { y: 58, x: 0, w: 1 },
  { y: 141, x: 0.17, w: 0.83 },
  { y: 214, x: 0, w: 1 },
  { y: 262, x: 0, w: 0.58 },
];

/** Blocks, in a handful of sizes. Same size everywhere is the other
 *  half of what made it look like a table. */
const BLOCKS = [
  { x: 203, y: 58, w: 128, h: 83, t: 0 },
  { x: 520, y: 141, w: 128, h: 73, t: 1 },
  { x: 735, y: 58, w: 134, h: 83, t: 0 },
  { x: 331, y: 214, w: 189, h: 48, t: 1 },
  { x: 958, y: 141, w: 128, h: 73, t: 0 },
  { x: 86, y: 141, w: 117, h: 73, t: 1 },
];

/** A park, as a few overlapping rectangles rather than one stripe —
 *  a full-height band of green is a column, not a park. */
const GREEN = [
  { x: 0, y: 0, w: 203, h: 58 },
  { x: 0, y: 58, w: 86, h: 83 },
  { x: 86, y: 0, w: 117, h: 141 },
  { x: 331, y: 0, w: 87, h: 58 },
];

/** Water, stepped, for the same reason. */
const BLUE = [
  { x: 1086, y: 0, w: 114, h: 141 },
  { x: 1004, y: 141, w: 196, h: 73 },
  { x: 1086, y: 214, w: 114, h: 74 },
];

/** The places a night moves between. No labels and no names — the
 *  point is that you can't read them from out here. */
const PLACES = [
  { x: 430, y: 152, c: '#F08A3C', halo: 'rgba(240,138,60,0.26)', r: 25 },
  { x: 742, y: 100, c: '#8B5CF6', halo: 'rgba(139,92,246,0.24)', r: 23 },
  { x: 946, y: 196, c: '#39434D', halo: 'rgba(57,67,77,0.18)', r: 21 },
];
/** You, where the blue dot always is. */
const HERE = { x: 600, y: 186, c: '#2E7DF6' };

export function ogMap(height: number) {
  const vh = (f: number) => Math.round(height * f);
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: W,
        height,
        display: 'flex',
        backgroundColor: GROUND,
      }}
    >
      {GREEN.map(g => (
        <div
          key={`g${g.x}-${g.y}`}
          style={{
            position: 'absolute',
            left: g.x,
            top: g.y,
            width: g.w,
            height: g.h,
            backgroundColor: PARK,
            display: 'flex',
          }}
        />
      ))}
      {BLUE.map(b => (
        <div
          key={`w${b.x}-${b.y}`}
          style={{
            position: 'absolute',
            left: b.x,
            top: b.y,
            width: b.w,
            height: b.h,
            backgroundColor: WATER,
            display: 'flex',
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
            backgroundColor: b.t ? BLOCK : BLOCK_ALT,
            display: 'flex',
          }}
        />
      ))}
      {AVENUES.map(a => (
        <div
          key={`a${a.x}`}
          style={{
            position: 'absolute',
            left: a.x,
            top: vh(a.y),
            width: 5,
            height: vh(a.h),
            backgroundColor: ROAD,
            display: 'flex',
          }}
        />
      ))}
      {STREETS.map(st => (
        <div
          key={`s${st.y}`}
          style={{
            position: 'absolute',
            left: Math.round(W * st.x),
            top: st.y,
            width: Math.round(W * st.w),
            height: 5,
            backgroundColor: ROAD,
            display: 'flex',
          }}
        />
      ))}

      {/* The fade sits HERE, under the pins and over everything else:
          the streets are texture and go back, the places are the
          point and stay crisp. */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: 0,
          width: W,
          height,
          backgroundColor: 'rgba(246,244,239,0.30)',
          display: 'flex',
        }}
      />

      {PLACES.map(p => (
        <div
          key={`p${p.x}`}
          style={{ position: 'absolute', left: 0, top: 0, display: 'flex' }}
        >
          <div
            style={{
              position: 'absolute',
              left: p.x - p.r * 2,
              top: p.y - p.r * 2,
              width: p.r * 4,
              height: p.r * 4,
              borderRadius: p.r * 2,
              backgroundColor: p.halo,
              display: 'flex',
            }}
          />
          <div
            style={{
              position: 'absolute',
              left: p.x - p.r,
              top: p.y - p.r,
              width: p.r * 2,
              height: p.r * 2,
              borderRadius: p.r,
              backgroundColor: p.c,
              display: 'flex',
            }}
          />
        </div>
      ))}

      <div
        style={{
          position: 'absolute',
          left: HERE.x - 44,
          top: HERE.y - 44,
          width: 88,
          height: 88,
          borderRadius: 44,
          backgroundColor: 'rgba(46,125,246,0.18)',
          display: 'flex',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: HERE.x - 14,
          top: HERE.y - 14,
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: HERE.c,
          border: '5px solid #FFFFFF',
          display: 'flex',
        }}
      />
    </div>
  );
}
