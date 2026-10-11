import { describe, expect, it } from 'vitest';
import {
  addMessageToWhatsAppUrl,
  buildWhatsAppInquiryMessage,
} from '../../src/domain/inquiry/whatsapp';

describe('WhatsApp inquiry draft', () => {
  it('builds an Indonesian message from completed fields and omits empty ones', () => {
    const message = buildWhatsAppInquiryMessage('id', {
      name: '  Nadia  ',
      company: '',
      email: 'nadia@example.com',
      improvement: 'Order masih dicatat ulang dan statusnya sulit dipantau.',
    });

    expect(message).toContain('Nama: Nadia');
    expect(message).toContain('Email: nadia@example.com');
    expect(message).toContain('Kebutuhan yang ingin dibuat lebih mudah: Order masih dicatat ulang');
    expect(message).not.toContain('Perusahaan / Organisasi:');
  });

  it('keeps the English fallback useful when the form is still empty', () => {
    const message = buildWhatsAppInquiryMessage('en', {});

    expect(message).toContain('Hello Digvation');
    expect(message).toContain('digvation.id');
    expect(message).not.toContain('Name:');
  });

  it('adds the encoded draft without changing the WhatsApp destination', () => {
    const result = addMessageToWhatsAppUrl(
      'https://wa.me/628123456789?text=old',
      'Halo Digvation\nNama: Nadia',
    );
    const url = new URL(result);

    expect(url.hostname).toBe('wa.me');
    expect(url.pathname).toBe('/628123456789');
    expect(url.searchParams.get('text')).toBe('Halo Digvation\nNama: Nadia');
  });
});
