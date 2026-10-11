export interface Brief {
  name: string;
  business: string;
  email: string;
  need: string;
  message: string;
  consent: boolean;
}
export type BriefErrors = Partial<
  Record<keyof Brief, 'required' | 'emailError' | 'messageError' | 'consentError'>
>;
export function validateBrief(brief: Brief): BriefErrors {
  const errors: BriefErrors = {};
  if (brief.name.trim().length < 2 || brief.name.trim().length > 80) errors.name = 'required';
  if (!brief.business.trim() || brief.business.trim().length > 120) errors.business = 'required';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(brief.email) || brief.email.length > 160)
    errors.email = 'emailError';
  if (!['website', 'system', 'product', 'support', 'unsure'].includes(brief.need))
    errors.need = 'required';
  if (brief.message.trim().length < 20 || brief.message.length > 2200)
    errors.message = 'messageError';
  if (!brief.consent) errors.consent = 'consentError';
  return errors;
}
