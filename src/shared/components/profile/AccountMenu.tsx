import { useEffect, useId, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CaretDownIcon,
  GearIcon,
  ShieldCheckIcon,
  QuestionIcon,
  LifebuoyIcon,
  SignOutIcon,
} from '@phosphor-icons/react';
import styled from 'styled-components';
import { getSession, logout } from '@/features/auth/services/session';
import { useCurrentProfile } from '@/features/auth/services/currentProfile';
import { Button } from '../ui/Button';
import { ContentDialog } from '../ui/ContentDialog';
import { ProfilePhoto } from './ProfilePhoto';

const Container = styled.div`
  margin-left: auto;
  position: relative;
  .account-menu {
    position: absolute;
    right: 0;
    top: calc(100% + 0.6rem);
    width: min(20rem, calc(100vw - 2rem));
    max-height: calc(100dvh - 6rem);
    overflow-y: auto;
    padding: 0.5rem;
    border: 1px solid ${({ theme }) => theme.colors.appBorder};
    border-radius: 0.8rem;
    background: ${({ theme }) => theme.colors.white};
    box-shadow: 0 0.75rem 2rem #0002;
    display: grid;
    z-index: 30;
  }
  .account-menu button {
    border: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.appText};
    font: inherit;
    text-align: left;
    padding: 0.8rem;
    min-height: 44px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    border-radius: 0.5rem;
    cursor: pointer;
  }
  .account-menu button:hover,
  .account-menu button:focus-visible {
    background: ${({ theme }) => theme.colors.accentSoft};
  }
  .account-menu .logout {
    border-top: 1px solid ${({ theme }) => theme.colors.appBorder};
    color: #a33430;
  }
`;
type Panel = 'personal' | 'privacy' | 'support' | 'faq';
const panels = [
  { id: 'personal', label: 'Configurações pessoais', Icon: GearIcon },
  {
    id: 'privacy',
    label: 'Privacidade no uso da aplicação',
    Icon: ShieldCheckIcon,
  },
  { id: 'support', label: 'Ajuda e suporte', Icon: LifebuoyIcon },
  { id: 'faq', label: 'Perguntas frequentes', Icon: QuestionIcon },
] as const;

