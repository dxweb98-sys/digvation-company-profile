import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import {
  JsonContentRepository,
  R2ContentRepository,
} from '../src/infrastructure/content-repository';
import { bundleSchema } from '../src/domain/content';
import { validateContentAssets } from '../src/infrastructure/content-assets';

const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const remote = env.CONTENT_BASE_URL?.trim();
const content = await (
  remote ? new R2ContentRepository(remote) : new JsonContentRepository(resolve('content'))
).load();
if (env.SITE_URL || env.SITE) content.site.siteUrl = (env.SITE_URL || env.SITE)!.replace(/\/$/, '');
if (env.CONTACT_ENDPOINT) content.site.contact.endpoint = env.CONTACT_ENDPOINT;
if (env.PUBLIC_GA_ID || env.GA_MEASUREMENT_ID)
  content.site.analytics.gaId = env.PUBLIC_GA_ID || env.GA_MEASUREMENT_ID!;
if (env.PUBLIC_GTM_ID) content.site.analytics.gtmId = env.PUBLIC_GTM_ID;
if (env.PUBLIC_CLARITY_ID) content.site.analytics.clarityId = env.PUBLIC_CLARITY_ID;
if (env.META_PIXEL_ID) content.site.analytics.metaPixelId = env.META_PIXEL_ID;
if (env.PUBLIC_ANALYTICS_MODE)
  content.site.analytics.mode = env.PUBLIC_ANALYTICS_MODE as typeof content.site.analytics.mode;
if (env.PUBLIC_GOOGLE_SITE_VERIFICATION)
  content.site.googleSiteVerification = env.PUBLIC_GOOGLE_SITE_VERIFICATION;
if (env.PUBLIC_WHATSAPP_NUMBER) content.site.contact.whatsapp = env.PUBLIC_WHATSAPP_NUMBER;
if (env.PUBLIC_TURNSTILE_SITEKEY)
  content.site.contact.turnstileSiteKey = env.PUBLIC_TURNSTILE_SITEKEY;
bundleSchema.parse(content);
const origin = new URL(content.site.siteUrl);
if (origin.pathname !== '/' || origin.search || origin.hash || origin.username || origin.password)
  throw new Error('SITE_URL must be an HTTPS origin, no path, query or credentials');
await validateContentAssets(content, resolve('public'));
if (process.argv.includes('--validate-only')) {
  console.log(
    `Content valid: ${content.services.length} services, ${content.products.length} products, ${content.works.length} works; ID/EN keys match.`,
  );
} else {
  await mkdir('src/generated', { recursive: true });
  await writeFile('src/generated/content.json', JSON.stringify(content));
  console.log(`Content snapshot ready (${remote ? 'R2' : 'local JSON'}).`);
}
