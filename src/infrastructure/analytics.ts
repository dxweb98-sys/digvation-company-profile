import type { Site } from '../domain/content';
export type EventName =
  | 'page_view'
  | 'section_view'
  | 'project_view'
  | 'case_study_view'
  | 'service_view'
  | 'cta_click'
  | 'contact_start'
  | 'contact_submit'
  | 'contact_success'
  | 'whatsapp_click'
  | 'email_click'
  | 'language_change'
  | 'outbound_project_click'
  | 'scroll_depth_50'
  | 'scroll_depth_90'
  | 'outbound_click'
  | 'product_view'
  | 'lead_contact_click'
  | 'lead_form_submit'
  | 'brief_download'
  | 'portfolio_view';
type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
  clarity?: ((...args: unknown[]) => void) & { q?: unknown[][] };
  fbq?: ((...args: unknown[]) => void) & {
    queue?: unknown[][];
    loaded?: boolean;
    version?: string;
    push?: unknown;
    callMethod?: (...args: unknown[]) => void;
  };
  _fbq?: unknown;
};
const consentKey = 'digvation.analytics-consent.v1';
let active = false;
let settings: Site['analytics'] | undefined;
const pending: { name: EventName; details: Record<string, string> }[] = [];
export function readConsent(): 'accepted' | 'rejected' | null {
  try {
    const value = localStorage.getItem(consentKey);
    return value === 'accepted' || value === 'rejected' ? value : null;
  } catch {
    return null;
  }
}
function permitted() {
  return settings?.mode !== 'off' && (readConsent() === 'accepted' || settings?.mode === 'always');
}
export function saveConsent(value: 'accepted' | 'rejected') {
  try {
    localStorage.setItem(consentKey, value);
    if (value === 'rejected') sessionStorage.removeItem('digvation.attribution');
  } catch {
    /* Storage may be unavailable. */
  }
}
export function resetConsent() {
  try {
    localStorage.removeItem(consentKey);
    sessionStorage.removeItem('digvation.attribution');
  } catch {
    /* Storage may be unavailable. */
  }
  window.location.reload();
}
export function attribution(): Record<string, string> {
  if (!permitted()) {
    try {
      sessionStorage.removeItem('digvation.attribution');
    } catch {
      /* No storage. */
    }
    return {};
  }
  const incoming: Record<string, string> = {};
  if (typeof window === 'undefined') return incoming;
  const search = new URLSearchParams(window.location.search);
  const keys = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'fbclid',
  ];
  for (const key of keys) {
    const value = search.get(key);
    if (value) incoming[key] = value.slice(0, 180);
  }
  let saved: Record<string, string> = {};
  try {
    const raw: unknown = JSON.parse(sessionStorage.getItem('digvation.attribution') ?? '{}');
    if (raw && typeof raw === 'object')
      for (const key of [...keys, 'landingPage', 'referrer']) {
        const value = (raw as Record<string, unknown>)[key];
        if (typeof value === 'string') saved[key] = value.slice(0, 500);
      }
  } catch {
    /* Ignore invalid storage. */
  }
  if (Object.keys(incoming).length || !saved.landingPage) {
    saved = {
      ...saved,
      ...incoming,
      landingPage: window.location.origin + window.location.pathname,
    };
    try {
      if (document.referrer) {
        const ref = new URL(document.referrer);
        saved.referrer = ref.origin + ref.pathname;
      }
    } catch {
      /* Invalid referrer. */
    }
    try {
      sessionStorage.setItem('digvation.attribution', JSON.stringify(saved));
    } catch {
      /* No storage. */
    }
  }
  return saved;
}
function script(src: string) {
  const element = document.createElement('script');
  element.async = true;
  element.src = src;
  document.head.append(element);
}
function pageContext() {
  let referrer = '';
  try {
    const url = new URL(document.referrer);
    if (url.protocol === 'https:' || url.protocol === 'http:') referrer = url.origin + url.pathname;
  } catch {
    /* Empty or invalid referrers must override the provider default too. */
  }
  return {
    page_path: window.location.pathname,
    page_location: window.location.origin + window.location.pathname,
    page_referrer: referrer,
  };
}
export function startAnalytics(site: Site) {
  settings = site.analytics;
  if (active || !permitted()) return;
  if (!settings.gaId && !settings.gtmId && !settings.clarityId && !settings.metaPixelId) return;
  active = true;
  const w = window as AnalyticsWindow;
  w.dataLayer = w.dataLayer ?? [];
  attribution();
  if (settings.gaId) {
    // Google Tag requires an arguments object in the dataLayer.
    w.gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      w.dataLayer!.push(arguments);
    };
    w.gtag('js', new Date());
    w.gtag('config', settings.gaId, {
      anonymize_ip: true,
      send_page_view: false,
      ...pageContext(),
    });
    script(`https://www.googletagmanager.com/gtag/js?id=${settings.gaId}`);
  }
  if (settings.gtmId) {
    w.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    script(`https://www.googletagmanager.com/gtm.js?id=${settings.gtmId}`);
  }
  if (settings.clarityId) {
    const clarity = ((...args: unknown[]) => clarity.q!.push(args)) as NonNullable<
      AnalyticsWindow['clarity']
    >;
    clarity.q = [];
    w.clarity = clarity;
    script(`https://www.clarity.ms/tag/${settings.clarityId}`);
  }
  if (settings.metaPixelId) {
    const fbq = ((...args: unknown[]) => {
      if (fbq.callMethod) fbq.callMethod(...args);
      else fbq.queue!.push(args);
    }) as NonNullable<AnalyticsWindow['fbq']>;
    fbq.queue = [];
    fbq.loaded = true;
    fbq.version = '2.0';
    fbq.push = fbq;
    w.fbq = fbq;
    w._fbq = fbq;
    script('https://connect.facebook.net/en_US/fbevents.js');
    fbq('init', settings.metaPixelId);
  }
  track('page_view', { locale: document.documentElement.lang });
  for (const item of pending.splice(0)) track(item.name, item.details);
  const seen = new Set<number>();
  window.addEventListener(
    'scroll',
    () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      if (height <= 0) return;
      const ratio = window.scrollY / height;
      for (const milestone of [50, 90])
        if (ratio >= milestone / 100 && !seen.has(milestone)) {
          seen.add(milestone);
          track(milestone === 50 ? 'scroll_depth_50' : 'scroll_depth_90');
        }
    },
    { passive: true },
  );
  document.addEventListener('click', (event) => {
    const anchor = event.target instanceof Element ? event.target.closest('a') : null;
    if (!anchor) return;
    if (anchor.classList.contains('language-switch')) track('language_change');
    else if (anchor.classList.contains('button')) track('cta_click');
  });
}
export function track(input: EventName, details: Record<string, string> = {}) {
  if (!permitted()) return;
  const aliases: Partial<Record<EventName, EventName>> = {
    portfolio_view: 'case_study_view',
    lead_form_submit: 'contact_success',
    lead_contact_click:
      details.channel === 'email'
        ? 'email_click'
        : details.channel === 'whatsapp'
          ? 'whatsapp_click'
          : 'cta_click',
  };
  const name = aliases[input] ?? input;
  const safe: Record<string, string> = {};
  if (details.locale === 'id' || details.locale === 'en') safe.locale = details.locale;
  for (const key of ['product_id', 'work_id', 'campaign_id', 'service_id', 'section_id'])
    if (/^[a-z0-9-]{1,80}$/.test(details[key] ?? '')) safe[key] = details[key];
  if (['email', 'whatsapp'].includes(details.channel)) safe.channel = details.channel;
  if (['website', 'system', 'product', 'support', 'unsure'].includes(details.need))
    safe.need = details.need;
  if (!active) {
    pending.push({ name, details: safe });
    return;
  }
  const w = window as AnalyticsWindow;
  const context = pageContext();
  w.dataLayer?.push({ event: name, ...safe, ...context });
  w.gtag?.('event', name, { ...safe, ...context });
  if (name === 'contact_success') w.fbq?.('track', 'Lead', safe);
  else if (name === 'page_view') w.fbq?.('track', 'PageView', safe);
  else w.fbq?.('trackCustom', name, safe);
}
