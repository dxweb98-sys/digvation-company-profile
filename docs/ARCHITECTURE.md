# Architecture

The approved React/Tailwind company profile replaces the previous Astro runtime. Vite creates a browser bundle and a temporary server bundle; `scripts/prerender.ts` uses the same React tree to generate complete localized HTML. Ordinary navigation uses real links and new documents. There is no catch-all SPA rewrite. Cloudflare serves clean `.html` routes and localized 404 files. Historical paths are permanently redirected.

Dependencies point inward: presentation consumes application and domain, infrastructure implements the domain content repository, and the domain has no browser or React dependency. Pages do not fetch remote content directly.

Eight JSON files form one validated snapshot: site, id, en, services, products, works, campaigns, legal. Local JSON is the default. R2 may use an immutable directory or `latest.json`, whose release identifier selects a single immutable directory. A failed remote request, unsafe manifest, invalid schema, duplicate slug, missing translation or broken proof reference fails the build. There is no silent fallback to stale local content.

All editable project text, status, order, images, live links, gallery, SEO, campaign proof, product flows and legal policy are data. Structural UI and illustrative interactions remain code. The server-rendered body, browser hydration, metadata, and sitemap consume the same snapshot. Updating only browser state would not create SEO-ready new routes, so publication requests a static rebuild.

The real portfolio is Poseidon Filter and Leaf Lab. Home features ordered, published work marked `featured`; Work filters all non-draft entries. Illustrative product surfaces are labeled as examples and carry sample data, not client results.

`/api/inquiry` accepts the existing form contract and supports webhook or Resend. Domain validation, actual 64KB limits, honeypot, same-origin checks, timeout bounds and optional server Turnstile verification precede delivery. Resend must return an email ID. Dry-run and honeypot responses have `delivered:false`. Client success and `contact_success` require `delivered:true`. Secrets never enter the content snapshot.

The legacy PUBLIC_GA_ID, PUBLIC_GTM_ID, PUBLIC_CLARITY_ID, PUBLIC_ANALYTICS_MODE, PUBLIC_WHATSAPP_NUMBER, PUBLIC_TURNSTILE_SITEKEY and PUBLIC_GOOGLE_SITE_VERIFICATION remain supported. Optional direct Meta Pixel is supported, but must not also be installed in GTM. Tags load according to the selected mode; consent is default. Event payloads allowlist business context and exclude form values and query strings. Clarity masks the complete inquiry form.

Core navigation, copy, screenshots, legal pages and detail links remain in static HTML. Tabs, demonstrations, motion, consent choices and the enhanced inquiry flow require JavaScript. Forms use POST even without enhancement, so personal fields cannot be submitted into a GET URL. Motion respects reduced-motion preferences and content is initially visible before enhancement.
