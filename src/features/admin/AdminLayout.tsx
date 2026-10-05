import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  SquaresFourIcon,
  ClipboardTextIcon,
  UsersIcon,
  RocketLaunchIcon,
  HandshakeIcon,
  ClockCounterClockwiseIcon,
  SignOutIcon,
  CalendarIcon,
} from '@phosphor-icons/react';
import { investorTheme } from '@/shared/styles/theme';
import { Button } from '@/shared/components/ui/Button';
import logo from '@/shared/assets/images/logo-txt.svg';
import { logout } from '@/features/auth/services/session';
import { Shell } from './styles';

const links = [
  { to: '/admin', label: 'Visão geral', icon: SquaresFourIcon },
  { to: '/admin/cadastros', label: 'Cadastros', icon: ClipboardTextIcon },
  { to: '/admin/usuarios', label: 'Usuários', icon: UsersIcon },
  { to: '/admin/startups', label: 'Startups', icon: RocketLaunchIcon },
  { to: '/admin/investidores', label: 'Investidores', icon: HandshakeIcon },
  { to: '/admin/reunioes', label: 'Reuniões', icon: CalendarIcon },
  {
    to: '/admin/auditoria',
    label: 'Auditoria',
    icon: ClockCounterClockwiseIcon,
  },
];
export function AdminLayout() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  return (
    <ThemeProvider theme={investorTheme}>
      <Shell>
        <header>
          <div className="top">
            <NavLink
              className="brand"
              to="/admin"
              aria-label="Juntaí! Administração"
            >
              <img src={logo} alt="Juntaí!" />
            </NavLink>
            <span className="admin-label">Administração</span>
            <nav aria-label="Navegação administrativa">
              {links.map(({ to, label, icon: Icon }) => (
                <NavLink to={to} key={to} end>
                  {({ isActive }) => (
                    <>
                      <Icon size={19} weight={isActive ? 'fill' : 'regular'} />
                      {label}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>
            <Button
              $variant="quiet"
              onClick={() => {
                logout();
                void navigate('/login');
              }}
            >
              <SignOutIcon size={18} />
              Sair
            </Button>
          </div>
        </header>
        <main>
          <div key={pathname}>
            <Outlet />
          </div>
        </main>
      </Shell>
    </ThemeProvider>
  );
}
