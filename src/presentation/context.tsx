import { createContext, useContext, type ReactNode } from 'react';
import type { ContentBundle } from '../domain/content';
import type { Route } from '../application/routes';
const Context = createContext<{ content: ContentBundle; route: Route } | null>(null);
export function ContentProvider({
  content,
  route,
  children,
}: {
  content: ContentBundle;
  route: Route;
  children: ReactNode;
}) {
  return <Context.Provider value={{ content, route }}>{children}</Context.Provider>;
}
export function useContent() {
  const context = useContext(Context);
  if (!context) throw new Error('ContentProvider required');
  return {
    ...context,
    locale: context.route.locale,
    t: (key: string) => context.content.copy[context.route.locale][key] ?? key,
  };
}
