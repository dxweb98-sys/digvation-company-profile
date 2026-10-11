import { ArrowUpRightIcon, ArrowRightIcon, ArrowLeftIcon } from '@phosphor-icons/react';
import type { ReactNode, KeyboardEvent } from 'react';
import { useContent } from '../context';
import { pathFor } from '../../application/routes';
import { track } from '../../infrastructure/analytics';
export function TextLink({
  href,
  children,
  className = '',
}: {
  href: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <a href={href} className={`text-link ${className}`}>
      {children}
      <ArrowUpRightIcon size={17} aria-hidden />
    </a>
  );
}
export function ButtonLink({
  href,
  children,
  light = false,
  className = '',
}: {
  href: string;
  children: ReactNode;
  light?: boolean;
  className?: string;
}) {
  return (
    <a
      className={`button ${light ? 'button-light' : ''} ${className}`}
      href={href}
      onClick={() => {
        if (href.includes('ngobrol') || href.includes('contact'))
          track('lead_contact_click', { channel: 'internal' });
      }}
    >
      {children}
      <ArrowUpRightIcon size={18} aria-hidden />
    </a>
  );
}
export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="eyebrow">{children}</p>;
}
export function PageIntro({
  eyebrow,
  title,
  intro,
}: {
  eyebrow: string;
  title: string;
  intro: string;
}) {
  return (
    <section className="page-intro container" data-reveal>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h1>{title}</h1>
      <p className="intro-copy">{intro}</p>
    </section>
  );
}
export function Cta() {
  const { t, locale } = useContent();
  return (
    <section className="cta-section container" data-reveal>
      <div>
        <h2>{t('cta.title')}</h2>
        <p>{t('cta.text')}</p>
      </div>
      <ButtonLink href={pathFor('contact', locale)}>{t('nav.contact')}</ButtonLink>
    </section>
  );
}
export function Tabs({
  items,
  value,
  onChange,
  label,
  id,
}: {
  items: string[];
  value: number;
  onChange: (v: number) => void;
  label: string;
  id: string;
}) {
  const key = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % items.length;
    else if (e.key === 'ArrowLeft') next = (i + items.length - 1) % items.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = items.length - 1;
    else return;
    e.preventDefault();
    onChange(next);
    document.getElementById(`${id}-tab-${next}`)?.focus();
  };
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item}
          role="tab"
          id={`${id}-tab-${i}`}
          aria-selected={value === i}
          aria-controls={`${id}-panel`}
          tabIndex={value === i ? 0 : -1}
          onClick={() => onChange(i)}
          onKeyDown={(e) => key(e, i)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
export function CarouselArrows({
  onPrevious,
  onNext,
  index,
  count,
}: {
  onPrevious: () => void;
  onNext: () => void;
  index: number;
  count: number;
}) {
  const { t } = useContent();
  return (
    <div className="carousel-controls">
      <button className="icon-button" aria-label={t('ui.previous')} onClick={onPrevious}>
        <ArrowLeftIcon size={19} />
      </button>
      <span className="carousel-count">
        {String(index + 1).padStart(2, '0')} <span>/ {String(count).padStart(2, '0')}</span>
      </span>
      <button className="icon-button" aria-label={t('ui.next')} onClick={onNext}>
        <ArrowRightIcon size={19} />
      </button>
    </div>
  );
}
export function Accordion({ items }: { items: { question: string; answer: string }[] }) {
  return (
    <div className="accordion">
      {items.map((item, i) => (
        <details key={i}>
          <summary>
            {item.question}
            <span className="accordion-plus" aria-hidden>
              +
            </span>
          </summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  );
}
