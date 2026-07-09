import type { Metadata } from 'next';
import {
  Playfair_Display,
  DM_Serif_Display,
  Dancing_Script,
  Caveat,
  Archivo,
  Oswald,
} from 'next/font/google';

import { RSVPCard } from './rsvp-card';
import { GroupRSVPCard } from './group-rsvp-card';
import {
  resolveToken,
  getContactInvite,
  formatDay,
  getPlanSummary,
  attendanceText,
  type PlanSummary,
  type PlanGuest,
} from './invite-data';

const APP_STORE_ID = '6759267210';

// Real editorial faces — the single biggest "magazine vs template"
// difference. System-font fallbacks (Georgia / Snell Roundhand) were
// exactly what made the old page read cheap.
const playfair = Playfair_Display({ subsets: ['latin'], weight: ['500', '600'], style: ['normal', 'italic'] });
const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400', style: ['normal', 'italic'] });
const dancing = Dancing_Script({ subsets: ['latin'], weight: ['500', '600'] });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '600'] });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700', '800'] });
const oswald = Oswald({ subsets: ['latin'], weight: ['500', '600'] });

// Open Graph / Twitter metadata so a texted invite link unfurls into a
// compact strip — the plan's name + day as the title, details in the
// description — instead of a bare URL. No og:image on purpose: the
// invite *card* (shared as an image) is the visual, so a big link card
// here would just duplicate it. Also includes the Smart App Banner tag
// so iPhone Safari offers "Open in Jorts" when the app is installed.
export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const plan = await getPlanSummary(params.token);

  const title = plan
    ? `${plan.name} — ${formatDay(plan.day)}`
    : "You're invited — Jorts";
  const detail = plan
    ? [plan.time, plan.location].filter(Boolean).join(' · ')
    : null;
  const hosted = plan?.host?.name ? `hosted by ${plan.host.name}` : null;
  const attendance = plan ? attendanceText(plan.confirmed_names) : null;
  const description =
    [hosted, detail, attendance].filter(Boolean).join(' — ') || 'Tap to RSVP.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=${params.token}`,
    },
  };
}

// ── The host-card page (July 2026 redesign) ──────────────────────
//
// Full-bleed themed scene with a smaller, centered, frosted card
// floating over it. The host's face bridges the card's top edge —
// the page reads as "Joe is inviting you", not "fill out this form".
// Stage 1 ships a themed gradient scene; Stage 2 replaces it with
// the host's own photo collage.

// ── Skins — one per composer style key ───────────────────────────
//
// The host picks a card design in the app's composer; the page skins
// itself to match (scene, card tint, accent, title face). All dark
// variants so the shared text palette stays white. Unknown/missing
// style falls back to the default night skin. `?style=` on the URL
// overrides — handy for previews, harmless in prod (visual only).

interface Skin {
  /** Card + type palette direction. Light cards get dark ink text. */
  mode: 'light' | 'dark';
  /** Wash behind the collage / fallback scene. */
  scene: string;
  /** SOLID card color — cream, ink, lilac. No frosted translucency:
   *  the mock's cards read as printed stock, not glass. */
  card: string;
  ink: string;
  sub: string;
  hair: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  ghost: string;
  titleFont: string;
  titleClass?: string;
  /** Handwritten note-card line in the collage. */
  quote: string;
}

const DEFAULT_SKIN: Skin = {
  mode: 'dark',
  scene:
    'radial-gradient(120% 55% at 50% 0%, rgba(232,160,32,0.16), transparent 55%),' +
    'linear-gradient(180deg, #1b2530 0%, #12191f 55%, #0b1015 100%)',
  card: '#181B20',
  ink: '#F3EFE7',
  sub: '#989184',
  hair: 'rgba(255,255,255,0.12)',
  accent: '#E1A33C',
  accentSoft: 'rgba(225,163,60,0.18)',
  onAccent: '#1C1710',
  ghost: 'rgba(255,255,255,0.22)',
  titleFont: playfair.style.fontFamily,
  quote: 'see you there \u2726',
};

