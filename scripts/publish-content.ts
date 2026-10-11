import { spawn } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { resolve } from 'node:path';
import { loadEnv } from 'vite';
import { contentFiles, JsonContentRepository } from '../src/infrastructure/content-repository';
import { validateContentAssets } from '../src/infrastructure/content-assets';

// Maintainer-only command. Credentials belong in the process environment or an
// ignored .env file; neither credentials nor the deployment hook are printed.
const env = { ...loadEnv('production', process.cwd(), ''), ...process.env };
const content = await new JsonContentRepository(resolve('content')).load();
await validateContentAssets(content, resolve('public'));
const snapshot: Record<(typeof contentFiles)[number], unknown> = {
  site: content.site,
  id: content.copy.id,
  en: content.copy.en,
  services: content.services,
  products: content.products,
  works: content.works,
  campaigns: content.campaigns,
  legal: content.legal,
};
const release = `${new Date().toISOString().replace(/[^0-9]/g, '')}-${randomUUID().slice(0, 8)}`;
const account = env.R2_ACCOUNT_ID;
const bucket = env.R2_CONTENT_BUCKET;
const prefix = env.R2_CONTENT_PREFIX ?? 'content/development';
const dry = process.argv.includes('--dry-run');
if (!/^[a-z0-9][a-z0-9/-]{0,120}$/.test(prefix) || prefix.includes('//'))
  throw new Error('Invalid R2 content prefix');
if (dry) {
  console.log(
    JSON.stringify(
      {
        release,
        prefix,
        files: contentFiles.map((name) => name + '.json'),
        publish: false,
        deploy: false,
      },
      null,
      2,
    ),
  );
  process.exit(0);
}
if (!account || !/^[a-f0-9]{32}$/.test(account) || !bucket || !/^[a-z0-9-]{3,63}$/.test(bucket))
  throw new Error('Configure R2_ACCOUNT_ID and R2_CONTENT_BUCKET before publishing.');
if (!env.AWS_ACCESS_KEY_ID || !env.AWS_SECRET_ACCESS_KEY)
  throw new Error(
    'Configure a bucket-scoped R2 access key through AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY.',
  );
const endpoint = `https://${account}.r2.cloudflarestorage.com`;
const hook = env.DEVELOPMENT_DEPLOY_HOOK_URL;
if (hook) {
  const url = new URL(hook);
  if (
    url.protocol !== 'https:' ||
    url.hostname !== 'api.cloudflare.com' ||
    url.username ||
    url.password
  )
    throw new Error('Use a Cloudflare Pages HTTPS development deploy hook.');
}
function upload(source: string, key: string, cache: string, input?: string) {
  return new Promise<void>((done, reject) => {
    const child = spawn(
      'aws',
      [
        's3',
        'cp',
        source,
        `s3://${bucket}/${prefix}/${key}`,
        '--endpoint-url',
        endpoint,
        '--region',
        'auto',
        '--content-type',
        'application/json',
        '--cache-control',
        cache,
        '--only-show-errors',
      ],
      { env: { ...process.env, ...env }, stdio: ['pipe', 'ignore', 'ignore'] },
    );
    child.on('error', () =>
      reject(new Error('AWS CLI is unavailable; install and configure it before publishing.')),
    );
    child.on('close', (code) =>
      code === 0 ? done() : reject(new Error('R2 upload failed; release publication stopped.')),
    );
    child.stdin.end(input);
  });
}
// Never update the pointer until every immutable file has uploaded successfully.
for (const name of contentFiles)
  await upload(
    '-',
    `releases/${release}/${name}.json`,
    'public,max-age=31536000,immutable',
    JSON.stringify(snapshot[name]),
  );
await upload('-', 'latest.json', 'no-store', JSON.stringify({ schemaVersion: 1, release }));
if (hook) {
  let accepted = false;
  try {
    accepted = (
      await fetch(hook, { method: 'POST', signal: AbortSignal.timeout(15000), redirect: 'error' })
    ).ok;
  } catch {
    /* Keep the secret hook out of error output. */
  }
  if (!accepted)
    throw new Error(
      `Release ${release} uploaded, but the development rebuild was not accepted. Retry the hook without uploading again.`,
    );
}
console.log(
  `Published content release ${release}.${hook ? ' Development rebuild requested.' : ' Trigger the development build to make it visible.'}`,
);
