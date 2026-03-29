import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'JORTS - Weekend Plans',
  description: 'RSVP to plans on JORTS',
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
