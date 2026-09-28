import { useId, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import {
  HouseIcon,
  HandshakeIcon,
  HeartIcon,
  ChatCircleIcon,
  CalendarIcon,
  GearIcon,
  ListIcon,
  SignOutIcon,
  CaretDownIcon,
} from '@phosphor-icons/react';
import logo from '@/shared/assets/images/logo-txt.svg';
import { getSession } from '@/features/auth/services/session';

const Header = styled.header`
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.appBorder};
  position: sticky;
  top: 0;
  z-index: 20;
  > div {
    width: min(100% - 4rem, 82.5rem);
    min-height: 4.75rem;
    margin: auto;
    display: flex;
    align-items: center;
    gap: 1rem;
  }
  .brand {
    flex-shrink: 0;
  }
  .brand img {
    width: 6.5rem;
  }
  nav {
    display: flex;
    align-items: center;
    gap: 0.2rem;
    flex: 1;
  }
  nav a,
  nav button,
  .account,
  .signout,
  .toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem;
    border: 0;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    color: ${({ theme }) => theme.colors.appMuted};
    padding: 0.65rem 0.7rem;
    background: transparent;
    border-radius: 0.65rem;
    text-decoration: none;
    cursor: pointer;
  }
  nav [aria-current='page'] {
    color: ${({ theme }) => theme.colors.accentStrong};
    background: ${({ theme }) => theme.colors.accentSoft};
  }
  nav button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .account {
    margin-left: auto;
    text-align: left;
    color: ${({ theme }) => theme.colors.appText};
    padding-left: 1rem;
    border-left: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 0;
  }
  .account strong {
    display: block;
    max-width: 8rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.8rem;
  }
  .account small {
    font-size: 0.65rem;
    color: ${({ theme }) => theme.colors.appMuted};
    font-weight: 400;
  }
  .initials {
    width: 2.2rem;
    height: 2.2rem;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.accentSoft};
    color: ${({ theme }) => theme.colors.accentStrong};
    display: grid;
    place-items: center;
    flex-shrink: 0;
  }
  .toggle {
    display: none;
  }
  .signout {
    padding: 0.5rem;
  }
  @media (max-width: 70rem) {
    > div {
      flex-wrap: wrap;
      gap: 0.5rem;
      padding: 0.75rem 0;
    }
    .toggle {
      display: flex;
    }
    nav {
      order: 5;
      flex-basis: 100%;
      flex-wrap: wrap;
      padding-top: 0.6rem;
      border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
    }
    nav[data-open='false'] {
      display: none;
    }
    .account {
      border: 0;
      padding: 0.25rem;
    }
  }
  @media (max-width: 48rem) {
    > div {
      width: calc(100% - 2rem);
    }
    .account strong,
    .account small,
    .account > svg {
      display: none;
    }
    .brand img {
      width: 5.5rem;
    }
  }
`;

export function ProfileSidebar({
  profilePath,
  status,
  onSettings,
  onLogout,
  name,
  subtitle,
}: {
  profilePath: string;
  status: string;
  onSettings: () => void;
  onLogout: () => void;
  name?: string;
  subtitle?: string;
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  const { pathname } = useLocation();
  const home = profilePath.replace('/perfil', '/inicio');
  const displayName = name || getSession()?.usuario.nome || 'Minha conta';
  return (
    <Header>
      <div>
        <Link className="brand" to={home} aria-label="Juntaí! — início">
          <img src={logo} alt="Juntaí!" />
        </Link>
        <button
          className="toggle"
          aria-expanded={open}
          aria-controls={id}
          onClick={() => setOpen(!open)}
        >
          <ListIcon size={20} aria-hidden="true" />
          Menu
        </button>
        <nav id={id} aria-label="Navegação do perfil" data-open={open}>
          <Link to={home} aria-current={pathname === home ? 'page' : undefined}>
            <HouseIcon size={17} aria-hidden="true" />
            Início
          </Link>
          <Link
            to={profilePath}
            aria-current={pathname === profilePath ? 'page' : undefined}
          >
            <HandshakeIcon size={17} aria-hidden="true" />
            Meu perfil
          </Link>
          {profilePath.startsWith('/investidor') && (
            <button disabled title="Em preparação">
              Startups
            </button>
          )}
          <button disabled title="Disponível após aprovação e integração">
            <HeartIcon size={17} aria-hidden="true" />
            Matches
          </button>
          <button disabled title="Em preparação">
            <ChatCircleIcon size={17} aria-hidden="true" />
            Mensagens
          </button>
          <button disabled title="Em preparação">
            <CalendarIcon size={17} aria-hidden="true" />
            Reuniões
          </button>
        </nav>
        <button
          className="account"
          onClick={onSettings}
          aria-label="Configurações da conta"
          title={subtitle || status}
        >
          <span className="initials" aria-hidden="true">
            {displayName
              .trim()
              .split(/\s+/)
              .slice(0, 2)
              .map((word) => word[0])
              .join('')
              .toUpperCase()}
          </span>
          <span>
            <strong>{displayName}</strong>
            <small>{subtitle || status}</small>
          </span>
          <CaretDownIcon size={13} aria-hidden="true" />
          <GearIcon size={16} aria-hidden="true" />
        </button>
        <button
          className="signout"
          onClick={onLogout}
          aria-label="Sair da conta"
          title="Sair da conta"
        >
          <SignOutIcon size={21} aria-hidden="true" />
        </button>
      </div>
    </Header>
  );
}
