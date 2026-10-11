# Digvation company profile

React, TypeScript, Tailwind CSS and Vite. Every public route is rendered to static HTML at build time; Cloudflare Pages serves the files and the existing `/api/inquiry` function handles delivery. Indonesian is the default language, with a complete English counterpart.

## Repository and review

The active repository is [dxweb98-sys/digvation-company-profile](https://github.com/dxweb98-sys/digvation-company-profile). Review and preview the rebuilt website on `development`. Promote it to `main` only after the owner's approval. The initial `main` commit contains only a README so the full website can be reviewed separately. See [Repository handoff](docs/REPOSITORY_HANDOFF.md) for the migration context.

## Run and verify

Use Node 22.20 (the CI version) or Node 24. Run `npm ci`, then `npm run dev`. `npm run build` validates content, compiles both browser and server bundles, renders all pages, and audits the result. `npm run preview` serves production output. `npm run preview:pages` runs Pages Functions locally after a build; copy `.dev.vars.example` to an ignored `.dev.vars` for dry-run testing.

Required checks: `npm run format:check` and `npm run qa`. QA includes lint, TypeScript, unit tests, build, metadata, translation parity, links and asset audits. Generated `dist`, `.server` and `src/generated` stay untracked.

## Structure

| Location                   | Responsibility                                                                |
| -------------------------- | ----------------------------------------------------------------------------- |
| `content/`                 | Editable bilingual site, services, products, real work, campaigns, legal copy |
| `src/domain/`              | Content schemas, locale and inquiry rules; no React                           |
| `src/application/`         | Routes, SEO, brief validation                                                 |
| `src/infrastructure/`      | JSON/R2 loading, consent-aware measurement, inquiry transport                 |
| `src/presentation/`        | React pages, shared UI, interactions, styles                                  |
| `scripts/`                 | Content validation/publication, static rendering and build audits             |
| `functions/api/inquiry.ts` | Cloudflare server validation, Turnstile, webhook/Resend delivery              |

## Update content without editing React

Start with the checked-in JSON. Edit the JSON through GitHub or an editor, add approved screenshots, and commit the data change. Cloudflare Git integration builds the updated pages automatically when configured.

For R2, set `CONTENT_BASE_URL` to a version directory or a manifest such as `https://assets.example.com/content/development/latest.json`. The maintainer command `npm run content:publish` validates local content, uploads a complete immutable release using AWS CLI, updates the manifest last, then requests a development rebuild if the secret hook is configured. `npm run content:publish -- --dry-run` prints the publication plan without uploading or deploying. There is no CMS admin or write credential in the browser.

Read [Content Management](docs/CONTENT_MANAGEMENT.md) for exact fields, setup, publishing and rollback. Static HTML and new detail URLs become visible after the successful build and deployment, not immediately after a raw R2 object edit.

## Deploy later

Cloudflare Pages: custom/Vite preset, build `npm run build`, output `dist`, Node 22.20. Keep production on main and configure development as a preview branch. Preserve the public environment variables in `.env.example`; credentials belong in Cloudflare secrets. `/api/inquiry` keeps webhook and Resend support. The frontend requires `{ok:true, delivered:true}` before reporting success or emitting `contact_success`.

See [Cloudflare setup](docs/PRE_DEPLOY_CLOUDFLARE.md), [Measurement](docs/MEASUREMENT.md), [Architecture](docs/ARCHITECTURE.md), [QA](docs/QA_REVIEW.md), and [Asset credits](docs/ASSET_CREDITS.md). This refactor does not deploy production or launch ads.
