import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  HouseIcon,
  HandshakeIcon,
  HeartIcon,
  ChatCircleIcon,
  CalendarIcon,
  GearIcon,
  ListIcon,
  SignOutIcon,
} from '@phosphor-icons/react';
import logo from '@/shared/assets/images/logo-txt.svg';
import { Button } from '../ui/Button';
import { Sidebar, Badge } from './Profile.styles';

export function ProfileSidebar({
  profilePath,
  status,
  onSettings,
  onLogout,
}: {
  profilePath: string;
  status: string;
  onSettings: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <Sidebar>
      <Link to="/" aria-label="Juntaí! — início">
        <img src={logo} alt="Juntaí!" />
      </Link>
      <Button
        $variant="quiet"
        aria-expanded={open}
        aria-controls="investor-menu"
        onClick={() => setOpen(!open)}
      >
        <ListIcon size={22} aria-hidden="true" />
        Menu
      </Button>
      <Badge>{status}</Badge>
      <nav id="investor-menu" aria-label="Navegação do perfil" data-open={open}>
        <Link to="/">
          <HouseIcon size={20} aria-hidden="true" />
          Início
        </Link>
        <Link to={profilePath} aria-current="page">
          <HandshakeIcon size={20} aria-hidden="true" />
          Meu perfil
        </Link>
        <button disabled title="Disponível após aprovação e integração">
          <HeartIcon size={20} aria-hidden="true" />
          Matches
        </button>
        <button disabled title="Em preparação">
          <ChatCircleIcon size={20} aria-hidden="true" />
          Mensagens
        </button>
        <button disabled title="Em preparação">
          <CalendarIcon size={20} aria-hidden="true" />
          Reuniões
        </button>
        <button onClick={onSettings}>
          <GearIcon size={20} aria-hidden="true" />
          Configurações
        </button>
        <button onClick={onLogout}>
          <SignOutIcon size={20} aria-hidden="true" />
          Sair da conta
        </button>
      </nav>
      <small>
        As conexões serão liberadas após aprovação e integração da plataforma.
      </small>
    </Sidebar>
  );
}
