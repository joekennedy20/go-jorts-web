/**
 * /out/[token] — the live night page behind an "I'm out" IG story.
 *
 * The story image is the billboard; this is the door. Viewers tap
 * the link sticker on the poster's story and land here, where they
 * can respond "I'm out too" / "where you at?" with just a name —
 * no account, no install. The response reaches the poster as a
 * push, and the responder gets the Get Jorts CTA.
 *
 * Three states: active (respond card), expired ("the night's
 * over"), not found (neutral Get Jorts page). Pages expire at
 * 6 AM Eastern — ephemerality is the point.
 */
import type { Metadata } from 'next';

import { RespondCard } from './respond-card';
import {
  getNightPage,
  headlineFor,
  startedLine,
  responsesLine,
} from './night-data';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';
const APP_STORE_ID = '6759267210';

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

function Wordmark() {
  return (
    <span className="text-2xl font-bold tracking-tight text-white">jorts</span>
  );
}

export default async function NightPage({
  params,
}: {
  params: { token: string };
}) {
  const page = await getNightPage(params.token);

  if (!page) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <Wordmark />
        <p className="text-white/60 text-lg text-center mt-8">
          This page isn&apos;t available.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-8 inline-block bg-gold text-navy font-bold rounded-full px-8 py-4"
        >
          Get Jorts
        </a>
      </main>
    );
  }

  if (!page.is_active) {
    return (
      <main className="min-h-screen bg-navy flex flex-col items-center justify-center px-6">
        <Wordmark />
        <h1 className="text-white font-bold text-[28px] text-center mt-8 leading-tight">
          the night&apos;s over
        </h1>
        <p className="text-white/60 text-base text-center mt-3">
          {page.first_name} was out — catch the next one on Jorts.
        </p>
        <a
          href={APP_STORE_URL}
          className="mt-8 inline-block bg-gold text-navy font-bold rounded-full px-8 py-4"
        >
          Get Jorts
        </a>
      </main>
    );
  }

  const others = responsesLine(page);

  return (
    <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-12 pb-16">
      <div className="text-center mb-10">
        <Wordmark />
      </div>

      {page.picture ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={page.picture}
          alt={page.first_name}
          width={88}
          height={88}
          className="rounded-full mb-6 object-cover"
        />
      ) : (
        <div className="w-[88px] h-[88px] rounded-full bg-gold mb-6" />
      )}

      <h1 className="text-white font-bold text-[30px] text-center leading-tight">
        {headlineFor(page)}
      </h1>
      <p className="text-white/50 text-base mt-2">
        {startedLine(page.started_at)}
      </p>

      {others && (
        <div className="mt-4 flex items-center gap-2 bg-gold/15 rounded-full px-4 py-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-gold" />
          <span className="text-gold text-sm">{others}</span>
        </div>
      )}

      <RespondCard token={params.token} firstName={page.first_name} />

      <p className="text-white/30 text-xs mt-12">
        this page expires at sunrise
      </p>
    </main>
  );
}