export function AccountMenu() {
  const session = getSession();
  const profile = useCurrentProfile(false);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [panel, setPanel] = useState<Panel | null>(null);
  const container = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const id = useId();
  const startup = session?.usuario.tipoPerfil === 'startup';
  const path = startup ? '/startup/perfil' : '/investidor/perfil';
  const role = startup
    ? 'Startup'
    : profile?.tipoInvestidor === 'mentor'
      ? 'Mentor'
      : profile?.tipoInvestidor === 'anjo_mentor'
        ? 'Investidor e mentor'
        : 'Investidor';
  const name = session?.usuario.nome || 'Minha conta';
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('pointerdown', outside);
    container.current
      ?.querySelector<HTMLButtonElement>('[role="menuitem"]')
      ?.focus();
    return () => document.removeEventListener('pointerdown', outside);
  }, [open]);
  const close = () => {
    setPanel(null);
    requestAnimationFrame(() => trigger.current?.focus());
  };
  return (
    <>
      <Container
        ref={container}
        onBlur={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget))
            setOpen(false);
        }}
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            setOpen(false);
            trigger.current?.focus();
          }
          if (
            open &&
            ['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)
          ) {
            event.preventDefault();
            const items = Array.from(
              container.current!.querySelectorAll<HTMLButtonElement>(
                '[role="menuitem"]',
              ),
            );
            const current = items.indexOf(
              document.activeElement as HTMLButtonElement,
            );
            const next =
              event.key === 'Home'
                ? 0
                : event.key === 'End'
                  ? items.length - 1
                  : (current +
                      (event.key === 'ArrowDown' ? 1 : -1) +
                      items.length) %
                    items.length;
            items[next]?.focus();
          }
        }}
      >
        <button
          ref={trigger}
          className="account"
          aria-label="Menu da conta"
          aria-haspopup="menu"
          aria-controls={id}
          aria-expanded={open}
          onClick={() => setOpen((value) => !value)}
        >
          <span className="initials" aria-hidden="true">
            <ProfilePhoto
              src={startup ? profile?.logoUrl : profile?.avatarUrl}
              name={name}
            />
          </span>
          <span>
            <strong>{name}</strong>
            <small data-account-role>{role}</small>
          </span>
          <CaretDownIcon size={15} aria-hidden="true" />
        </button>
        {open && (
          <div
            className="account-menu"
            id={id}
            role="menu"
            aria-label="Opções da conta"
          >
            {panels.map(({ id, label, Icon }) => (
              <button
                key={id}
                role="menuitem"
                onClick={() => {
                  setOpen(false);
                  setPanel(id);
                }}
              >
                <Icon size={19} aria-hidden="true" />
                {label}
              </button>
            ))}
            <button
              role="menuitem"
              className="logout"
              onClick={() => {
                logout();
                void navigate('/login', { replace: true });
              }}
            >
              <SignOutIcon size={19} aria-hidden="true" />
              Sair
            </button>
          </div>
        )}
      </Container>
      <ContentDialog
        open={panel !== null}
        title={panels.find((item) => item.id === panel)?.label || 'Minha conta'}
        onClose={close}
      >
        {panel === 'personal' && (
          <>
            <dl>
              <dt>Nome da conta</dt>
              <dd>{name}</dd>
              <dt>E-mail</dt>
              <dd>{session?.usuario.email}</dd>
              <dt>Papel na plataforma</dt>
              <dd>{role}</dd>
            </dl>
            <p>
              Edite os dados de apresentação, localização e interesses nas
              seções do seu perfil.
            </p>
            <Button as={Link} to={path} onClick={close}>
              Abrir meu perfil
            </Button>
          </>
        )}
        {panel === 'privacy' && (
          <>
            <h3>Informações do perfil</h3>
            <p>
              Os dados de apresentação do perfil aprovado ajudam outras pessoas
              a conhecer você e suas conexões. Revise o que compartilha nas
              seções do seu perfil.
            </p>
            <h3>Recomendações</h3>
            <p>
              A plataforma considera os dados e interesses informados no perfil
              para calcular compatibilidade. A pontuação não garante conexão ou
              investimento.
            </p>
            <h3>Acesso à conta</h3>
            <p>
              Use “Sair” ao terminar em um dispositivo compartilhado. Encerrar a
              sessão não exclui seu cadastro.
            </p>
            <Button as={Link} to={path} onClick={close}>
              Revisar informações do perfil
            </Button>
          </>
        )}
        {panel === 'support' && (
          <>
            <p>
              Para identificar um problema, anote a tela, o que você tentou
              fazer e a mensagem exibida. Não compartilhe senhas ou códigos de
              acesso.
            </p>
            <p>
              O aplicativo não possui abertura de chamados ou canal de
              atendimento integrado.
            </p>
            <Button $variant="secondary" onClick={() => setPanel('faq')}>
              Consultar perguntas frequentes
            </Button>
          </>
        )}
        {panel === 'faq' && (
          <>
            <details>
              <summary>Como edito meus dados?</summary>
              <p>
                Abra Meu perfil e use o botão de edição da seção desejada.
                Confirme em Salvar alterações.
              </p>
            </details>
            <details>
              <summary>Por que algumas áreas estão bloqueadas?</summary>
              <p>
                Conexões, mensagens e reuniões exigem um perfil aprovado.
                Consulte a situação do cadastro em Meu perfil.
              </p>
            </details>
            <details>
              <summary>O que representa a pontuação?</summary>
              <p>
                A compatibilidade compara os perfis e interesses informados. Ela
                não é garantia de investimento ou de interesse de outra pessoa.
              </p>
            </details>
            <details>
              <summary>Sair exclui meus dados?</summary>
              <p>
                Não. Sair encerra a sessão neste navegador. Seu cadastro
                permanece na plataforma.
              </p>
            </details>
          </>
        )}
      </ContentDialog>
    </>
  );
}
