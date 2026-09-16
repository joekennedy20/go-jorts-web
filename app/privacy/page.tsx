import type {Metadata} from 'next';
import {LegalDoc, readDoc} from '../legal-doc';

export const metadata: Metadata = {
  title: 'Privacy Policy — Jorts',
  description: 'How Jorts collects, uses and protects your information.',
};

export default function PrivacyPage() {
  return <LegalDoc text={readDoc('privacy.txt')} />;
}
