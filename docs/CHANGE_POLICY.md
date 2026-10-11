# Change policy

Latest user instructions override older design or architecture guidance. Record cross-cutting decisions in the same branch as their implementation so code and documentation agree.

| Change                                       | Read/update                                                  |
| -------------------------------------------- | ------------------------------------------------------------ |
| Public copy and company story                | CONTENT_STRATEGY, content/id.json, content/en.json, About    |
| Home hierarchy                               | HOMEPAGE_SECTIONS, EXPERIENCE_STRATEGY                       |
| Architecture and runtime                     | ARCHITECTURE, README, package/CI                             |
| Work, products, campaigns and R2 publication | CONTENT_MANAGEMENT, domain content schemas, route/SEO audits |
| Inquiry, consent and tracking                | MEASUREMENT, SECURITY_REVIEW, legal copy, backend tests      |
| Deployment variables and providers           | PRE_DEPLOY_CLOUDFLARE, .env.example                          |
| Readiness and verification                   | COMMERCIAL_READINESS, QA_REVIEW, design-qa.md                |

Before removing a file, inspect consumers, routes, tests, config and docs and migrate their references. Keep ID/EN aligned, use actual project evidence, preserve canonical/alternate/noindex behavior and avoid duplicate analytics. Never commit credentials, generated output or dependencies. Required repository gates are npm run format:check and npm run qa, plus affected rendered journeys. Any live service check that is not performed must be reported as unverified.
