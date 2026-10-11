import { useEffect, useRef, useState, type ReactNode } from 'react';
import { ListIcon, XIcon, ArrowUpRightIcon } from '@phosphor-icons/react';
import { useContent } from '../context';
import { counterpart, pathFor } from '../../application/routes';
import { useReveal, useScrollProgress } from '../hooks/useScroll';
import {
  readConsent,
  saveConsent,
  startAnalytics,
  resetConsent,
} from '../../infrastructure/analytics';
import { ButtonLink } from './ui';
const nav = ['services', 'work', 'products', 'about'] as const;
export function Layout({ children }: { children: ReactNode }) {
  const { t, content, locale, route } = useContent();
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const progress = useScrollProgress();
  useReveal();
  const isHome = route.kind === 'home';
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 32);
    handler();
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);
  useEffect(() => {
    if (!menu) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const first = menuRef.current?.querySelector<HTMLAnchorElement>('a');
    first?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMenu(false);
        opener.current?.focus();
      }
      if (e.key === 'Tab') {
        const controls = [...menuRef.current!.querySelectorAll<HTMLElement>('a,button')];
        const last = controls.at(-1);
        const first = controls[0];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', handler);
    };
  }, [menu]);
  return (
    <>
      <a className="skip-link" href="#main">
        {t('ui.skip')}
      </a>
      <header
        className={`site-header ${isHome && !scrolled ? 'over-hero' : ''} ${scrolled ? 'is-scrolled' : ''}`}
      >
        <div className="nav-shell">
          <a
            href={pathFor('home', locale)}
            className="brand"
            aria-label={`Digvation, ${t('nav.home')}`}
          >
            <img src="/brand/digvation-logo.png" alt="Digvation" width="176" height="38" />
          </a>
          <nav className="desktop-nav" aria-label="Main">
            {nav.map((key) => (
              <a
                key={key}
                href={pathFor(key, locale)}
                aria-current={
                  route.kind === key || route.kind === `${key}-detail` ? 'page' : undefined
                }
              >
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>
          <div className="nav-actions">
            <a
              className="language-switch"
              href={counterpart(route, content)}
              hrefLang={locale === 'id' ? 'en' : 'id'}
              aria-label={t('ui.language')}
            >
              <span className={locale === 'id' ? 'active' : ''}>ID</span>
              <span className="divider">/</span>
              <span className={locale === 'en' ? 'active' : ''}>EN</span>
            </a>
            <ButtonLink
              href={pathFor('contact', locale)}
              light={isHome && !scrolled}
              className="header-cta"
            >
              {t('nav.contact')}
            </ButtonLink>
            <button
              className="menu-toggle"
              ref={opener}
              onClick={() => setMenu(true)}
              aria-label={t('ui.menu')}
              aria-expanded={menu}
            >
              <ListIcon size={26} />
            </button>
          </div>
        </div>
        <div className="scroll-progress" style={{ transform: `scaleX(${progress})` }} />
      </header>
      {menu && (
        <div
          className="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={t('ui.menu')}
          ref={menuRef}
        >
          <button
            className="icon-button mobile-close"
            onClick={() => {
              setMenu(false);
              opener.current?.focus();
            }}
            aria-label={t('ui.close')}
          >
            <XIcon size={26} />
          </button>
          <a className="brand mobile-brand" href={pathFor('home', locale)}>
            <img src="/brand/digvation-logo.png" alt="Digvation" width="176" height="38" />
          </a>
          <nav>
            {['home', ...nav, 'contact'].map((key, i) => (
              <a key={key} href={pathFor(key as 'home', locale)}>
                <small>0{i + 1}</small>
                {t(`nav.${key}`)}
                <ArrowUpRightIcon size={24} />
              </a>
            ))}
          </nav>
          <p>{content.site.tagline[locale]}</p>
        </div>
      )}
      <main id="main">{children}</main>
      <footer className="site-footer container">
        <div className="footer-top">
          <a className="brand" href={pathFor('home', locale)}>
            <img src="/brand/digvation-logo.png" alt="Digvation" width="176" height="38" />
          </a>
          <nav aria-label="Footer">
            {nav.map((key) => (
              <a key={key} href={pathFor(key, locale)}>
                {t(`nav.${key}`)}
              </a>
            ))}
          </nav>
          <p>{t('footer.line')}</p>
        </div>
        <div className="footer-bottom">
          <small>
            © {new Date().getFullYear()} {t('footer.copyright')}
          </small>
          <a href={pathFor('privacy', locale)}>{t('footer.privacy')}</a>
          <a href={pathFor('terms', locale)}>{t('footer.terms')}</a>
          {(content.site.analytics.gaId ||
            content.site.analytics.gtmId ||
            content.site.analytics.clarityId ||
            content.site.analytics.metaPixelId) &&
            content.site.analytics.mode === 'consent' && (
              <button className="text-link" onClick={resetConsent}>
                {t('cookies.settings')}
              </button>
            )}
        </div>
      </footer>
      <CookieNotice />
    </>
  );
}
function CookieNotice() {
  const { content, t, locale } = useContent();
  const [show, setShow] = useState(false);
  useEffect(() => {
    const configured = !!(
      content.site.analytics.gaId ||
      content.site.analytics.gtmId ||
      content.site.analytics.clarityId ||
      content.site.analytics.metaPixelId
    );
    if (configured && content.site.analytics.mode === 'consent' && !readConsent()) setShow(true);
    startAnalytics(content.site);
  }, [content.site]);
  const choose = (accepted: boolean) => {
    saveConsent(accepted ? 'accepted' : 'rejected');
    if (accepted) startAnalytics(content.site);
    setShow(false);
  };
  if (!show) return null;
  return (
    <aside className="cookie-notice" aria-label={t('cookies.title')}>
      <strong>{t('cookies.title')}</strong>
      <p>
        {t('cookies.text')} <a href={pathFor('privacy', locale)}>{t('footer.privacy')}</a>
      </p>
      <div>
        <button className="button" onClick={() => choose(true)}>
          {t('cookies.accept')}
        </button>
        <button className="text-link" onClick={() => choose(false)}>
          {t('cookies.reject')}
        </button>
      </div>
    </aside>
  );
}
