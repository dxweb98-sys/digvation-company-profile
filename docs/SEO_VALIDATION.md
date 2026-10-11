# SEO validation

Routes, metadata, canonical URLs, language alternates, JSON-LD, Open Graph and Twitter cards come from the same validated content snapshot. Real case-study SEO is preserved from the original repository. Organization schema states the founder-confirmed 2022 founding year without inventing address, awards or client metrics.

Build-time rendering writes complete HTML for each ID and EN route. New published content generates detail pages without React edits. Draft details are absent. Demonstration details, legal pages, errors and campaigns marked noindex are excluded from the sitemap. The existing B2B paid page remains noindex. FAQ structured data on product/campaign pages uses the same answers as visible FAQs.

Permanent redirects preserve old /solutions, /work, /about, /contact, /privacy, /terms, /process and legacy solution links. Existing work slugs remain unchanged under localized paths. The old sitemap-index.xml and sitemap-0.xml map to sitemap.xml. Unknown URLs use actual Cloudflare 404 handling; there is no SPA fallback rewrite.

`scripts/verify-build.ts` audits H1 count, unique titles, canonical, ID/EN/x-default alternates, JSON-LD validity, sitemap policy, local link and asset existence and error output. Verify clean-route/redirect/header behavior on Cloudflare after deployment because Vite preview is not the Pages edge.
