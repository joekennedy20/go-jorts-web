/** @type {import('next').NextConfig} */

// When the request hostname is `share.jortsapp.com`, rewrite the URL
// `/{token}` to the actual Next.js page at `/share/{token}` so SMS
// recipients see a clean URL like `share.jortsapp.com/AbCdEf123`
// instead of the redundant `share.jortsapp.com/share/AbCdEf123`.
//
// The rewrite is server-side (URL bar doesn't change), so the user
// just sees the clean URL throughout.
//
// We only apply the rewrite when the hostname is the share subdomain
// — that way `jortsapp.com/share/foo` and `go-jorts-web.vercel.app/share/foo`
// continue to work via the literal route on disk.
const nextConfig = {
  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/:token([A-Za-z0-9_-]{6,64})',
          has: [
            {
              type: 'host',
              value: 'share.jortsapp.com',
            },
          ],
          destination: '/share/:token',
        },
        // Night pages — `out.jortsapp.com/joe` (the short URL printed
        // on IG story images) rewrites to the /out/[token] page.
        // Slugs are 1-24 chars (first names + numeric suffixes), but
        // legacy random tokens (12 chars urlsafe) match too.
        {
          source: '/:token([A-Za-z0-9_-]{1,64})',
          has: [
            {
              type: 'host',
              value: 'out.jortsapp.com',
            },
          ],
          destination: '/out/:token',
        },
      ],
    };
  },
};

module.exports = nextConfig;
