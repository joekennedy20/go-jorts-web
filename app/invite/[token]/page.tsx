import type { Metadata } from 'next';

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
  scene: string;
  cardBg: string;
  accent: string;
  accentSoft: string;
  titleFont: string;
  titleClass?: string;
}

const SERIF = "Georgia, 'Times New Roman', serif";
const SCRIPT = "'Snell Roundhand', 'Bradley Hand', 'Segoe Script', cursive";
const CONDENSED = "'Arial Narrow', 'Helvetica Neue', sans-serif";

const DEFAULT_SKIN: Skin = {
  scene:
    'radial-gradient(120% 55% at 50% 0%, rgba(232,160,32,0.16), transparent 55%),' +
    'radial-gradient(90% 40% at 15% 100%, rgba(26,58,92,0.55), transparent 60%),' +
    'linear-gradient(180deg, #1b3441 0%, #101d26 55%, #0a141b 100%)',
  cardBg: 'rgba(20, 34, 43, 0.8)',
  accent: '#E8A020',
  accentSoft: 'rgba(232,160,32,0.2)',
  titleFont: SERIF,
};

const SKINS: Record<string, Skin> = {
  cocktail: {
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(232,160,32,0.22), transparent 55%),' +
      'radial-gradient(70% 40% at 85% 90%, rgba(120,50,90,0.35), transparent 65%),' +
      'linear-gradient(180deg, #241521 0%, #150d14 60%, #0c070c 100%)',
    cardBg: 'rgba(30, 19, 29, 0.8)',
    accent: '#E8A020',
    accentSoft: 'rgba(232,160,32,0.2)',
    titleFont: SERIF,
    titleClass: 'italic',
  },
  poolside: {
    scene:
      'radial-gradient(120% 55% at 50% 0%, rgba(80,200,215,0.2), transparent 55%),' +
      'radial-gradient(80% 45% at 10% 100%, rgba(20,110,130,0.45), transparent 60%),' +
      'linear-gradient(180deg, #0e3742 0%, #0a2731 55%, #06171e 100%)',
    cardBg: 'rgba(13, 42, 51, 0.8)',
    accent: '#4FC9D6',
    accentSoft: 'rgba(79,201,214,0.2)',
    titleFont: SERIF,
  },
  houseparty: {
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(255,122,69,0.2), transparent 55%),' +
      'radial-gradient(70% 45% at 90% 95%, rgba(170,50,120,0.35), transparent 65%),' +
      'linear-gradient(180deg, #29141f 0%, #180c14 60%, #0e070c 100%)',
    cardBg: 'rgba(36, 21, 33, 0.8)',
    accent: '#FF7A45',
    accentSoft: 'rgba(255,122,69,0.2)',
    titleFont: CONDENSED,
    titleClass: 'font-black uppercase tracking-wide',
  },
  boatday: {
    scene:
      'radial-gradient(120% 55% at 50% 0%, rgba(120,180,235,0.22), transparent 55%),' +
      'radial-gradient(90% 40% at 15% 100%, rgba(30,80,140,0.5), transparent 60%),' +
      'linear-gradient(180deg, #143least 0%, #0f2438 55%, #081420 100%)'.replace('#143least', '#1a3a5c'),
    cardBg: 'rgba(15, 36, 56, 0.8)',
    accent: '#5AA9E6',
    accentSoft: 'rgba(90,169,230,0.2)',
    titleFont: SERIF,
  },
  girldinner: {
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(240,180,140,0.18), transparent 55%),' +
      'radial-gradient(75% 45% at 85% 95%, rgba(140,60,60,0.35), transparent 65%),' +
      'linear-gradient(180deg, #2a1417 0%, #1a0d10 60%, #100709 100%)',
    cardBg: 'rgba(38, 20, 23, 0.8)',
    accent: '#E8B08A',
    accentSoft: 'rgba(232,176,138,0.2)',
    titleFont: SCRIPT,
  },
  wewantbeer: {
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(217,164,65,0.2), transparent 55%),' +
      'linear-gradient(180deg, #241b10 0%, #17110a 60%, #0d0a06 100%)',
    cardBg: 'rgba(33, 25, 15, 0.82)',
    accent: '#D9A441',
    accentSoft: 'rgba(217,164,65,0.2)',
    titleFont: CONDENSED,
    titleClass: 'font-black uppercase tracking-wide',
  },
  bookclub: {
    scene:
      'radial-gradient(110% 50% at 50% 0%, rgba(201,180,88,0.16), transparent 55%),' +
      'radial-gradient(80% 45% at 10% 100%, rgba(30,70,45,0.45), transparent 60%),' +
      'linear-gradient(180deg, #14231a 0%, #0e1912 60%, #080f0b 100%)',
    cardBg: 'rgba(18, 33, 25, 0.8)',
    accent: '#C9B458',
    accentSoft: 'rgba(201,180,88,0.2)',
    titleFont: SERIF,
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
  const cls = 'rounded-full ring-2 ring-[#14222b] object-cover flex-none';
  if (guest.picture) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={guest.picture}
        alt={guest.name}
        width={size}
        height={size}
        className={cls}
        style={{ width: size, height: size }}
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

function Collage({ photos, day }: { photos: string[]; day: string }) {
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
      {/* Handwritten date note — the scrapbook's connective tissue */}
      <div
        className="collage-sway absolute bottom-[6%] left-[7%] z-[3] -rotate-[5deg] rounded-[2px] bg-[#f6efdf] px-3.5 py-2 shadow-[0_6px_16px_rgba(0,0,0,0.45)]"
        style={{
          fontFamily: "'Snell Roundhand', 'Bradley Hand', 'Segoe Script', cursive",
          animationDuration: '9s',
          animationDelay: '0.4s',
        }}
      >
        <span className="text-[15px] font-semibold text-[#5d4a35]">
          {formatDay(day)} ✦
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
    <main className="relative min-h-screen overflow-hidden bg-[#0a141b]">
      {collage.length >= 2 ? (
        <>
          {/* Themed ground with a woven-texture read under the polaroids */}
          <div className="absolute inset-0" style={{ background: skin.scene }} />
          <div
            className="absolute inset-0 opacity-[0.16] mix-blend-overlay"
            style={{ backgroundImage: GRAIN }}
          />
          <Collage photos={collage} day={day} />
          <div
            className="absolute inset-0 z-[4]"
            style={{
              background:
                'radial-gradient(120% 90% at 50% 40%, transparent 55%, rgba(6,12,17,0.5) 100%),' +
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
      className="relative w-full max-w-[380px] rounded-3xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.55),0_2px_8px_rgba(0,0,0,0.4)] backdrop-blur-xl px-5 pb-5 pt-12"
      style={{
        backgroundColor: skin.cardBg,
        backgroundImage:
          'radial-gradient(120% 60% at 50% 0%, rgba(255,255,255,0.06), transparent 60%)',
        ['--accent' as string]: skin.accent,
        ['--accent-soft' as string]: skin.accentSoft,
      }}
    >
      {/* Host face bridging the card's top edge */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2">
        {host?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={host.picture}
            alt={host.name}
            className="h-[72px] w-[72px] rounded-full border-[3px] object-cover shadow-lg"
            style={{ borderColor: skin.accent }}
          />
        ) : (
          <span
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] text-[28px] font-bold text-white shadow-lg"
            style={{ backgroundColor: initialColor(host?.name ?? 'J'), borderColor: skin.accent }}
          >
            {(host?.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <p
        className="text-center text-[10px] font-bold uppercase tracking-[0.22em]"
        style={{ color: skin.accent }}
      >
        {host?.name ? `${host.name}’s plan` : 'You’re invited'}
      </p>
      <h1
        className={`mt-1.5 text-center text-[30px] font-semibold leading-[1.15] text-white ${skin.titleClass ?? ''}`}
        style={{ fontFamily: skin.titleFont }}
      >
        {plan.name}
      </h1>

      <div className="mt-4 flex items-center gap-2.5 text-[13.5px] font-semibold text-[#d7e1e8]">
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
        <div className="mt-2 flex items-center gap-2.5 text-[13.5px] font-semibold text-[#d7e1e8]">
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
          <div className="mt-5 h-px bg-white/10" />
          <p className="mt-4 text-[10px] font-bold uppercase tracking-[0.2em] text-[#7f95a3]">
            {host?.name ? `Invited by ${host.name}` : 'The group'}
          </p>
          <div className="mt-2.5 flex items-center">
            <div className="flex items-center -space-x-2">
              {shown.map((g, i) => (
                <GuestAvatar key={`${g.name}-${i}`} guest={g} size={30} />
              ))}
              {overflow > 0 && (
                <span className="flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-[#3a5262] text-[11px] font-bold text-white ring-2 ring-[#14222b]">
                  +{overflow}
                </span>
              )}
            </div>
            {invited > 0 && (
              <div className="ml-auto text-right leading-none">
                <span className="block text-[22px] font-extrabold text-white">
                  {invited}
                </span>
                <span className="text-[9px] font-bold uppercase tracking-[0.18em] text-[#7f95a3]">
                  invited
                </span>
              </div>
            )}
          </div>
        </>
      )}

      <div className="mt-5 flex items-center border-t border-white/10 pt-4">
        <span
          className="text-[17px] font-extrabold tracking-tight"
          style={{ color: skin.accent }}
        >
          jorts
        </span>
        <a
          href={`https://apps.apple.com/app/id${APP_STORE_ID}`}
          className="ml-auto text-[11px] font-bold text-[#7f95a3]"
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
      <div className="relative -rotate-[1.5deg]">
        <div className="absolute -top-2.5 left-1/2 z-[2] h-5 w-16 -translate-x-1/2 -rotate-3 bg-[#fff8dc]/45 shadow-sm" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={plan.card as string}
          alt={plan.name}
          className="w-full rounded-2xl border border-white/10 shadow-[0_24px_60px_rgba(0,0,0,0.6)]"
        />
        <div
          className="absolute inset-x-2.5 bottom-2.5 z-[1] rounded-xl border border-white/10 px-4 pb-3.5 pt-1 shadow-[0_10px_30px_rgba(0,0,0,0.45)] backdrop-blur-xl"
          style={{
            backgroundColor: skin.cardBg.replace('0.8', '0.72'),
            ['--accent' as string]: skin.accent,
            ['--accent-soft' as string]: skin.accentSoft,
          }}
        >
          {children}
          <div className="mt-3.5 flex items-center border-t border-white/10 pt-3">
            {shown.length > 0 && (
              <div className="flex items-center -space-x-2">
                {shown.map((g, i) => (
                  <GuestAvatar key={`${g.name}-${i}`} guest={g} size={26} />
                ))}
                {overflow > 0 && (
                  <span className="flex h-[26px] w-[26px] flex-none items-center justify-center rounded-full bg-[#3a5262] text-[10px] font-bold text-white ring-2 ring-[#14222b]">
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
