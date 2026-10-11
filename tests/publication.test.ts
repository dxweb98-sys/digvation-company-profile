import { test, expect } from 'vitest';
import { mkdtemp, cp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { promisify } from 'node:util';
import { execFile } from 'node:child_process';
import { createRequire } from 'node:module';

test('publisher refuses local missing assets even when builds use an R2 snapshot', async () => {
  const directory = await mkdtemp(resolve(tmpdir(), 'digvation-publish-test-'));
  try {
    await cp('content', resolve(directory, 'content'), { recursive: true });
    await mkdir(resolve(directory, 'public'));
    const sitePath = resolve(directory, 'content/site.json');
    const site = JSON.parse(await readFile(sitePath, 'utf8'));
    site.heroImage = '/images/missing.jpg';
    await writeFile(sitePath, JSON.stringify(site));
    await expect(
      promisify(execFile)(
        process.execPath,
        [
          '--import',
          createRequire(resolve('package.json')).resolve('tsx'),
          resolve('scripts/publish-content.ts'),
          '--dry-run',
        ],
        {
          cwd: directory,
          env: {
            ...process.env,
            CONTENT_BASE_URL: 'https://assets.example.com/content/latest.json',
          },
        },
      ),
    ).rejects.toThrow(/missing.jpg/);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

// The fake AWS executable uses a Unix shebang; the remaining publication check is portable.
test.skipIf(process.platform === 'win32')(
  'publication uploads the validated snapshot even if local files change during upload',
  async () => {
    const directory = await mkdtemp(resolve(tmpdir(), 'digvation-snapshot-test-'));
    try {
      await cp('content', resolve(directory, 'content'), { recursive: true });
      await cp('public', resolve(directory, 'public'), { recursive: true });
      const original = JSON.parse(await readFile(resolve(directory, 'content/id.json'), 'utf8'));
      await mkdir(resolve(directory, 'bin'));
      await writeFile(
        resolve(directory, 'bin/aws'),
        `#!/usr/bin/env node
const fs = require('node:fs');
const path = require('node:path');
let body = '';
process.stdin.on('data', chunk => body += chunk);
process.stdin.on('end', () => {
  const args = process.argv.slice(2);
  const key = args.find(arg => arg.startsWith('s3://'));
  const source = args[2];
  const entriesPath = path.join(process.cwd(), 'uploads.json');
  const entries = fs.existsSync(entriesPath) ? JSON.parse(fs.readFileSync(entriesPath, 'utf8')) : [];
  entries.push({key, body: JSON.parse(source === '-' ? body : fs.readFileSync(source, 'utf8'))});
  fs.writeFileSync(entriesPath, JSON.stringify(entries));
  if (key.endsWith('/site.json')) {
    const file = path.join(process.cwd(), 'content/id.json');
    const copy = JSON.parse(fs.readFileSync(file, 'utf8'));
    copy['home.hero.line1'] = 'Unvalidated edit during upload';
    fs.writeFileSync(file, JSON.stringify(copy));
  }
});
`,
        { mode: 0o755 },
      );
      await promisify(execFile)(
        process.execPath,
        [
          '--import',
          createRequire(resolve('package.json')).resolve('tsx'),
          resolve('scripts/publish-content.ts'),
        ],
        {
          cwd: directory,
          env: {
            ...process.env,
            PATH: resolve(directory, 'bin') + ':' + process.env.PATH,
            R2_ACCOUNT_ID: '0'.repeat(32),
            R2_CONTENT_BUCKET: 'test-bucket',
            R2_CONTENT_PREFIX: 'content/development',
            AWS_ACCESS_KEY_ID: 'test-key',
            AWS_SECRET_ACCESS_KEY: 'test-secret',
            DEVELOPMENT_DEPLOY_HOOK_URL: '',
          },
        },
      );
      const uploads = JSON.parse(await readFile(resolve(directory, 'uploads.json'), 'utf8')) as {
        key: string;
        body: unknown;
      }[];
      expect(uploads).toHaveLength(9);
      expect(uploads.at(-1)?.key).toMatch(/\/latest.json$/);
      expect(uploads.find((entry) => entry.key.endsWith('/id.json'))?.body).toEqual(original);
      const edited = JSON.parse(await readFile(resolve(directory, 'content/id.json'), 'utf8'));
      expect(edited['home.hero.line1']).toBe('Unvalidated edit during upload');
    } finally {
      await rm(directory, { recursive: true, force: true });
    }
  },
);
