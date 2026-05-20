import type { Metadata } from 'next';
import './globals.css';

// Default page metadata for every route that doesn't supply its own
// (privacy + terms set their own; /join/[token] does too via
// generateMetadata). The previous title "JORTS - Weekend Plans" was
// vestigial — Jorts is no longer weekend-only and the "Weekend Plans"
// subtitle showed up redundantly in iMessage link unfurls next to
// the message body which already names the specific hang.
export const metadata: Metadata = {
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
