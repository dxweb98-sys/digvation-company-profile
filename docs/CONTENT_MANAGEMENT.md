# Content Management

## Edit data, keep React unchanged

| File                                 | What you edit                                                               |
| ------------------------------------ | --------------------------------------------------------------------------- |
| `content/site.json`                  | Identity, 2022 foundation, tagline, hero, contact, public tracking settings |
| `content/id.json`, `content/en.json` | Page copy, navigation, process, after-sales, about story and UI labels      |
| `content/works.json`                 | Real project stories, screenshots, links, order, visibility and metadata    |
| `content/products.json`              | Product status, audience, use cases, flow, features, FAQs and availability  |
| `content/services.json`              | Services and deliverables                                                   |
| `content/campaigns.json`             | Paid landing pages, publication, proof, localized tracking and SEO          |
| `content/legal.json`                 | Complete privacy and terms policies in both languages                       |

Every localized field contains `id` and `en`; UI copy keys must match. Run `npm run validate:content` to validate the configured build source. The publication command independently validates local JSON and local assets, regardless of CONTENT_BASE_URL, then uploads the exact validated snapshot. Never insert credentials in any JSON: the public snapshot reaches browser visitors.

## Real work

Copy an existing entry and change its unique `id` and `slug`. Supply approved title, category (`website`, `system`, `product`), summary, context, solution, result, services, steps, image and optional gallery/liveUrl/year/industry/challenge/localized SEO. Use exact screenshots and qualitative results when no measured result is available. The original Poseidon Filter and Leaf Lab content remains the initial source of truth.

Set `status: published` to publish; `status: draft` hides the item and its detail routes. `status: demo` is an explicitly labeled concept with noindex detail metadata. Keep the real work collection for delivered work. `order` sorts the directory; `featured: true` includes published work on Home. Gallery and image accept a local public path or an HTTPS asset URL. For new R2-hosted projects use HTTPS screenshots, so no React or local asset change is needed. Changing a live slug requires a permanent redirect from the old one.

Campaigns use a unique slug and `proofProject` pointing to a published real work ID. Drafts have no routes. Published campaigns build both `/campaign/<slug>` and `/en/campaign/<slug>`. `noindex:true` keeps paid duplicates out of the sitemap. The existing B2B campaign remains published and noindex. Prices and testimonials remain unpublished until actual evidence and values are supplied.

## Simplest workflow: GitHub JSON

Edit JSON through GitHub's file editor or locally, review the bilingual data diff, and commit to the intended branch. A configured Cloudflare Git integration rebuilds it automatically. This changes content files; React components stay unchanged. Use development for preview, then promote through the normal review process.

## R2 workflow

1. Create a bucket and a public custom asset domain. Create bucket-scoped access keys for the maintainer. Keep writes private; public visitors need only read access.
2. Use separate prefixes for preview and production. Set Cloudflare development `CONTENT_BASE_URL` to `https://<asset-domain>/content/development/latest.json`.
3. Install AWS CLI and configure its R2 access through ignored environment variables in `.env.example`: R2_ACCOUNT_ID, R2_CONTENT_BUCKET, R2_CONTENT_PREFIX, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY. Use the R2 account's S3 endpoint and region auto. No key is bundled in React.
4. Create a Cloudflare Pages deploy hook explicitly targeting development. Put it in DEVELOPMENT_DEPLOY_HOOK_URL as a secret. Keep main as the production branch.
5. Edit the local content JSON and supply the image URLs. Run `npm run content:publish -- --dry-run`, then `npm run content:publish` when ready to publish that preview content. The command validates local content, uploads all eight immutable files, updates latest.json last, and requests the development rebuild. It prints no credential or hook URL.
6. The new pages and SEO appear when the Cloudflare build and deployment finish. Inspect development before promoting production. A failed build leaves the previous successful site deployment available.

The manifest contains only `{"schemaVersion":1,"release":"<release-id>"}`. Files live at `<prefix>/releases/<release-id>/<name>.json`; never overwrite an existing release. Roll back by pointing latest.json to a known complete release and triggering the same development rebuild. Raw dashboard edits to individual R2 objects do not themselves trigger a build; use the publication command, a hook integration, or a deliberate rebuild.

The optional content-update workflow can validate a remote snapshot and trigger a development hook. Set GitHub variable DEVELOPMENT_CONTENT_BASE_URL and secret DEVELOPMENT_DEPLOY_HOOK_URL. Repository-dispatch requires the workflow to exist on the repository default branch; until the refactor is promoted there, use the publisher command or Cloudflare hook directly. Nothing in this refactor provisions accounts or runs a remote publication automatically.

References: https://developers.cloudflare.com/r2/examples/aws/aws-cli/ and https://developers.cloudflare.com/pages/configuration/deploy-hooks/ .
