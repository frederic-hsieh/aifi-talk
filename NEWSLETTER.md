# Newsletter setup

The build inserts one localized signup form near the midpoint of every article, at a top-level Markdown block boundary. `api/newsletter.js` is a Vercel Node function; `lib/newsletter.js` remains server-only. Static-only hosting cannot process subscriptions.

Required Vercel environment variables (Preview and Production, stored as sensitive):

- `RESEND_API_KEY`: Resend key with permissions for sending email and managing Contacts. A sending-only key cannot save subscriptions.
- `NEWSLETTER_FROM`: a sender on a domain verified in Resend, e.g. `AiFi Talk <newsletter@updates.aifitalk.com>` after that subdomain is verified.
- `NEWSLETTER_TOKEN_SECRET`: independent random secret, at least 32 characters. Keep stable across deploys; changing it invalidates confirmation and unsubscribe links.
- `SITE_URL`: canonical origin, defaults to `https://aifitalk.com`. Use the preview origin when testing a preview, so confirmation links stay on that deployment.

No secrets are bundled into the static site. Configure email before release. Do not publish the form with an unconfigured API.

Flow: signup sends a confirmation email; opening the link shows a confirmation button. Only pressing the button creates a Resend Contact. Links expire after one hour. Unsubscribe links do not expire and require a button press, so mail link scanners do not alter subscriptions. The email contains both links. Newsletter issues should be sent with Resend Broadcasts and their managed unsubscribe link, which respects the Contact's unsubscribed state.

Existing unsubscribed contacts are never automatically reactivated, even through an old confirmation link. Rejoining currently requires author assistance. Existing subscribed contacts can confirm again without duplicate creation. Contact creation is not followed by a separate welcome email; the confirmation message is the live delivery test.

Basic abuse controls: same-origin checks, honeypot, five requests per minute per IP per running function instance. This in-memory throttle is not a distributed limit and resets on cold starts. Before public release, configure a Vercel Firewall rate-limit rule for POST `/api/newsletter` or add a verified challenge. Do not treat the application throttle as comprehensive spam protection.

Verification: `npm run build && npm test`. Provider tests mock Resend and cannot prove live delivery, provider persistence, permissions, DNS, or deployment routing. For end-to-end verification, submit the owner's real email in a configured deployment, find the confirmation email in Gmail, click the confirmation button, inspect the saved Resend Contact, reload, then verify unsubscribe. Test Preview separately before production.
