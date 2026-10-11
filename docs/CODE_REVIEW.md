# Final branch review

The required independent review compared a099d355743188368b508867bb8df2c4efa1c7c9 with 95a81ad8191a8a07566c4d9320709c73f3e903b2. It found no Critical issues, two Important issues and two Minor issues. The fixes below are the single follow-up pass.

| Finding                                                                              | Fix and verification                                                                                                                                                                                                                         |
| ------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GA default page URL/referrer could retain query strings                              | Explicit sanitized page_location and page_referrer in configuration and every event. Regression checks provider arguments, including a query-bearing referrer.                                                                               |
| Retried inquiry could reuse a consumed Turnstile token                               | Clear token, remount challenge after failure, ignore disposed callbacks, and keep submit disabled until a new token. Rendered component test covers failed delivery, retained brief, stale callback and successful retry with a fresh token. |
| Publisher could validate a remote build snapshot instead of local publication assets | Publisher validates its own local schema/assets and uploads that loaded snapshot through stdin. Tests cover missing local assets despite CONTENT_BASE_URL and a file edit during an upload.                                                  |
| Service view measurement was documented but absent                                   | Measure the initial/hash-selected service after selection resolves and deduplicate revisited tabs. The common tracking transport still enforces consent. Component test covers hash selection and revisits.                                  |

The first three regression scenarios and absent service measurement were observed failing before the fixes; the same targeted suite passed afterward. Actual third-party dashboards, R2 uploads, email delivery and hosted Cloudflare behavior remain configuration-dependent checks. A local Wrangler Pages Functions compilation succeeded with Wrangler 4.149.0 without deploying.

References: https://developers.google.com/analytics/devguides/collection/ga4/reference/config and https://developers.cloudflare.com/turnstile/get-started/server-side-validation/ .
