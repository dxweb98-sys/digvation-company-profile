import { z } from 'zod';
import { requiredCopyKeys } from './copy-contract';

export const locales = ['id', 'en'] as const;
export type Locale = (typeof locales)[number];
export const localizedText = z.object({ id: z.string().min(1), en: z.string().min(1) }).strict();
const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
export const assetUrl = z.string().refine((value) => {
  try {
    if (value.split('/').some((part) => ['.', '..'].includes(decodeURIComponent(part))))
      return false;
    if (/^\/(?!\/)[^\s?#]*$/.test(value)) return true;
    const url = new URL(value);
    return url.protocol === 'https:' && !url.username && !url.password && !/\s/.test(value);
  } catch {
    return false;
  }
}, 'Use a local /path or HTTPS URL');
const webUrl = z.union([z.literal(''), z.string().url().startsWith('https://')]);
const email = z.union([z.literal(''), z.string().email()]);
const status = z.enum(['published', 'demo', 'draft']);
const step = z.object({ title: localizedText, text: localizedText }).strict();
const metadata = z
  .object({ title: z.string().min(1), description: z.string().min(1), ogImage: assetUrl })
  .strict();
const localizedMetadata = z.object({ id: metadata, en: metadata }).strict();
const legalCopy = z
  .object({
    title: z.string().min(1),
    intro: z.string().min(1),
    updated: z.string().min(1),
    sections: z
      .array(
        z
          .object({
            id: slug,
            title: z.string().min(1),
            body: z.array(z.string().min(1)).min(1),
            bullets: z.array(z.string().min(1)).optional(),
          })
          .strict(),
      )
      .min(1),
  })
  .strict();
export const campaignSchema = z
  .object({
    id: slug,
    slug,
    status,
    noindex: z.boolean(),
    eyebrow: localizedText,
    title: localizedText,
    summary: localizedText,
    problems: z.array(localizedText).min(1),
    solutions: z.array(localizedText).min(1),
    proofProject: slug,
    primaryCta: localizedText,
    faq: z.array(z.object({ question: localizedText, answer: localizedText }).strict()),
    tracking: z
      .object({
        id: z.object({ campaignName: z.string(), conversionLabel: z.string() }).strict(),
        en: z.object({ campaignName: z.string(), conversionLabel: z.string() }).strict(),
      })
      .strict(),
    seo: localizedMetadata,
  })
  .strict();
export const siteSchema = z
  .object({
    schemaVersion: z.literal(1),
    name: z.string().min(1),
    siteUrl: z.string().url().startsWith('https://'),
    foundedYear: z.number().int().min(1900).max(2100),
    googleSiteVerification: z.string().regex(/^[A-Za-z0-9_-]*$/),
    tagline: localizedText,
    description: localizedText,
    heroImage: assetUrl,
    contact: z
      .object({
        email,
        whatsapp: z.string().regex(/^$|^[1-9][0-9]{7,14}$/),
        endpoint: z
          .string()
          .refine((v) => v === '' || v === '/api/inquiry' || /^https:\/\/[^\s]+$/.test(v)),
        turnstileSiteKey: z
          .string()
          .regex(/^[A-Za-z0-9_-]*$/)
          .default(''),
        responseNote: localizedText,
      })
      .strict(),
    analytics: z
      .object({
        gaId: z.string().regex(/^$|^G-[A-Z0-9]+$/),
        metaPixelId: z.string().regex(/^$|^[0-9]+$/),
        gtmId: z.string().regex(/^$|^GTM-[A-Z0-9]+$/),
        clarityId: z.string().regex(/^[A-Za-z0-9]*$/),
        mode: z.enum(['off', 'consent', 'always']),
      })
      .strict(),
    social: z.array(z.object({ label: z.string(), url: webUrl })).default([]),
  })
  .strict();
export const serviceSchema = z
  .object({
    id: slug,
    slug,
    title: localizedText,
    short: localizedText,
    description: localizedText,
    for: localizedText,
    deliverables: z.array(localizedText).min(1),
    icon: z.enum(['website', 'system', 'product', 'support']),
  })
  .strict();
export const productSchema = z
  .object({
    id: slug,
    slug,
    status,
    name: z.string(),
    category: localizedText,
    summary: localizedText,
    description: localizedText,
    audience: localizedText,
    availability: localizedText,
    preview: z.enum(['pos', 'workshop']),
    image: assetUrl.optional(),
    useCases: z.array(localizedText).min(1),
    steps: z.array(step).min(1),
    features: z.array(step).min(1),
    faq: z.array(z.object({ question: localizedText, answer: localizedText }).strict()),
  })
  .strict();
export const workSchema = z
  .object({
    id: slug,
    slug,
    status,
    title: localizedText,
    category: z.enum(['website', 'system', 'product']),
    summary: localizedText,
    context: localizedText,
    solution: localizedText,
    result: localizedText,
    preview: z.enum(['pos', 'workshop', 'website']),
    services: z.array(localizedText),
    steps: z.array(step).min(1),
    productId: slug.optional(),
    image: assetUrl.optional(),
    liveUrl: webUrl.optional(),
    gallery: z.array(assetUrl).default([]),
    year: z.number().int().optional(),
    industry: localizedText.optional(),
    challenge: localizedText.optional(),
    featured: z.boolean().default(false),
    order: z.number().int().default(100),
    seo: localizedMetadata.optional(),
  })
  .strict();
export const bundleSchema = z
  .object({
    site: siteSchema,
    copy: z.object({
      id: z.record(z.string(), z.string().min(1)),
      en: z.record(z.string(), z.string().min(1)),
    }),
    services: z.array(serviceSchema),
    products: z.array(productSchema),
    works: z.array(workSchema),
    campaigns: z.array(campaignSchema),
    legal: z
      .object({
        privacy: z.object({ id: legalCopy, en: legalCopy }).strict(),
        terms: z.object({ id: legalCopy, en: legalCopy }).strict(),
      })
      .strict(),
  })
  .superRefine((bundle, ctx) => {
    for (const locale of locales)
      for (const key of requiredCopyKeys)
        if (!bundle.copy[locale][key])
          ctx.addIssue({
            code: 'custom',
            message: `Missing required copy: ${locale}.${key}`,
          });
    if (!bundle.services.some((s) => s.icon !== 'support'))
      ctx.addIssue({
        code: 'custom',
        message: 'At least one main service is required',
      });
    const idKeys = Object.keys(bundle.copy.id).sort();
    const enKeys = Object.keys(bundle.copy.en).sort();
    if (JSON.stringify(idKeys) !== JSON.stringify(enKeys))
      ctx.addIssue({
        code: 'custom',
        message: 'ID and EN copy keys must match',
      });
    for (const [name, items] of Object.entries({
      services: bundle.services,
      products: bundle.products,
      works: bundle.works,
      campaigns: bundle.campaigns,
    })) {
      if (
        new Set(items.map((x) => x.slug)).size !== items.length ||
        new Set(items.map((x) => x.id)).size !== items.length
      )
        ctx.addIssue({
          code: 'custom',
          message: `Duplicate ${name} slug or ID`,
        });
    }
    for (const work of bundle.works)
      if (
        work.productId &&
        !bundle.products.some(
          (p) => p.id === work.productId && (work.status === 'draft' || p.status !== 'draft'),
        )
      )
        ctx.addIssue({
          code: 'custom',
          message: `Unknown productId in ${work.id}`,
        });
    for (const campaign of bundle.campaigns) {
      const proof = bundle.works.find((work) => work.id === campaign.proofProject);
      if (!proof || (campaign.status === 'published' && proof.status !== 'published'))
        ctx.addIssue({
          code: 'custom',
          message: `Campaign ${campaign.id} requires published real proof`,
        });
    }
  });
export type ContentBundle = z.infer<typeof bundleSchema>;
export type Product = z.infer<typeof productSchema>;
export type Work = z.infer<typeof workSchema>;
export type Service = z.infer<typeof serviceSchema>;
export type Site = z.infer<typeof siteSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
