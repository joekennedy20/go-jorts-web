/**
 * apple-app-site-association — iOS Universal Links manifest.
 *
 * Apple's App Search APIs fetch this file from
 * https://jortsapp.com/.well-known/apple-app-site-association
 * to determine which URLs on this domain should open the Jorts iOS
 * app instead of Safari.
 *
 * Requirements that bite you if you get them wrong (most apps that
 * fail Universal Links setup fail on one of these):
 *
 *   1. Served over HTTPS (Vercel handles this)
 *   2. Status 200 (this route always returns it inline; no DB lookup)
 *   3. Content-Type: application/json (set explicitly below — Next.js
 *      / Vercel won't infer it from the extension-less filename if
 *      you just drop it in /public)
 *   4. No HTTP redirects (we serve directly, no rewrites)
 *   5. JSON-parseable (it's a literal here, can't drift)
 *
 * Why a route handler instead of a file in /public:
 *   The file has no extension, so Vercel's static asset serving
 *   guesses Content-Type wrong (it'll send text/plain or octet-
 *   stream, depending). Apple's parser REQUIRES application/json
 *   and silently ignores the file otherwise — and there's no error
 *   message, just "Universal Links don't work" with no clue why.
 *   A route handler lets us pin the Content-Type header explicitly.
 *
 * The appID format is "TEAMID.BUNDLEID":
 *   - KW44C92RMU is our Apple Developer team ID (from
 *     ios/JortsApp.xcodeproj/project.pbxproj DEVELOPMENT_TEAM).
 *   - org.JortsApp is the bundle identifier (also in project.pbxproj
 *     PRODUCT_BUNDLE_IDENTIFIER).
 *
 * Paths claimed here:
 *
 *   /join/*    shareable-hang links (the original surface)
 *   /invite/*  plan invites — the links the app actually sends
 *
 * /invite/* was left out on the theory that those pages are "web-only
 * RSVPs, no app handling there". That stopped being true, and the cost
 * was that EVERY Jorts invite opened Safari — including for people who
 * had the app, who then typed their own name into a page built for
 * strangers, next to their own profile. The app now resolves the token
 * and joins them (POST /v1/invites/{token}/join).
 *
 * /share/* is deliberately NOT claimed. Those are the sticker/share
 * pages, meant to be looked at in a browser by anyone; hijacking them
 * into the app would break the one thing they're for.
 */
import { NextResponse } from 'next/server';

// Apple recommends caching the AASA file for 1 day per their docs
// (https://developer.apple.com/documentation/xcode/supporting-associated-domains).
// Vercel CDN respects max-age on JSON responses by default.
export const revalidate = 86400;

export async function GET() {
  const body = {
    applinks: {
      details: [
        {
          appIDs: ['KW44C92RMU.org.JortsApp'],
          components: [
            {
              '/': '/join/*',
              comment: 'Open shareable Group Hang invites in the Jorts app',
            },
            {
              '/': '/invite/*',
              comment: 'Open plan invites in the app for people who have it',
            },
          ],
        },
      ],
    },
  };
  return NextResponse.json(body, {
    headers: {
      'Content-Type': 'application/json',
      // Apple Search uses CDN-cached AASA but also re-fetches on app
      // updates. A 1-day max-age keeps things fresh while not
      // hammering Vercel from millions of devices.
      'Cache-Control': 'public, max-age=86400, s-maxage=86400',
    },
  });
}