const LIGHT_BASE = {
  mode: 'light' as const,
  ink: '#221E18',
  sub: '#7A7367',
  hair: 'rgba(34,30,24,0.12)',
  ghost: 'rgba(34,30,24,0.25)',
  onAccent: '#FFFDF7',
};
const DARK_BASE = {
  mode: 'dark' as const,
  ink: '#F3EFE7',
  sub: '#98918A',
  hair: 'rgba(255,255,255,0.12)',
  ghost: 'rgba(255,255,255,0.22)',
  onAccent: '#FFFDF7',
};

const SKINS: Record<string, Skin> = {
  cocktail: {
    ...DARK_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(225,163,60,0.2), transparent 55%),' +
      'linear-gradient(180deg, #241a14 0%, #16100c 60%, #0d0908 100%)',
    card: '#16130F',
    accent: '#E1A33C',
    accentSoft: 'rgba(225,163,60,0.16)',
    onAccent: '#1C1710',
    titleFont: playfair.style.fontFamily,
    titleClass: 'italic',
    quote: 'good people, good drinks \u2726',
  },
  poolside: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(120% 55% at 50% 0%, rgba(79,201,214,0.25), transparent 55%),' +
      'linear-gradient(180deg, #cfe9ec 0%, #b7d8de 55%, #9dc4cd 100%)',
    card: '#F4F0E6',
    accent: '#1F97A6',
    accentSoft: 'rgba(31,151,166,0.14)',
    titleFont: playfair.style.fontFamily,
    quote: 'salt air + good company',
  },
  boatday: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(120% 55% at 50% 0%, rgba(120,180,235,0.3), transparent 55%),' +
      'linear-gradient(180deg, #d4e4f2 0%, #b9d0e6 55%, #9cbbd8 100%)',
    card: '#F4F0E6',
    accent: '#33689E',
    accentSoft: 'rgba(51,104,158,0.14)',
    titleFont: playfair.style.fontFamily,
    quote: 'meet you on the water',
  },
  houseparty: {
    ...DARK_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(255,122,69,0.2), transparent 55%),' +
      'linear-gradient(180deg, #241318 0%, #150b10 60%, #0d070b 100%)',
    card: '#17131A',
    accent: '#FF7A45',
    accentSoft: 'rgba(255,122,69,0.16)',
    onAccent: '#221008',
    titleFont: archivo.style.fontFamily,
    titleClass: 'font-black uppercase tracking-wide',
    quote: 'good music, late nights',
  },
  girldinner: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(214,150,110,0.28), transparent 55%),' +
      'linear-gradient(180deg, #e8d9c8 0%, #dcc8b2 55%, #c9b098 100%)',
    card: '#F5EFE3',
    accent: '#A4552F',
    accentSoft: 'rgba(164,85,47,0.12)',
    titleFont: dancing.style.fontFamily,
    quote: "can't wait for this one \u2728",
  },
  wewantbeer: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(217,164,65,0.28), transparent 55%),' +
      'linear-gradient(180deg, #e4d6bc 0%, #d4c2a2 55%, #bfa989 100%)',
    card: '#F3ECDD',
    accent: '#8A6420',
    accentSoft: 'rgba(138,100,32,0.12)',
    titleFont: archivo.style.fontFamily,
    titleClass: 'font-black uppercase tracking-wide',
    quote: "first round's on us",
  },
  bookclub: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(201,180,88,0.22), transparent 55%),' +
      'linear-gradient(180deg, #dfd9c6 0%, #cdc5ad 55%, #b3aa8f 100%)',
    card: '#F4EFE3',
    accent: '#26221B',
    accentSoft: 'rgba(38,34,27,0.08)',
    titleFont: playfair.style.fontFamily,
    quote: 'good times \u2726',
  },
  runclub: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 55% at 50% 0%, rgba(236,154,118,0.3), transparent 55%),' +
      'linear-gradient(180deg, #ecd8c8 0%, #dfc0ab 55%, #c8a68e 100%)',
    card: '#F6F0E5',
    accent: '#C96A3B',
    accentSoft: 'rgba(201,106,59,0.13)',
    titleFont: playfair.style.fontFamily,
    quote: 'early miles, better days',
  },
  dinnerparty: {
    ...DARK_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(224,149,95,0.18), transparent 55%),' +
      'linear-gradient(180deg, #1c1410 0%, #120d0a 60%, #0b0807 100%)',
    card: '#15120E',
    accent: '#7B8B5A',
    accentSoft: 'rgba(123,139,90,0.16)',
    // DM Serif italic — matches the app's dinner party card (Joe
    // vetoed cursive there; the page follows the card).
    titleFont: dmSerif.style.fontFamily,
    titleClass: 'italic',
    quote: 'good people\ngood wine\ngood night',
  },
  balloonparty: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(180,150,220,0.3), transparent 55%),' +
      'linear-gradient(180deg, #ddd2ec 0%, #c9bade 55%, #b09cc9 100%)',
    card: '#F0EBF6',
    accent: '#6D55A8',
    accentSoft: 'rgba(109,85,168,0.12)',
    titleFont: playfair.style.fontFamily,
    quote: 'girls just wanna have fun \u2661',
  },
  tailgate: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(214,167,63,0.3), transparent 55%),' +
      'linear-gradient(180deg, #e0d2b4 0%, #cbb890 55%, #b09d74 100%)',
    card: '#F3ECDA',
    accent: '#A87A1F',
    accentSoft: 'rgba(168,122,31,0.13)',
    titleFont: oswald.style.fontFamily,
    titleClass: 'uppercase tracking-wide font-semibold',
    quote: 'game day \u2726',
  },
  dogpark: {
    ...LIGHT_BASE,
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(201,162,59,0.26), transparent 55%),' +
      'linear-gradient(180deg, #d9d6c4 0%, #c2c0a8 55%, #a5a488 100%)',
    card: '#F4F0E3',
    accent: '#96762A',
    accentSoft: 'rgba(150,118,42,0.13)',
    titleFont: oswald.style.fontFamily,
    titleClass: 'uppercase tracking-wide font-semibold',
    quote: 'bring the ball \u2726',
  },
};

