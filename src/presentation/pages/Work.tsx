import { text } from '../../domain/localized';
import { useState, useEffect } from 'react';
import { ArrowUpRightIcon, ReceiptIcon, WrenchIcon, BrowserIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
import { type Work as WorkEntity } from '../../domain/content';
import { pathFor } from '../../application/routes';
import { track } from '../../infrastructure/analytics';
import { PageIntro, Tabs, Cta, TextLink, Eyebrow } from '../components/ui';
import { ProductPreview } from '../components/Demos';
export function Work() {
  const { t, content, locale } = useContent();
  const [filter, setFilter] = useState(0);
  const categories = ['all', 'website', 'system', 'product'];
  const works = content.works
    .filter((x) => x.status !== 'draft' && (filter === 0 || x.category === categories[filter]))
    .sort((a, b) => a.order - b.order);
  return (
    <>
      <PageIntro eyebrow={t('work.eyebrow')} title={t('work.title')} intro={t('work.intro')} />
      <section className="container work-section">
        <Tabs
          id="work-filter"
          label={t('work.filter')}
          value={filter}
          onChange={setFilter}
          items={categories.map((c) => t(`ui.${c}`))}
        />
        <div id="work-filter-panel" role="tabpanel" aria-labelledby={`work-filter-tab-${filter}`}>
          <p className="filter-count" aria-live="polite">
            {works.length} {locale === 'id' ? 'karya' : 'projects'}
          </p>
          {works[0] && <FeaturedWork work={works[0]} />}
          <div className="work-grid">
            {works.slice(1).map((work) => (
              <WorkCard work={work} key={work.id} />
            ))}
            {!works.length && <p className="empty-state">{t('ui.empty')}</p>}
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
function FeaturedWork({ work }: { work: WorkEntity }) {
  const { locale, t } = useContent();
  const href = pathFor('work-detail', locale, work.slug);
  return (
    <article className="featured-work">
      <div className="featured-work-visual">
        {work.image ? (
          <a href={href} aria-label={text(work.title, locale)}>
            <img src={work.image} alt={text(work.title, locale)} width="1348" height="926" />
          </a>
        ) : (
          <ProductPreview kind={work.preview} />
        )}
      </div>
      <div className="featured-work-copy">
        <Eyebrow>{t(`ui.${work.category}`)}</Eyebrow>
        <h2>{text(work.title, locale)}</h2>
        {work.status === 'demo' && <p className="featured-work-label">{t('ui.demo')}</p>}
        <p>{text(work.summary, locale)}</p>
        <dl>
          <dt>{t('work.solution')}</dt>
          <dd>{work.services.map((item) => text(item, locale)).join(' / ')}</dd>
        </dl>
        <TextLink href={href}>{t('work.story')}</TextLink>
      </div>
    </article>
  );
}
export function WorkCard({ work }: { work: WorkEntity }) {
  const { locale, t } = useContent();
  const Icon =
    work.preview === 'pos' ? ReceiptIcon : work.preview === 'workshop' ? WrenchIcon : BrowserIcon;
  return (
    <a
      className={`work-card work-${work.preview}`}
      href={pathFor('work-detail', locale, work.slug)}
    >
      <div className="work-card-visual">
        {work.image ? (
          <img src={work.image} alt="" loading="lazy" width="700" height="480" />
        ) : (
          <div className="work-art-content">
            <Icon size={44} weight="duotone" />
            <span>
              {work.preview === 'pos'
                ? 'Digvation POS'
                : work.preview === 'workshop'
                  ? 'Digvation Workshop'
                  : t('demo.nameSite')}
            </span>
            <p>{text(work.summary, locale)}</p>
            <div className="work-mini-row">
              <span>
                {t(
                  work.preview === 'workshop'
                    ? 'demo.intake'
                    : work.preview === 'pos'
                      ? 'demo.transaction'
                      : 'demo.business',
                )}
              </span>
              <CheckBadge />
            </div>
          </div>
        )}
        <span className="work-card-arrow">
          <ArrowUpRightIcon size={23} />
        </span>
      </div>
      <div className="work-card-meta">
        <span>{t(`ui.${work.category}`)}</span>
        {work.status === 'demo' && <span>{t('ui.demo')}</span>}
      </div>
      <h2>{text(work.title, locale)}</h2>
    </a>
  );
}
function CheckBadge() {
  return <ArrowUpRightIcon size={18} aria-hidden />;
}
export function WorkDetail() {
  const { route, t, locale, content } = useContent();
  const work = route.entity as WorkEntity;
  useEffect(() => {
    track('portfolio_view', { work_id: work.id, locale });
  }, [work.id, locale]);
  return (
    <>
      <section className="detail-intro container">
        <TextLink href={pathFor('work', locale)}>{t('nav.work')}</TextLink>
        <Eyebrow>{t(`ui.${work.category}`)}</Eyebrow>
        <h1>{text(work.title, locale)}</h1>
        <p className="intro-copy">{text(work.summary, locale)}</p>
        {work.liveUrl && (
          <a
            className="text-link work-live-link"
            href={work.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => track('outbound_project_click', { work_id: work.id, locale })}
          >
            {t('work.live')}
            <ArrowUpRightIcon size={20} />
          </a>
        )}
        {work.status === 'demo' && (
          <p className="demo-disclosure">
            <strong>{t('ui.demo')}.</strong> {t('ui.demoNote')}
          </p>
        )}
      </section>
      <section className="detail-preview wide-container sage-panel">
        {work.image ? (
          <img
            className="case-image"
            src={work.image}
            alt={text(work.title, locale)}
            width="1200"
            height="780"
          />
        ) : (
          <>
            <ProductPreview kind={work.preview} />
            <p className="demo-caption">{t('ui.preview')}</p>
          </>
        )}
      </section>
      <section className="container case-story section">
        {[
          ['context', work.context],
          ['solution', work.solution],
          ['result', work.result],
        ].map(([key, value], i) => (
          <div data-reveal key={key as string}>
            <Eyebrow>0{i + 1}</Eyebrow>
            <h2>
              {key === 'result' && work.status === 'published'
                ? locale === 'id'
                  ? 'Hasil yang dicapai'
                  : 'The outcome'
                : t(`work.${key}`)}
            </h2>
            <p>{text(value as WorkEntity['context'], locale)}</p>
          </div>
        ))}
      </section>
      {work.gallery.length > 0 && (
        <section className="container case-gallery section">
          <h2>{t('work.gallery')}</h2>
          {work.gallery.map((src, i) => (
            <img
              src={src}
              alt={`${text(work.title, locale)} ${i + 1}`}
              key={src}
              width="1200"
              height="780"
              loading="lazy"
            />
          ))}
        </section>
      )}
      <section className="container case-process section">
        <h2>{t('work.process')}</h2>
        <ol className="flow-list">
          {work.steps.map((step, i) => (
            <li key={i}>
              <span>0{i + 1}</span>
              <h3>{text(step.title, locale)}</h3>
              <p>{text(step.text, locale)}</p>
            </li>
          ))}
        </ol>
        {work.productId && (
          <TextLink
            href={pathFor(
              'product-detail',
              locale,
              content.products.find((p) => p.id === work.productId)?.slug,
            )}
          >
            {t('ui.details')}
          </TextLink>
        )}
      </section>
      <Cta />
    </>
  );
}
