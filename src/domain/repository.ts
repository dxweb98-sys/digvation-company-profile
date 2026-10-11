import type { ContentBundle } from './content';
export interface ContentRepository {
  load(): Promise<ContentBundle>;
}
