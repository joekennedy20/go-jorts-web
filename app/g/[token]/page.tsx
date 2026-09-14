import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { DM_Serif_Display, Archivo } from 'next/font/google';

import { CalendarSubscribe } from './CalendarSubscribe';
import { GroupPlans } from './GroupPlans';
import { feedLinks, resolveGroupLink, resolveGroupPage } from './group-link-data';

const APP_STORE_ID = '6759267210';
const APP_STORE_URL = `https://apps.apple.com/app/id${APP_STORE_ID}`;

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700'] });

/**
 * The group page — what a group's one link opens.
 *
 * Anyone who HAS Jorts never sees this: the AASA claims /g/*, so iOS
 * hands the link to the app, which joins the group. This page is for
 * everyone else, and prod says that's most people: 28 of 45 real users
 * have no friends on the app, and a bare link in a group chat is the
 * only invite that has ever worked. So this is not a fallback or an ad
 * for the app. For most members it IS the group (Joe, decision 5,
 * 2026-09-11):
 *
 *   - what the group is doing, with "I'm in" on each plan — through
 *     the plan's own invite page, the RSVP flow that already works;
 *   - a calendar subscription, so the group's plans live in the
 *     calendar they already use and follow every change;
 *   - the app, offered second.
 *
 * What it never shows: who is in the group, and anything about the
 * time members have taken elsewhere. The busy blocks on the in-app
 * calendar are for members; a link holder gets the group's own plans.
 *
 * A group link is reusable — one link, forwarded as far as the group
 * wants — so there is no "already used" state. A link that resolves to
 * nothing was reset by the group's owner.
 *
 * If the API doesn't serve the plans read yet, this degrades to the
 * plain landing page (name, who asked, App Store).
 */
export async function generateMetadata({
  params,
}: {
  params: { token: string };
}): Promise<Metadata> {
  // The preview read, not the plans one: iMessage fetches this for the
  // link bubble, and the bubble only needs the name.
  const group = await resolveGroupLink(params.token);
  const name = group
    ? `${group.emoji ? `${group.emoji} ` : ''}${group.group_name}`
    : 'a group';
  const title = group?.inviter_name
    ? `${group.inviter_name} wants you in ${name}`
    : `Join ${name} on Jorts`;
  const description =
    "See what the group's got planned, say you're in, and add it to your calendar.";

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
  const group = await resolveGroupPage(params.token);

  if (!group) {
    return (
      <main style={styles.page}>
        <div style={{ ...styles.column, ...styles.centered }}>
          <div style={styles.card}>
            <p style={{ ...styles.eyebrow, ...archivo.style }}>LINK RESET</p>
            <h1 style={{ ...styles.title, ...dmSerif.style }}>
              This group link doesn&apos;t work anymore
            </h1>
            <p style={{ ...styles.body, ...archivo.style }}>
              Whoever runs the group made a new one, which switches the old
              link off. Nobody was removed — ask someone in the group to send
              the new link.
            </p>
            <p style={{ ...styles.footnote, ...archivo.style }}>
              If you added this group to your calendar, that stopped updating
              too. The new link has a new calendar.
            </p>
          </div>
        </div>
      </main>
    );
  }

  const who = group.inviter_name;
  const count = group.member_count ?? 0;
  const label = group.group_name || 'this group';

  const h = headers();
  const feed = group.calendar
    ? feedLinks(
        group.calendar.token,
        h.get('x-forwarded-host') ?? h.get('host'),
        h.get('x-forwarded-proto'),
      )
    : null;

  return (
    <main style={styles.page}>
      <div style={styles.column}>
        <header style={styles.card}>
          <p style={{ ...styles.eyebrow, ...archivo.style }}>
            {group.emoji ? `${group.emoji}  ` : ''}A GROUP ON JORTS
          </p>
          <h1 style={{ ...styles.title, ...dmSerif.style }}>
            {who ? `${who} wants you in` : "You're invited to"}
            <br />
            <span style={styles.name}>{group.group_name}</span>
          </h1>
          <p style={{ ...styles.body, ...archivo.style }}>
            {count === 1 ? 'One person is in so far' : `${count} people are in`}
            {who ? `, including ${who}.` : '.'}{' '}
            {group.plans
              ? "Say you're in to anything below — no app, no account."
              : "A group shares one calendar, so you can see when everyone's free and plan around it."}
          </p>
        </header>

        {group.plans && (
          <GroupPlans
            groupName={label}
            plans={group.plans}
            serif={dmSerif.style}
            sans={archivo.style}
          />
        )}

        {feed && (
          <CalendarSubscribe
            groupName={label}
            url={feed.url}
            webcalUrl={feed.webcal_url}
            googleUrl={feed.google_url}
            serif={dmSerif.style}
            sans={archivo.style}
          />
        )}

        <section style={styles.app}>
          {group.plans ? (
            <>
              <p style={{ ...styles.appTitle, ...archivo.style }}>
                Want the whole group&apos;s week?
              </p>
              <p style={{ ...styles.appBody, ...archivo.style }}>
                On Jorts you see when everyone&apos;s free, make plans for the
                group, and join the chat.
              </p>
              <a href={APP_STORE_URL} style={{ ...styles.appCta, ...archivo.style }}>
                Get Jorts
              </a>
            </>
          ) : (
            <a href={APP_STORE_URL} style={{ ...styles.cta, ...archivo.style }}>
              Get Jorts to join
            </a>
          )}
          <p style={{ ...styles.footnote, ...archivo.style }}>
            Already have Jorts? Tap the group link in your messages and it
            opens the group in the app. It keeps working after you install.
          </p>
        </section>
      </div>
    </main>
  );
}

// The group calendar's night palette, so the page looks like the thing
// it's inviting you into.
const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100dvh',
    padding: '28px 18px 48px',
    background: '#0B141D',
  },
  column: {
    width: '100%',
    maxWidth: 440,
    margin: '0 auto',
  },
  centered: {
    minHeight: 'calc(100dvh - 76px)',
    display: 'flex',
    alignItems: 'center',
  },
  card: {
    width: '100%',
    background: '#16222C',
    borderRadius: 20,
    padding: '32px 24px 26px',
    border: '1px solid rgba(246,241,232,0.10)',
    boxSizing: 'border-box',
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
    fontWeight: 400,
  },
  name: { color: '#F4B941' },
  body: {
    margin: '14px 0 0',
    fontSize: 15.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.72)',
    fontWeight: 500,
  },
  app: {
    marginTop: 26,
    padding: '0 6px',
    textAlign: 'center',
  },
  appTitle: { margin: 0, fontSize: 15, fontWeight: 700, color: '#F6F1E8' },
  appBody: {
    margin: '6px 0 0',
    fontSize: 13.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.62)',
    fontWeight: 500,
  },
  appCta: {
    display: 'inline-block',
    marginTop: 14,
    padding: '11px 26px',
    borderRadius: 999,
    border: '1px solid rgba(244,185,65,0.6)',
    color: '#F4B941',
    fontSize: 15,
    fontWeight: 700,
    textDecoration: 'none',
  },
  cta: {
    display: 'block',
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
    margin: '14px 0 0',
    fontSize: 12.5,
    lineHeight: 1.5,
    color: 'rgba(246,241,232,0.5)',
    fontWeight: 500,
  },
};
