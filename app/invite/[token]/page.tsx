import { RSVPCard } from './rsvp-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

interface InviteData {
  contact_name: string;
  rsvp_status: string;
  plan: {
    name: string;
    day: string;
    time: string | null;
    location: string | null;
    confirmed_names: string[];
  };
}

async function getInvite(token: string): Promise<InviteData | null> {
  try {
    const res = await fetch(`${API_URL}/v1/invites/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function formatDay(dayStr: string): string {
  try {
    const [y, m, d] = dayStr.split('-').map(Number);
    const date = new Date(y, m - 1, d);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    });
  } catch {
    return dayStr;
  }
}

export default async function InvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await getInvite(params.token);

  if (!invite) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <p className="text-white/60 text-lg text-center">
          This invite link is invalid or expired.
        </p>
        <a
          href="https://apps.apple.com/app/id6759267210"
          className="mt-8 text-gold font-bold text-base"
        >
          Get Jorts &rarr;
        </a>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-10 pb-16">
      {/* Logo */}
      <div className="text-center mb-6">
        <span className="text-3xl font-bold tracking-tight">jorts</span>
      </div>

      {/* Plan details */}
      <h1 className="text-white font-bold text-[28px] text-center leading-tight">
        {invite.plan.name}
      </h1>
      <p className="text-gold text-lg mt-2">{formatDay(invite.plan.day)}</p>
      {invite.plan.time && (
        <p className="text-white/60 text-base mt-1">{invite.plan.time}</p>
      )}
      {invite.plan.location && (
        <p className="text-white/60 text-base mt-1.5 flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          {invite.plan.location}
        </p>
      )}

      {/* Attendance */}
      {invite.plan.confirmed_names.length > 0 && (
        <p className="text-white/80 text-base mt-4">
          {invite.plan.confirmed_names.length === 1
            ? `${invite.plan.confirmed_names[0]} is in`
            : invite.plan.confirmed_names.length === 2
            ? `${invite.plan.confirmed_names[0]} and ${invite.plan.confirmed_names[1]} are in`
            : `${invite.plan.confirmed_names[0]}, ${invite.plan.confirmed_names[1]}, and ${invite.plan.confirmed_names.length - 2} other${invite.plan.confirmed_names.length - 2 > 1 ? 's' : ''} are in`}
        </p>
      )}

      {/* Divider */}
      <div className="w-full h-px bg-white/15 mt-8" />

      {/* RSVP section */}
      <RSVPCard
        token={params.token}
        contactName={invite.contact_name}
        initialStatus={invite.rsvp_status}
        planName={invite.plan.name}
      />
    </main>
  );
}
