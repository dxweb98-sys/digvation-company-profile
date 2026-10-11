import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { bundleSchema, type ContentBundle } from '../domain/content';
import { z } from 'zod';
import type { ContentRepository } from '../domain/repository';
export const contentFiles = [
  'site',
  'id',
  'en',
  'services',
  'products',
  'works',
  'campaigns',
  'legal',
] as const;
function assemble(data: unknown[]): ContentBundle {
  return bundleSchema.parse({
    site: data[0],
    copy: { id: data[1], en: data[2] },
    services: data[3],
    products: data[4],
    works: data[5],
    campaigns: data[6],
    legal: data[7],
  });
}
export class JsonContentRepository implements ContentRepository {
  constructor(private directory: string) {}
  async load() {
    return assemble(
      await Promise.all(
        contentFiles.map(async (file) =>
          JSON.parse(await readFile(resolve(this.directory, `${file}.json`), 'utf8')),
        ),
      ),
    );
  }
}
export class R2ContentRepository implements ContentRepository {
  constructor(private baseUrl: string) {
    const url = new URL(baseUrl);
    if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash)
      throw new Error(
        'CONTENT_BASE_URL must be a public HTTPS directory URL without credentials, query or fragment',
      );
  }
  async load() {
    let directory = this.baseUrl.replace(/\/$/, '');
    if (new URL(directory).pathname.endsWith('/latest.json')) {
      const response = await fetch(directory, {
        signal: AbortSignal.timeout(15000),
        redirect: 'error',
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(`R2: release manifest returned ${response.status}`);
      const raw = await response.text();
      if (raw.length > 2048) throw new Error('R2: release manifest exceeds 2KB');
      const manifest = z
        .object({
          schemaVersion: z.literal(1),
          release: z.string().regex(/^[a-z0-9][a-z0-9-]{0,79}$/),
        })
        .strict()
        .parse(JSON.parse(raw));
      directory = `${directory.slice(0, directory.lastIndexOf('/'))}/releases/${manifest.release}`;
    }
    return assemble(
      await Promise.all(
        contentFiles.map(async (file) => {
          const response = await fetch(`${directory}/${file}.json`, {
            signal: AbortSignal.timeout(15000),
            redirect: 'error',
          });
          if (!response.ok) throw new Error(`R2: ${file}.json returned ${response.status}`);
          const body = await response.text();
          if (body.length > 2_000_000) throw new Error(`R2: ${file}.json exceeds 2MB`);
          return JSON.parse(body);
        }),
      ),
    );
  }
}
