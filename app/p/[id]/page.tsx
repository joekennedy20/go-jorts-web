import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { DM_Serif_Display, Archivo } from 'next/font/google';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';

const dmSerif = DM_Serif_Display({ subsets: ['latin'], weight: '400' });
const archivo = Archivo({ subsets: ['latin'], weight: ['500', '600', '700'] });

/**
 * /p/<plan id> — "See who's on the way", the link on every plan in a
 * person's own Jorts calendar subscription.
 *
 * On an iPhone with Jorts, the AASA claims /p/* and the app opens the
 * plan. This page is only what a browser sees: a laptop's Google
 * Calendar, or a phone without the app. With the plan's invite token
 * (`?t=`), it goes straight to the plan's invite page, which works for
 * anyone. Without one there's nothing public to show, so it says where
 * the plan lives.
 */

export const metadata: Metadata = {
  title: 'Open in Jorts',
  robots: { index: false },
};

const TOKEN = /^[A-Za-z0-9_-]{6,128}$/;

export default function PlanLinkPage({
  searchParams,
}: {
  params: { id: string };
  searchParams: { t?: string };
}) {
  const t = searchParams?.t;
  if (t && TOKEN.test(t)) {
    redirect(`/invite/${t}`);
  }

  return (
    <main
      className={archivo.className}
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '32px 20px',
        background: '#F7F1E6',
        color: '#22435B',
      }}
    >
      <div style={{ maxWidth: 420, textAlign: 'center' }}>
        <div style={{ fontSize: 44 }}>🩳</div>
        <h1 className={dmSerif.className} style={{ fontSize: 32, fontWeight: 400, margin: '12px 0 8px' }}>
          This plan is in the Jorts app
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.5, color: '#4B6275', margin: '0 0 24px' }}>
          Open this link on your iPhone to see who&rsquo;s going and who&rsquo;s on the way.
        </p>
        <a
          href={APP_STORE_URL}
          style={{
            display: 'inline-block',
            padding: '14px 22px',
            borderRadius: 999,
            background: '#F4B941',
            color: '#22435B',
            fontWeight: 700,
            textDecoration: 'none',
          }}
        >
          Get Jorts
        </a>
      </div>
    </main>
  );
}
