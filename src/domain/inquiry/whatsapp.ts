import type { Locale } from '../content';

export type WhatsAppInquiryDraft = {
  name?: string;
  company?: string;
  email?: string;
  phone?: string;
  improvement?: string;
};

const clean = (value: string | undefined, limit: number) => (value ?? '').trim().slice(0, limit);

export function buildWhatsAppInquiryMessage(locale: Locale, draft: WhatsAppInquiryDraft) {
  const copy =
    locale === 'id'
      ? {
          intro:
            'Halo Digvation, saya ingin berdiskusi mengenai kebutuhan digital untuk bisnis saya.',
          name: 'Nama',
          company: 'Perusahaan / Organisasi',
          email: 'Email',
          phone: 'WhatsApp / Telepon',
          problem: 'Kebutuhan yang ingin dibuat lebih mudah',
          source: 'Pesan ini disiapkan dari form di digvation.id.',
        }
      : {
          intro: 'Hello Digvation, I would like to discuss a digital need for my business.',
          name: 'Name',
          company: 'Company / Organization',
          email: 'Email',
          phone: 'WhatsApp / Phone',
          problem: 'What I would like to make easier',
          source: 'This message was prepared from the form at digvation.id.',
        };
  const details = [
    [copy.name, clean(draft.name, 300)],
    [copy.company, clean(draft.company, 300)],
    [copy.email, clean(draft.email, 300)],
    [copy.phone, clean(draft.phone, 300)],
    [copy.problem, clean(draft.improvement, 1600)],
  ]
    .filter((entry) => entry[1])
    .map(([label, content]) => `${label}: ${content}`);

  return [copy.intro, details.length ? details.join('\n') : '', copy.source]
    .filter(Boolean)
    .join('\n\n');
}

export function addMessageToWhatsAppUrl(url: string, message: string) {
  const target = new URL(url);
  target.searchParams.set('text', message);
  return target.toString();
}
