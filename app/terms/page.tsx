import type {Metadata} from 'next';
import {LegalDoc, readDoc} from '../legal-doc';

export const metadata: Metadata = {
  title: 'Terms of Use — Jorts',
  description: 'The terms you agree to when you use Jorts.',
};

export default function TermsPage() {
  return <LegalDoc text={readDoc('terms.txt')} />;
}
