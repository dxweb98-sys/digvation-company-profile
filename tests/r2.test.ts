import { test } from 'vitest';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { R2ContentRepository } from '../src/infrastructure/content-repository';
test('an atomic release manifest resolves one complete immutable snapshot', async () => {
  const original = globalThis.fetch;
  const paths: string[] = [];
  try {
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      paths.push(url.pathname);
      if (url.pathname.endsWith('/latest.json'))
        return Response.json({ schemaVersion: 1, release: '2026-10-11-001' });
      return new Response(await readFile('content/' + url.pathname.split('/').at(-1), 'utf8'));
    };
    await new R2ContentRepository('https://assets.example.com/content/latest.json').load();
    assert.equal(paths.length, 9);
    assert.ok(paths.slice(1).every((path) => path.startsWith('/content/releases/2026-10-11-001/')));
  } finally {
    globalThis.fetch = original;
  }
});
test('R2 uses all public JSON files as one validated snapshot', async () => {
  const original = globalThis.fetch;
  const seen: string[] = [];
  try {
    globalThis.fetch = async (input) => {
      const url = new URL(String(input));
      seen.push(url.pathname);
      return new Response(await readFile('content/' + url.pathname.split('/').at(-1), 'utf8'), {
        headers: { 'Content-Type': 'application/json' },
      });
    };
    const bundle = await new R2ContentRepository('https://assets.example.com/content/v1').load();
    assert.equal(seen.length, 8);
    assert.ok(seen.every((x) => x.startsWith('/content/v1/')));
    assert.equal(bundle.site.name, 'Digvation');
    assert.equal(bundle.copy.en['nav.products'], 'Products');
  } finally {
    globalThis.fetch = original;
  }
});
test('failed or unsafe remote content does not silently fall back', async () => {
  assert.throws(() => new R2ContentRepository('http://assets.example.com'), /HTTPS/);
  assert.throws(
    () => new R2ContentRepository('https://user:pass@assets.example.com'),
    /credentials/,
  );
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () => new Response('Not found', { status: 404 });
    await assert.rejects(
      new R2ContentRepository('https://assets.example.com').load(),
      /returned 404/,
    );
  } finally {
    globalThis.fetch = original;
  }
});
