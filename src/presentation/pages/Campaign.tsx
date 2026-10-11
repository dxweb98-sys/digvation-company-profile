import { useContent } from '../context';
import type { Campaign as CampaignEntity } from '../../domain/content';
import { text } from '../../domain/localized';
import { pathFor } from '../../application/routes';
import { PageIntro, ButtonLink, TextLink, Eyebrow, Accordion } from '../components/ui';

export function Campaign() {
  const { content, route, locale, t } = useContent();
  const campaign = route.entity as CampaignEntity;
  const proof = content.works.find((work) => work.id === campaign.proofProject)!;
  return (
    <>
      <PageIntro
        eyebrow={text(campaign.eyebrow, locale)}
        title={text(campaign.title, locale)}
        intro={text(campaign.summary, locale)}
      />
      <section className="container campaign-start">
        <ButtonLink href={`${pathFor('contact', locale)}?need=website&campaign=${campaign.slug}`}>
          {text(campaign.primaryCta, locale)}
        </ButtonLink>
        <TextLink href={pathFor('work-detail', locale, proof.slug)}>{t('campaign.proof')}</TextLink>
      </section>
      <section className="container section campaign-context">
        {[
          ['problem', campaign.problems],
          ['solution', campaign.solutions],
        ].map(([key, items]) => (
          <div key={key as string} data-reveal>
            <Eyebrow>{t(`campaign.${key}`)}</Eyebrow>
            <ul>
              {(items as typeof campaign.problems).map((item, i) => (
                <li key={i}>{text(item, locale)}</li>
              ))}
            </ul>
          </div>
        ))}
      </section>
      <section className="wide-container sage-panel campaign-proof">
        {proof.image && (
          <img
            src={proof.image}
            alt={text(proof.title, locale)}
            width="1200"
            height="780"
            loading="lazy"
          />
        )}
        <div>
          <Eyebrow>{t('campaign.proof')}</Eyebrow>
          <h2>{text(proof.title, locale)}</h2>
          <p>{text(proof.summary, locale)}</p>
          <TextLink href={pathFor('work-detail', locale, proof.slug)}>{t('work.story')}</TextLink>
        </div>
      </section>
      <section className="container section campaign-faq">
        <Accordion
          items={campaign.faq.map((item) => ({
            question: text(item.question, locale),
            answer: text(item.answer, locale),
          }))}
        />
        <ButtonLink href={`${pathFor('contact', locale)}?need=website&campaign=${campaign.slug}`}>
          {text(campaign.primaryCta, locale)}
        </ButtonLink>
      </section>
    </>
  );
}
