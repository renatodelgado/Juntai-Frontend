import { createBrowserRouter } from 'react-router-dom';
import { HomePage } from '@/features/home/pages/HomePage';
import { NotFoundPage } from '@/shared/pages/NotFoundPage';
import { LegalPage } from '@/features/legal/LegalPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ProtectedRoute, AuthRouteError } from '@/features/auth/ProtectedRoute';
import {
  requireRole,
  redirectAuthenticated,
} from '@/features/auth/services/requireRole';

export const router = createBrowserRouter([
  ...(['startup', 'investidor'] as const).map((role) => ({
    id: `${role}-meetings`,
    path: `/${role}/reunioes`,
    element: <ProtectedRoute />,
    loader: requireRole(role),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { MeetingsPage } =
            await import('@/features/meetings/MeetingsPage');
          return { Component: MeetingsPage };
        },
      },
    ],
  })),
  {
    id: 'investor-matches',
    path: '/investidor/matches',
    element: <ProtectedRoute />,
    loader: requireRole('investidor'),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { InvestorMatchesPage } =
            await import('@/features/investor-matches/InvestorMatchesPage');
          return { Component: InvestorMatchesPage };
        },
      },
    ],
  },
  ...['/investidor/startups', '/startups/:id'].map((path) => ({
    id:
      path === '/investidor/startups' ? 'discovery-list' : 'discovery-profile',
    path,
    element: <ProtectedRoute />,
    loader: requireRole('investidor'),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          if (path === '/startups/:id') {
            const { PublicStartupProfile } =
              await import('@/features/explore-startups/PublicStartupProfile');
            return { Component: PublicStartupProfile };
          }
          const { ExploreStartups } =
            await import('@/features/explore-startups/ExploreStartups');
          return { Component: ExploreStartups };
        },
      },
    ],
  })),
  ...(['startup', 'investidor'] as const).map((role) => ({
    id: `${role}-messages`,
    path: `/${role}/mensagens`,
    element: <ProtectedRoute />,
    loader: requireRole(role),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { MessagesPage } =
            await import('@/features/messages/MessagesPage');
          return { Component: MessagesPage };
        },
      },
    ],
  })),
  {
    path: '/',
    element: <HomePage />,
    loader: redirectAuthenticated,
    errorElement: <AuthRouteError />,
  },
  {
    path: '/login',
    element: <LoginPage />,
    loader: redirectAuthenticated,
    errorElement: <AuthRouteError />,
  },
  ...(['startup', 'investidor'] as const).map((role) => ({
    path: `/${role}/inicio`,
    element: <ProtectedRoute />,
    loader: requireRole(role),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { DashboardPage } =
            await import('@/features/dashboard/pages/DashboardPage');
          return { Component: DashboardPage };
        },
      },
    ],
  })),
  { path: '/esqueci-minha-senha', element: <ForgotPasswordPage /> },
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
    element: <ProtectedRoute />,
    loader: requireRole('investidor'),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { InvestorProfilePage } =
            await import('@/features/investor-onboarding/pages/InvestorProfilePage');
          return { Component: InvestorProfilePage };
        },
      },
    ],
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
    element: <ProtectedRoute />,
    loader: requireRole('startup'),
    errorElement: <AuthRouteError />,
    children: [
      {
        index: true,
        lazy: async () => {
          const { StartupProfilePage } =
            await import('@/features/startup-profile/pages/StartupProfilePage');
          return { Component: StartupProfilePage };
        },
      },
    ],
  },
  { path: '/termos-de-uso', element: <LegalPage document="terms" /> },
  {
    path: '/politica-de-privacidade',
    element: <LegalPage document="privacy" />,
  },
  { path: '*', element: <NotFoundPage /> },
]);
