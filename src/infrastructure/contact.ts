import type { Brief } from '../application/brief';
import { attribution } from './analytics';
export async function sendBrief(
  endpoint: string,
  brief: Brief,
  locale: string,
  turnstileToken: string,
  honeypot = '',
) {
  if (!endpoint) throw new Error('Contact endpoint is not configured');
  const body = new FormData();
  for (const [key, value] of Object.entries({
    name: brief.name.trim(),
    company: brief.business.trim(),
    email: brief.email.trim(),
    improvement: brief.message.trim(),
    need: brief.need,
    locale,
    consent: String(brief.consent),
    website: honeypot,
    'cf-turnstile-response': turnstileToken,
  }))
    body.set(key, value);
  const source = attribution();
  const fields: Record<string, string> = {
    utm_source: 'utmSource',
    utm_medium: 'utmMedium',
    utm_campaign: 'utmCampaign',
    utm_content: 'utmContent',
    utm_term: 'utmTerm',
    gclid: 'clickId',
    fbclid: 'clickId',
    landingPage: 'landingPage',
    referrer: 'referrer',
  };
  for (const [key, value] of Object.entries(source))
    if (fields[key] && !body.has(fields[key])) body.set(fields[key], value);
  const response = await fetch(endpoint, {
    method: 'POST',
    body,
    signal: AbortSignal.timeout(20000),
  });
  if (!response.ok) throw new Error(`Contact HTTP ${response.status}`);
  const data = (await response.json()) as { ok?: boolean; delivered?: boolean };
  if (data.ok !== true || data.delivered !== true)
    throw new Error('Contact request was not delivered');
}
export function downloadBrief(brief: Brief, labels: Record<string, string>) {
  const body = [
    'DIGVATION, PROJECT BRIEF',
    '',
    ...(['name', 'business', 'email', 'need', 'message'] as const).map(
      (key) => `${labels[key]}: ${brief[key]}`,
    ),
  ].join('\n\n');
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'digvation-project-brief.txt';
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
