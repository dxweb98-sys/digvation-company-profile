// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, test, vi } from 'vitest';
import { JsonContentRepository } from '../src/infrastructure/content-repository';
import { ContentProvider } from '../src/presentation/context';
import { Contact } from '../src/presentation/pages/Contact';
import { Services } from '../src/presentation/pages/Services';
import { track } from '../src/infrastructure/analytics';

vi.mock('../src/infrastructure/analytics', () => ({ track: vi.fn(), attribution: () => ({}) }));
const content = await new JsonContentRepository('content').load();
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

test('failed inquiry delivery keeps the brief and requires a fresh Turnstile token before retry', async () => {
  window.history.replaceState(null, '', '/mulai-ngobrol');
  const callbacks: ((token: string) => void)[] = [];
  const turnstile = {
    render: vi.fn((_element: HTMLElement, options: Record<string, unknown>) => {
      callbacks.push(options.callback as (token: string) => void);
      return `widget-${callbacks.length}`;
    }),
    remove: vi.fn(),
  };
  vi.stubGlobal('turnstile', turnstile);
  const tokens: string[] = [];
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, init: RequestInit) => {
      tokens.push(String((init.body as FormData).get('cf-turnstile-response')));
      return tokens.length === 1
        ? Response.json({ ok: false }, { status: 503 })
        : Response.json({ ok: true, delivered: true });
    }),
  );
  const configured = structuredClone(content);
  configured.site.contact.turnstileSiteKey = 'test-site-key';
  render(
    <ContentProvider
      content={configured}
      route={{ kind: 'contact', locale: 'id', path: '/mulai-ngobrol' }}
    >
      <Contact />
    </ContentProvider>,
  );
  const submit = screen.getByRole('button', { name: 'Kirim cerita kalian' });
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  act(() => callbacks[0]('consumed-token'));
  fireEvent.change(screen.getByLabelText(/Nama kalian/), { target: { value: 'Rina' } });
  fireEvent.change(screen.getByLabelText(/Nama bisnis/), { target: { value: 'Salon Rina' } });
  fireEvent.change(screen.getByLabelText(/^Email/), { target: { value: 'rina@example.com' } });
  fireEvent.change(screen.getByLabelText(/Yang ingin dibantu/), { target: { value: 'system' } });
  fireEvent.change(screen.getByLabelText(/Ceritakan sedikit/), {
    target: { value: 'Kami ingin mencatat transaksi dan pelanggan lebih rapi.' },
  });
  fireEvent.click(screen.getByRole('checkbox'));
  fireEvent.click(submit);
  await screen.findByText(/Pesan belum terkirim/);
  await waitFor(() => expect(turnstile.render).toHaveBeenCalledTimes(2));
  expect(turnstile.remove).toHaveBeenCalledWith('widget-1');
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  expect((screen.getByLabelText(/Nama bisnis/) as HTMLInputElement).value).toBe('Salon Rina');
  act(() => callbacks[0]('stale-token'));
  expect((submit as HTMLButtonElement).disabled).toBe(true);
  fireEvent.click(submit);
  expect(tokens).toEqual(['consumed-token']);
  act(() => callbacks[1]('fresh-token'));
  fireEvent.click(submit);
  await screen.findByText('Cerita kalian sudah terkirim.');
  expect(tokens).toEqual(['consumed-token', 'fresh-token']);
  expect(track).toHaveBeenCalledWith('lead_form_submit', { locale: 'id', need: 'system' });
});

test('service views include the initial hash selection and deduplicate revisited tabs', async () => {
  window.history.replaceState(null, '', '/layanan#product');
  render(
    <ContentProvider content={content} route={{ kind: 'services', locale: 'id', path: '/layanan' }}>
      <Services />
    </ContentProvider>,
  );
  const product = content.services.find((s) => s.icon === 'product')!;
  await waitFor(() =>
    expect(track).toHaveBeenCalledWith('service_view', { locale: 'id', service_id: product.id }),
  );
  expect(track).toHaveBeenCalledTimes(1);
  fireEvent.click(screen.getByRole('tab', { name: /^Website$/ }));
  const website = content.services.find((s) => s.icon === 'website')!;
  await waitFor(() =>
    expect(track).toHaveBeenCalledWith('service_view', { locale: 'id', service_id: website.id }),
  );
  fireEvent.click(screen.getByRole('tab', { name: /^Produk digital$/ }));
  expect(track).toHaveBeenCalledTimes(2);
});
