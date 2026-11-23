import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from '@/app/App';

// Scrolling over a focused numeric field should scroll the page, not change its value.
document.addEventListener(
  'wheel',
  (event) => {
    const target = event.target;
    if (
      target instanceof HTMLInputElement &&
      target.type === 'number' &&
      document.activeElement === target
    )
      target.blur();
  },
  { passive: true },
);

const root = document.getElementById('root');

if (!root) {
  throw new Error('Elemento raiz da aplicação não encontrado.');
}

createRoot(root).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
