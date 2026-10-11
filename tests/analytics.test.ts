import { test, expect, vi, afterEach } from 'vitest';
import { readConsent, track, attribution, startAnalytics } from '../src/infrastructure/analytics';
import site from '../content/site.json';
import type { Site } from '../src/domain/content';

afterEach(() => vi.unstubAllGlobals());
test('invalid stored preferences are not accepted as consent', () => {
  vi.stubGlobal('localStorage', { getItem: () => 'something-else' });
  expect(readConsent()).toBe(null);
});

test('rejecting analytics clears attribution and prevents provider calls', () => {
  const events: unknown[] = [];
  vi.stubGlobal('localStorage', { getItem: () => 'rejected' });
  vi.stubGlobal('sessionStorage', { removeItem: (key: string) => events.push(key) });
  vi.stubGlobal('window', { gtag: (...args: unknown[]) => events.push(args) });
  track('contact_success', { locale: 'id' });
  expect(attribution()).toEqual({});
  expect(events).toEqual(['digvation.attribution']);
});
test('configured providers initialize once and custom events omit personal fields', () => {
  const layer: unknown[] = [];
  const scripts: { src: string }[] = [];
  vi.stubGlobal('localStorage', { getItem: () => 'accepted' });
  vi.stubGlobal('sessionStorage', { getItem: () => null, setItem: () => {} });
  vi.stubGlobal('window', {
    dataLayer: layer,
    location: {
      search: '?email=private@example.com',
      pathname: '/mulai-ngobrol',
      origin: 'https://digvation.id',
    },
    addEventListener: () => {},
  });
  vi.stubGlobal('document', {
    referrer: 'https://referrer.example.com/page?token=private#secret',
    documentElement: { lang: 'id' },
    createElement: () => ({ src: '', async: false }),
    head: { append: (element: { src: string }) => scripts.push(element) },
    addEventListener: () => {},
  });
  const configured = {
    ...site,
    analytics: { ...site.analytics, gaId: 'G-TEST', gtmId: 'GTM-TEST' },
  } as Site;
  startAnalytics(configured);
  startAnalytics(configured);
  track('contact_success', {
    locale: 'id',
    need: 'system',
    name: 'Private',
    email: 'private@example.com',
    message: 'confidential',
  });
  expect(scripts).toHaveLength(2);
  const events = layer.filter(
    (value) => value && typeof value === 'object' && 'event' in value,
  ) as Record<string, unknown>[];
  expect(events.filter((event) => event.event === 'page_view')).toHaveLength(1);
  expect(events.find((event) => event.event === 'contact_success')).toEqual({
    event: 'contact_success',
    locale: 'id',
    need: 'system',
    page_path: '/mulai-ngobrol',
    page_location: 'https://digvation.id/mulai-ngobrol',
    page_referrer: 'https://referrer.example.com/page',
  });
  const calls = layer.filter(
    (value) => Object.prototype.toString.call(value) === '[object Arguments]',
  ) as IArguments[];
  const configuration = calls.find((call) => call[0] === 'config');
  expect(configuration?.[2]).toMatchObject({
    send_page_view: false,
    page_location: 'https://digvation.id/mulai-ngobrol',
    page_referrer: 'https://referrer.example.com/page',
  });
  for (const call of calls.filter((call) => call[0] === 'event')) {
    expect(call[2]).toMatchObject({
      page_location: 'https://digvation.id/mulai-ngobrol',
      page_referrer: 'https://referrer.example.com/page',
    });
  }
  expect(JSON.stringify(layer)).not.toContain('private@example.com');
  expect(JSON.stringify(layer)).not.toContain('token=private');
});
