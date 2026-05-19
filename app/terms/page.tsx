/**
 * /terms — public Terms of Use.
 *
 * Static page. Content is the May 18 2026 draft (Google Doc id
 * 1uVjfd_DDgoCqk9snF6mAPhjdi_4bilEixlu9Fg-A2xk) reflected here as
 * the canonical published copy. Apple App Store requires a publicly
 * accessible Terms URL; this is it.
 */
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Terms of Use — Jorts',
  description:
    'Terms governing your use of the Jorts mobile app and jortsapp.com.',
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-white text-navy">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] font-semibold uppercase text-navy/40">
            Jorts
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Terms of Use</h1>
          <p className="text-sm text-navy/60 mt-3">
            Effective Date: May 18, 2026 &nbsp;·&nbsp; Last Updated: May 18, 2026
          </p>
        </header>

        <article className="space-y-8 leading-relaxed text-base">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Acceptance of Terms</h2>
            <p>
              These Terms of Use ("Terms") constitute a legally binding
              agreement between you ("you" or "user") and If You Know You
              Know, Inc. ("Company," "we," "us," or "our") governing your
              access to and use of:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The Jorts mobile application (the "App")</li>
              <li>The website located at jortsapp.com (the "Site"), including the public shareable-hang invite preview at jortsapp.com/join/&lt;token&gt;</li>
            </ul>
            <p className="mt-3">
              (collectively, the "Services"). By downloading, installing,
              or using the App, or by accessing or using the Site, you
              represent that you have read, understood, and agree to be
              bound by these Terms. If you do not agree, do not use the
              Services.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Apple App Store — Additional Terms</h2>
            <p>
              The following provisions apply specifically to your use of
              the App obtained through the Apple App Store and are required
              by Apple, Inc. ("Apple"):
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li><strong>a. Acknowledgment.</strong> You acknowledge that these Terms are an agreement between you and the Company only, and not with Apple. Apple is not responsible for the App or its content.</li>
              <li><strong>b. Scope of License.</strong> The Company grants you a limited, non-exclusive, non-transferable, revocable license to use the App on any Apple-branded device that you own or control, as permitted by the App Store Review Guidelines and these Terms.</li>
              <li><strong>c. Maintenance and Support.</strong> The Company is solely responsible for providing maintenance and support services with respect to the App. Apple has no obligation whatsoever to furnish any maintenance or support services.</li>
              <li><strong>d. Warranty.</strong> To the maximum extent permitted by applicable law, Apple has no warranty obligation whatsoever with respect to the App. Any claims, losses, liabilities, damages, costs, or expenses attributable to any failure to conform to any warranty are the sole responsibility of the Company.</li>
              <li><strong>e. Product Claims.</strong> The Company, not Apple, is responsible for addressing any claims by you or any third party relating to the App or your possession and/or use of the App.</li>
              <li><strong>f. Intellectual Property.</strong> In the event of any third-party claim that the App or your possession and use of the App infringes a third party's intellectual property rights, the Company, not Apple, will be solely responsible for the investigation, defense, settlement, and discharge of any such claim.</li>
              <li><strong>g. Legal Compliance.</strong> You represent and warrant that you are not located in a U.S.-embargoed country and are not on any U.S. Government list of prohibited or restricted parties.</li>
              <li><strong>h. Third-Party Beneficiary.</strong> The parties acknowledge and agree that Apple and Apple's subsidiaries are third-party beneficiaries of these Terms as they relate to your license of the App.</li>
              <li><strong>i. Developer Contact.</strong> If you have questions, complaints, or claims with respect to the App, please contact us at <a href="mailto:legal@jortsapp.com" className="underline">legal@jortsapp.com</a>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. Eligibility</h2>
            <p>
              You must be at least 13 years of age to use the Services. By
              using the Services, you represent that you are 13 or older.
              If you are between the ages of 13 and 17 (or the age of
              majority in your jurisdiction, if higher), you represent that
              your parent or legal guardian has reviewed and agrees to
              these Terms on your behalf.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. Account Registration</h2>
            <p>
              To access core features of the App, you must create an
              account by signing in with a supported third-party
              authentication provider (currently Google or Apple). When
              registering, you agree to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use accurate identity information returned by your sign-in provider, and maintain and promptly update profile information you choose to add (display name, profile photo, Instagram handle)</li>
              <li>Keep your sign-in provider account secure and not share access credentials with others</li>
              <li>Notify us at legal@jortsapp.com if you suspect unauthorized use of your account</li>
              <li>Accept responsibility for all activity that occurs under your account</li>
            </ul>
            <p className="mt-3">
              You may also visit certain pages on jortsapp.com (such as
              the shareable-hang invite preview at jortsapp.com/join/&lt;token&gt;)
              without creating an account. Those pages display limited
              information about a Group Hang to anyone with the link.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Description of the Services</h2>
            <p>Jorts is a friend-group coordination application that allows users to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create and join real-time Group Hangs</li>
              <li>Share live location with hang participants on the in-hang map (optional, user-controlled)</li>
              <li>Optionally share your current "vibe" and approximate location with mutual friends via the "Share my location with friends" toggle (a 4-hour foreground broadcast that auto-expires)</li>
              <li>Express your current vibe via emoji status</li>
              <li>Share outfit photos via the Fit Check feature</li>
              <li>Communicate via in-hang chat</li>
              <li>Signal "Heading Home" and confirm "Home Safe" through the safety flow</li>
              <li>Maintain a profile with a display name, profile picture, photo grid, and optional Instagram handle</li>
              <li>Connect with friends through the in-app friend system</li>
              <li>Create and join social plans for the day</li>
              <li>Receive push notifications related to your hangs, friend activity, and safety confirmations</li>
              <li>Generate and share a shareable hang invite link that anyone with the link can use to join the hang</li>
              <li>Share a Group Hang invite card to Instagram Story or Snap Story via your device's native sharing</li>
              <li>Receive admin announcements (community events, platform updates) on the home feed</li>
            </ul>
            <p className="mt-3">Features and functionality are subject to change at any time at our discretion.</p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Licenses</h2>
            <h3 className="font-semibold mt-3">A. License to You</h3>
            <p className="mt-2">
              Subject to these Terms, the Company grants you a personal,
              non-exclusive, non-transferable, revocable, limited license
              to download, install, and use the App on a compatible
              device you own or control, and to access and use the Site,
              solely for your personal, non-commercial purposes.
            </p>
            <h3 className="font-semibold mt-4">B. License You Grant to Us</h3>
            <p className="mt-2">
              By submitting, posting, or transmitting any content through
              the Services — including profile information, chat messages,
              Fit Check photos, vibe status, shareable invite links, or any
              other user-generated content ("User Content") — you grant the
              Company a worldwide, non-exclusive, royalty-free, sublicensable
              license to use, reproduce, process, transmit, display, and
              distribute that content solely to the extent necessary to
              operate, improve, and provide the Services. This license does
              not grant us the right to sell your User Content or use it
              for advertising purposes.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. User Conduct</h2>
            <p>You agree NOT to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Use the Services for any illegal purpose</li>
              <li>Harass, bully, stalk, threaten, intimidate, or harm any other user</li>
              <li>Impersonate any person or entity, including by setting an Instagram handle that is not yours</li>
              <li>Post unlawful, obscene, defamatory, abusive, threatening, harmful, or otherwise objectionable content</li>
              <li>Share personal information about other users without their consent</li>
              <li>Use the live location feature or "Share my location with friends" feature to track, monitor, or surveil any person without their knowledge and consent</li>
              <li>Distribute a shareable hang invite link in a manner intended to invite people the host has not consented to having in their hang</li>
              <li>Attempt unauthorized access to any part of the Services</li>
              <li>Reverse engineer, decompile, or disassemble the App</li>
              <li>Use any automated means to access the Services</li>
              <li>Use the Services to send unsolicited communications or spam</li>
            </ul>
            <p className="mt-3">
              We reserve the right to remove any User Content and to
              suspend or terminate the account of any user who violates
              these Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Location Sharing</h2>
            <p>The App offers location-based features in two contexts:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>In an active Group Hang</strong> — when location sharing is enabled, your precise location is visible in real time to other participants in the hang.</li>
              <li><strong>"Share my location with friends"</strong> — when enabled, your approximate location and current vibe are visible to your mutual friends for a foreground-only 4-hour window, after which the broadcast automatically ends.</li>
            </ul>
            <p className="mt-3">
              You may disable location sharing at any time from your
              Profile, from the Group Hang screen, or by revoking
              permission in your device's settings. Using location features
              to monitor a person without their knowledge and consent is
              prohibited and may violate applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Shareable Hang Invite Links</h2>
            <p>
              If you are the host of a Group Hang, you may enable a
              shareable invite link from the in-hang invite menu. When
              enabled, the link is a Universal Link to
              jortsapp.com/join/&lt;token&gt; that:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Auto-opens the App and joins the hang for any user with Jorts installed who taps the link</li>
              <li>Opens a public web preview at jortsapp.com/join/&lt;token&gt; for any user without the App, showing the hang name, your first name, your profile picture, the going count, and the expiry time</li>
            </ul>
            <p className="mt-3">
              You can disable, revoke, and re-issue the shareable invite
              link at any time. Disabling the link immediately stops it
              from working; re-enabling it issues a fresh token and the
              previous link cannot be re-activated.
            </p>
            <p className="mt-3">
              By enabling a shareable invite link, you acknowledge that
              you are voluntarily publishing limited information about the
              hang to anyone who possesses the link, and that anyone you
              give the link to can pass it to other people.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Intellectual Property</h2>
            <p>
              All content, features, and functionality of the Services —
              including the Jorts name and brand, logos, software, design
              elements, and text — are the exclusive property of If You
              Know You Know, Inc. or its licensors. These Terms do not
              grant you any right, title, or interest in or to the
              Services or any Company intellectual property.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">11. Privacy</h2>
            <p>
              Your use of the Services is subject to our{' '}
              <a href="/privacy" className="underline">Privacy Policy</a>, which is incorporated into these Terms by this reference.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">12. Disclaimer of Warranties</h2>
            <p className="uppercase text-sm leading-relaxed">
              The services are provided on an "as is" and "as available"
              basis, without warranties of any kind, either express or
              implied, including but not limited to warranties of
              merchantability, fitness for a particular purpose, title,
              and non-infringement. The Company does not warrant that the
              services will be uninterrupted, error-free, secure, or free
              of viruses or other harmful components.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">13. Limitation of Liability</h2>
            <p className="uppercase text-sm leading-relaxed">
              To the maximum extent permitted by applicable law, in no
              event shall If You Know You Know, Inc., its officers,
              directors, employees, agents, or licensors be liable for any
              indirect, incidental, special, consequential, punitive, or
              exemplary damages — including but not limited to loss of
              profits, loss of data, loss of goodwill, or service
              interruption — arising out of or related to your use of or
              inability to use the services. The Company's total cumulative
              liability shall not exceed the greater of (a) the amount you
              paid to the Company in the twelve months preceding the claim
              or (b) $100.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">14. Indemnification</h2>
            <p>
              You agree to indemnify, defend, and hold harmless If You Know
              You Know, Inc. and its officers, directors, employees, and
              agents from and against any claims, liabilities, damages,
              losses, and expenses (including reasonable attorneys' fees)
              arising out of or related to: your use of the Services, your
              User Content, your violation of these Terms, or your
              violation of any rights of another person or entity.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">15. Termination</h2>
            <p>
              You may stop using the Services at any time. You may
              permanently delete your account and associated personal data
              from within the App at Profile → Delete Account, or by
              contacting us at legal@jortsapp.com. The Company may suspend
              or terminate your access to the Services, in whole or in
              part, at any time and for any reason, with or without notice.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">16. Governing Law &amp; Dispute Resolution</h2>
            <p>
              These Terms are governed by the laws of the State of North
              Carolina. Any legal action shall be brought exclusively in
              the state or federal courts located in Mecklenburg County,
              North Carolina.
            </p>
            <p className="mt-3">
              <strong>Informal Resolution.</strong> Before initiating any
              formal legal proceeding, you agree to first contact us at
              legal@jortsapp.com and give us 30 days to attempt to resolve
              the dispute informally.
            </p>
            <p className="mt-3">
              <strong>Binding Arbitration.</strong> Disputes not resolved
              informally shall be resolved by binding individual
              arbitration administered by the American Arbitration
              Association ("AAA") under its Consumer Arbitration Rules. You
              and the Company each agree that any claims must be brought
              in the respective party's individual capacity, and not as a
              plaintiff or class member in any purported class or
              representative proceeding.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">17. Changes to These Terms</h2>
            <p>
              We may update these Terms from time to time. When we do, we
              will revise the "Last Updated" date at the top of this
              document. Your continued use of the Services after the
              effective date of any changes constitutes your acceptance of
              the revised Terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">18. Contact Us</h2>
            <p>
              <strong>If You Know You Know, Inc.</strong>
              <br />
              Charlotte, North Carolina
              <br />
              Email: <a href="mailto:legal@jortsapp.com" className="underline">legal@jortsapp.com</a>
            </p>
          </section>
        </article>

        <footer className="mt-16 pt-8 border-t border-navy/10 text-sm text-navy/60">
          <a href="/privacy" className="underline mr-6">Privacy Policy</a>
          <a href="mailto:legal@jortsapp.com" className="underline">legal@jortsapp.com</a>
        </footer>
      </div>
    </main>
  );
}
