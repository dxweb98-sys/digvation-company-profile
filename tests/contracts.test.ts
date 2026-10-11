import { test } from 'vitest';
import assert from 'node:assert/strict';
import { JsonContentRepository } from '../src/infrastructure/content-repository';
import { matchRoute, pathFor, allRoutes, counterpart } from '../src/application/routes';
import { validateBrief } from '../src/application/brief';
import { bundleSchema } from '../src/domain/content';
const content = await new JsonContentRepository('content').load();
test('nested work and product keep their identity across languages', () => {
  const work = matchRoute('/karya/poseidon-filter/', content);
  assert.equal(work.kind, 'work-detail');
  assert.equal(counterpart(work, content), '/en/work/poseidon-filter');
  const product = matchRoute('/en/products/pos', content);
  assert.equal(counterpart(product, content), '/produk/pos');
  assert.equal(pathFor('home', 'id'), '/');
});
test('unknown and unpublished detail routes do not appear as live content', () => {
  const draft = structuredClone(content);
  draft.products[0].status = 'draft';
  assert.equal(matchRoute('/produk/pos', draft).kind, 'not-found');
  assert.equal(
    allRoutes(draft).some((x) => x.path === '/produk/pos'),
    false,
  );
  assert.equal(matchRoute('/karya/does-not-exist', content).kind, 'not-found');
});
test('editable content rejects duplicate slugs, missing translation, and unsafe images', () => {
  const bad = structuredClone(content);
  bad.products.push(bad.products[0]);
  assert.equal(bundleSchema.safeParse(bad).success, false);
  const missing = structuredClone(content);
  delete missing.copy.en['nav.home'];
  assert.equal(bundleSchema.safeParse(missing).success, false);
  const unsafe = structuredClone(content);
  unsafe.site.heroImage = 'javascript:alert(1)';
  assert.equal(bundleSchema.safeParse(unsafe).success, false);
});
test('content cannot publish credential-bearing assets or a work linked to a draft product', () => {
  const credentials = structuredClone(content);
  credentials.site.heroImage = 'https://user:secret@assets.example.com/hero.jpg';
  assert.equal(bundleSchema.safeParse(credentials).success, false);
  const unpublished = structuredClone(content);
  unpublished.works[0].productId = unpublished.products[0].id;
  unpublished.products[0].status = 'draft';
  assert.equal(bundleSchema.safeParse(unpublished).success, false);
});
test('lead validation rejects malformed email, whitespace and no consent', () => {
  const empty = validateBrief({
    name: ' ',
    business: ' ',
    email: 'x',
    need: '',
    message: 'short',
    consent: false,
  });
  assert.deepEqual(
    Object.keys(empty).sort(),
    ['business', 'consent', 'email', 'message', 'name', 'need'].sort(),
  );
  assert.deepEqual(
    validateBrief({
      name: 'Rina',
      business: 'Salon Rina',
      email: 'rina@example.com',
      need: 'system',
      message: 'Kami butuh pencatatan transaksi yang rapi.',
      consent: true,
    }),
    {},
  );
});