function skinFor(style: string | null | undefined): Skin {
  return (style && SKINS[style]) || DEFAULT_SKIN;
}

const INITIAL_COLORS = [
  '#7a5fb0', '#4f8fb0', '#b0645f', '#5fb07a', '#b0975f', '#5f74b0',
];

function initialColor(name: string): string {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) | 0;
  return INITIAL_COLORS[Math.abs(h) % INITIAL_COLORS.length];
}

function GuestAvatar({ guest, size }: { guest: PlanGuest; size: number }) {
  const cls = 'rounded-full object-cover flex-none';
  const ring = { boxShadow: '0 0 0 2px var(--card, #14222b)' };
  if (guest.picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={guest.picture}
        alt={guest.name}
        width={size}
        height={size}
        className={cls}
        style={{ width: size, height: size, ...ring }}
      />
    );
  }
  return (
    <span
      className={`${cls} flex items-center justify-center text-white font-bold`}
      style={{
        width: size,
        height: size,
        backgroundColor: initialColor(guest.name),
        fontSize: size * 0.42,
        ...ring,
      }}
    >
      {guest.name.charAt(0).toUpperCase()}
    </span>
  );
}

// ── Polaroid collage backdrop ─────────────────────────────────────
//
// The scrapbook look from the approved mock: the host's photos in
// white polaroid frames, scattered at fixed tilts around the screen,
// some peeking out from behind the frosted card. Slots are static
// (hand-tuned to look right at phone width) and photos fill them
// round-robin, so 2 photos still dress the whole page. Deliberately
// no randomness — the page renders identically on every visit.

