import { useContent } from '../context';
import { PageIntro, ButtonLink } from '../components/ui';
import { pathFor } from '../../application/routes';
import { resetConsent } from '../../infrastructure/analytics';
export function Legal() {
  const { t, content, route, locale } = useContent();
  const kind = route.kind === 'terms' ? 'terms' : 'privacy';
  const policy = content.legal[kind][locale];
  return (
    <>
      <PageIntro eyebrow={t(`footer.${kind}`)} title={policy.title} intro={policy.intro} />
      <article className="container privacy-copy">
        <p>{policy.updated}</p>
        {policy.sections.map((section) => (
          <section key={section.id} id={section.id}>
            <h2>{section.title}</h2>
            {section.body.map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
            {section.bullets && (
              <ul>
                {section.bullets.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
        {kind === 'privacy' && (
          <button className="text-link" onClick={resetConsent}>
            {t('cookies.reset')}
          </button>
        )}
      </article>
    </>
  );
}
export function NotFound() {
  const { t, locale } = useContent();
  return (
    <section className="not-found container">
      <p className="eyebrow">404</p>
      <h1>{t('404.title')}</h1>
      <p>{t('404.text')}</p>
      <ButtonLink href={pathFor('home', locale)}>{t('nav.home')}</ButtonLink>
    </section>
  );
}
