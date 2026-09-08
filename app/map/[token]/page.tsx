import type { Metadata } from 'next';
import { DM_Serif_Display, Archivo } from 'next/font/google';

import { resolveMapInvite } from './map-invite-data';

const APP_STORE_ID = '6759267210';
const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700'] });

/**
 * The landing page for an invite to an invite-only campus map.
 *
 * This page exists because the app started sending /map/ links before
 * anything served them — a steward's first invite came back a 404
 * (Joe, 2026-09-08). Its sibling fix is the AASA now claiming /map/*,
 * so somebody who HAS Jorts never reaches this page at all; iOS hands
 * the link straight to the app, which claims the invite and opens the
 * map.
 *
 * So the only people who land here are the ones without the app —
 * which, for a map a student is filling one friend at a time, is most
 * of them. That makes this page's job narrow and specific: say what
 * they've been invited to, by name, and send them to the App Store.
 *
 * What it deliberately does NOT do:
 *
 *   - Show the map. There is no web view of a campus map and there
 *     shouldn't be: the whole point of an invite map is that seeing it
 *     is something you're let into.
 *   - Ask for anything. No name field, no RSVP. The plan invite page
 *     collects an RSVP because a plan can be answered from the web; a
 *     map can only be entered.
 *   - Burn the invite. Resolving is a read. The link still works when
 *     they come back with the app installed, which is the entire
 *     journey this page is for.
 */
export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const invite = await resolveMapInvite(params.token);
  const name = invite?.map_name ?? 'a campus map';
  const who = invite?.inviter_name;

  return {
    title: who ? `${who} invited you to ${name}` : `You're invited to ${name}`,
    description:
      'An invite-only map on Jorts. Only people invited can see it.',
    openGraph: {
      title: who ? `${who} invited you to ${name}` : `You're invited to ${name}`,
      description:
        'An invite-only map on Jorts. Only people invited can see it.',
    },
    // Smart App Banner, so iPhone Safari offers "Open in Jorts" to
    // anyone who already has it and somehow landed here anyway.
    other: { 'apple-itunes-app': `app-id=${APP_STORE_ID}` },
  };
}

export default async function MapInvitePage({
  params,
}: {
  params: { token: string };
}) {
  const invite = await resolveMapInvite(params.token);

  const gone =
    !invite || invite.status === 'revoked' || invite.status === 'accepted';
  const name = invite?.map_name ?? 'a campus map';
  const who = invite?.inviter_name;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {gone ? (
          <>
            <p style={{ ...styles.eyebrow, ...archivo.style }}>
              THIS INVITE IS SPENT
            </p>
            <h1 style={{ ...styles.title, ...dmSerif.style }}>
              {invite?.status === 'accepted'
                ? 'Somebody already used this link'
                : 'This link no longer works'}
            </h1>
            {/* Says the actual rule rather than apologising. Each
                invite works once, for one person — that IS the
                feature, and someone who hits this deserves to know
                why instead of assuming the app is broken. */}
            <p style={{ ...styles.body, ...archivo.style }}>
              Every invite to a Jorts map works once, for one person.
              {who ? ` Ask ${who} for another.` : ' Ask whoever sent it for another.'}
            </p>
          </>
        ) : (
          <>
            <p style={{ ...styles.eyebrow, ...archivo.style }}>
              {invite?.emoji ? `${invite.emoji}  ` : ''}INVITE ONLY
            </p>
            <h1 style={{ ...styles.title, ...dmSerif.style }}>
              {who ? `${who} invited you to` : "You're invited to"}
              <br />
              <span style={styles.mapName}>{name}</span>
            </h1>
            <p style={{ ...styles.body, ...archivo.style }}>
              It&apos;s a map only the people invited to it can see —
              what&apos;s happening, where, and who&apos;s around.
            </p>
            {/* The one thing about the room that would otherwise be a
                surprise, said before they join rather than after. */}
            <p style={{ ...styles.body, ...archivo.style }}>
              You&apos;ll be invisible on it until you choose otherwise.
            </p>

            <a href={APP_STORE_URL} style={{ ...styles.cta, ...archivo.style }}>
              Get Jorts to join
            </a>

            {/* The link survives the install — resolving it doesn't
                spend it — and saying so is what stops someone thinking
                they have to hurry or that they've lost it. */}
            <p style={{ ...styles.footnote, ...archivo.style }}>
              Already have Jorts? Tap this link again and it&apos;ll open
              the map. It&apos;ll still be here after you install.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#F4F1EA',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#FFFFFF',
    borderRadius: 20,
    padding: '36px 28px 32px',
    boxShadow: '0 2px 24px rgba(20,30,40,0.08)',
  },
  eyebrow: {
    margin: 0,
    fontSize: 11.5,
    letterSpacing: '0.16em',
    fontWeight: 700,
    color: '#1D7A5E',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 30,
    lineHeight: 1.18,
    color: '#132430',
  },
  mapName: { color: '#244050' },
  body: {
    margin: '16px 0 0',
    fontSize: 15.5,
    lineHeight: 1.5,
    color: '#4A5560',
    fontWeight: 500,
  },
  cta: {
    display: 'block',
    marginTop: 26,
    padding: '15px 20px',
    borderRadius: 12,
    background: '#244050',
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    textDecoration: 'none',
  },
  footnote: {
    margin: '16px 0 0',
    fontSize: 12.5,
    lineHeight: 1.5,
    color: '#8A8A93',
    fontWeight: 500,
  },
};
