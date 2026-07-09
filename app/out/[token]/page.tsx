/**
 * /out/[token] — the live night page behind an "I'm out" IG story.
 *
 * The story image is the billboard; this is the door — and it should
 * feel like walking THROUGH the sticker the viewer just tapped. The
 * page skins itself to the sticker design that shared it (classic
 * serif arch / typewriter ticket stub / handwritten note / pink
 * neon), set in the sticker's own typeface over a night backdrop
 * with a warm glow pooled behind the poster's face.
 *
 * Three states: active (respond card), expired (dawn-gradient
 * "night's over"), not found (neutral Get Jorts page). Pages expire
 * at 6 AM Eastern — ephemerality is the point, and the sunrise
 * meter at the bottom makes it visible.
 */
import type { Metadata } from 'next';
import {
  Prata,
  Special_Elite,
  Great_Vibes,
  Sacramento,
  Archivo,
} from 'next/font/google';

import { RespondCard } from './respond-card';
import {
  getNightPage,
  headlineFor,
  startedLine,
  responsesLine,
  type NightPage as NightPageData,
} from './night-data';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';
const APP_STORE_ID = '6759267210';

const prata = Prata({ subsets: ['latin'], weight: '400' });
const specialElite = Special_Elite({ subsets: ['latin'], weight: '400' });
const greatVibes = Great_Vibes({ subsets: ['latin'], weight: '400' });
const sacramento = Sacramento({ subsets: ['latin'], weight: '400' });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700', '800'] });

// ── Skins — one per sticker design ────────────────────────────────
interface NightSkin {
  bg: string;
  glow: string;
  accent: string;
  accentSoft: string;
  onAccent: string;
  ink: string;
  sub: string;
  headlineFont: string;
  headlineClass: string;
  headlineShadow?: string;
  /** Small tracked line above the headline (the ticket's ADMIT ONE). */
  eyebrow?: string;
}

const NIGHT_SKINS: Record<string, NightSkin> = {
  classic: {
    bg: 'linear-gradient(180deg, #16222E 0%, #101B26 55%, #0A121A 100%)',
    glow: 'rgba(244,185,65,0.22)',
    accent: '#F4B941',
    accentSoft: 'rgba(244,185,65,0.16)',
    onAccent: '#1A2E3D',
    ink: '#F3EFE7',
    sub: '#8E9AA6',
    headlineFont: prata.style.fontFamily,
    headlineClass: 'text-[34px] leading-[1.15]',
  },
  ticket: {
    bg: 'linear-gradient(180deg, #201A12 0%, #17120C 55%, #0E0B07 100%)',
    glow: 'rgba(217,164,65,0.2)',
    accent: '#D9A441',
    accentSoft: 'rgba(217,164,65,0.14)',
    onAccent: '#201708',
    ink: '#F0E8D6',
    sub: '#9C9077',
    headlineFont: specialElite.style.fontFamily,
    headlineClass: 'text-[30px] uppercase tracking-[0.06em] leading-[1.25]',
    eyebrow: 'ADMIT ONE',
  },
  note: {
    bg: 'linear-gradient(180deg, #1E1A15 0%, #15120D 55%, #0D0B08 100%)',
    glow: 'rgba(201,162,59,0.2)',
    accent: '#C9A23B',
    accentSoft: 'rgba(201,162,59,0.14)',
    onAccent: '#1E1708',
    ink: '#F2EBDC',
    sub: '#9A9180',
    headlineFont: greatVibes.style.fontFamily,
    headlineClass: 'text-[46px] leading-[1.1]',
  },
  neon: {
    bg: 'linear-gradient(180deg, #150C10 0%, #0F0709 55%, #090405 100%)',
    glow: 'rgba(255,79,134,0.22)',
    accent: '#FF9EB8',
    accentSoft: 'rgba(255,79,134,0.16)',
    onAccent: '#2A0714',
    ink: '#F5EDEF',
    sub: '#9A8890',
    headlineFont: sacramento.style.fontFamily,
    headlineClass: 'text-[46px] leading-[1.1]',
    headlineShadow:
      '0 0 18px rgba(255,79,134,0.85), 0 0 42px rgba(255,79,134,0.45)',
  },
};

function nightSkin(design: string | null | undefined): NightSkin {
  return NIGHT_SKINS[design ?? ''] ?? NIGHT_SKINS.classic;
}

// Film-grain overlay — same texture as the invite page.
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const page = await getNightPage(params.token);

  const title =
    page && page.is_active ? headlineFor(page) : 'Out tonight — Jorts';
  const description =
    page && page.is_active
      ? 'Tap to tell them you&apos;re out too.'
      : 'Catch the next one on Jorts.';

  return {
    title,
    description,
    openGraph: { title, description, type: 'website' },
    twitter: { card: 'summary_large_image', title, description },
    other: {
      'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=${params.token}`,
    },
  };
}

function Logo({ className = 'h-9' }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/jorts-logo.png"
      alt="jorts"
      className={`${className} w-auto`}
      style={{ filter: 'brightness(0) invert(0.92)' }}
    />
  );
}

/** How far through the night we are, 0..1 (started → sunrise). */
function nightProgress(page: NightPageData): number {
  try {
    const start = new Date(page.started_at).getTime();
    const end = new Date(page.expires_at).getTime();
    const now = Date.now();
    if (!(end > start)) return 0;
    return Math.min(1, Math.max(0, (now - start) / (end - start)));
  } catch {
    return 0;
  }
}

