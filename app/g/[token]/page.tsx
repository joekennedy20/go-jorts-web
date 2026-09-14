import type { Metadata } from 'next';
import { DM_Serif_Display, Archivo } from 'next/font/google';

import { resolveGroupLink } from './group-link-data';

const APP_STORE_ID = '6759267210';
const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700'] });

/**
 * The landing page for a group link.
 *
 * The app sent these links before anything answered them — they pointed
 * at a domain that didn't exist (Joe, 2026-09-14). Now the link lives
 * here, and the AASA claims /g/*, so anyone who HAS Jorts goes straight
 * into the app and joins; this page is for everyone else.
 *
 * Deliberately a first version: say what the group is and who asked,
 * and send people to the App Store. The page that lets people without
 * the app see the group's plans and add them to their own calendar is
 * being built on top of this one.
 *
 * Unlike a map invite, a group link is reusable — one link, forwarded
 * as far as the group wants — so there is no "already used" state. A
 * link that resolves to nothing was rotated by the group's owner.
 */
export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  const group = await resolveGroupLink(params.token);
  const name = group
    ? `${group.emoji ? `${group.emoji} ` : ''}${group.group_name}`
    : 'a group';
  const title = group?.inviter_name
    ? `${group.inviter_name} wants you in ${name}`
    : `Join ${name} on Jorts`;
  const description = 'A group on Jorts: one shared calendar for the people you actually do things with.';

  return {
    title,
    description,
    openGraph: { title, description },
    other: { 'apple-itunes-app': `app-id=${APP_STORE_ID}` },
  };
}

export default async function GroupLinkPage({
  params,
}: {
  params: { token: string };
}) {
  const group = await resolveGroupLink(params.token);
  const who = group?.inviter_name;
  const count = group?.member_count ?? 0;

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {!group ? (
          <>
            <p style={{ ...styles.eyebrow, ...archivo.style }}>LINK EXPIRED</p>
            <h1 style={{ ...styles.title, ...dmSerif.style }}>
              This group link no longer works
            </h1>
            <p style={{ ...styles.body, ...archivo.style }}>
              Whoever runs the group made a new one, which switches the old
              link off. Ask them to send it again.
            </p>
          </>
        ) : (
          <>
            <p style={{ ...styles.eyebrow, ...archivo.style }}>
              {group.emoji ? `${group.emoji}  ` : ''}A GROUP ON JORTS
            </p>
            <h1 style={{ ...styles.title, ...dmSerif.style }}>
              {who ? `${who} wants you in` : "You're invited to"}
              <br />
              <span style={styles.name}>{group.group_name}</span>
            </h1>
            <p style={{ ...styles.body, ...archivo.style }}>
              {count === 1
                ? 'One person is in so far.'
                : `${count} people are in.`}{' '}
              A group shares one calendar, so you can see when everyone&apos;s
              free and plan around it.
            </p>

            <a href={APP_STORE_URL} style={{ ...styles.cta, ...archivo.style }}>
              Get Jorts to join
            </a>

            <p style={{ ...styles.footnote, ...archivo.style }}>
              Already have Jorts? Tap the link again and it&apos;ll open the
              group. It keeps working after you install.
            </p>
          </>
        )}
      </div>
    </main>
  );
}

// The group calendar's night palette, so the page looks like the thing
// it's inviting you into.
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
    background: '#0B141D',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#16222C',
    borderRadius: 20,
    padding: '36px 28px 32px',
    border: '1px solid rgba(246,241,232,0.10)',
  },
  eyebrow: {
    margin: 0,
    fontSize: 11.5,
    letterSpacing: '0.16em',
    fontWeight: 700,
    color: '#C9A24B',
  },
  title: {
    margin: '14px 0 0',
    fontSize: 30,
    lineHeight: 1.18,
    color: '#F6F1E8',
  },
  name: { color: '#F4B941' },
  body: {
    margin: '16px 0 0',
    fontSize: 15.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.72)',
    fontWeight: 500,
  },
  cta: {
    display: 'block',
    marginTop: 26,
    padding: '15px 20px',
    borderRadius: 12,
    background: '#F4B941',
    color: '#0B141D',
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    textDecoration: 'none',
  },
  footnote: {
    margin: '16px 0 0',
    fontSize: 12.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.5)',
    fontWeight: 500,
  },
};
