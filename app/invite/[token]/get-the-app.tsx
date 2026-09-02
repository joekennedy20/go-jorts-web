'use client';

/**
 * GetTheApp — the call to action that follows a yes.
 *
 * The moment a guest RSVPs is the highest-intent second in the whole
 * product: they have just committed to a real plan with real friends,
 * on a page we control, without the app. Until now we answered it with
 * a checkmark and an 11px "Get the app →" in the page footer.
 *
 * So this leads with what they're missing by name — the chat and the
 * people already in it — rather than asking them to download something.
 * Shown only after "in" or "maybe"; someone who just said they can't
 * come is not a candidate for anything.
 *
 * The tap is recorded (fire-and-forget) because it is the only part of
 * the install journey we can see. An actual install still isn't
 * attributable without deferred deep linking.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.getjorts.com';
const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';

interface GetTheAppProps {
  /** Invite token — scopes the recorded tap to this plan. */
  token: string;
  /** First names of people already confirmed, host included. */
  guests?: string[];
  /** Which placement this is, for the funnel breakdown. */
  source?: string;
}

/** "Sofia's in the chat" / "Sofia and Kate are…" / "Sofia, Kate and 3 others are…" */
function chatLine(guests: string[]): string {
  const names = guests.map((n) => n.trim()).filter(Boolean);
  if (names.length === 0) return 'The chat is in the app';
  if (names.length === 1) return `${names[0]} is in the chat`;
  if (names.length === 2) return `${names[0]} and ${names[1]} are in the chat`;
  const rest = names.length - 2;
  return `${names[0]}, ${names[1]} and ${rest} ${
    rest === 1 ? 'other' : 'others'
  } are in the chat`;
}

export function GetTheApp({ token, guests = [], source = 'rsvp_confirmed' }: GetTheAppProps) {
  const recordTap = () => {
    // Never block the navigation on our own telemetry. keepalive so
    // the request survives the page being replaced by the App Store.
    try {
      fetch(`${API_URL}/v1/invites/${token}/app-taps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      /* no-op */
    }
  };

  return (
    <div
      className="mt-5 w-full border-t pt-4"
      style={{ borderColor: 'var(--hair, rgba(255,255,255,0.12))' }}
    >
      <p
        className="text-center text-[15px] font-bold"
        style={{ color: 'var(--ink, #fff)' }}
      >
        {chatLine(guests)}
      </p>
      <p
        className="mt-1 text-center text-[13px] leading-snug"
        style={{ color: 'var(--sub, rgba(255,255,255,0.55))' }}
      >
        Get Jorts to see what everyone&apos;s saying — and where they are
        when it starts.
      </p>
      <a
        href={APP_STORE_URL}
        onClick={recordTap}
        className="mt-3 flex h-12 w-full items-center justify-center rounded-xl text-[15px] font-bold transition-opacity active:opacity-80"
        style={{
          backgroundColor: 'var(--accent, #E8A020)',
          color: 'var(--on-accent, #fff)',
        }}
      >
        Get Jorts — free
      </a>
    </div>
  );
}
