import { describe, expect, it, vi, afterEach } from 'vitest';
import { onRequestPost } from '../../functions/api/inquiry';

const makeRequest = (
  body: URLSearchParams | string,
  contentType = 'application/x-www-form-urlencoded',
) =>
  new Request('https://digvation.id/api/inquiry', {
    method: 'POST',
    headers: { 'content-type': contentType },
    body,
  });

const validBody = () =>
  new URLSearchParams({
    locale: 'id',
    name: 'Dicky',
    email: 'dicky@example.com',
    improvement: 'Saya ingin merapikan proses order dan pemantauan status bisnis.',
    consent: 'true',
  });

describe('inquiry handler', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('rejects cross-origin submissions before contacting a provider', async () => {
    const request = makeRequest(validBody());
    request.headers.set('origin', 'https://unrelated.example');
    const response = await onRequestPost({ request, env: { INQUIRY_DRY_RUN: 'true' } });
    expect(response.status).toBe(403);
  });

  it('reports real webhook acceptance as delivered using the original payload contract', async () => {
    let sent: Record<string, unknown> | undefined;
    vi.stubGlobal('fetch', async (_url: string, init: RequestInit) => {
      sent = JSON.parse(String(init.body));
      return new Response(null, { status: 202 });
    });
    const response = await onRequestPost({
      request: makeRequest(validBody()),
      env: { INQUIRY_PROVIDER: 'webhook', INQUIRY_WEBHOOK_URL: 'https://webhook.example/inquiry' },
    });
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: true });
    expect(sent?.source).toBe('digvation-website');
    expect((sent?.data as Record<string, unknown>).improvement).toContain('proses order');
  });

  it('requires a Resend email ID before confirming delivery', async () => {
    vi.stubGlobal('fetch', async () => Response.json({}));
    const response = await onRequestPost({
      request: makeRequest(validBody()),
      env: {
        INQUIRY_PROVIDER: 'resend',
        RESEND_API_KEY: 'test',
        INQUIRY_FROM: 'site@example.com',
        INQUIRY_RECIPIENT: 'hello@example.com',
      },
    });
    expect(response.status).toBe(500);
  });

  it('verifies Turnstile hostname before sending any inquiry', async () => {
    const body = validBody();
    body.set('cf-turnstile-response', 'test-token');
    vi.stubGlobal('fetch', async () => Response.json({ success: true, hostname: 'wrong.example' }));
    const response = await onRequestPost({
      request: makeRequest(body),
      env: {
        INQUIRY_DRY_RUN: 'true',
        TURNSTILE_MODE: 'turnstile',
        TURNSTILE_SECRET_KEY: 'test',
        TURNSTILE_ALLOWED_HOSTNAMES: 'digvation.id',
      },
    });
    expect(response.status).toBe(400);
  });
  it('accepts a valid same-format inquiry in dry-run mode', async () => {
    const response = await onRequestPost({
      request: makeRequest(validBody()),
      env: { INQUIRY_DRY_RUN: 'true', TURNSTILE_MODE: 'none' },
    });

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: false });
  });

  it('does not report a honeypot request as a delivered lead', async () => {
    const body = validBody();
    body.set('website', 'bot.example');
    const response = await onRequestPost({ request: makeRequest(body), env: {} });
    await expect(response.json()).resolves.toEqual({ ok: true, delivered: false });
  });

  it('rejects an oversized body even without a content-length header', async () => {
    const body = validBody();
    body.set('improvement', 'x'.repeat(70 * 1024));
    const request = makeRequest(body);
    request.headers.delete('content-length');

    const response = await onRequestPost({ request, env: {} });

    expect(response.status).toBe(413);
  });

  it('rejects unsupported content types before parsing', async () => {
    const response = await onRequestPost({
      request: makeRequest('{}', 'application/json'),
      env: {},
    });

    expect(response.status).toBe(415);
  });
});
