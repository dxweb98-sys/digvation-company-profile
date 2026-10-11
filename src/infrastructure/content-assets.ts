import { access } from 'node:fs/promises';
import { resolve } from 'node:path';
import type { ContentBundle } from '../domain/content';

// Shared by build preparation and publication, always against the loaded snapshot.
export async function validateContentAssets(content: ContentBundle, publicDirectory: string) {
  const images = [
    content.site.heroImage,
    ...content.products.map((item) => item.image),
    ...content.works.flatMap((item) => [
      item.image,
      ...item.gallery,
      item.seo?.id.ogImage,
      item.seo?.en.ogImage,
    ]),
    ...content.campaigns.flatMap((item) => [item.seo.id.ogImage, item.seo.en.ogImage]),
  ];
  for (const image of images) {
    if (image?.startsWith('/')) await access(resolve(publicDirectory, image.slice(1)));
  }
}
