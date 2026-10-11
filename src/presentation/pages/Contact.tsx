import { text } from '../../domain/localized';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  ArrowUpRightIcon,
  CheckCircleIcon,
  EnvelopeSimpleIcon,
  WhatsappLogoIcon,
  DownloadSimpleIcon,
} from '@phosphor-icons/react';
import { useContent } from '../context';
import { validateBrief, type Brief, type BriefErrors } from '../../application/brief';
import { pathFor } from '../../application/routes';
import { sendBrief, downloadBrief } from '../../infrastructure/contact';
import { track } from '../../infrastructure/analytics';
import { Turnstile } from '../components/Turnstile';
import {
  addMessageToWhatsAppUrl,
  buildWhatsAppInquiryMessage,
} from '../../domain/inquiry/whatsapp';
import { PageIntro, Eyebrow } from '../components/ui';
const initial: Brief = {
  name: '',
  business: '',
  email: '',
  need: '',
  message: '',
  consent: false,
};
export function Contact() {
  const { content, locale, t } = useContent();
  const [brief, setBrief] = useState<Brief>(initial);
  const [errors, setErrors] = useState<BriefErrors>({});
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'failed' | 'downloaded'>('idle');
  const form = useRef<HTMLFormElement>(null);
  const started = useRef(false);
  const endpoint = content.site.contact.endpoint;
  const [token, setToken] = useState('');
  const [challenge, setChallenge] = useState(0);
  useEffect(() => {
    const query = new URLSearchParams(window.location.search);
    const need = query.get('need') ?? '';
    if (['website', 'system', 'product', 'support', 'unsure'].includes(need))
      setBrief((b) => ({ ...b, need }));
  }, []);
  const field = (key: keyof Brief, value: string | boolean) => {
    setBrief((b) => ({ ...b, [key]: value }));
    setErrors((e) => ({ ...e, [key]: undefined }));
  };
  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (state === 'sending') return;
    const next = validateBrief(brief);
    setErrors(next);
    if (Object.keys(next).length) {
      const first = Object.keys(next)[0];
      form.current?.querySelector<HTMLElement>(`[id="${first}"]`)?.focus();
      return;
    }
    if (!endpoint) {
      downloadBrief(
        brief,
        Object.fromEntries(
          ['name', 'business', 'email', 'need', 'message'].map((k) => [k, t(`contact.${k}`)]),
        ),
      );
      setState('downloaded');
      track('brief_download', { locale, need: brief.need });
      return;
    }
    setState('sending');
    track('contact_submit', { locale, need: brief.need });
    try {
      const honeypot = String(new FormData(form.current!).get('website') ?? '');
      await sendBrief(endpoint, brief, locale, token, honeypot);
      setState('sent');
      track('lead_form_submit', { locale, need: brief.need });
    } catch {
      // Verification can consume a token even when subsequent delivery fails.
      setToken('');
      setChallenge((value) => value + 1);
      setState('failed');
    }
  };
  const error = (key: keyof Brief) =>
    errors[key] ? (
      <span className="field-error" id={`${key}-error`}>
        {t(`contact.${errors[key]}`)}
      </span>
    ) : null;
  return (
    <>
      <PageIntro
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        intro={t('contact.intro')}
      />
      <section className="contact-layout container">
        <div className="contact-form-wrap">
          {state === 'sent' ? (
            <div className="contact-success" role="status">
              <CheckCircleIcon size={56} weight="duotone" />
              <h2>{t('contact.sent')}</h2>
              <p>{t('contact.sentText')}</p>
            </div>
          ) : (
            <form
              className="contact-form"
              method="post"
              action={endpoint || undefined}
              data-clarity-mask="true"
              onFocus={() => {
                if (!started.current) {
                  started.current = true;
                  track('contact_start', { locale });
                }
              }}
              onSubmit={submit}
              noValidate
              ref={form}
            >
              <input type="hidden" name="locale" value={locale} />
              <div className="honeypot" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" name="website" tabIndex={-1} autoComplete="off" />
              </div>
              <div className="form-row">
                {(['name', 'business'] as const).map((key) => (
                  <div className="field" key={key}>
                    <label htmlFor={key}>
                      {t(`contact.${key}`)} <span>*</span>
                    </label>
                    <input
                      id={key}
                      name={key === 'business' ? 'company' : key}
                      autoComplete={key === 'name' ? 'name' : 'organization'}
                      value={brief[key]}
                      onChange={(e) => field(key, e.target.value)}
                      placeholder={t(`contact.${key}Placeholder`)}
                      maxLength={key === 'name' ? 80 : 120}
                      aria-invalid={!!errors[key]}
                      aria-describedby={errors[key] ? `${key}-error` : undefined}
                      required
                    />
                    {error(key)}
                  </div>
                ))}
              </div>
              <div className="field">
                <label htmlFor="email">
                  {t('contact.email')} <span>*</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder={locale === 'id' ? 'nama@bisniskalian.com' : 'name@yourbusiness.com'}
                  value={brief.email}
                  onChange={(e) => field('email', e.target.value)}
                  maxLength={160}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                  required
                />
                {error('email')}
              </div>
              <div className="field">
                <label htmlFor="need">
                  {t('contact.need')} <span>*</span>
                </label>
                <select
                  id="need"
                  name="need"
                  value={brief.need}
                  onChange={(e) => field('need', e.target.value)}
                  aria-invalid={!!errors.need}
                  aria-describedby={errors.need ? 'need-error' : undefined}
                  required
                >
                  <option value="">{t('contact.select')}</option>
                  {['website', 'system', 'product', 'support', 'unsure'].map((key) => (
                    <option key={key} value={key}>
                      {key === 'unsure'
                        ? t('contact.unsure')
                        : key === 'support'
                          ? t('process.support')
                          : t(`ui.${key}`)}
                    </option>
                  ))}
                </select>
                {error('need')}
              </div>
              <div className="field">
                <label htmlFor="message">
                  {t('contact.message')} <span>*</span>
                </label>
                <textarea
                  id="message"
                  name="improvement"
                  rows={5}
                  value={brief.message}
                  onChange={(e) => field('message', e.target.value)}
                  placeholder={t('contact.messagePlaceholder')}
                  maxLength={2200}
                  aria-invalid={!!errors.message}
                  aria-describedby={errors.message ? 'message-error' : undefined}
                  required
                />
                {error('message')}
              </div>
              <div className="consent-field">
                <label>
                  <input
                    type="checkbox"
                    name="consent"
                    checked={brief.consent}
                    onChange={(e) => field('consent', e.target.checked)}
                    aria-invalid={!!errors.consent}
                    aria-describedby={errors.consent ? 'consent-error' : undefined}
                  />
                  <span>
                    {t('contact.consent')}{' '}
                    <a href={pathFor('privacy', locale)}>{t('footer.privacy')}</a>
                  </span>
                </label>
                {error('consent')}
              </div>
              {!endpoint && <p className="preview-notice">{t('contact.unconfigured')}</p>}
              {endpoint && content.site.contact.turnstileSiteKey && (
                <Turnstile
                  key={challenge}
                  siteKey={content.site.contact.turnstileSiteKey}
                  locale={locale}
                  onToken={setToken}
                />
              )}
              <button
                type="submit"
                className="button"
                disabled={
                  state === 'sending' ||
                  !!(endpoint && content.site.contact.turnstileSiteKey && !token)
                }
              >
                {state === 'sending'
                  ? t('contact.sending')
                  : endpoint
                    ? t('contact.submit')
                    : t('contact.download')}
                {endpoint ? <ArrowUpRightIcon size={19} /> : <DownloadSimpleIcon size={19} />}
              </button>
              <div aria-live="polite">
                {state === 'failed' && (
                  <p className="field-error form-status">{t('contact.failed')}</p>
                )}
                {state === 'downloaded' && <p className="form-status">{t('contact.downloaded')}</p>}
              </div>
            </form>
          )}
        </div>
        <aside className="contact-aside">
          <Eyebrow>{t('contact.next')}</Eyebrow>
          <ol>
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <span>0{i}</span>
                <p>{t(`contact.next${i}`)}</p>
              </li>
            ))}
          </ol>
          <p className="response-note">{text(content.site.contact.responseNote, locale)}</p>
          {(content.site.contact.email || content.site.contact.whatsapp) && (
            <div className="direct-contact">
              <h2>{t('contact.direct')}</h2>
              {content.site.contact.email && (
                <a
                  href={`mailto:${content.site.contact.email}`}
                  onClick={() => track('lead_contact_click', { channel: 'email', locale })}
                >
                  <EnvelopeSimpleIcon size={20} />
                  {content.site.contact.email}
                  <ArrowUpRightIcon size={17} />
                </a>
              )}
              {content.site.contact.whatsapp && (
                <a
                  href={addMessageToWhatsAppUrl(
                    `https://wa.me/${content.site.contact.whatsapp}`,
                    buildWhatsAppInquiryMessage(locale, {
                      name: brief.name,
                      company: brief.business,
                      email: brief.email,
                      improvement: brief.message,
                    }),
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => track('lead_contact_click', { channel: 'whatsapp', locale })}
                >
                  <WhatsappLogoIcon size={22} />
                  WhatsApp
                  <ArrowUpRightIcon size={17} />
                </a>
              )}
            </div>
          )}
        </aside>
      </section>
    </>
  );
}
