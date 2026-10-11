# Repository handoff

## Active repository

The owner selected `https://github.com/dxweb98-sys/digvation-company-profile.git` as the publication target on 2026-10-11. The connected account has write access to this repository. The previous access blocker applies to `dickyd9/digvation-company-profile` only.

The rebuilt application is published to `development` for review. `main` is the future production branch; promote the application there only after the owner's approval. The new repository was empty. Commit `c5d7ff7332f19a0be6945feae580998b28a21ae7` initializes `main` with a README as the review baseline. No application or deployment is part of that baseline.

## Migration

The verified implementation and review fixes come from local commit `f3debc925ae59ed13ba12e0822951fe3f6037028`, based on the original repository's `a099d355743188368b508867bb8df2c4efa1c7c9`. The GitHub integration publishes the complete tracked source snapshot on top of the new baseline. This creates new commit IDs; it does not import the original commit ancestry. The original history remains available in the delivered Git bundle and original repository.

Required assets, editable JSON, source, tests and configuration are included. Generated output and dependencies remain untracked. The complete quality gate passed before publication: formatting, ESLint, TypeScript, 34 tests, production build and static output audit.

## Cloudflare

When ready, connect this repository to Cloudflare Pages and use `development` for preview. Build with `npm run build`, output `dist`, and Node 22.20. Keep production promotion separate from preview review. Configure inquiry delivery, Turnstile and measurement before validating those external services.

No Cloudflare deployment, R2 upload or real email delivery was performed during this repository migration. See [Cloudflare setup](PRE_DEPLOY_CLOUDFLARE.md) and [QA](QA_REVIEW.md) for the remaining account-dependent checks.
