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
      ],
    };
  },
};

module.exports = nextConfig;