function SunriseMeter({ progress, accent }: { progress: number; accent: string }) {
  return (
    <div className="mt-12 w-full max-w-sm" style={{ fontFamily: archivo.style.fontFamily }}>
      <div className="flex items-center gap-2.5">
        <span className="text-[13px]">🌙</span>
        <div className="relative h-[3px] flex-1 overflow-hidden rounded-full bg-white/10">
          <div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{ width: `${Math.round(progress * 100)}%`, backgroundColor: accent, opacity: 0.8 }}
          />
        </div>
        <span className="text-[13px]">🌅</span>
      </div>
      <p className="mt-2 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-white/30">
        this page expires at sunrise
      </p>
    </div>
  );
}

export default async function NightPage({
  params,
  searchParams,
}: {
  params: { token: string };
  searchParams?: { design?: string };
}) {
  const page = await getNightPage(params.token);
  const designOverride = searchParams?.design;

  if (!page) {
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{ background: NIGHT_SKINS.classic.bg, fontFamily: archivo.style.fontFamily }}
      >
        <Logo />
        <p className="mt-8 text-center text-lg text-white/60">
          This page isn&apos;t available.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-8 inline-block rounded-full px-8 py-4 font-bold"
          style={{ backgroundColor: '#F4B941', color: '#1A2E3D' }}
        >
          Get Jorts
        </a>
      </main>
    );
  }

  const skin = nightSkin(designOverride ?? page.design);

  if (!page.is_active) {
    // The morning after — dawn gradient, the night put to bed.
    return (
      <main
        className="flex min-h-screen flex-col items-center justify-center px-6"
        style={{
          background:
            'linear-gradient(180deg, #2B2740 0%, #6A4E63 45%, #C97F63 78%, #E8B087 100%)',
          fontFamily: archivo.style.fontFamily,
        }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.12] mix-blend-overlay"
          style={{ backgroundImage: GRAIN }}
        />
        <Logo />
        <h1
          className="mt-10 text-center text-[38px] leading-tight text-[#FFF6EA]"
          style={{ fontFamily: prata.style.fontFamily }}
        >
          the night&apos;s over
        </h1>
        <p className="mt-3 text-center text-base text-[#FFF6EA]/75">
          {page.first_name} was out — catch the next one.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-9 inline-block rounded-full bg-[#241F33] px-9 py-4 font-bold text-[#F6E9D8]"
        >
          Get Jorts
        </a>
      </main>
    );
  }

  const others = responsesLine(page);
  const progress = nightProgress(page);

  return (
    <main
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-6 pb-14 pt-10"
      style={{
        background: skin.bg,
        fontFamily: archivo.style.fontFamily,
        ['--accent' as string]: skin.accent,
        ['--accent-soft' as string]: skin.accentSoft,
        ['--on-accent' as string]: skin.onAccent,
        ['--ink' as string]: skin.ink,
        ['--sub' as string]: skin.sub,
      }}
    >
      {/* Warm glow pooled behind the poster — the venue-spotlight look */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[46vh]"
        style={{
          background: `radial-gradient(60% 55% at 50% 30%, ${skin.glow}, transparent 70%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.14] mix-blend-overlay"
        style={{ backgroundImage: GRAIN }}
      />

      <div className="relative z-10 flex w-full flex-col items-center">
        <Logo className="h-9" />

        {/* LIVE row */}
        <div className="mt-8 flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span
              className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
              style={{ backgroundColor: skin.accent }}
            />
            <span
              className="relative inline-flex h-2 w-2 rounded-full"
              style={{ backgroundColor: skin.accent }}
            />
          </span>
          <span
            className="text-[11px] font-bold uppercase tracking-[0.22em]"
            style={{ color: skin.sub }}
          >
            live · {startedLine(page.started_at)}
          </span>
        </div>

        {/* Poster's face in an accent ring over the glow */}
        <div className="mt-7">
          {page.picture ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={page.picture}
              alt={page.first_name}
              width={96}
              height={96}
              className="rounded-full border-[3px] object-cover shadow-[0_14px_40px_rgba(0,0,0,0.5)]"
              style={{ borderColor: skin.accent }}
            />
          ) : (
            <div
              className="h-24 w-24 rounded-full border-[3px]"
              style={{ backgroundColor: skin.accentSoft, borderColor: skin.accent }}
            />
          )}
        </div>

        {skin.eyebrow && (
          <p
            className="mt-6 text-[11px] font-bold uppercase tracking-[0.34em]"
            style={{ color: skin.accent, fontFamily: skin.headlineFont }}
          >
            {skin.eyebrow}
          </p>
        )}
        <h1
          className={`${skin.eyebrow ? 'mt-2' : 'mt-6'} px-2 text-center ${skin.headlineClass}`}
          style={{
            fontFamily: skin.headlineFont,
            color: skin.ink,
            textShadow: skin.headlineShadow,
          }}
        >
          {headlineFor(page)}
        </h1>

        {others && (
          <div
            className="mt-5 flex items-center gap-2 rounded-full px-4 py-1.5"
            style={{ backgroundColor: skin.accentSoft }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: skin.accent }}
            />
            <span className="text-sm font-semibold" style={{ color: skin.accent }}>
              {others}
            </span>
          </div>
        )}

        <RespondCard token={params.token} firstName={page.first_name} />

        <SunriseMeter progress={progress} accent={skin.accent} />
      </div>
    </main>
  );
}
