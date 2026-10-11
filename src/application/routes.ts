import type { ContentBundle, Locale, Product, Work, Campaign } from '../domain/content';
export type PageKind =
  | 'home'
  | 'services'
  | 'work'
  | 'products'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'campaign'
  | 'product-detail'
  | 'work-detail'
  | 'not-found';
export interface Route {
  kind: PageKind;
  locale: Locale;
  path: string;
  entity?: Product | Work | Campaign;
}
const segments = {
  id: {
    home: '',
    services: 'layanan',
    work: 'karya',
    products: 'produk',
    about: 'tentang',
    contact: 'mulai-ngobrol',
    privacy: 'privasi',
    terms: 'ketentuan',
    campaign: 'campaign',
  },
  en: {
    home: '',
    services: 'services',
    work: 'work',
    products: 'products',
    about: 'about',
    contact: 'contact',
    privacy: 'privacy',
    terms: 'terms',
    campaign: 'campaign',
  },
};
export function pathFor(kind: PageKind, locale: Locale, slug?: string): string {
  const base = locale === 'en' ? '/en' : '';
  const key = kind === 'product-detail' ? 'products' : kind === 'work-detail' ? 'work' : kind;
  if (key === 'not-found') return locale === 'en' ? '/en/404' : '/404';
  const segment = segments[locale][key];
  return `${base}${segment ? `/${segment}` : ''}${slug ? `/${slug}` : ''}` || '/';
}
export function allRoutes(content: ContentBundle): Route[] {
  return (['id', 'en'] as const).flatMap((locale) => [
    ...(
      ['home', 'services', 'work', 'products', 'about', 'contact', 'privacy', 'terms'] as const
    ).map((kind) => ({ kind, locale, path: pathFor(kind, locale) })),
    ...content.products
      .filter((x) => x.status !== 'draft')
      .map((entity) => ({
        kind: 'product-detail' as const,
        locale,
        path: pathFor('product-detail', locale, entity.slug),
        entity,
      })),
    ...content.campaigns
      .filter((entity) => entity.status === 'published')
      .map((entity) => ({
        kind: 'campaign' as const,
        locale,
        path: pathFor('campaign', locale, entity.slug),
        entity,
      })),
    ...content.works
      .filter((x) => x.status !== 'draft')
      .map((entity) => ({
        kind: 'work-detail' as const,
        locale,
        path: pathFor('work-detail', locale, entity.slug),
        entity,
      })),
  ]);
}
export function matchRoute(pathname: string, content: ContentBundle): Route {
  const path = pathname.replace(/\/+$/, '') || '/';
  return (
    allRoutes(content).find((r) => r.path === path) ?? {
      kind: 'not-found',
      locale: path.startsWith('/en') ? 'en' : 'id',
      path,
    }
  );
}
export function counterpart(route: Route, content: ContentBundle) {
  const locale = route.locale === 'id' ? 'en' : 'id';
  return (
    allRoutes(content).find(
      (r) => r.locale === locale && r.kind === route.kind && r.entity?.id === route.entity?.id,
    )?.path ?? pathFor('home', locale)
  );
}
