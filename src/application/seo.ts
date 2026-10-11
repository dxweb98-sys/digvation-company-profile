import type { ContentBundle, Product, Work, Campaign } from '../domain/content';
import { text } from '../domain/localized';
import { counterpart, type Route } from './routes';
const escape = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export function seoFor(route: Route, content: ContentBundle) {
  const { site, copy } = content;
  const t = copy[route.locale];
  const entity = route.entity;
  let title = t[`seo.${route.kind}.title`] ?? t['404.title'];
  let description = text(site.description, route.locale);
  if (route.kind === 'product-detail') {
    title = `${(entity as Product).name} | ${text((entity as Product).category, route.locale)} | Digvation`;
    description = text(entity!.summary, route.locale);
  }
  if (route.kind === 'work-detail') {
    title = `${text((entity as Work).title, route.locale)} | Digvation`;
    description = text(entity!.summary, route.locale);
  }
  if (route.kind === 'work-detail' && (entity as Work).seo) {
    title = (entity as Work).seo![route.locale].title;
    description = (entity as Work).seo![route.locale].description;
  }
  if (route.kind === 'campaign') {
    title = (entity as Campaign).seo[route.locale].title;
    description = (entity as Campaign).seo[route.locale].description;
  }
  if (route.kind === 'privacy' || route.kind === 'terms') {
    description = content.legal[route.kind][route.locale].intro;
  }
  const intro = t[`${route.kind}.intro`];
  if (intro) description = intro;
  const canonical = site.siteUrl + (route.path === '/' ? '/' : route.path);
  const otherPath = counterpart(route, content);
  const indexable =
    route.kind !== 'not-found' &&
    route.kind !== 'privacy' &&
    route.kind !== 'terms' &&
    !(route.kind === 'campaign' && (entity as Campaign).noindex) &&
    (!entity || entity.status === 'published');
  const entityImage =
    entity && 'seo' in entity && entity.seo
      ? entity.seo[route.locale].ogImage
      : entity && 'image' in entity
        ? entity.image
        : undefined;
  const image = entityImage
    ? entityImage.startsWith('/')
      ? site.siteUrl + entityImage
      : entityImage
    : site.siteUrl + '/images/og-digvation.jpg';
  const schemas: Record<string, unknown>[] = [
    {
      '@type': 'Organization',
      '@id': site.siteUrl + '/#organization',
      name: site.name,
      foundingDate: String(site.foundedYear),
      url: site.siteUrl,
      logo: site.siteUrl + '/brand/digvation-logo.png',
      description: text(site.description, route.locale),
      ...(site.contact.email ? { email: site.contact.email } : {}),
      ...(site.social.length ? { sameAs: site.social.map((s) => s.url).filter(Boolean) } : {}),
    },
    {
      '@type': 'WebSite',
      '@id': site.siteUrl + '/#website',
      name: site.name,
      url: site.siteUrl,
      inLanguage: ['id', 'en'],
      publisher: { '@id': site.siteUrl + '/#organization' },
    },
    {
      '@type': 'WebPage',
      '@id': canonical + '#webpage',
      name: title,
      url: canonical,
      description,
      inLanguage: route.locale,
      isPartOf: { '@id': site.siteUrl + '/#website' },
    },
  ];
  if (route.kind === 'services')
    schemas.push({
      '@type': 'Service',
      name: title,
      provider: { '@id': site.siteUrl + '/#organization' },
      serviceType: content.services.map((s) => text(s.title, route.locale)),
      url: canonical,
    });
  if (route.kind === 'product-detail')
    schemas.push({
      '@type': 'SoftwareApplication',
      name: (entity as Product).name,
      applicationCategory: 'BusinessApplication',
      description,
      creator: { '@id': site.siteUrl + '/#organization' },
      url: canonical,
    });
  if (route.kind === 'work-detail')
    schemas.push({
      '@type': 'CreativeWork',
      name: text((entity as Work).title, route.locale),
      description,
      url: canonical,
      image,
      creator: { '@id': site.siteUrl + '/#organization' },
    });
  if (route.kind === 'product-detail' || route.kind === 'campaign') {
    const faq = (entity as Product | Campaign).faq;
    if (faq.length)
      schemas.push({
        '@type': 'FAQPage',
        mainEntity: faq.map((item) => ({
          '@type': 'Question',
          name: text(item.question, route.locale),
          acceptedAnswer: { '@type': 'Answer', text: text(item.answer, route.locale) },
        })),
      });
  }
  const alternates =
    route.locale === 'id' ? { id: route.path, en: otherPath } : { id: otherPath, en: route.path };
  const head = [
    `<title>${escape(title)}</title>`,
    ...(site.googleSiteVerification
      ? [`<meta name="google-site-verification" content="${escape(site.googleSiteVerification)}">`]
      : []),
    `<meta name="description" content="${escape(description)}">`,
    `<meta name="robots" content="${indexable ? 'index,follow,max-image-preview:large' : 'noindex,follow'}">`,
    `<link rel="canonical" href="${escape(canonical)}">`,
    ...Object.entries({ ...alternates, 'x-default': alternates.id }).map(
      ([lang, path]) =>
        `<link rel="alternate" hreflang="${lang}" href="${escape(site.siteUrl + path)}">`,
    ),
    `<meta property="og:type" content="website">`,
    `<meta property="og:site_name" content="Digvation">`,
    `<meta property="og:title" content="${escape(title)}">`,
    `<meta property="og:description" content="${escape(description)}">`,
    `<meta property="og:url" content="${escape(canonical)}">`,
    `<meta property="og:image" content="${escape(image)}">`,
    `<meta property="og:locale" content="${route.locale === 'id' ? 'id_ID' : 'en_US'}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:title" content="${escape(title)}">`,
    `<meta name="twitter:description" content="${escape(description)}">`,
    `<meta name="twitter:image" content="${escape(image)}">`,
    `<script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@graph': schemas }).replace(/</g, '\\u003c')}</script>`,
    ...(route.kind === 'home'
      ? [`<link rel="preload" as="image" href="${escape(site.heroImage)}" fetchpriority="high">`]
      : []),
  ].join('\n');
  return { title, description, canonical, indexable, head };
}
