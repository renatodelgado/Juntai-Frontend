import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/features/home/pages/HomePage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { LegalPage } from '@/features/legal/LegalPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';

export const router = createBrowserRouter([
  { path: '/', element: <HomePage /> },
  { path: '/login', element: <LoginPage /> },
  {
    path: '/cadastro/investidor',
    lazy: async () => {
      const { InvestorOnboardingPage } =
        await import('@/features/investor-onboarding/pages/InvestorOnboardingPage');
      return { Component: InvestorOnboardingPage };
    },
  },
  {
    path: '/investidor/perfil',
    lazy: async () => {
      const { InvestorProfilePage } =
        await import('@/features/investor-onboarding/pages/InvestorProfilePage');
      return { Component: InvestorProfilePage };
    },
  },
  {
    path: '/cadastro/startup',
    lazy: async () => {
      const { StartupOnboardingPage } =
        await import('@/features/startup-onboarding/pages/StartupOnboardingPage');
      return { Component: StartupOnboardingPage };
    },
  },
  {
    path: '/startup/perfil',
    lazy: async () => {
      const { StartupProfilePage } =
        await import('@/features/startup-profile/pages/StartupProfilePage');
      return { Component: StartupProfilePage };
    },
  },
  { path: '/termos-de-uso', element: <LegalPage document="terms" /> },
  {
    path: '/politica-de-privacidade',
    element: <LegalPage document="privacy" />,
  },
  { path: '*', element: <NotFoundPage /> },
]);
