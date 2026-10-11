# Measurement

Keep PUBLIC_ANALYTICS_MODE=consent as the default. PUBLIC_GA_ID, PUBLIC_GTM_ID, PUBLIC_CLARITY_ID and PUBLIC_GOOGLE_SITE_VERIFICATION remain compatible with the previous setup. Optional META_PIXEL_ID enables a direct pixel; use either the direct pixel or GTM for Meta, never both. Mode off disables optional measurement; always is an explicit operator setting requiring the corresponding privacy review before use.

Semantic events include page_view, cta_click, contact_start, contact_submit, contact_success, email_click, whatsapp_click, language_change, case_study_view, product_view, service_view, outbound_project_click, and scroll_depth_50/90. Consent loads each configured provider once per document. Direct GA4 uses send_page_view:false, then one explicit page_view. Browser navigation is ordinary full-document navigation.

`contact_success` is the conversion event. It fires only after `/api/inquiry` reports `{ok:true, delivered:true}`. Dry-run, honeypot, malformed responses, provider failures, brief downloads, WhatsApp drafts and mailto clicks are not successful leads. Track contact_submit as an attempt, not a conversion. GA4 key events, Google Ads and Meta Lead should use the same confirmed-delivery event.

GTM is the marketing-tag entry point. Do not install another GA4 configuration in GTM when direct PUBLIC_GA_ID is enabled. Do not count the same lead twice by configuring both a primary Google Ads tag and a primary import of the same GA4 key event.

Events allowlist locale, known need/channel and safe entity identifiers. Names, emails, business names and messages are excluded. GA configuration and events explicitly set page_path, page_location and page_referrer without query strings or fragments; empty referrers also override the provider default. GTM tags should use these sanitized data-layer fields for URL context rather than the built-in full Page URL. Consented inquiry attribution includes the five UTM fields, click ID, landing path and referrer path; query strings are excluded from landing/referrer fields. Invalid or rejected consent clears stored attribution. Clarity masks the entire inquiry form.

Validate actual event delivery and inquiry acceptance on an authorized Cloudflare preview with the real selected provider configuration. Mock tests validate contracts and deduplication intent, not vendor dashboards or inbox delivery.