const COLLAGE_SLOTS: Array<{
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  width: string;
  ratio: number;
  rot: number;
  tape?: boolean;
  // 'print' = borderless photo print; default is a polaroid frame
  kind?: 'print';
  // gentle idle sway — period (s) and delay (s), staggered per slot
  sway: [number, number];
  z: number;
}> = [
  { top: '-2%', left: '-8%', width: 'min(46vw, 300px)', ratio: 1.15, rot: -8, sway: [7, 0], z: 1 },
  { top: '-3%', right: '-7%', width: 'min(42vw, 270px)', ratio: 1.1, rot: 7, tape: true, sway: [9, 1.2], z: 2 },
  { top: '10%', left: '26%', width: 'min(40vw, 260px)', ratio: 0.85, rot: -2, kind: 'print', sway: [8, 0.6], z: 0 },
  { top: '30%', right: '-10%', width: 'min(38vw, 240px)', ratio: 1.2, rot: 10, kind: 'print', sway: [10, 2], z: 0 },
  { bottom: '-4%', left: '-7%', width: 'min(44vw, 285px)', ratio: 1.05, rot: 6, tape: true, sway: [8.5, 1.6], z: 2 },
  { bottom: '-3%', right: '-6%', width: 'min(42vw, 275px)', ratio: 0.9, rot: -6, sway: [7.5, 0.9], z: 1 },
];

// Film-grain overlay — SVG turbulence noise, tiled. Kills the "flat
// digital gradient" read without weighing the page down.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

function Collage({ photos, day, quote }: { photos: string[]; day: string; quote: string }) {
  return (
    <div className="absolute inset-0">
      {COLLAGE_SLOTS.map((slot, i) => {
        const src = photos[i % photos.length];
        const isPrint = slot.kind === 'print';
        return (
          <div
            key={i}
            className={
              isPrint
                ? 'collage-sway absolute rounded-[2px] shadow-[0_10px_28px_rgba(0,0,0,0.55)]'
                : 'collage-sway absolute rounded-[2px] bg-[#faf7f0] shadow-[0_10px_28px_rgba(0,0,0,0.55)]'
            }
            style={{
              top: slot.top,
              bottom: slot.bottom,
              left: slot.left,
              right: slot.right,
              width: slot.width,
              zIndex: slot.z,
              padding: isPrint ? 0 : '2.4% 2.4% 8%',
              transform: `rotate(${slot.rot}deg)`,
              animationDuration: `${slot.sway[0]}s`,
              animationDelay: `${slot.sway[1]}s`,
            }}
          >
            {slot.tape && (
              <div className="absolute -top-2 left-5 h-4 w-14 -rotate-[38deg] bg-[#fff8dc]/45 shadow-sm" />
            )}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt=""
              className="block w-full object-cover"
              style={{
                aspectRatio: String(1 / slot.ratio),
                // gentle film wash for cohesion across mismatched shots
                filter: 'saturate(0.92) contrast(1.04) brightness(0.98) sepia(0.08)',
              }}
            />
          </div>
        );
      })}
      {/* Handwritten note card — the scrapbook's connective tissue.
          Skin quote in a real handwriting face, date beneath. */}
      <div
        className="collage-sway absolute bottom-[6%] left-[7%] z-[3] -rotate-[5deg] rounded-[3px] bg-[#f8f2e4] px-4 py-2.5 shadow-[0_8px_20px_rgba(0,0,0,0.35)]"
        style={{
          fontFamily: caveat.style.fontFamily,
          animationDuration: '9s',
          animationDelay: '0.4s',
        }}
      >
        <span className="block whitespace-pre-line text-[19px] font-semibold leading-[1.15] text-[#4a3d2c]">
          {quote}
        </span>
        <span className="mt-0.5 block text-[13px] font-medium text-[#8a7a5f]">
          {formatDay(day)}
        </span>
      </div>
      <style>{`
        @keyframes collage-sway {
          from { translate: 0 0; }
          to { translate: 0 7px; }
        }
        .collage-sway {
          animation: collage-sway 8s ease-in-out infinite alternate;
        }
        @media (prefers-reduced-motion: reduce) {
          .collage-sway { animation: none; }
        }
      `}</style>
    </div>
  );
}

