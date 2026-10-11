import { useId, useState, type FormEvent } from 'react';
import {
  MagnifyingGlassIcon,
  ArrowRightIcon,
  CheckCircleIcon,
  ReceiptIcon,
  UsersIcon,
  WrenchIcon,
  ChartBarIcon,
  CalendarBlankIcon,
  BrowserIcon,
} from '@phosphor-icons/react';
import { useContent } from '../context';
import { useSectionStage } from '../hooks/useScroll';
import { Tabs } from './ui';
import { pathFor } from '../../application/routes';
import type { Product } from '../../domain/content';
const money = (n: number, locale: string) =>
  new Intl.NumberFormat(locale === 'id' ? 'id-ID' : 'en-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

export function DiscoveryDemo() {
  const { t } = useContent();
  const { ref, stage } = useSectionStage(3);
  const [manual, setManual] = useState<number | null>(null);
  const [query, setQuery] = useState('');
  const current = manual ?? stage;
  return (
    <div className="discovery-demo" ref={ref}>
      <form
        className="search-demo"
        onSubmit={(e) => {
          e.preventDefault();
          setManual(1);
        }}
      >
        <MagnifyingGlassIcon size={21} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('demo.search')}
          aria-label={t('demo.search')}
        />
        <button aria-label={t('ui.next')} type="submit">
          <ArrowRightIcon size={20} />
        </button>
      </form>
      <div className="discovery-scene">
        <button
          className={`search-result ${current > 0 ? 'result-expanded' : ''}`}
          onClick={() => setManual(current === 0 ? 1 : 2)}
          aria-label={`${t('demo.business')}, ${t('ui.learn')}`}
        >
          <img src="/brand/digvation-mark.png" alt="" width="43" height="43" />
          <span>
            <strong>{query || t('demo.business')}</strong>
            <span>{t('demo.businessText')}</span>
            {current > 0 && (
              <small className="result-extra">
                <CheckCircleIcon size={15} />
                {t('demo.known')}
              </small>
            )}
          </span>
          <ArrowUpRightMini />
        </button>
        <div className={`chat-preview ${current === 2 ? 'chat-active' : ''}`} aria-live="polite">
          <span>{t('demo.chat')}</span>
          {current === 2 && <p>{t('demo.reply')}</p>}
          <UsersIcon size={24} />
        </div>
      </div>
      <div className="journey-steps" aria-label={t('demo.discoveryNote')}>
        {['found', 'known', 'contacted'].map((key, i) => (
          <button
            key={key}
            className={current === i ? 'selected' : ''}
            aria-pressed={current === i}
            onClick={() => setManual(i)}
          >
            <span>{i + 1}</span>
            {t(`demo.${key}`)}
          </button>
        ))}
      </div>
      <p className="demo-caption">{t('demo.discoveryNote')}</p>
    </div>
  );
}
function ArrowUpRightMini() {
  return <ArrowRightIcon size={18} className="result-arrow" aria-hidden />;
}

