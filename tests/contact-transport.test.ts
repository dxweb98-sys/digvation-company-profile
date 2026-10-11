import { test, expect, afterEach, vi } from 'vitest';
import { sendBrief } from '../src/infrastructure/contact';

const brief = {
  name: 'Rina',
  business: 'Salon Rina',
  email: 'rina@example.com',
  need: 'system',
  message: 'Kami ingin mencatat transaksi dan pelanggan lebih rapi.',
  consent: true,
};
afterEach(() => vi.unstubAllGlobals());

test('the browser sends the existing inquiry form contract, including consent and Turnstile', async () => {
  let form: FormData | undefined;
  vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
    form = init.body as FormData;
    return Response.json({ ok: true, delivered: true });
  });
  await sendBrief('/api/inquiry', brief, 'id', 'test-token', '');
  expect(form).toBeInstanceOf(FormData);
  expect(form?.get('company')).toBe(brief.business);
  expect(form?.get('improvement')).toBe(brief.message);
  expect(form?.get('cf-turnstile-response')).toBe('test-token');
  expect(form?.get('consent')).toBe('true');
});

test('a dry-run acknowledgement cannot produce a successful client lead', async () => {
  vi.stubGlobal('fetch', async () => Response.json({ ok: true, delivered: false }));
  await expect(sendBrief('/api/inquiry', brief, 'id', '', '')).rejects.toThrow('not delivered');
});
