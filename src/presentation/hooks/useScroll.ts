import { useEffect, useState, useRef } from 'react';
export function useReveal() {
  useEffect(() => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    document.querySelectorAll('[data-reveal]').forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > innerHeight * 0.9) el.classList.add('will-reveal');
      observer.observe(el);
    });
    // Anchors and keyboard navigation can jump past a section in one frame.
    // Always expose passed content instead of leaving it hidden until re-entry.
    const revealPassed = () =>
      document.querySelectorAll('[data-reveal].will-reveal:not(.is-visible)').forEach((el) => {
        if (el.getBoundingClientRect().top < innerHeight * 0.92) {
          el.classList.add('is-visible');
          observer.unobserve(el);
        }
      });
    window.addEventListener('scroll', revealPassed, { passive: true });
    revealPassed();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', revealPassed);
    };
  }, []);
}
export function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() =>
        setProgress(
          window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight),
        ),
      );
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);
  return progress;
}
export function useSectionStage(stages: number) {
  const ref = useRef<HTMLDivElement>(null);
  const [stage, setStage] = useState(0);
  useEffect(() => {
    const update = () => {
      if (!ref.current) return;
      const r = ref.current.getBoundingClientRect();
      const travel = innerHeight * 0.85 + Math.min(r.height, innerHeight * 0.6);
      const p = (innerHeight * 0.85 - r.top) / travel;
      setStage(Math.min(stages - 1, Math.max(0, Math.floor(p * stages))));
    };
    window.addEventListener('scroll', update, { passive: true });
    update();
    return () => window.removeEventListener('scroll', update);
  }, [stages]);
  return { ref, stage };
}