export function TransactionForm({ onSaved }: { onSaved?: (amount: number) => void }) {
  const { t, locale } = useContent();
  const id = useId();
  const [service, setService] = useState('haircut');
  const [customer, setCustomer] = useState('Rina');
  const [payment, setPayment] = useState('cash');
  const [saved, setSaved] = useState(false);
  const amount = service === 'hairspa' ? 120000 : service === 'facial' ? 150000 : 75000;
  const submit = (e: FormEvent) => {
    e.preventDefault();
    setSaved(true);
    onSaved?.(amount);
  };
  if (saved)
    return (
      <div className="demo-success" role="status">
        <CheckCircleIcon size={48} weight="duotone" />
        <h3>{t('demo.saved')}</h3>
        <p>
          {customer} · {t(`demo.${service}`)}
        </p>
        <strong>{money(amount, locale)}</strong>
        <button onClick={() => setSaved(false)} className="button">
          {t('demo.reset')}
        </button>
        <small>{t('ui.preview')}</small>
      </div>
    );
  return (
    <form className="transaction-form" onSubmit={submit}>
      <h3>{t('demo.transaction')}</h3>
      <div className="demo-field">
        <label htmlFor={`${id}-service`}>{t('demo.service')}</label>
        <select id={`${id}-service`} value={service} onChange={(e) => setService(e.target.value)}>
          {['haircut', 'hairspa', 'facial'].map((s) => (
            <option key={s} value={s}>
              {t(`demo.${s}`)}
            </option>
          ))}
        </select>
      </div>
      <div className="demo-field">
        <label htmlFor={`${id}-customer`}>{t('demo.customer')}</label>
        <input
          id={`${id}-customer`}
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          required
          maxLength={60}
        />
      </div>
      <div className="demo-field">
        <span>{t('demo.total')}</span>
        <strong>{money(amount, locale)}</strong>
      </div>
      <div className="demo-field">
        <label htmlFor={`${id}-payment`}>{t('demo.payment')}</label>
        <select id={`${id}-payment`} value={payment} onChange={(e) => setPayment(e.target.value)}>
          <option value="cash">{t('demo.cash')}</option>
          <option value="qris">QRIS</option>
        </select>
      </div>
      <button className="demo-submit" type="submit">
        {t('demo.save')}
        <ArrowRightIcon size={17} />
      </button>
    </form>
  );
}

export function WorkshopForm() {
  const { t } = useContent();
  const id = useId();
  const [customer, setCustomer] = useState('Rina');
  const [vehicle, setVehicle] = useState('B 1234 DV');
  const [complaint, setComplaint] = useState('');
  const [saved, setSaved] = useState(false);
  if (saved)
    return (
      <div className="demo-success" role="status">
        <CheckCircleIcon size={48} weight="duotone" />
        <h3>{t('demo.orderSaved')}</h3>
        <p>
          {vehicle} · {customer}
        </p>
        <strong>WO-DEMO-001</strong>
        <small>{t('demo.orderReady')}</small>
        <button className="button" onClick={() => setSaved(false)}>
          {t('demo.reset')}
        </button>
      </div>
    );
  return (
    <form
      className="transaction-form"
      onSubmit={(e) => {
        e.preventDefault();
        setSaved(true);
      }}
    >
      <h3>{t('demo.intake')}</h3>
      <div className="demo-field">
        <label htmlFor={`${id}-c`}>{t('demo.customer')}</label>
        <input
          id={`${id}-c`}
          required
          value={customer}
          onChange={(e) => setCustomer(e.target.value)}
          maxLength={60}
        />
      </div>
      <div className="demo-field">
        <label htmlFor={`${id}-v`}>{t('demo.vehicle')}</label>
        <input
          id={`${id}-v`}
          required
          value={vehicle}
          onChange={(e) => setVehicle(e.target.value)}
          maxLength={40}
        />
      </div>
      <div className="demo-field stacked">
        <label htmlFor={`${id}-issue`}>{t('demo.complaint')}</label>
        <textarea
          id={`${id}-issue`}
          value={complaint}
          onChange={(e) => setComplaint(e.target.value)}
          placeholder={t('demo.orderReady')}
          required
          maxLength={200}
          rows={2}
        />
      </div>
      <button type="submit" className="demo-submit">
        {t('demo.workOrder')}
        <ArrowRightIcon size={17} />
      </button>
    </form>
  );
}