function Scene({
  skin,
  photo,
  photos,
  day,
  children,
}: {
  skin: Skin;
  photo?: string | null;
  photos?: string[];
  day: string;
  children: React.ReactNode;
}) {
  const collage = (photos ?? []).slice(0, 4);
  return (
    <main
      className="relative min-h-screen overflow-hidden"
      style={{ backgroundColor: skin.mode === 'light' ? '#B9AE96' : '#0a141b' }}
    >
      {collage.length >= 2 ? (
        <>
          {/* Themed ground with a woven-texture read under the polaroids */}
          <div className="absolute inset-0" style={{ background: skin.scene }} />
          <div
            className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
          <Collage photos={collage} day={day} quote={skin.quote} />
          <div
            className="absolute inset-0 z-[4]"
            style={{
              background:
                skin.mode === 'light'
                  ? // Light skins: bright collage, a whisper of vignette
                    'radial-gradient(120% 90% at 50% 40%, transparent 60%, rgba(40,33,22,0.28) 100%)'
                  : 'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(6,12,17,0.5) 100%),' +
                    'linear-gradient(180deg, rgba(6,12,17,0.12) 0%, rgba(6,12,17,0.38) 55%, rgba(6,12,17,0.66) 100%)',
            }}
          />
          <div
            className="absolute inset-0 z-[4] opacity-[0.1]"
            style={{ backgroundImage: GRAIN }}
          />
        </>
      ) : photo || collage[0] ? (
        <>
          {/* The host's own photo, full-bleed. The scrim + skin tint
              keep the frosted card readable on any shot. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={(photo ?? collage[0]) as string}
            alt=""
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(6,12,17,0.25) 0%, rgba(6,12,17,0.55) 55%, rgba(6,12,17,0.8) 100%)',
            }}
          />
          <div
            className="absolute inset-0 opacity-40"
            style={{ background: skin.scene }}
          />
        </>
      ) : (
        <div className="absolute inset-0" style={{ background: skin.scene }} />
      )}
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        {children}
      </div>
    </main>
  );
}

function HostCard({
  plan,
  skin,
  children,
}: {
  plan: PlanSummary;
  skin: Skin;
  children: React.ReactNode;
}) {
  const host = plan.host ?? null;
  const guests = plan.guests ?? [];
  const shown = guests.slice(0, 5);
  const overflow = guests.length - shown.length;
  const invited = plan.invited_count ?? 0;

  return (
    <div
      className="relative w-full max-w-[380px] rounded-[28px] px-6 pb-5 pt-14 shadow-[0_28px_70px_rgba(0,0,0,0.45),0_4px_14px_rgba(0,0,0,0.28)]"
      style={{
        backgroundColor: skin.card,
        fontFamily: archivo.style.fontFamily,
        ['--accent' as string]: skin.accent,
        ['--accent-soft' as string]: skin.accentSoft,
        ['--on-accent' as string]: skin.onAccent,
        ['--ink' as string]: skin.ink,
        ['--sub' as string]: skin.sub,
        ['--hair' as string]: skin.hair,
        ['--ghost' as string]: skin.ghost,
        ['--card' as string]: skin.card,
      }}
    >
      {/* Host face bridging the card's top edge */}
      <div className="absolute -top-10 left-1/2 -translate-x-1/2">
        {host?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={host.picture}
            alt={host.name}
            className="h-[80px] w-[80px] rounded-full border-4 object-cover shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
            style={{ borderColor: skin.card }}
          />
        ) : (
          <span
            className="flex h-[80px] w-[80px] items-center justify-center rounded-full border-4 text-[30px] font-bold text-white shadow-[0_10px_26px_rgba(0,0,0,0.35)]"
            style={{ backgroundColor: initialColor(host?.name ?? 'J'), borderColor: skin.card }}
          >
            {(host?.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <p
        className="text-center text-[11px] font-bold uppercase tracking-[0.26em]"
        style={{ color: 'var(--sub)' }}
      >
        {host?.name ? `${host.name}\u2019s plan` : 'You\u2019re invited'}
      </p>
      <h1
        className={`mt-2 text-center text-[36px] font-medium leading-[1.12] ${skin.titleClass ?? ''}`}
        style={{ fontFamily: skin.titleFont, color: 'var(--ink)' }}
      >
        {plan.name}
      </h1>

      <div className="mt-5 flex items-center gap-2.5 text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={skin.accent} strokeWidth="2" strokeLinecap="round" className="flex-none">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {formatDay(plan.day)}
        {plan.time ? ` · ${plan.time}` : ''}
      </div>
      {plan.location && (
        <div className="mt-2.5 flex items-center gap-2.5 text-[14px] font-semibold" style={{ color: 'var(--ink)' }}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={skin.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {plan.location}
        </div>
      )}

      {/* The RSVP flow (idle / confirmed / name entry) renders here */}
      {children}

      {(shown.length > 0 || invited > 0) && (
        <>
          <div className="mt-5 h-px" style={{ backgroundColor: 'var(--hair)' }} />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.22em]" style={{ color: 'var(--sub)' }}>
            {host?.name ? `Invited by ${host.name}` : 'The group'}
          </p>
          <div className="mt-2.5 flex items-center">
            <div className="flex items-center -space-x-2">
              {shown.map((g, i) => (
                <GuestAvatar key={`${g.name}-${i}`} guest={g} size={30} />
              ))}
              {overflow > 0 && (
                <span
                  className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--ink)', boxShadow: '0 0 0 2px var(--card)' }}
                >
                  +{overflow}
                </span>
              )}
            </div>
            {invited > 0 && (
              <div className="ml-auto text-right leading-none">
                <span className="block text-[26px] font-extrabold" style={{ color: 'var(--ink)' }}>
                  {invited}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.2em]" style={{ color: 'var(--sub)' }}>
                  invited
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-5 flex items-center border-t pt-4" style={{ borderColor: 'var(--hair)' }}>
        <span
          className="text-[17px] font-extrabold tracking-tight"
          style={{ color: skin.mode === 'light' ? 'var(--ink)' : 'var(--accent)' }}
        >
          jorts
        </span>
        <a
          href={`https://apps.apple.com/app/id${APP_STORE_ID}`}
          className="ml-auto text-[11px] font-bold"
          style={{ color: 'var(--sub)' }}
        >
          Get the app &rarr;
        </a>
      </div>
    </div>
  );
}

// ── Card-hero mode ────────────────────────────────────────────────
//
// When the host designed an invite card in the composer, its captured
// poster IS the page design — show it as the hero and attach a compact
// RSVP panel beneath it instead of repeating the title/date in text.
function CardHero({
  plan,
  skin,
  children,
}: {
  plan: PlanSummary;
  skin: Skin;
  children: React.ReactNode;
}) {
  const host = plan.host ?? null;
  const guests = plan.guests ?? [];
  const shown = guests.slice(0, 5);
  const overflow = guests.length - shown.length;
  const invited = plan.invited_count ?? 0;

  return (
    <div className="w-full max-w-[330px]">
      {/* One taped-in object: the poster with the RSVP panel frosted
          over its lower portion — compact, so the host's collage owns
          the rest of the screen. */}
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plan.card as string}
          alt={plan.name}
          className="w-full rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        />
        {/* Slim RSVP tab right below the poster — never covers the
            card's own details, inset narrower so it reads as attached
            hardware rather than a second card. */}
        <div
          className="relative mx-3 -mt-1 rounded-b-xl rounded-t-md border border-white/10 px-3.5 pb-3 pt-2.5 shadow-[0_14px_36px_rgba(0,0,0,0.5)] backdrop-blur-xl"
          style={{
            backgroundColor: skin.card,
            fontFamily: archivo.style.fontFamily,
            ['--accent' as string]: skin.accent,
            ['--accent-soft' as string]: skin.accentSoft,
            ['--on-accent' as string]: skin.onAccent,
            ['--ink' as string]: skin.ink,
            ['--sub' as string]: skin.sub,
            ['--hair' as string]: skin.hair,
            ['--ghost' as string]: skin.ghost,
            ['--card' as string]: skin.card,
          }}
        >
          {children}
          <div className="mt-3 flex items-center border-t border-white/10 pt-2.5">
            {shown.length > 0 && (
              <div className="flex items-center -space-x-2">
                {shown.map((g, i) => (
                  <GuestAvatar key={`${g.name}-${i}`} guest={g} size={26} />
                ))}
                {overflow > 0 && (
                  <span
                    className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full text-[10px] font-bold"
                    style={{ backgroundColor: 'var(--accent-soft)', color: 'var(--ink)', boxShadow: '0 0 0 2px var(--card)' }}
                  >
                    +{overflow}
                  </span>
                )}
              </div>
            )}
            {invited > 0 && (
              <span className="ml-2 text-[10px] font-bold uppercase tracking-[0.14em] text-[#9fb2c0]">
                {invited} invited
              </span>
            )}
            <a
              href={`https://apps.apple.com/app/id${APP_STORE_ID}`}
              className="ml-auto text-[13px] font-extrabold tracking-tight"
              style={{ color: skin.accent }}
            >
              jorts &rarr;
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function InvalidInvite() {
  return (
    <Scene skin={DEFAULT_SKIN} day="">
      <div className="flex flex-col items-center">
        <p className="text-center text-lg text-white/60">
          This invite link is invalid or expired.
        </p>
        <a
          href={`https://apps.apple.com/app/id${APP_STORE_ID}`}
          className="mt-8 text-base font-bold text-gold"
        >
          Get Jorts &rarr;
        </a>
      </div>
    </Scene>
  );
}

export default async function InvitePage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: { style?: string };
}) {
  const resolved = await resolveToken(params.token);

  if (!resolved) {
    return <InvalidInvite />;
  }
  const styleOverride = searchParams?.style;

  // Contact invite — fetch full invite data with contact name + rsvp status
  if (resolved.type === 'contact') {
    const invite = await getContactInvite(params.token);
    if (!invite) {
      return <InvalidInvite />;
    }

    const skin = skinFor(styleOverride ?? invite.plan.style);
    if (invite.plan.card) {
      return (
        <Scene skin={skin} photo={invite.plan.photo} photos={invite.plan.photos} day={invite.plan.day}>
          <CardHero plan={invite.plan} skin={skin}>
            <RSVPCard
              token={params.token}
              contactName={invite.contact_name}
              initialStatus={invite.rsvp_status}
              planName={invite.plan.name}
              planDay={invite.plan.day}
              planTime={invite.plan.time}
              planLocation={invite.plan.location}
              compact
            />
          </CardHero>
        </Scene>
      );
    }
    return (
      <Scene skin={skin} photo={invite.plan.photo} photos={invite.plan.photos} day={invite.plan.day}>
        <HostCard plan={invite.plan} skin={skin}>
          <RSVPCard
            token={params.token}
            contactName={invite.contact_name}
            initialStatus={invite.rsvp_status}
            planName={invite.plan.name}
            planDay={invite.plan.day}
            planTime={invite.plan.time}
            planLocation={invite.plan.location}
          />
        </HostCard>
      </Scene>
    );
  }

  // Group invite — show name entry + RSVP
  if (resolved.type === 'group' && resolved.plan) {
    const skin = skinFor(styleOverride ?? resolved.plan.style);
    if (resolved.plan.card) {
      return (
        <Scene skin={skin} photo={resolved.plan.photo} photos={resolved.plan.photos} day={resolved.plan.day}>
          <CardHero plan={resolved.plan} skin={skin}>
            <GroupRSVPCard
              token={params.token}
              planName={resolved.plan.name}
              planDay={resolved.plan.day}
              planTime={resolved.plan.time}
              planLocation={resolved.plan.location}
              compact
            />
          </CardHero>
        </Scene>
      );
    }
    return (
      <Scene skin={skin} photo={resolved.plan.photo} photos={resolved.plan.photos} day={resolved.plan.day}>
        <HostCard plan={resolved.plan} skin={skin}>
          <GroupRSVPCard
            token={params.token}
            planName={resolved.plan.name}
            planDay={resolved.plan.day}
            planTime={resolved.plan.time}
            planLocation={resolved.plan.location}
          />
        </HostCard>
      </Scene>
    );
  }

  return null;
}
