# Security review

Server delivery uses the existing form endpoint. Unsupported content types and actual bodies above 64KB are rejected. Validation requires name, email, at least 20 characters of context and explicit form consent. Honeypot requests are accepted without delivery; same-origin checks reject a mismatched Origin header. Turnstile, when configured, is verified on the server against the allowed hostnames before sending.

Webhook credentials and Resend/Turnstile secrets remain runtime-only. Resend sends an escaped internal notification with Reply-To; a returned email ID confirms provider acceptance. Visitor acknowledgement failure does not negate the accepted internal notification. Provider requests have bounded timeouts. Dry-run and honeypot never emit a delivered lead. The client preserves errors and prevents repeated active submission.

CSP, frame denial, MIME protections, referrer policy, permissions policy, HSTS and immutable hashed-asset caching remain configured. Remote image origins are derived from the validated snapshot and added to the built CSP. Optional analytics providers and Turnstile have explicit script/connect allowlists. Additional marketing vendors need a deliberate header update; do not silently broaden the policy.

R2 public content is read-only to visitors. The maintainer publisher uses environment credentials and an external AWS CLI, uploads immutable files first and swaps the pointer last. It does not print keys or hook URLs. A raw object edit is not an automatic deployment. Use bucket-scoped access and separate development/production prefixes and hooks.

The local suite checks input/delivery/consent contracts without contacting real mail or webhook recipients. Production headers, credentials, email delivery, provider dashboards, Turnstile registration, rate-limit/WAF rules and operational retention remain deployment checks. Keep those external limitations explicit.
