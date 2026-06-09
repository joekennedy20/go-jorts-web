import type { Metadata } from 'next';

import { RSVPCard } from './rsvp-card';
import { GroupRSVPCard } from './group-rsvp-card';
import {
  resolveToken,
  getContactInvite,
  getPlanSummary,
  formatDay,
  attendanceText,
} from './invite-data';

const APP_STORE_ID = '6759267210';

// Open Graph / Twitter metadata so a texted invite link unfurls into a
// card with the plan's name, day, and who's in — instead of a bare URL.
// The og:image is generated per-plan by opengraph-image.tsx alongside.
// Also includes the Smart App Banner tag so iPhone Safari offers
// "Open in Jorts" when the app is installed.
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
  const attendance = plan ? attendanceText(plan.confirmed_names) : null;
  const description =
    [detail, attendance].filter(Boolean).join(' — ') || 'Tap to RSVP.';

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
    other: {
      'apple-itunes-app': `app-id=${APP_STORE_ID}, app-argument=${params.token}`,
    },
  };
}

function AttendanceLine({ names }: { names: string[] }) {
  const text = attendanceText(names);
  if (!text) return null;
  return <p className="text-white/80 text-base mt-4">{text}</p>;
}

function PlanDetails({ plan }: { plan: { name: string; day: string; time: string | null; location: string | null; confirmed_names: string[] } }) {
  return (
    <>
      <h1 className="text-white font-bold text-[28px] text-center leading-tight">
        {plan.name}
      </h1>
      <p className="text-gold text-lg mt-2">{formatDay(plan.day)}</p>
      {plan.time && (
        <p className="text-white/60 text-base mt-1">{plan.time}</p>
      )}
      {plan.location && (
        <p className="text-white/60 text-base mt-1.5 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {plan.location}
        </p>
      )}
      <AttendanceLine names={plan.confirmed_names} />
    </>
  );
}

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const resolved = await resolveToken(params.token);

  if (!resolved) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <p className="text-white/60 text-lg text-center">
          This invite link is invalid or expired.
        </p>
        <a
          href={`https://apps.apple.com/app/id${APP_STORE_ID}`}
          className="mt-8 text-gold font-bold text-base"
        >
          Get Jorts &rarr;
        </a>
      </main>
    );
  }

  // Contact invite — fetch full invite data with contact name + rsvp status
  if (resolved.type === 'contact') {
    const invite = await getContactInvite(params.token);
    if (!invite) {
      return (
        <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
          <p className="text-white/60 text-lg text-center">
            This invite link is invalid or expired.
          </p>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-10 pb-16">
        <div className="text-center mb-6">
          <span className="text-3xl font-bold tracking-tight">jorts</span>
        </div>
        <PlanDetails plan={invite.plan} />
        <div className="w-full h-px bg-white/15 mt-8" />
        <RSVPCard
          token={params.token}
          contactName={invite.contact_name}
          initialStatus={invite.rsvp_status}
          planName={invite.plan.name}
        />
      </main>
    );
  }

  // Group invite — show name entry + RSVP
  if (resolved.type === 'group' && resolved.plan) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-10 pb-16">
        <div className="text-center mb-6">
          <span className="text-3xl font-bold tracking-tight">jorts</span>
        </div>
        <PlanDetails plan={resolved.plan} />
        <div className="w-full h-px bg-white/15 mt-8" />
        <GroupRSVPCard
          token={params.token}
          planName={resolved.plan.name}
        />
      </main>
    );
  }

  return null;
}
