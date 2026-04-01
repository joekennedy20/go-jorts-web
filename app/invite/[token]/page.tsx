import { RSVPCard } from './rsvp-card';
import { GroupRSVPCard } from './group-rsvp-card';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';

interface ResolveResult {
  type: 'contact' | 'group';
  token?: string;
  plan_id?: string;
  plan?: {
    name: string;
    day: string;
    time: string | null;
    location: string | null;
    confirmed_names: string[];
  };
}

interface ContactInviteData {
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

async function resolveToken(token: string): Promise<ResolveResult | null> {
  try {
    const res = await fetch(`${API_URL}/v1/invites/resolve/${token}`, {
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function getContactInvite(token: string): Promise<ContactInviteData | null> {
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

function AttendanceLine({ names }: { names: string[] }) {
  if (names.length === 0) return null;
  const text =
    names.length === 1
      ? `${names[0]} is in`
      : names.length === 2
      ? `${names[0]} and ${names[1]} are in`
      : `${names[0]}, ${names[1]}, and ${names.length - 2} other${names.length - 2 > 1 ? 's' : ''} are in`;
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
          href="https://testflight.apple.com/join/Cqdz46jE"
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
