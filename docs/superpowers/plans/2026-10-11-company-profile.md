# Company profile refactor plan

Spec: `docs/superpowers/specs/2026-10-11-company-profile.md`

Global constraints: preserve real evidence and inquiry delivery; ID/EN parity; no secrets or generated output committed; update obsolete architecture documentation; no production deployment. Base: a099d355743188368b508867bb8df2c4efa1c7c9. Isolated branch: refactor/partner-digital-company-profile.

## Task 1: Content and React foundation

Files: `content/*.json`, `src/domain`, `src/application`, `src/infrastructure/content-repository.ts`, `src/presentation`, build scripts and package configuration.

Interfaces: bundle schema produces validated bilingual content; route/SEO/application consume it. Migrate the approved frontend, retain original work assets, add the verified 2022 story. Preserve legal/campaign routes and permanent aliases for old paths. Write behavior tests before new route/content behavior, then implement.

Verification: content contracts and route/SEO tests, TypeScript, production build audit. Expected: real work routes and bilingual campaigns render; campaign/draft policies respected; no demo is presented as client work.

## Task 2: Inquiry and measurement continuity

Files: `functions/api/inquiry.ts`, pure inquiry validation, `src/infrastructure/contact.ts`, `src/infrastructure/analytics.ts`, Contact and Layout, inquiry/analytics tests.

Interfaces: browser sends the existing form fields to `/api/inquiry`; backend explicitly reports delivered state. Analytics consumes only confirmed delivery and allowlisted non-PII context. Keep PUBLIC_* variables and Resend/webhook/Turnstile functionality.

Verification: write and run failing tests for dry-run/honeypot conversion, provider error, multipart compatibility, consent, sanitized analytics. Expected: only actual accepted provider delivery is successful; drafts, dry-run and failure never count as leads.

## Task 3: Content updates and repository maintenance

Files: `.github/workflows`, `.env.example`, `_headers`, `_redirects`, README and referenced docs.

Interfaces: local/R2 content snapshots feed build; `repository_dispatch`/manual workflow triggers Cloudflare preview rebuild through a secret hook. No public write credential. Update CI for development and document versioned uploads and rollback. Remove Astro sources/config only after auditing references and replacing consumers.

Verification: `npm run format:check`, `npm run qa`, reference and secret scan. Expected: clean quality gate, accurate docs, no stale runtime imports or generated files staged.

## Task 4: Browser verification and integration

Files: QA evidence/docs; reviewed source commits.

Verify full-image home, real project filters/details/live links, product flows, about story, contact errors, consent, language switching, mobile menu, keyboard focus and reduced motion. Run one fresh whole-branch reviewer, fix important findings and rerun relevant checks. Create a development branch from main if absent, PR this branch to it, inspect checks and merge without touching main. If remote permission blocks integration, deliver the complete tested change and exact access blocker.

Review focus: remote content cross-references and publication rules; redirects and noindex; lead false positives; GTM/GA duplicates; PII in analytics; Turnstile configuration; English parity; mobile overflow; real evidence integrity.
