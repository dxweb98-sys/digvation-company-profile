import { useEffect } from 'react';
import type { ContentBundle } from './domain/content';
import { matchRoute } from './application/routes';
import { seoFor } from './application/seo';
import { ContentProvider } from './presentation/context';
import { Layout } from './presentation/components/Layout';
import { Home } from './presentation/pages/Home';
import { Services } from './presentation/pages/Services';
import { Work, WorkDetail } from './presentation/pages/Work';
import { Products, ProductDetail } from './presentation/pages/Products';
import { About } from './presentation/pages/About';
import { Contact } from './presentation/pages/Contact';
import { Legal, NotFound } from './presentation/pages/Other';
import { Campaign } from './presentation/pages/Campaign';
export function App({ content, pathname }: { content: ContentBundle; pathname: string }) {
  const route = matchRoute(pathname, content);
  useEffect(() => {
    document.documentElement.lang = route.locale;
    document.title = seoFor(route, content).title;
  }, [route.locale, route.kind, pathname, content]);
  const pages = {
    home: <Home />,
    services: <Services />,
    work: <Work />,
    products: <Products />,
    about: <About />,
    contact: <Contact />,
    privacy: <Legal />,
    terms: <Legal />,
    campaign: <Campaign />,
    'product-detail': <ProductDetail />,
    'work-detail': <WorkDetail />,
    'not-found': <NotFound />,
  };
  return (
    <ContentProvider content={content} route={route}>
      <Layout>{pages[route.kind]}</Layout>
    </ContentProvider>
  );
}
