import { text } from '../../domain/localized';
import { useEffect, useRef, useState } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
import { pathFor } from '../../application/routes';
import { PageIntro, Tabs, TextLink, Cta, Accordion, Eyebrow } from '../components/ui';
import { WebsiteDemo, ProductPreview } from '../components/Demos';
import { Process } from '../components/Process';
import { track } from '../../infrastructure/analytics';
export function Services() {
  const { content, locale, t } = useContent();
  const [active, setActive] = useState(0);
  const [ready, setReady] = useState(false);
  const measured = useRef(new Set<string>());
  const services = content.services.filter((s) => s.icon !== 'support');
  const service = services[active];
  useEffect(() => {
    const select = () => {
      const index = services.findIndex((item) => item.icon === window.location.hash.slice(1));
      if (index >= 0) setActive(index);
    };
    select();
    setReady(true);
    window.addEventListener('hashchange', select);
    return () => window.removeEventListener('hashchange', select);
  }, [content.services]);
  useEffect(() => {
    if (!ready || measured.current.has(service.id)) return;
    measured.current.add(service.id);
    track('service_view', { locale, service_id: service.id });
  }, [ready, service.id, locale]);
  return (
    <>
      <PageIntro
        eyebrow={t('services.eyebrow')}
        title={t('services.title')}
        intro={t('services.intro')}
      />
      <section className="service-showcase wide-container sage-panel" data-reveal>
        <div className="service-showcase-copy">
          <Tabs
            id="services"
            label={t('services.eyebrow')}
            items={services.map((s) => t(`ui.${s.icon}`))}
            value={active}
            onChange={(index) => {
              setActive(index);
              window.history.replaceState(null, '', `#${services[index].icon}`);
            }}
          />
          <div
            role="tabpanel"
            id="services-panel"
            aria-labelledby={`services-tab-${active}`}
            key={service.id}
          >
            <h2 id={service.icon}>{text(service.title, locale)}</h2>
            <p>{text(service.description, locale)}</p>
            <TextLink href={`${pathFor('contact', locale)}?need=${service.icon}`}>
              {t('ui.talk')}
            </TextLink>
          </div>
        </div>
        <div className="service-showcase-preview" key={`preview-${service.id}`}>
          {active === 0 ? (
            <WebsiteDemo />
          ) : (
            <ProductPreview kind={active === 1 ? 'pos' : 'workshop'} />
          )}
          <p className="demo-caption">{t('ui.preview')}</p>
        </div>
        <ul className="deliverables">
          {service.deliverables.map((d, i) => (
            <li key={i}>
              <CheckIcon size={17} />
              {text(d, locale)}
            </li>
          ))}
        </ul>
      </section>
      <noscript>
        <section className="container section">
          {services.map((item) => (
            <article key={item.id}>
              <h2>{text(item.title, locale)}</h2>
              <p>{text(item.description, locale)}</p>
              <ul>
                {item.deliverables.map((output, i) => (
                  <li key={i}>{text(output, locale)}</li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      </noscript>
      <section className="container section" id="cara-kerja">
        <div className="section-heading" data-reveal>
          <Eyebrow>{t('home.process.link')}</Eyebrow>
          <h2>{t('services.processTitle')}</h2>
        </div>
        <Process />
      </section>
      <section className="support-band" id="pendampingan">
        <div className="container support-band-layout">
          <div data-reveal>
            <Eyebrow>{t('home.support.label')}</Eyebrow>
            <h2>{t('services.supportTitle')}</h2>
            <p>{t('services.supportText')}</p>
          </div>
          <Accordion
            items={['start', 'support', 'cost'].map((key) => ({
              question: t(`faq.${key}Q`),
              answer: t(`faq.${key}A`),
            }))}
          />
        </div>
      </section>
      <Cta />
    </>
  );
}
