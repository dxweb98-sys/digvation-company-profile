import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { allRoutes } from '../src/application/routes';
import { seoFor } from '../src/application/seo';
import type { ContentBundle } from '../src/domain/content';
const server = (await import(pathToFileURL(resolve('.server/entry-server.js')).href)) as {
  render: (path: string) => string;
  content: ContentBundle;
};
const template = await readFile('dist/index.html', 'utf8');
const routes = allRoutes(server.content);
const output = (path: string) => (path === '/' ? 'dist/index.html' : `dist${path}.html`);
async function page(path: string) {
  const route = (await import('../src/application/routes')).matchRoute(path, server.content);
  const html = template
    .replace('<html lang="id">', `<html lang="${route.locale}">`)
    .replace('<!--app-head-->', seoFor(route, server.content).head)
    .replace('<!--app-html-->', server.render(path));
  const file = output(path);
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}
for (const route of routes) await page(route.path);
await page('/404');
await page('/en/404');
const xmlEscape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${routes
  .filter((r) => seoFor(r, server.content).indexable)
  .map((r) => `  <url><loc>${xmlEscape(server.content.site.siteUrl + r.path)}</loc></url>`)
  .join('\n')}\n</urlset>\n`;
await writeFile('dist/sitemap.xml', sitemap);
await writeFile(
  'dist/robots.txt',
  `User-agent: *\nAllow: /\nDisallow: /api/\nSitemap: ${server.content.site.siteUrl}/sitemap.xml\n`,
);
await writeFile(
  'dist/content-version.json',
  JSON.stringify({
    schemaVersion: 1,
    builtAt: new Date().toISOString(),
    locales: ['id', 'en'],
    routes: routes.length,
  }),
);
console.log(`Prerendered ${routes.length} localized pages + 2 error pages. Sitemap ready.`);

// Restrict image origins to the exact remote assets in this validated snapshot.
const headers = await readFile('public/_headers', 'utf8');
const imageSources = [
  server.content.site.heroImage,
  ...server.content.works.flatMap((item) => [
    item.image,
    ...item.gallery,
    item.seo?.id.ogImage,
    item.seo?.en.ogImage,
  ]),
  ...server.content.products.map((item) => item.image),
  ...server.content.campaigns.flatMap((item) => [item.seo.id.ogImage, item.seo.en.ogImage]),
];
const origins = [
  ...new Set(
    imageSources
      .filter((src): src is string => !!src?.startsWith('https://'))
      .map((src) => new URL(src).origin),
  ),
];
await writeFile(
  'dist/_headers',
  headers.replace("img-src 'self' data:", "img-src 'self' data: " + origins.join(' ')),
);
