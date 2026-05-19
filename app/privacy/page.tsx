/**
 * /privacy — public Privacy Policy.
 *
 * Static page. Content is the May 18 2026 draft (Google Doc id
 * 1bZ4Q-PYp5YpIiWdi4H_LAx1u04oFokZ8mPWe-qb6VCM) reflected here as
 * the canonical published copy. Apple App Store requires a publicly
 * accessible Privacy Policy URL; this is it.
 *
 * Keep formatting plain and high-contrast — the page renders inside
 * iOS Safari, IG's in-app browser, and Apple's reviewer browser. No
 * Tailwind animations, no interactive elements.
 */
import type {Metadata} from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy — Jorts',
  description:
    'How If You Know You Know, Inc. (the makers of Jorts) collects, uses, and protects your information.',
};

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-white text-navy">
      <div className="max-w-3xl mx-auto px-6 py-12">
        <header className="mb-10">
          <p className="text-xs tracking-[0.3em] font-semibold uppercase text-navy/40">
            Jorts
          </p>
          <h1 className="text-3xl md:text-4xl font-bold mt-2">Privacy Policy</h1>
          <p className="text-sm text-navy/60 mt-3">
            Effective Date: May 18, 2026 &nbsp;·&nbsp; Last Updated: May 18, 2026
          </p>
        </header>

        <article className="space-y-8 leading-relaxed text-base">
          <section>
            <h2 className="text-xl font-bold mb-3">1. Introduction</h2>
            <p>
              If You Know You Know, Inc. ("Company," "we," "us," or "our")
              built the Jorts mobile application (the "App") to help friend
              groups coordinate plans in real time. This Privacy Policy
              describes how we collect, use, disclose, and protect your
              information when you use the App and the related website at
              jortsapp.com (together, the "Services").
            </p>
            <p className="mt-3">
              By downloading or using the App, or by visiting a Jorts
              shareable-hang invite page on jortsapp.com, you agree to the
              collection and use of information in accordance with this
              policy.
            </p>
            <p className="mt-3">
              The website at jortsapp.com serves a small number of public
              pages — most importantly the shareable hang invite preview at
              jortsapp.com/join/&lt;token&gt;, which is created when a Group
              Hang host enables a shareable invite link (see Section 4). The
              website does not require you to sign in, does not maintain its
              own user accounts, and does not host or store any user data on
              its own; it reads invite previews from the same backend that
              the App uses.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">2. Information We Collect</h2>

            <h3 className="font-semibold mt-4">A. Account and Identity Information</h3>
            <p className="mt-2">When you create a Jorts account, we collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Name returned by your sign-in provider (you can edit your display name later)</li>
              <li>Email address returned by your sign-in provider</li>
              <li>Sign-in provider account identifier (Google account ID or Apple user identifier)</li>
            </ul>
            <p className="mt-3">
              You sign in to Jorts using Sign in with Google or Sign in with
              Apple. Each provider returns a small set of profile fields to
              Jorts under that provider's own privacy practices. We do not
              support SMS, phone number, or email-and-password sign-in.
            </p>
            <p className="mt-3">In addition, you may optionally add the following to your profile:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Profile photo</li>
              <li>Display name (overriding the name returned by your sign-in provider)</li>
              <li>
                Instagram handle (a public Instagram username such as @yourhandle), which is shown on your in-app profile so friends can tap to open your Instagram account in the Instagram app or the web. We do not connect to Instagram's API; the handle is treated as plain text you typed.
              </li>
            </ul>

            <h3 className="font-semibold mt-5">B. Location Information</h3>
            <p className="mt-2">
              The App requests access to your device's precise location while the App is in use. Location data is used to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Show your position to other participants in your active Group Hang (in-hang map)</li>
              <li>Show your approximate position to mutual friends when you have enabled the "Share my location with friends" toggle (a 4-hour foreground broadcast you can stop at any time from your Profile)</li>
            </ul>
            <p className="mt-3">
              Location sharing is user-controlled. You can disable it at any
              time from Profile → Privacy → Share my location with friends,
              or by revoking location permission in iOS Settings. The App
              does not use background location.
            </p>

            <h3 className="font-semibold mt-5">C. Contacts</h3>
            <p className="mt-2">
              With your permission, the App accesses your device's contact
              list to help you find friends who already have Jorts accounts.
              Contacts are processed locally on your device only — we do not
              upload, store, or transmit your contact list to our servers.
              We perform matching client-side against the existing Jorts
              user base.
            </p>

            <h3 className="font-semibold mt-5">D. Camera and Photos</h3>
            <p className="mt-2">
              The App requests access to your device's camera and (optionally) photo library to enable:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Profile pictures uploaded to your account</li>
              <li>Fit Check photos shared with participants in your active Group Hang</li>
              <li>Photo grid on your profile</li>
            </ul>
            <p className="mt-3">
              Photos you upload are stored in Google Cloud Storage in
              private buckets. They are visible only to the recipients
              defined by the feature (your active Group Hang for Fit Check;
              your friends for profile content).
            </p>
            <p className="mt-3">
              If you choose to share Group Hang content to a third-party
              platform such as Instagram Story or Snap Story, the App will
              use your device's native sharing mechanism to hand off an
              image generated by Jorts. Once handed off, that content is
              governed by the receiving platform's privacy practices and is
              no longer under our control.
            </p>

            <h3 className="font-semibold mt-5">E. User-Generated Content</h3>
            <p className="mt-2">While using the App, we collect content you create and share, including:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Chat messages sent within a Group Hang</li>
              <li>Fit Check photos you capture and share</li>
              <li>Vibe status selections (emoji-based status updates within or outside a hang)</li>
              <li>Heading Home / Home Safe status notifications</li>
              <li>Plan and hang details you create</li>
              <li>Shareable hang invite tokens you generate (see Section 4)</li>
            </ul>

            <h3 className="font-semibold mt-5">F. Usage and Diagnostic Data</h3>
            <p className="mt-2">We collect technical information for debugging and reliability:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>App version, OS version, device model</li>
              <li>Crash logs and structured request logs (via Google Cloud Logging)</li>
              <li>IP address (logged at sign-in and on rate-limited endpoints; retained for up to 30 days under Google Cloud Logging defaults)</li>
              <li>App performance metrics (via Google Cloud Monitoring)</li>
            </ul>
            <p className="mt-3">This information is used to maintain, debug, and improve the App.</p>

            <h3 className="font-semibold mt-5">G. Device Identifiers</h3>
            <p className="mt-2">We collect:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Firebase Cloud Messaging (FCM) device token, used to deliver push notifications</li>
              <li>Device install identifier via Airbridge, used for deep-link attribution (e.g., to track which marketing or invite link a user followed)</li>
            </ul>
            <p className="mt-3">
              We do not use device identifiers for cross-app tracking or
              advertising profiles.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">3. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Create and manage your account</li>
              <li>Enable and operate core App features (Group Hangs, in-hang map, Fit Check, in-hang chat, vibe status, Heading Home / Home Safe safety flows, friends presence layer, Instagram-handle quick-link, and shareable hang invite links)</li>
              <li>Render the public web invite preview at jortsapp.com/join/&lt;token&gt; for hangs whose host has enabled a shareable invite link</li>
              <li>Deliver push notifications related to your Group Hangs, safety confirmations, and product moments (e.g., a "what's the move tonight?" prompt and a morning-after recap prompt for the hangs you joined)</li>
              <li>Authenticate your identity and maintain session security</li>
              <li>Respond to support requests or communications from you</li>
              <li>Monitor App performance, diagnose errors, and improve features</li>
              <li>Comply with applicable legal obligations</li>
            </ul>
            <p className="mt-3">
              We do not use your information to serve targeted advertising,
              build advertising profiles, or sell your data to any third
              party.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">4. How We Share Your Information</h2>

            <h3 className="font-semibold mt-4">A. With Other Users</h3>
            <p className="mt-2">Certain information you provide is visible to other users by design:</p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Your display name and profile information are visible to friends you connect with in the App</li>
              <li>Your Instagram handle, if you set one, is visible on your profile to friends in the App and to anyone you authorize to view your profile</li>
              <li>Your live location (when sharing is on), vibe status, Fit Check photo, and chat messages are visible to participants in your active Group Hang</li>
              <li>Your vibe and approximate location are visible to mutual friends when you have enabled "Share my location with friends"</li>
              <li>Your Heading Home and Home Safe status is visible to participants in your active Group Hang</li>
            </ul>

            <h3 className="font-semibold mt-5">B. With Anyone Who Has a Shareable Invite Link</h3>
            <p className="mt-2">
              If you are the host of a Group Hang and you choose to mint a
              shareable invite link (a "Share to group chat, IG, or Snap"
              action in the lobby), Jorts publishes a public web preview at
              https://jortsapp.com/join/&lt;token&gt;. The preview contains:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>The hang name you set</li>
              <li>The host's first name</li>
              <li>The host's profile picture</li>
              <li>A count of how many people are currently in</li>
              <li>The hang's expiration time</li>
            </ul>
            <p className="mt-3">
              Anyone who possesses the link can view this preview without
              signing in, and anyone with the Jorts app installed can tap
              the link to join the hang directly. You can disable a
              shareable invite link at any time from the hang's invite menu;
              once disabled, the link returns a "this hang isn't available"
              response and stops working. Shareable links are scoped to a
              single Group Hang and expire when that hang ends. If you
              re-enable a shareable link after disabling it, a fresh token
              is issued — the previous link cannot be re-activated.
            </p>
            <p className="mt-3">
              You should treat the shareable invite link as semi-public.
              Anyone you give it to can pass it to other people. Do not
              enable a shareable invite link for a Group Hang whose
              composition you want to keep private.
            </p>

            <h3 className="font-semibold mt-5">C. With Third-Party Platforms You Choose to Share To</h3>
            <p className="mt-2">
              When you choose to share Group Hang content to a third-party
              platform (for example, Instagram Story or Snap Story) using
              the in-app share action, the content (a generated invite card
              image and the shareable-link URL) leaves Jorts and is governed
              by the receiving platform's privacy practices. We do not
              receive any data back from those platforms about what you
              posted or who viewed it.
            </p>

            <h3 className="font-semibold mt-5">D. With Service Providers</h3>
            <p className="mt-2">
              We share information with the following trusted third-party
              service providers. Each provider is contractually limited to
              using your data only to provide services to Jorts and may not
              use it for their own purposes.
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>MongoDB Atlas</strong> — Primary database. Stores user, hang, plan, message, presence, and shareable-link token data.</li>
              <li><strong>Neo4j Aura</strong> — Social-graph database. Stores friend relationships.</li>
              <li><strong>Google Cloud Run</strong> — Application hosting (backend API). Receives all HTTP traffic to the App's backend.</li>
              <li><strong>Google Cloud Storage</strong> — Photo storage (profile pictures, Fit Check images).</li>
              <li><strong>Google Cloud Logging, Monitoring, Trace</strong> — Operational logging, metrics, and tracing.</li>
              <li><strong>Google Cloud Scheduler</strong> — Triggers timed product moments (the 7 PM "what's the move" prompt and the 9 AM morning-after recap) by calling internal backend endpoints.</li>
              <li><strong>Vercel</strong> — Web hosting for jortsapp.com. Serves the shareable invite preview page and the apple-app-site-association file used by iOS Universal Links.</li>
              <li><strong>Google Sign-In</strong> — Authentication.</li>
              <li><strong>Sign in with Apple</strong> — Authentication.</li>
              <li><strong>Firebase Cloud Messaging (Google)</strong> — Push notification delivery.</li>
              <li><strong>Google Maps (via react-native-maps)</strong> — Renders the in-hang map.</li>
              <li><strong>Airbridge</strong> — Deep-link attribution and install tracking.</li>
            </ul>
            <p className="mt-3">
              CometChat appears in our codebase but is currently disabled
              for the current release. If we re-enable it in a future
              version we will update this policy and the App Store Privacy
              Label accordingly.
            </p>

            <h3 className="font-semibold mt-5">E. Legal Requirements and Safety</h3>
            <p className="mt-2">
              We may disclose your information if required by law,
              regulation, or legal process, or if we believe in good faith
              that disclosure is necessary to protect the rights, property,
              or safety of the Company, our users, or the public.
            </p>

            <h3 className="font-semibold mt-5">F. Business Transfers</h3>
            <p className="mt-2">
              In the event of a merger, acquisition, financing,
              reorganization, or sale of all or substantially all of our
              assets, your information may be transferred as part of that
              transaction. We will provide notice within the App or by
              other reasonable means before your information becomes
              subject to a materially different privacy policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">5. Data Retention</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Account profile information</strong> — Retained until you delete your account.</li>
              <li><strong>Friend graph</strong> — Retained until you delete your account.</li>
              <li><strong>Crew / Group Hang messages</strong> — Retained indefinitely as part of hang history; deleted when the parent hang record is deleted or when you delete your account.</li>
              <li><strong>Plans / Hangs</strong> — Retained indefinitely but hidden from feeds after the scheduled day passes.</li>
              <li><strong>Shareable invite tokens</strong> — Retained while the hang is active and shareable; cleared when the host disables shareable mode, when the hang ends, or when the user deletes their account.</li>
              <li><strong>Photos</strong> — Retained in Google Cloud Storage until you delete them, delete the parent record, or delete your account.</li>
              <li><strong>Live location pings</strong> — Not persisted as a log — the most-recent location is overwritten as new pings arrive; cleared when sharing is turned off.</li>
              <li><strong>IP addresses in logs</strong> — Up to 30 days.</li>
              <li><strong>Authentication tokens</strong> — Access tokens expire after 30 days; refresh tokens valid for 30 days from issuance.</li>
            </ul>
            <p className="mt-3">
              You may request deletion of your account and associated data
              at any time via Profile → Delete Account, or by contacting us
              at the address in Section 11.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">6. Data Security</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li>Encrypted data transmission (TLS) between the App, the website, and our servers</li>
              <li>Encrypted storage at rest in MongoDB Atlas, Neo4j Aura, and Google Cloud Storage</li>
              <li>Authentication tokens stored on your device in the iOS Keychain rather than plain device storage</li>
              <li>Access controls limiting which Company personnel can access user data</li>
              <li>Authentication via established OAuth providers (Google, Apple) rather than self-managed passwords</li>
              <li>Rate limiting and request validation at the API edge</li>
            </ul>
            <p className="mt-3">
              No method of transmission over the Internet or electronic
              storage is 100% secure, and we cannot guarantee absolute
              security.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">7. Children's Privacy</h2>
            <p>
              The App is not directed to children under the age of 13, and
              we do not knowingly collect personal information from
              children under 13. If we learn that we have collected personal
              information from a child under 13, we will delete that
              information promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">8. Your Rights and Choices</h2>
            <ul className="list-disc pl-6 mt-2 space-y-1">
              <li><strong>Access</strong> — Request a copy of the personal information we hold about you.</li>
              <li><strong>Correction</strong> — Request correction of inaccurate or incomplete data.</li>
              <li><strong>Deletion</strong> — Request deletion of your account and associated personal data (you can also delete your account at any time from Profile → Delete Account in the App).</li>
              <li><strong>Withdrawal of Consent</strong> — Withdraw consent to location, contacts, or photo/camera access at any time through your device settings.</li>
              <li><strong>Push Notifications</strong> — Opt out of push notifications at any time through your device settings.</li>
            </ul>
            <p className="mt-3">
              California residents: We do not sell personal information. To
              exercise your CCPA rights, contact us as described in
              Section 11.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">9. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. When we
              do, we will revise the "Last Updated" date at the top of this
              document. For material changes, we will provide notice within
              the App or by other reasonable means. Continued use of the
              App after the effective date of any changes constitutes your
              acceptance of the revised policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold mb-3">10. Contact Us</h2>
            <p>
              If you have questions, concerns, or requests regarding this
              Privacy Policy or our data practices, please contact us:
            </p>
            <p className="mt-3">
              <strong>If You Know You Know, Inc.</strong>
              <br />
              Charlotte, North Carolina
              <br />
              Email: <a href="mailto:legal@jortsapp.com" className="underline">legal@jortsapp.com</a>
            </p>
          </section>
        </article>

        <footer className="mt-16 pt-8 border-t border-navy/10 text-sm text-navy/60">
          <a href="/terms" className="underline mr-6">Terms of Use</a>
          <a href="mailto:legal@jortsapp.com" className="underline">legal@jortsapp.com</a>
        </footer>
      </div>
    </main>
  );
}
