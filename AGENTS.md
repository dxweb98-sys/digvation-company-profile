# Digvation repository guide

## Product intent

This repository is Digvation's conversion-focused, bilingual company profile. Every change should reinforce one idea: Digvation is a practical digitalization partner that turns fragmented business operations into connected, usable systems.

Do not make the site feel like a generic software house, AI agency, or template-driven SaaS landing page.

## Read before changing

Open only the source of truth relevant to the task:

| Change                                  | Read first                                               |
| --------------------------------------- | -------------------------------------------------------- |
| Positioning, voice, or copy             | `docs/CONTENT_STRATEGY.md`                               |
| Homepage sections                       | `docs/HOMEPAGE_SECTIONS.md`                              |
| UI, typography, layout, or motion       | `docs/EXPERIENCE_STRATEGY.md`                            |
| Routes, components, or architecture     | `docs/ARCHITECTURE.md`                                   |
| Solutions, work, or content collections | `docs/CONTENT_MANAGEMENT.md`                             |
| SEO, ads, analytics, or conversion      | `docs/COMMERCIAL_READINESS.md` and `docs/MEASUREMENT.md` |
| Deployment or environment variables     | `docs/PRE_DEPLOY_CLOUDFLARE.md`                          |
| QA and known limitations                | `docs/QA_REVIEW.md`                                      |

For cross-cutting work, follow `docs/CHANGE_POLICY.md`.

## Non-negotiable standards

- Keep Indonesian as the default experience and preserve the equivalent English route or content where applicable.
- Never invent clients, testimonials, metrics, certifications, integrations, or business outcomes.
- Keep copy short, specific, and human. Lead with the business problem, operational change, or outcome instead of technology jargon.
- Do not use em dashes in public-facing copy. Prefer a full stop, comma, colon, or a shorter sentence.
- Reuse existing design tokens, layouts, and components before introducing a new pattern.
- Avoid generic SaaS cards, decorative gradients, stock-style illustrations, and motion without meaning.
- Keep one clear page H1 and one visually dominant primary CTA.
- Preserve metadata, canonical URLs, language alternates, structured data, attribution, and lead-success behavior.
- Maintain keyboard access, visible focus, semantic HTML, responsive behavior, and reduced-motion support.
- Do not commit secrets or generated output such as `.env`, `.dev.vars`, `node_modules`, `dist`, or `.astro`.
- Remove an obsolete file only after confirming that no source, route, test, configuration, or documentation still references it.
- Document any new production dependency, route, analytics event, environment variable, or reusable UI pattern.

## Definition of done

1. Update the relevant source-of-truth document when a standard or behavior changes; documentation-only typo fixes do not require cascading updates.
2. Run `npm run format:check`.
3. Run `npm run qa`.
4. Check affected Indonesian and English experiences, mobile layout, keyboard navigation, and reduced motion.
5. Report changed files, validation performed, and any external blocker or intentionally deferred work.

## Review priorities

Treat these as blocking issues: fabricated proof, broken language parity, duplicate analytics events, metadata regressions, generic or inflated copy, inaccessible interaction, and weakened inquiry, privacy, consent, or security safeguards.
