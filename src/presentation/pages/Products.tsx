import { text } from '../../domain/localized';
import { useState, useEffect } from 'react';
import { CheckIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
import { type Product } from '../../domain/content';
import { pathFor } from '../../application/routes';
import { track } from '../../infrastructure/analytics';
import { PageIntro, Tabs, TextLink, Cta, Accordion, Eyebrow, ButtonLink } from '../components/ui';
import { ProductPreview } from '../components/Demos';
export function Products() {
  const { content, locale, t } = useContent();
  const [active, setActive] = useState(0);
  const products = content.products.filter((p) => p.status !== 'draft');
  const product = products[active];
  if (!product)
    return (
      <>
        <PageIntro
          eyebrow={t('products.eyebrow')}
          title={t('products.title')}
          intro={t('products.intro')}
        />
        <Cta />
      </>
    );
  return (
    <>
      <PageIntro
        eyebrow={t('products.eyebrow')}
        title={t('products.title')}
        intro={t('products.intro')}
      />
      <section className="product-showcase wide-container sage-panel">
        <div className="product-showcase-copy">
          <Tabs
            id="products"
            label={t('nav.products')}
            items={products.map((p) => p.name)}
            value={active}
            onChange={setActive}
          />
          <div
            role="tabpanel"
            id="products-panel"
            aria-labelledby={`products-tab-${active}`}
            key={product.id}
          >
            <Eyebrow>{text(product.category, locale)}</Eyebrow>
            <h2>{product.name}</h2>
            <p>{text(product.summary, locale)}</p>
            <ButtonLink href={pathFor('product-detail', locale, product.slug)}>
              {t('ui.details')}
            </ButtonLink>
          </div>
        </div>
        <div key={`preview-${product.id}`}>
          {product.image ? (
            <img
              className="product-photo"
              src={product.image}
              alt={product.name}
              width="1000"
              height="650"
              loading="lazy"
            />
          ) : (
            <ProductPreview kind={product.preview} />
          )}
          <p className="demo-caption">{t('ui.preview')}</p>
        </div>
      </section>
      <section className="container section product-info" data-reveal>
        <div className="section-heading">
          <Eyebrow>{t('products.eyebrow')}</Eyebrow>
          <h2>{t('products.use')}</h2>
        </div>
        <Accordion
          items={[
            {
              question: t('products.for'),
              answer: text(product.audience, locale),
            },
            ...product.faq.map((f) => ({
              question: text(f.question, locale),
              answer: text(f.answer, locale),
            })),
          ]}
        />
      </section>
      <Cta />
    </>
  );
}
export function ProductDetail() {
  const { route, t, locale } = useContent();
  const product = route.entity as Product;
  const [step, setStep] = useState(0);
  useEffect(() => {
    track('product_view', { product_id: product.id, locale });
  }, [product.id, locale]);
  return (
    <>
      <section className="detail-intro container">
        <TextLink href={pathFor('products', locale)}>{t('nav.products')}</TextLink>
        <Eyebrow>{text(product.category, locale)}</Eyebrow>
        <h1>{product.name}</h1>
        <p className="intro-copy">{text(product.description, locale)}</p>
        <ButtonLink href={`${pathFor('contact', locale)}?need=product&product=${product.id}`}>
          {t('products.discuss')}
        </ButtonLink>
      </section>
      <section className="detail-preview wide-container sage-panel">
        {product.image ? (
          <img
            className="product-photo"
            src={product.image}
            alt={product.name}
            width="1000"
            height="650"
            loading="lazy"
          />
        ) : (
          <ProductPreview kind={product.preview} />
        )}
        <p className="demo-caption">{t('products.previewNote')}</p>
      </section>
      <section className="container product-audience section" data-reveal>
        <div>
          <Eyebrow>{t('products.for')}</Eyebrow>
          <h2>{text(product.audience, locale)}</h2>
        </div>
        <ul className="check-list">
          {product.useCases.map((use, i) => (
            <li key={i}>
              <CheckIcon size={21} />
              <span>{text(use, locale)}</span>
            </li>
          ))}
        </ul>
      </section>
      <section className="flow-section">
        <div className="container">
          <div className="section-heading" data-reveal>
            <Eyebrow>{t('products.eyebrow')}</Eyebrow>
            <h2>{t('products.flow')}</h2>
          </div>
          <Tabs
            id="product-flow"
            label={t('products.flow')}
            items={product.steps.map((s, i) => `0${i + 1} · ${text(s.title, locale)}`)}
            value={step}
            onChange={setStep}
          />
          <div
            id="product-flow-panel"
            role="tabpanel"
            aria-labelledby={`product-flow-tab-${step}`}
            className="flow-panel"
            key={step}
          >
            <span className="flow-index">0{step + 1}</span>
            <div>
              <h3>{text(product.steps[step].title, locale)}</h3>
              <p>{text(product.steps[step].text, locale)}</p>
            </div>
          </div>
        </div>
      </section>
      <section className="container section features-section">
        <h2>{t('products.features')}</h2>
        <div className="feature-list">
          {product.features.map((feature, i) => (
            <div key={i} data-reveal>
              <span>0{i + 1}</span>
              <h3>{text(feature.title, locale)}</h3>
              <p>{text(feature.text, locale)}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="container product-faq section">
        <h2>{t('products.faq')}</h2>
        <Accordion
          items={product.faq.map((f) => ({
            question: text(f.question, locale),
            answer: text(f.answer, locale),
          }))}
        />
        <p className="availability-note">{text(product.availability, locale)}</p>
      </section>
      <Cta />
    </>
  );
}
