# Design QA

final result: passed

## Source and matching states

Source: the previously approved Digvation React implementation in the sibling digvation-profile project, using the supplied Digvation logo and the approved photographic hero. The migration changes content and real project evidence as requested while preserving that visual direction.

Saved source and implementation captures live in docs/qa. Desktop viewport images are 1348 x 926 pixels. The matching mobile hero images are 390 x 844 pixels. Both comparisons use Indonesian, the top of the page, menu closed and default service tab selected. A temporary iframe fixture supplied exact mobile widths and was removed from source before the final build.

Compared both images together at full-page/viewport scale and inspected a focused headline crop. Evidence:

- comparison-hero.jpg: desktop first screen.
- comparison-hero-focus.jpg: matching hero typography and photograph region.
- comparison-mobile-aligned.jpg: matching mobile hero.
- comparison-services-default.jpg: matching default Website service panel.
- comparison-about.jpg: About first screen, with intentional 2022 story copy update.
- digvation-refactor-work-desktop.jpg: real screenshots, quiet hierarchy and final CTA.
- digvation-refactor-contact-tablet.jpg: tablet inquiry layout.
- digvation-refactor-work-320.jpg and digvation-refactor-product-320.jpg: narrow screen evidence.

## Five fidelity surfaces

| Surface             | Assessment                                                                                                                                                                                         |
| ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Typography          | The same Manrope font, weight, headline scale and centered hero wrapping. Navigation remains compact. Longer About copy reflects the new user-provided story.                                      |
| Spacing and layout  | Full photographic first screen, restrained alternating sections, generous whitespace and one dominant section interaction. Mobile hero position and wrapping align with the source.                |
| Color and borders   | Warm off-white surfaces, muted pale-green panels, teal actions, restrained dividers and the same dark image overlay. No neon or extra decorative panels.                                           |
| Images and graphics | Supplied logo unchanged; original hero photograph and notebook graphic preserved. Real repository screenshots replace demonstration portfolio items. Product interfaces are labeled illustrations. |
| Copy                | Default Indonesian, English parity, partner positioning, small/medium business history since 2022, after-sales care and future ambitions stated without invented evidence.                         |

## Interaction and accessibility

Production-browser checks covered mobile focus loop/Escape, keyboard service tabs, work filters and case-detail navigation, language counterpart links, example product transaction, native campaign FAQ, invalid Contact form focus and a failed-send state that retains fields. Narrow and tablet checks showed no horizontal overflow. The fresh production session showed no React or hydration errors.

Reduced-motion behavior was inspected in source/CSS; actual browser preference emulation is unavailable. Live provider/inbox tests and Cloudflare response headers require a configured development deployment and are tracked in docs/QA_REVIEW.md.

## Issue ledger

No remaining P0, P1 or P2 visual or local-journey defects. The campaign headline duplicated conjunction was corrected in both languages. Intentional deviations are the requested authentic project evidence, revised 2022 story, legal/campaign route preservation and stricter confirmed-delivery inquiry behavior.
