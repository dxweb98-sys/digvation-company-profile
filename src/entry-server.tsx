import { renderToString } from 'react-dom/server';
import { App } from './App';
import rawContent from './generated/content.json';
import type { ContentBundle } from './domain/content';
export const content = rawContent as ContentBundle;
export function render(pathname: string) {
  return renderToString(<App content={content} pathname={pathname} />);
}
