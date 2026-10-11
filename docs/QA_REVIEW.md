# Digvation company profile QA

This review covers the React/Tailwind migration against the approved visual direction and the original repository contracts. Static rendering is checked separately from live Cloudflare services.

## Content and evidence

- Poseidon Filter and Leaf Lab are the two published real projects. Original screenshots, live destinations, qualitative case studies and localized SEO remain in the data layer.
- Interactive product scenes are labeled as illustrations with example data. They do not claim client results.
- The About page states that Digvation has helped small and medium businesses since 2022. Larger-company work is an ambition tied to future capability and reputation.
- Indonesian is the default, with equivalent English routes. Public copy has no em dashes, invented metrics, clients, testimonials or published price promises.
- The full photographic hero, dark overlay and centered headline remain intact. Home uses seven alternating sections without stacking extra proof panels into the page.

## Automated gate

Commands: npm run format:check and npm run qa. The latter includes ESLint, TypeScript, Vitest, production compilation, static rendering and output auditing. Final result: Prettier, ESLint, TypeScript and all 34 tests in 10 files passed. Production rendering and the output audit passed. The Unix fake-AWS upload-race test skips on Windows; the missing-asset publication and browser component tests remain portable.

Build audit checks one H1, unique titles, metadata, canonical/language alternates, valid JSON-LD, local link and asset targets, noindex policy and the sitemap. The current route inventory contains 26 localized pages, two error pages and 20 indexable sitemap URLs. Generated artifacts, dependencies, temporary viewport fixtures and secrets are excluded from git.

## Rendered browser checks

The production build was served through the managed local preview at terminal.local:4173 and checked in the cloud Chrome browser.

- Desktop: approved hero, services and About comparisons; real Work listing and Leaf Lab detail; ID/EN counterpart navigation; real outbound destination; report illustration; real-project carousel.
- Keyboard: service tabs respond to ArrowRight; mobile menu loops focus, closes with Escape and returns focus to the trigger.
- Mobile: 390 x 844 hero comparison. Width 320 layouts were checked for services, work, products, About, Contact and both product details. Content remained within the viewport.
- Tablet: 768-wide Contact and 1024-wide Products had matching document/client widths and no horizontal overflow.
- Products: changing the example service and saving a transaction updated the labeled demo confirmation to Hair spa and Rp 120.000. The real product detail exposes audience, use flow, connected features, availability and FAQs.
- Campaign: the first native FAQ expanded with its expected answer. The ID/EN duplicated conjunction in the preserved campaign headline was corrected.
- Contact: empty submission marked invalid fields and focused the first error. A local endpoint failure showed an explicit unsent state, retained the sample brief and did not produce a success conversion.
- Production console: no application or hydration errors observed. Browser-extension metadata errors were unrelated to the app. The intentionally unavailable local inquiry endpoint produced the expected failed request.

Reduced motion was checked in CSS/source: reveal content stays visible and nonessential transitions/scroll effects are removed. The browser does not expose preference emulation, so an actual OS-level reduced-motion check remains a preview check.

Evidence and fidelity comparison: ../design-qa.md and ./qa/.

## Contract tests and external configuration

Inquiry tests cover actual body limits, origin rejection, validation, consent, honeypot/dry-run non-delivery, confirmed provider acceptance and provider failure. Frontend transport requires both ok:true and delivered:true. Analytics mock tests cover rejected/invalid consent, single provider initialization, one explicit page view, sanitized GA configuration/event URLs and exclusion of private form fields. Rendered component tests cover fresh Turnstile tokens after failure and deduplicated service views. See CODE_REVIEW.md for the independent review and follow-up fixes.

R2 tests validate one complete immutable release and strict manifest behavior. The eight-file publisher dry run succeeded without uploading data or calling a deploy hook. Local Wrangler 4.149.0 compilation of the inquiry Worker succeeded without deploying. Content changes need a successful rebuild to update static pages and SEO.

Live R2 credentials, Cloudflare headers/redirect status, Turnstile, webhook/Resend delivery, acknowledgements and vendor dashboard events have not been exercised against an account. Check these on a configured development deployment. No production deployment was requested or performed.
