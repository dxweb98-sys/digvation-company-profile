import { useContent } from '../context';
import { PageIntro, Eyebrow, Cta } from '../components/ui';
export function About() {
  const { t, content, locale } = useContent();
  return (
    <>
      <PageIntro eyebrow={t('about.eyebrow')} title={t('about.title')} intro={t('about.intro')} />
      <section className="about-story wide-container sage-panel">
        <div data-reveal>
          <Eyebrow>Digvation</Eyebrow>
          <h2>{t('about.storyTitle')}</h2>
          <p>{t('about.storyText')}</p>
        </div>
        <div className="about-brand" data-reveal>
          <img src="/brand/digvation-mark.png" alt="" width="170" height="170" />
          <p>{content.site.tagline[locale]}</p>
        </div>
      </section>
      <section className="container section about-journey">
        <div data-reveal>
          <Eyebrow>{t('nav.about')}</Eyebrow>
          <h2>{t('about.journeyTitle')}</h2>
        </div>
        <ol>
          {[1, 2, 3].map((i) => (
            <li key={i} data-reveal>
              <span>0{i}</span>
              <div>
                <h3>{t(`about.journey${i}`)}</h3>
                <p>{t(`about.journey${i}Text`)}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
      <section className="about-values support-band">
        <div className="container">
          <h2 data-reveal>{t('about.valuesTitle')}</h2>
          <div className="values-list">
            {[1, 2, 3].map((i) => (
              <div key={i} data-reveal>
                <span>0{i}</span>
                <h3>{t(`about.value${i}`)}</h3>
                <p>{t(`about.value${i}Text`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Cta />
    </>
  );
}
