import { useEffect, useRef } from 'react';
import type { Locale } from '../../domain/content';
interface TurnstileAPI {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (id: string) => void;
}
export function Turnstile({
  siteKey,
  locale,
  onToken,
}: {
  siteKey: string;
  locale: Locale;
  onToken: (token: string) => void;
}) {
  const element = useRef<HTMLDivElement>(null);
  const callback = useRef(onToken);
  callback.current = onToken;
  useEffect(() => {
    if (!siteKey) return;
    let widget: string | undefined;
    let disposed = false;
    const w = window as Window & { turnstile?: TurnstileAPI };
    const render = () => {
      if (disposed || !element.current || !w.turnstile) return;
      widget = w.turnstile.render(element.current, {
        sitekey: siteKey,
        language: locale,
        theme: 'light',
        callback: (token: string) => {
          if (!disposed) callback.current(token);
        },
        'expired-callback': () => {
          if (!disposed) callback.current('');
        },
        'error-callback': () => {
          if (!disposed) callback.current('');
        },
      });
    };
    let script = document.querySelector<HTMLScriptElement>('script[data-turnstile]');
    if (w.turnstile) render();
    else if (script) script.addEventListener('load', render);
    else {
      script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.dataset.turnstile = 'true';
      script.addEventListener('load', render);
      document.head.append(script);
    }
    return () => {
      disposed = true;
      script?.removeEventListener('load', render);
      if (widget) w.turnstile?.remove(widget);
    };
  }, [siteKey, locale]);
  return <div ref={element} className="turnstile-widget" />;
}
