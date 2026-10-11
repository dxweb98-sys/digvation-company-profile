import type { Locale } from './content';
export const text = (value: { id: string; en: string }, locale: Locale) => value[locale];
