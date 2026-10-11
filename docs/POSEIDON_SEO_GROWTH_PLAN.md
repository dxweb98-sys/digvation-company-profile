# Poseidon Filter — SEO & Acquisition Growth Plan

Audit date: 2026-08-18

This is a public-surface audit of `https://poseidonfilter.id/`. It is not a source-code audit. The public search surface confirms that Home, Product, About Us, and Contact are discoverable, but the current snippets are still generic (for example `Product - POSEIDON` and `About Us - POSEIDON`). Treat the site as having a basic indexing foundation, not a complete organic acquisition system.

## 1. Organic search

### Priority A — page architecture

Create dedicated crawlable URLs for important product/category intent instead of relying only on one broad `/product` page when the content is substantial enough.

Potential structure:

```text
/product
/product/reverse-osmosis
/product/water-purifier
/product/ultrafiltration-pvdf
/product/dispenser
/product/standard-ro-system
/product/accessories
```

Only create pages that have enough unique, useful content. Do not create thin SEO pages.

### Priority B — metadata

Every indexable page should have a specific title and meta description.

Direction:

```text
Reverse Osmosis Membrane | Poseidon Filter Technology
Water Purifier untuk Residential & Commercial | Poseidon
Ultrafiltration PVDF | Poseidon Filter Technology
```

Avoid generic titles such as `Product - POSEIDON` when the page can describe the actual search intent.

### Priority C — content that answers buying questions

For each important product/category, explain:

- what problem the product solves
- suitable use cases
- residential / commercial / industrial applicability
- key specifications that matter to buyers
- how to choose a variant
- installation / maintenance context where accurate
- FAQ based on real sales questions
- clear sales/contact CTA

Do not publish filler articles purely for keyword volume.

### Priority D — internal linking

Connect:

```text
Home
→ product category
→ product / solution detail
→ related educational article
→ Contact / WhatsApp
```

Use descriptive anchor text instead of repeated `Learn more` links.

### Priority E — structured data

Use only truthful schema that matches visible page content:

- Organization
- WebSite
- BreadcrumbList
- Product / ProductGroup where product data is sufficient
- LocalBusiness if the business information is accurate and appropriate

Do not invent price, availability, review, rating, or address data.

### Priority F — local SEO

Poseidon's public search result exposes a Tangerang address. If that remains the official business location, keep Name / Address / Phone consistent across:

- website
- Google Business Profile
- social profiles
- directories/citations that are genuinely relevant

Create location content only where the business genuinely operates or serves customers. Do not generate fake city pages.

## 2. Measurement for organic SEO

Connect Google Search Console and review at least:

- impressions
- clicks
- CTR
- average position
- query
- landing page
- device
- country / relevant geography

The important question is not only `How much traffic?`, but:

```text
Which search query
→ entered which page
→ viewed which product
→ clicked WhatsApp / contact
→ submitted an inquiry
```

## 3. Website analytics

Use GA4 through one analytics/tagging layer. Track meaningful events such as:

```text
view_product
view_product_category
search_product
click_whatsapp
click_phone
contact_started
generate_lead
form_error
catalog_download (if introduced)
```

Mark `generate_lead` as a key event once the lead action is verified.

Do not track sensitive form values as analytics parameters.

## 4. Paid acquisition (non-organic)

Paid traffic is not SEO. Treat it as SEM / paid acquisition and connect it to the same conversion measurement.

### Google Search Ads

Best first paid channel when users already search with clear intent, for example product/problem-based queries.

Campaign architecture should separate intent, not dump every keyword into one ad group.

Example intent groups:

```text
Reverse Osmosis / RO
Water Purifier
Ultrafiltration / PVDF
Industrial Water Treatment
Commercial Water Treatment
Brand / Poseidon
```

Each ad should land on the most relevant page, not always the homepage.

### Retargeting

After enough traffic and appropriate consent setup, retarget visitors who showed meaningful intent but did not inquire, such as visitors who viewed product detail pages.

### Meta / social ads

Use primarily when there is a strong visual offer, educational content, or audience strategy. Do not assume it replaces high-intent Search campaigns for technical products.

## 5. Paid conversion tracking

Measure at minimum:

- submitted inquiry
- WhatsApp contact click
- phone click
- qualified lead if CRM/offline feedback becomes available

Connect Google Ads conversion measurement to the real business outcome. Avoid optimizing campaigns only for page views or button clicks if lead data is available.

Use UTMs consistently for non-Google campaigns.

Recommended convention:

```text
utm_source=google
utm_medium=cpc
utm_campaign=ro_indonesia
utm_content=search_ad_a
```

For Meta:

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=<campaign>
utm_content=<creative>
```

## 6. Funnel dashboard

A useful weekly dashboard should show:

```text
SEARCH / ADS
    ↓
LANDING PAGE
    ↓
PRODUCT / CATEGORY VIEW
    ↓
WHATSAPP / CONTACT START
    ↓
LEAD
    ↓
QUALIFIED LEAD
    ↓
SALE
```

Track organic and paid separately, then compare:

- cost per lead
- qualified-lead rate
- landing-page conversion rate
- top organic queries
- top converting landing pages
- paid search terms
- WhatsApp conversion by campaign

The website should ultimately answer which acquisition source creates real business opportunities, not merely which source creates traffic.

## 7. Recommended implementation order

1. Verify Search Console + sitemap/indexing.
2. Install/verify GA4 and conversion events.
3. Improve page titles/descriptions and heading hierarchy.
4. Create useful dedicated product/category URLs.
5. Add Organization/Breadcrumb/Product/LocalBusiness structured data where truthful.
6. Improve internal links and buyer-focused content.
7. Configure Google Business Profile/local consistency.
8. Launch high-intent Google Search campaigns.
9. Import/track real lead conversions.
10. Review Search Console + GA4 + Ads weekly and iterate from actual data.
