export type InquirySubmission = {
  locale: 'id' | 'en';
  name: string;
  email: string;
  phone?: string;
  company?: string;
  improvement: string;
  need?: 'website' | 'system' | 'product' | 'support' | 'unsure';
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  clickId?: string;
  landingPage?: string;
  referrer?: string;
  consent: true;
};

export type ParsedInquiry = {
  submission: InquirySubmission;
  honeypot: string;
  turnstileToken: string;
};

export type InquiryValidationResult =
  { ok: true; data: ParsedInquiry } | { ok: false; locale: 'id' | 'en'; message: string };

const value = (form: FormData, key: string, max: number) =>
  String(form.get(key) ?? '')
    .trim()
    .slice(0, max);

export function validateInquiryForm(form: FormData): InquiryValidationResult {
  const locale = value(form, 'locale', 2) === 'en' ? 'en' : 'id';
  const name = value(form, 'name', 80);
  const email = value(form, 'email', 160);
  const phone = value(form, 'phone', 40);
  const company = value(form, 'company', 120);
  const improvement = value(form, 'improvement', 2200);
  const selectedNeed = value(form, 'need', 20);
  const need = ['website', 'system', 'product', 'support', 'unsure'].includes(selectedNeed)
    ? (selectedNeed as InquirySubmission['need'])
    : undefined;
  const utmSource = value(form, 'utmSource', 120);
  const utmMedium = value(form, 'utmMedium', 120);
  const utmCampaign = value(form, 'utmCampaign', 180);
  const utmContent = value(form, 'utmContent', 180);
  const utmTerm = value(form, 'utmTerm', 180);
  const clickId = value(form, 'clickId', 240);
  const landingPage = value(form, 'landingPage', 500);
  const referrer = value(form, 'referrer', 500);
  const honeypot = value(form, 'website', 200);
  const consent = ['true', 'on', '1'].includes(value(form, 'consent', 8));
  const turnstileToken = value(form, 'cf-turnstile-response', 4096);

  const invalid =
    locale === 'id'
      ? 'Ada data yang belum lengkap atau belum valid.'
      : 'Some information is missing or invalid.';

  if (name.length < 2 || improvement.length < 20 || !consent) {
    return { ok: false, locale, message: invalid };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, locale, message: invalid };
  }

  return {
    ok: true,
    data: {
      submission: {
        locale,
        name,
        email,
        ...(phone ? { phone } : {}),
        ...(company ? { company } : {}),
        improvement,
        ...(need ? { need } : {}),
        ...(utmSource ? { utmSource } : {}),
        ...(utmMedium ? { utmMedium } : {}),
        ...(utmCampaign ? { utmCampaign } : {}),
        ...(utmContent ? { utmContent } : {}),
        ...(utmTerm ? { utmTerm } : {}),
        ...(clickId ? { clickId } : {}),
        ...(landingPage ? { landingPage } : {}),
        ...(referrer ? { referrer } : {}),
        consent: true,
      },
      honeypot,
      turnstileToken,
    },
  };
}
