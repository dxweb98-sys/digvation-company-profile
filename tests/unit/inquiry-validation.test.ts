import { describe, expect, it } from 'vitest';
import { validateInquiryForm } from '../../src/domain/inquiry/validation';

function validForm() {
  const form = new FormData();
  form.set('locale', 'id');
  form.set('name', 'Nadia');
  form.set('email', 'nadia@example.com');
  form.set('improvement', 'Order masih dicatat ulang dan statusnya sulit dipantau.');
  form.set('consent', 'true');
  return form;
}

describe('validateInquiryForm', () => {
  it('accepts a valid lead and keeps campaign attribution', () => {
    const form = validForm();
    form.set('utmSource', 'google');
    form.set('utmCampaign', 'business-system');
    form.set('clickId', 'gclid-example');
    form.set('need', 'system');
    form.set('landingPage', '/?utm_source=google');

    const result = validateInquiryForm(form);

    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.data.submission).toMatchObject({
      locale: 'id',
      utmSource: 'google',
      utmCampaign: 'business-system',
      clickId: 'gclid-example',
      need: 'system',
      landingPage: '/?utm_source=google',
    });
  });

  it('rejects a lead without consent', () => {
    const form = validForm();
    form.delete('consent');

    expect(validateInquiryForm(form)).toMatchObject({ ok: false, locale: 'id' });
  });

  it('rejects an invalid email address', () => {
    const form = validForm();
    form.set('email', 'not-an-email');

    expect(validateInquiryForm(form)).toMatchObject({ ok: false, locale: 'id' });
  });
});
