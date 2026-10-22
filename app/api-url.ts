/**
 * Where this site's API lives.
 *
 * It used to be declared in fourteen separate files, each with its own
 * copy of the same line — and the default every one of them fell back
 * to, `https://api.getjorts.com`, does not resolve. It is not a slow
 * host or a wrong path; the name is dead.
 *
 * Nothing had caught fire because Vercel sets NEXT_PUBLIC_API_URL in
 * production, so the dead default was never reached. That is exactly
 * what made it worth fixing: the day the variable is missing — a new
 * preview deployment, a renamed project, a typo — every page here
 * fails to fetch and recovers into its own empty state. The invite
 * page would draw "You're invited" with no plan on it and the link
 * preview would render the same, both looking deliberate.
 *
 * So: one place, and a default that is the real API. If the variable
 * goes missing now, the site still works.
 */
export const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  'https://jorts-api-944215515278.us-central1.run.app';
