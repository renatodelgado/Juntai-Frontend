// Uma confirmação por contexto durante a vida da página; inclui cards duplicados.
const confirmed = new Set<string>();
const pending = new Set<string>();

export function observeExposure(
  element: Element,
  context: string,
  send: (context: string) => Promise<unknown>,
): () => void {
  if (typeof IntersectionObserver === 'undefined' || confirmed.has(context))
    return () => {};
  let timer: ReturnType<typeof setTimeout> | undefined;
  let visible = false;
  let disposed = false;
  function cancel() {
    clearTimeout(timer);
    timer = undefined;
  }
  function update() {
    cancel();
    if (!visible || document.visibilityState !== 'visible') return;
    timer = setTimeout(() => {
      if (disposed || confirmed.has(context) || pending.has(context)) return;
      pending.add(context);
      void send(context)
        .then(() => {
          confirmed.add(context);
        })
        .catch(() => {
          // Telemetria não interrompe navegação; próxima entrada pode tentar novamente.
        })
        .finally(() => pending.delete(context));
    }, 1000);
  }
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible =
        !!entry && entry.isIntersecting && entry.intersectionRatio >= 0.5;
      update();
    },
    { threshold: [0, 0.5] },
  );
  observer.observe(element);
  document.addEventListener('visibilitychange', update);
  return () => {
    disposed = true;
    cancel();
    observer.disconnect();
    document.removeEventListener('visibilitychange', update);
  };
}