export function ReportDemo() {
  const { t, locale } = useContent();
  const [period, setPeriod] = useState(0);
  const data =
    period === 0 ? [75000, 120000, 150000] : [75000, 120000, 150000, 75000, 120000, 75000, 150000];
  return (
    <div className="report-demo">
      <div className="report-top">
        <h3>{t('demo.summary')}</h3>
        <CalendarBlankIcon size={20} />
      </div>
      <Tabs
        id="report-period"
        label={t('demo.summary')}
        items={locale === 'id' ? ['Hari ini', 'Minggu ini'] : ['Today', 'This week']}
        value={period}
        onChange={setPeriod}
      />
      <div
        role="tabpanel"
        id="report-period-panel"
        aria-labelledby={`report-period-tab-${period}`}
        className="report-values"
      >
        <div>
          <span>{t('demo.transactions')}</span>
          <strong>{data.length}</strong>
        </div>
        <div>
          <span>{t('demo.recorded')}</span>
          <strong>
            {money(
              data.reduce((a, b) => a + b, 0),
              locale,
            )}
          </strong>
        </div>
      </div>
      <div className="report-list">
        {data.slice(-3).map((value, i) => (
          <div key={`${period}-${i}`}>
            <ReceiptIcon size={18} />
            <span>TRX-00{i + 1}</span>
            <strong>{money(value, locale)}</strong>
            <CheckCircleIcon size={18} />
          </div>
        ))}
      </div>
      <p className="demo-caption">{t('demo.note')}</p>
    </div>
  );
}

export function WebsiteDemo() {
  const { t, locale } = useContent();
  const [active, setActive] = useState(0);
  return (
    <div className="website-demo">
      <div className="browser-bar">
        <BrowserIcon size={18} />
        <span>studio-kalian.example</span>
        <span aria-hidden>-</span>
      </div>
      <div className="website-demo-content">
        <small>{t('demo.nameSite')}</small>
        <h3>{t('demo.siteTagline')}</h3>
        <p>{t('demo.siteText')}</p>
        <div className="website-services">
          {['haircut', 'hairspa'].map((key, i) => (
            <button onClick={() => setActive(i)} aria-pressed={active === i} key={key}>
              {t(`demo.${key}`)}
              <CheckCircleIcon size={18} className={active === i ? '' : 'muted'} />
            </button>
          ))}
        </div>
        <a className="demo-submit" href={`${pathFor('contact', locale)}?need=website`}>
          {t('demo.booking')}
          <ArrowRightIcon size={17} />
        </a>
      </div>
    </div>
  );
}

export function ProductPreview({
  kind = 'pos',
  simple = false,
}: {
  kind: Product['preview'] | 'website';
  simple?: boolean;
}) {
  const { t } = useContent();
  const [view, setView] = useState(0);
  const base = kind === 'workshop' ? 'workshop' : 'transaction';
  if (kind === 'website') return <WebsiteDemo />;
  const contents =
    view === 0 ? (
      kind === 'workshop' ? (
        <WorkshopForm />
      ) : (
        <TransactionForm />
      )
    ) : view === 1 ? (
      <ReportDemo />
    ) : (
      <div className="customers-demo">
        <h3>{t('demo.customers')}</h3>
        {['Rina', 'Dimas', 'Ayu'].map((name, i) => (
          <div key={name}>
            <UsersIcon size={22} />
            <span>
              {name}
              <small>{kind === 'workshop' ? `B ${1234 + i} DV` : t('demo.customer')}</small>
            </span>
            <CheckCircleIcon size={18} />
          </div>
        ))}
      </div>
    );
  return (
    <div className={`product-preview ${simple ? 'simple-preview' : ''}`}>
      <aside className="product-sidebar">
        <img src="/brand/digvation-logo.png" alt="Digvation" width="112" height="25" />
        {[
          {
            text: t(`demo.${base}`),
            icon: kind === 'workshop' ? <WrenchIcon size={18} /> : <ReceiptIcon size={18} />,
          },
          { text: t('demo.overview'), icon: <ChartBarIcon size={18} /> },
          { text: t('demo.customers'), icon: <UsersIcon size={18} /> },
        ].map((item, i) => (
          <button
            key={i}
            className={view === i ? 'active' : ''}
            onClick={() => setView(i)}
            aria-pressed={view === i}
          >
            {item.icon}
            <span>{item.text}</span>
          </button>
        ))}
      </aside>
      <div className="product-main">
        <div className="product-chrome">
          <span>{kind === 'workshop' ? 'Digvation Workshop' : 'Digvation POS'}</span>
          <span className="demo-pill">DEMO</span>
        </div>
        {contents}
      </div>
    </div>
  );
}
