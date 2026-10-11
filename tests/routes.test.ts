import { test, expect } from 'vitest';
import { readFile } from 'node:fs/promises';
import { allRoutes, matchRoute, counterpart } from '../src/application/routes';
import { seoFor } from '../src/application/seo';
import type { ContentBundle } from '../src/domain/content';

const get = async (name: string) => JSON.parse(await readFile(`content/${name}.json`, 'utf8'));
const content = {
  site: await get('site'),
  copy: { id: await get('id'), en: await get('en') },
  services: await get('services'),
  products: await get('products'),
  works: await get('works'),
  campaigns: await get('campaigns'),
  legal: await get('legal'),
} as ContentBundle;

test('a published campaign keeps its bilingual detail route and remains outside organic indexing', () => {
  const route = matchRoute('/campaign/website-b2b', content);
  expect(route.kind).toBe('campaign');
  expect(counterpart(route, content)).toBe('/en/campaign/website-b2b');
  expect(seoFor(route, content).indexable).toBe(false);
  expect(seoFor(route, content).title).toContain('B2B');
});

test('terms have independent bilingual static routes', () => {
  expect(allRoutes(content).some((route) => route.path === '/ketentuan')).toBe(true);
  expect(matchRoute('/en/terms', content).kind).toBe('terms');
});

test('a real work uses its supplied case-study metadata and is indexable', () => {
  const route = matchRoute('/karya/poseidon-filter', content);
  expect(seoFor(route, content).title).toBe('Poseidon Filter | Case Study Website');
  expect(seoFor(route, content).indexable).toBe(true);
});
