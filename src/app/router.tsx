import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/features/home/pages/HomePage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '*', element: <NotFoundPage /> },
]);
