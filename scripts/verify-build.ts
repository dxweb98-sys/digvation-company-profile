import { readFile, access } from 'node:fs/promises';
import { resolve } from 'node:path';
import assert from 'node:assert/strict';
import { allRoutes } from '../src/application/routes';
import { seoFor } from '../src/application/seo';
import type { ContentBundle } from '../src/domain/content';
const content = JSON.parse(await readFile('src/generated/content.json', 'utf8')) as ContentBundle;
const routes = allRoutes(content);
const titles = new Set<string>();
for (const route of routes) {
  const html = await readFile(
    route.path === '/' ? 'dist/index.html' : `dist${route.path}.html`,
    'utf8',
  );
  const seo = seoFor(route, content);
  assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1, `Exactly one H1: ${route.path}`);
  assert.ok(html.includes(`<html lang="${route.locale}">`), `lang: ${route.path}`);
  assert.ok(html.includes(`href="${seo.canonical}"`), `canonical: ${route.path}`);
  for (const language of ['id', 'en', 'x-default'])
    assert.ok(html.includes(`hreflang="${language}"`), `hreflang: ${route.path}`);
  assert.ok(!html.includes('<!--app-'), `Unrendered content: ${route.path}`);
  assert.ok(html.includes('<main'), `SSR body: ${route.path}`);
  assert.ok(!titles.has(seo.title), `Duplicate title: ${seo.title}`);
  titles.add(seo.title);
  const scripts = [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length, 1);
  JSON.parse(scripts[0][1]);
  for (const match of html.matchAll(/(?:href|src)="([^"#]+)"/g)) {
    const raw = match[1].replace(/&amp;/g, '&');
    if (!raw.startsWith('/') || raw.startsWith('//')) continue;
    const path = new URL(raw, content.site.siteUrl).pathname;
    if (path.startsWith('/api/')) continue;
    const target =
      path === '/'
        ? 'dist/index.html'
        : routes.some((item) => item.path === path)
          ? `dist${path}.html`
          : resolve('dist', path.slice(1));
    await access(target).catch(() =>
      assert.fail(`Missing local link or asset ${raw} on ${route.path}`),
    );
  }
  if (route.entity?.status === 'demo') assert.ok(html.includes('noindex,follow'));
}
const sitemap = await readFile('dist/sitemap.xml', 'utf8');
for (const route of routes)
  assert.equal(
    sitemap.includes(`<loc>${content.site.siteUrl + route.path}</loc>`),
    seoFor(route, content).indexable,
    `sitemap policy: ${route.path}`,
  );
await Promise.all(
  [
    'dist/404.html',
    'dist/en/404.html',
    'dist/_headers',
    'dist/_redirects',
    'dist/images/hero-team.webp',
    'dist/images/og-digvation.jpg',
  ].map((f) => access(f)),
);
console.log(
  `Build checks passed: ${routes.length} pages, static content, unique titles, ID/EN alternates, JSON-LD, demo noindex, sitemap & assets.`,
);
