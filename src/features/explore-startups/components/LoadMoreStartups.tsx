import { useEffect, useRef } from 'react';
import { Button } from '@/shared/components/ui/Button';
export function LoadMoreStartups({
  loading,
  failed,
  onLoad,
}: {
  loading: boolean;
  failed: boolean;
  onLoad: () => void;
}) {
  const sentinel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (
      loading ||
      failed ||
      !sentinel.current ||
      typeof IntersectionObserver === 'undefined'
    )
      return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) onLoad();
      },
      { rootMargin: '400px' },
    );
    observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, [loading, failed, onLoad]);
  return (
    <div
      ref={sentinel}
      style={{ padding: '24px', textAlign: 'center' }}
      aria-busy={loading}
    >
      <p role={failed ? 'alert' : 'status'}>
        {failed
          ? 'Não foi possível carregar mais startups.'
          : loading
            ? 'Carregando mais startups…'
            : 'Role para descobrir mais startups.'}
      </p>
      <Button $variant="secondary" disabled={loading} onClick={onLoad}>
        {failed
          ? 'Tentar novamente'
          : loading
            ? 'Carregando…'
            : 'Carregar mais startups'}
      </Button>
    </div>
  );
}
