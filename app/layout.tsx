import type { Metadata } from 'next';
import './globals.css';

// Default page metadata for every route that doesn't supply its own
// (privacy + terms set their own; /join/[token] does too via
// generateMetadata). The previous title "JORTS - Weekend Plans" was
// vestigial — Jorts is no longer weekend-only and the "Weekend Plans"
// subtitle showed up redundantly in iMessage link unfurls next to
// the message body which already names the specific hang.
export const metadata: Metadata = {
  // Absolute-URL base for og:image and friends. Without this, Next
  // falls back to the Vercel project's production domain, which is
  // jortsapp.com — a domain that does NOT currently serve this app
  // (it's a placeholder hosted elsewhere), so generated image URLs
  // 404'd in link previews. Pin to the address that actually serves
  // these pages until jortsapp.com is pointed here.
  metadataBase: new URL('https://go-jorts-web.vercel.app'),
  title: 'Jorts',
  description: 'RSVP to plans on Jorts.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-navy">{children}</body>
    </html>
  );
}
