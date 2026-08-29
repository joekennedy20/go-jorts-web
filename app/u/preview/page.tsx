/**
 * /u/preview — static mockup of the "Jorts-as-IG-bio-link" landing page.
 *
 * Not wired to real data; everything here is hardcoded so Joe can see
 * the layout and decide whether to commit to building the real
 * `/u/<username>` route on top of a backend public-profile endpoint.
 *
 * The pitch: every Jorts user gets a personal jortsapp.com/u/<handle>
 * URL they put in their Instagram bio. Anyone who visits the page sees
 * the user's current vibe, a "Start a Hang" CTA, and a grid of recent
 * hang photos. Every Jorts user becomes a recruiter just by existing
 * (their IG bio is the funnel).
 */
import type {Metadata} from 'next';

const APP_STORE_URL = 'https://apps.apple.com/app/id6759267210';

export const metadata: Metadata = {
  title: 'Joe — on Jorts',
  description: 'Down to hang tonight. Tap to start a hang with Joe.',
};

// Placeholder hang photos via picsum.photos so the grid renders without
// us hosting any images. The real page would render the user's own
// recent fit-check photos.
const HANG_PHOTOS = [
  'https://picsum.photos/seed/jorts1/400/400',
  'https://picsum.photos/seed/jorts2/400/400',
  'https://picsum.photos/seed/jorts3/400/400',
  'https://picsum.photos/seed/jorts4/400/400',
  'https://picsum.photos/seed/jorts5/400/400',
  'https://picsum.photos/seed/jorts6/400/400',
];

export default function ProfilePreviewPage() {
  return (
    <main className="min-h-screen bg-navy flex flex-col items-center px-6 pt-12 pb-10">
      <div className="w-full max-w-[420px]">
        {/* Small wordmark up top — branded but not overwhelming */}
        <div className="flex justify-center mb-8">
          <span className="text-white/30 text-xs tracking-[0.3em] font-semibold uppercase">
            jorts
          </span>
        </div>

        {/* Profile photo */}
        <div className="flex justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://picsum.photos/seed/joekennedy/400/400"
            alt="Joe Kennedy"
            width={144}
            height={144}
            className="rounded-full object-cover ring-4 ring-gold/40"
          />
        </div>

        {/* Name + handle */}
        <h1 className="text-white text-[36px] font-bold text-center mt-6 tracking-tight leading-none">
          Joe Kennedy
        </h1>
        <p className="text-white/50 text-center mt-1 text-base">
          @joekennedy20
        </p>

        {/* Live vibe pill — the punchy "what's this person doing right now" */}
        <div className="flex justify-center mt-7">
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-gold/15 border border-gold/40">
            <span className="text-2xl leading-none">🔥</span>
            <span className="text-gold font-semibold text-base">
              Down to hang tonight
            </span>
          </div>
        </div>

        {/* Secondary location chip */}
        <div className="flex justify-center mt-3">
          <span className="text-white/55 text-sm">📍 Charlotte</span>
        </div>

        {/* Primary CTA — the whole reason a viewer is on this page */}
        <a
          href={APP_STORE_URL}
          className="block mt-9 bg-gold text-navy font-bold text-center text-lg rounded-full py-4 px-6">
          Start a Hang with Joe ✨
        </a>
        <p className="text-white/40 text-xs text-center mt-2.5">
          Opens Jorts if you have it. Otherwise the App Store.
        </p>

        {/* Recent hangs grid — IG-style 3x2 */}
        <div className="mt-12">
          <p className="text-white/40 text-[11px] tracking-[0.18em] font-semibold uppercase">
            Recent Hangs
          </p>
          <div className="mt-4 grid grid-cols-3 gap-1.5">
            {HANG_PHOTOS.map((url, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={url}
                alt=""
                className="w-full aspect-square object-cover rounded-md"
              />
            ))}
          </div>
        </div>

        {/* Footer — quiet "get the app" affordance for IG visitors who
            haven't installed yet */}
        <div className="mt-14 flex flex-col items-center gap-2">
          <a
            href={APP_STORE_URL}
            className="text-gold/80 text-sm font-semibold underline underline-offset-4">
            Get Jorts
          </a>
          <p className="text-white/30 text-xs text-center max-w-[280px] leading-relaxed">
            Jorts is for hanging out IRL. Set a vibe, see who's around,
            start something.
          </p>
        </div>
      </div>
    </main>
  );
}
