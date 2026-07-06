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

function Scene({ children }: { children: React.ReactNode }) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#101d26]">
      {/* Stage-1 scene: layered navy night with an amber glow up top.
          Stage 2 swaps this layer for the host's photo collage. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(120% 55% at 50% 0%, rgba(232,160,32,0.16), transparent 55%),' +
            'radial-gradient(90% 40% at 15% 100%, rgba(26,58,92,0.55), transparent 60%),' +
            'linear-gradient(180deg, #1b3441 0%, #101d26 55%, #0a141b 100%)',
        }}
      />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-5 py-16">
        {children}
      </div>
    </main>
  );
}

function HostCard({
  plan,
  children,
}: {
  plan: PlanSummary;
  children: React.ReactNode;
}) {
  const host = plan.host ?? null;
  const guests = plan.guests ?? [];
  const shown = guests.slice(0, 5);
  const overflow = guests.length - shown.length;
  const invited = plan.invited_count ?? 0;

  return (
    <div className="relative w-full max-w-[380px] rounded-3xl border border-white/10 bg-[#14222b]/80 shadow-[0_18px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl px-5 pb-5 pt-12">
      {/* Host face bridging the card's top edge */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2">
        {host?.picture ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={host.picture}
            alt={host.name}
            className="h-[72px] w-[72px] rounded-full border-[3px] border-gold object-cover shadow-lg"
          />
        ) : (
          <span
            className="flex h-[72px] w-[72px] items-center justify-center rounded-full border-[3px] border-gold text-[28px] font-bold text-white shadow-lg"
            style={{ backgroundColor: initialColor(host?.name ?? 'J') }}
          >
            {(host?.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      <p className="text-center text-[10px] font-bold uppercase tracking-[0.22em] text-gold">
        {host?.name ? `${host.name}’s plan` : 'You’re invited'}
      </p>
      <h1
        className="mt-1.5 text-center text-[30px] font-semibold leading-[1.15] text-white"
        style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
      >
        {plan.name}
      </h1>

      <div className="mt-4 flex items-center gap-2.5 text-[13.5px] font-semibold text-[#d7e1e8]">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ECAB3A" strokeWidth="2" strokeLinecap="round" className="flex-none">
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
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#ECAB3A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="flex-none">
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
        <span className="text-[17px] font-extrabold tracking-tight text-gold">
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

function InvalidInvite() {
  return (
    <Scene>
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
}: {
  params: { token: string };
}) {
  const resolved = await resolveToken(params.token);

  if (!resolved) {
    return <InvalidInvite />;
  }

  // Contact invite — fetch full invite data with contact name + rsvp status
  if (resolved.type === 'contact') {
    const invite = await getContactInvite(params.token);
    if (!invite) {
      return <InvalidInvite />;
    }

    return (
      <Scene>
        <HostCard plan={invite.plan}>
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
    return (
      <Scene>
        <HostCard plan={resolved.plan}>
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
