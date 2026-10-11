import { text } from '../../domain/localized';
import { useState } from 'react';
import { ArrowDownIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
import { pathFor } from '../../application/routes';
import { Eyebrow, TextLink, Cta, Tabs, CarouselArrows } from '../components/ui';
import {
  DiscoveryDemo,
  TransactionForm,
  ReportDemo,
  WebsiteDemo,
  ProductPreview,
} from '../components/Demos';
import { Process } from '../components/Process';
export function Home() {
  const { t, content, locale } = useContent();
  const [daily, setDaily] = useState(1);
  const [featured, setFeatured] = useState(0);
  const works = content.works
    .filter((p) => p.status === 'published' && p.featured)
    .sort((a, b) => a.order - b.order);
  const item = works[featured % Math.max(works.length, 1)];
  return (
    <>
      <section className="home-hero">
        <img
          className="hero-photo"
          src={content.site.heroImage}
          alt=""
          width="1920"
          height="1200"
          fetchPriority="high"
        />
        <div className="hero-shade" />
        <div className="hero-content">
          <p>{text(content.site.tagline, locale)}</p>
          <h1>
            <span>{t('hero.line1')}</span>
            <span>{t('hero.line2')}</span>
          </h1>
        </div>
        <a className="hero-scroll" href="#lebih-dekat">
          <span>{t('hero.scroll')}</span>
          <ArrowDownIcon size={23} />
        </a>
      </section>
      <section id="lebih-dekat" className="discovery-section section container">
        <div className="section-copy" data-reveal>
          <Eyebrow>{t('home.discovery.label')}</Eyebrow>
          <h2>{t('home.discovery.title')}</h2>
          <p>{t('home.discovery.text')}</p>
          <TextLink href={pathFor('services', locale)}>{t('home.discovery.link')}</TextLink>
        </div>
        <div data-reveal>
          <DiscoveryDemo />
        </div>
      </section>
      <section className="quiet-process container" data-reveal>
        <Process compact />
        <div>
          <h2>{t('home.process.title')}</h2>
          <p>{t('home.process.text')}</p>
          <TextLink href={`${pathFor('services', locale)}#cara-kerja`}>
            {t('home.process.link')}
          </TextLink>
        </div>
      </section>
      <section className="daily-section section">
        <div className="container">
          <div className="daily-heading" data-reveal>
            <Eyebrow>{t('home.daily.label')}</Eyebrow>
            <h2>{t('home.daily.title')}</h2>
            <p>{t('home.daily.intro')}</p>
          </div>
          <Tabs
            id="daily"
            label={t('home.daily.title')}
            items={[t('home.daily.tab1'), t('home.daily.tab2'), t('home.daily.tab3')]}
            value={daily}
            onChange={setDaily}
          />
          <div
            className="daily-content"
            role="tabpanel"
            id="daily-panel"
            aria-labelledby={`daily-tab-${daily}`}
          >
            <figure className="paper-figure" data-reveal>
              <img
                src="/images/paper-work.webp"
                alt={
                  locale === 'id'
                    ? 'Ilustrasi dua buku catatan di meja'
                    : 'Illustration of two notebooks on a table'
                }
                width="1200"
                height="900"
                loading="lazy"
              />
              <figcaption>{t('home.daily.caption')}</figcaption>
            </figure>
            <div className="daily-demo" key={daily}>
              {daily === 0 ? <WebsiteDemo /> : daily === 1 ? <TransactionForm /> : <ReportDemo />}
              <p className="demo-caption">{t('ui.preview')}</p>
            </div>
          </div>
          <TextLink
            href={`${pathFor('contact', locale)}?need=${daily === 0 ? 'website' : 'system'}`}
          >
            {t('ui.talk')}
          </TextLink>
        </div>
      </section>
      <section className="support-section container" data-reveal>
        <Eyebrow>{t('home.support.label')}</Eyebrow>
        <h2>{t('home.support.title')}</h2>
        <p>{t('home.support.text')}</p>
        <TextLink href={`${pathFor('services', locale)}#pendampingan`}>
          {t('home.support.link')}
        </TextLink>
      </section>
      {item && (
        <section className="featured-section container section">
          <div className="featured-heading" data-reveal>
            <Eyebrow>{t('home.proof.label')}</Eyebrow>
            <h2>{t('home.proof.title')}</h2>
          </div>
          <div className="featured-layout">
            <div className="featured-preview" key={item.id}>
              {item.image ? (
                <img
                  className="product-photo"
                  src={item.image}
                  alt={text(item.title, locale)}
                  width="1000"
                  height="650"
                  loading="lazy"
                />
              ) : (
                <ProductPreview kind={item.preview} />
              )}
              <p className="demo-caption">
                {text(item.title, locale)}
                {item.year ? ` / ${item.year}` : ''}
              </p>
            </div>
            <div className="featured-copy">
              <h3>{text(item.title, locale)}</h3>
              <p>{text(item.summary, locale)}</p>
              <TextLink href={pathFor('work-detail', locale, item.slug)}>
                {t('work.story')}
              </TextLink>
              <Tabs
                id="featured"
                label={t('home.proof.title')}
                items={works.map((p) => text(p.title, locale))}
                value={featured}
                onChange={setFeatured}
              />
              <div
                role="tabpanel"
                id="featured-panel"
                aria-labelledby={`featured-tab-${featured}`}
                className="sr-only"
              >
                {text(item.title, locale)}
              </div>
              <CarouselArrows
                index={featured}
                count={works.length}
                onPrevious={() => setFeatured((featured - 1 + works.length) % works.length)}
                onNext={() => setFeatured((featured + 1) % works.length)}
              />
              <TextLink href={pathFor('work', locale)}>{t('home.proof.link')}</TextLink>
            </div>
          </div>
        </section>
      )}
      <Cta />
    </>
  );
}
