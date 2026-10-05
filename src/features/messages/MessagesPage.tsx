import { useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  ArrowLeftIcon,
  ChatCircleIcon,
  CheckIcon,
  ChecksIcon,
  MagnifyingGlassIcon,
  PaperPlaneTiltIcon,
} from '@phosphor-icons/react';
import {
  getSession,
  logout,
  profilePath,
  type AuthUser,
} from '@/features/auth/services/session';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Layout, Badge } from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';
import { theme, investorTheme } from '@/shared/styles/theme';
import { messagesApi, type ConversationSummary, type ApiMessage } from './api';
import { interestsApi } from '@/features/explore-startups/api';
import * as S from './Messages.styles';

const dateTime = (date: string) =>
  new Date(date).toLocaleString('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });
function Avatar({ name }: { name: string }) {
  return (
    <S.Avatar aria-hidden="true">
      {name
        .split(' ')
        .slice(0, 2)
        .map((w) => w[0])
        .join('')}
    </S.Avatar>
  );
}
export function MessagesPage() {
  const [params] = useSearchParams();
  const startup = useRouteLoaderData('startup-messages');
  const investor = useRouteLoaderData('investidor-messages');
  const user = (startup ?? investor ?? getSession()?.usuario) as AuthUser;
  return (
    <MessagesScreen
      key={`${user.id}:${params.get('startup') ?? params.get('usuario') ?? ''}`}
      user={user}
    />
  );
}
function MessagesScreen({ user }: { user: AuthUser }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [messages, setMessages] = useState<ApiMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [threadLoading, setThreadLoading] = useState(false);
  const [error, setError] = useState('');
  const [threadError, setThreadError] = useState('');
  const [search, setSearch] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [sending, setSending] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [threadAttempt, setThreadAttempt] = useState(0);
  const timeline = useRef<HTMLDivElement>(null);
  const selectedRef = useRef(selected);
  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  const requested = params.get('usuario');
  const requestedStartup = params.get('startup');
  useEffect(() => {
    const controller = new AbortController();
    const token = getSession()?.token;
    let running = false;
    async function refresh() {
      if (running) return;
      running = true;
      try {
        const [items, interests] = await Promise.all([
          messagesApi.list(controller.signal),
          requestedStartup && user.tipoPerfil === 'investidor'
            ? interestsApi.list(controller.signal)
            : Promise.resolve([]),
        ]);
        const recipient = interests.find(
          (item) => item.startupId === requestedStartup,
        );
        if (requestedStartup && user.tipoPerfil === 'investidor' && !recipient)
          throw new Error(
            'Confirme o interesse em uma startup aprovada antes de iniciar a conversa.',
          );
        if (
          recipient &&
          !items.some((item) => item.usuarioId === recipient.usuarioId)
        )
          items.push({
            conversaId: 'nova:' + recipient.startupId,
            usuarioId: recipient.usuarioId,
            nome: recipient.startupName,
            tipoPerfil: 'startup',
            ultimaMensagem: null,
            ultimaMensagemEm: null,
            enviadaPorMim: null,
            naoLidas: 0,
          });
        if (!controller.signal.aborted && token === getSession()?.token) {
          setConversations(items);
          setError('');
          if (requested && items.some((i) => i.usuarioId === requested))
            setSelected((s) => s ?? requested);
          if (recipient) setSelected((s) => s ?? recipient.usuarioId);
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setError(
            e instanceof Error
              ? e.message
              : 'Não conseguimos carregar suas conversas.',
          );
      } finally {
        running = false;
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', focus);
    };
  }, [attempt, requested, requestedStartup, user.tipoPerfil]);
  useEffect(() => {
    if (!selected) return;
    const controller = new AbortController();
    const token = getSession()?.token;
    let running = false;
    async function refresh() {
      if (running) return;
      running = true;
      try {
        const items = await messagesApi.history(selected!, controller.signal);
        if (!controller.signal.aborted && token === getSession()?.token) {
          setMessages((current) =>
            [
              ...new Map([...current, ...items].map((m) => [m.id, m])).values(),
            ].sort((a, b) => a.enviadoEm.localeCompare(b.enviadoEm)),
          );
          setThreadError('');
          setConversations((current) =>
            current.map((c) =>
              c.usuarioId === selected ? { ...c, naoLidas: 0 } : c,
            ),
          );
        }
      } catch (e) {
        if (!controller.signal.aborted)
          setThreadError(
            e instanceof Error
              ? e.message
              : 'Não conseguimos carregar a conversa.',
          );
      } finally {
        running = false;
        if (!controller.signal.aborted) setThreadLoading(false);
      }
    }
    void refresh();
    const timer = window.setInterval(() => void refresh(), 5000);
    const focus = () => void refresh();
    window.addEventListener('focus', focus);
    return () => {
      controller.abort();
      window.clearInterval(timer);
      window.removeEventListener('focus', focus);
    };
  }, [selected, threadAttempt]);
  useEffect(() => {
    timeline.current?.scrollTo({ top: timeline.current.scrollHeight });
  }, [messages.length, selected]);
  const conversation = conversations.find((c) => c.usuarioId === selected);
  function choose(usuarioId: string | null) {
    selectedRef.current = usuarioId;
    setSelected(usuarioId);
    setMessages([]);
    setThreadError('');
    setThreadLoading(!!usuarioId);
  }
  const draft = selected ? (drafts[selected] ?? '') : '';
  const normalize = (s: string) =>
    s
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase();
  const visible = conversations.filter(
    (c) =>
      normalize(c.nome).includes(normalize(search.trim())) &&
      (!unreadOnly || c.naoLidas > 0),
  );
  async function send() {
    if (!selected || sending || !draft.trim()) return;
    const recipient = selected,
      content = draft;
    const token = getSession()?.token;
    setSending(true);
    setThreadError('');
    try {
      const result = await messagesApi.send(recipient, content);
      if (!mounted.current || token !== getSession()?.token) return;
      setDrafts((current) => ({
        ...current,
        [recipient]:
          current[recipient] === content ? '' : (current[recipient] ?? ''),
      }));
      if (selectedRef.current === recipient)
        setMessages((current) =>
          current.some((m) => m.id === result.id)
            ? current
            : [...current, result],
        );
      setConversations((current) =>
        current.map((c) =>
          c.usuarioId === recipient
            ? {
                ...c,
                conversaId: result.conversaId,
                ultimaMensagem: result.conteudo,
                ultimaMensagemEm: result.enviadoEm,
                enviadaPorMim: true,
              }
            : c,
        ),
      );
    } catch (e) {
      if (mounted.current && selectedRef.current === recipient)
        setThreadError(
          e instanceof Error
            ? e.message
            : 'Não foi possível enviar. Sua mensagem foi mantida.',
        );
    } finally {
      if (mounted.current) setSending(false);
    }
  }
  return (
    <ThemeProvider
      theme={user.tipoPerfil === 'startup' ? theme : investorTheme}
    >
      <Layout
        $audience={user.tipoPerfil === 'startup' ? 'startup' : 'investor'}
      >
        <ProfileSidebar
          profilePath={profilePath(user.tipoPerfil)}
          status="Mensagens"
          unreadMessages={conversations.reduce((n, c) => n + c.naoLidas, 0)}
          onSettings={() => void navigate(profilePath(user.tipoPerfil))}
          onLogout={() => {
            logout();
            void navigate('/login');
          }}
        />
        <S.Page>
          <PageHeader
            title="Mensagens"
            subtitle="Converse com suas conexões e avance suas oportunidades."
          />
          <S.Workspace $selected={!!selected}>
            <S.List>
              <header>
                <h2>Conversas</h2>
                <label>
                  <MagnifyingGlassIcon size={18} />
                  <input
                    type="search"
                    aria-label="Buscar conversas"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar conversa"
                  />
                </label>
                <nav aria-label="Filtros de conversas">
                  <button
                    aria-pressed={!unreadOnly}
                    onClick={() => setUnreadOnly(false)}
                  >
                    Todas
                  </button>
                  <button
                    aria-pressed={unreadOnly}
                    onClick={() => setUnreadOnly(true)}
                  >
                    Não lidas
                  </button>
                </nav>
              </header>
              <div>
                {loading ? (
                  <S.Empty aria-busy="true">Carregando conversas…</S.Empty>
                ) : error ? (
                  <S.Empty role="alert">
                    <p>{error}</p>
                    <Button
                      onClick={() => {
                        setLoading(true);
                        setAttempt((n) => n + 1);
                      }}
                    >
                      Tentar novamente
                    </Button>
                  </S.Empty>
                ) : !visible.length ? (
                  <S.Empty>
                    <ChatCircleIcon size={32} />
                    <h3>
                      {search || unreadOnly
                        ? 'Nenhuma conversa encontrada'
                        : 'Nenhuma conversa ainda'}
                    </h3>
                    <p>
                      {user.tipoPerfil === 'startup'
                        ? 'Quando um investidor iniciar contato, você poderá responder aqui.'
                        : 'As conversas iniciadas com startups aparecerão aqui.'}
                    </p>
                  </S.Empty>
                ) : (
                  visible.map((c) => (
                    <S.ConversationItem
                      key={c.conversaId}
                      aria-current={selected === c.usuarioId}
                      aria-label={`Conversa com ${c.nome}`}
                      onClick={() => choose(c.usuarioId)}
                    >
                      <Avatar name={c.nome} />
                      <div>
                        <header>
                          <strong>{c.nome}</strong>
                          {c.naoLidas > 0 && (
                            <Badge
                              aria-label={`${c.naoLidas} mensagens não lidas`}
                            >
                              {c.naoLidas}
                            </Badge>
                          )}
                        </header>
                        <small>
                          {c.tipoPerfil === 'startup'
                            ? 'Startup'
                            : 'Investidor'}
                        </small>
                        <p>
                          {c.enviadaPorMim ? 'Você: ' : ''}
                          {c.ultimaMensagem ?? 'Nenhuma mensagem'}
                        </p>
                        {c.ultimaMensagemEm && (
                          <time>{dateTime(c.ultimaMensagemEm)}</time>
                        )}
                      </div>
                    </S.ConversationItem>
                  ))
                )}
              </div>
            </S.List>
            <S.Thread>
              {!conversation ? (
                <S.Empty>
                  <ChatCircleIcon size={42} />
                  <h2>Selecione uma conversa</h2>
                  <p>Seu histórico ficará disponível aqui.</p>
                </S.Empty>
              ) : (
                <>
                  <header>
                    <button
                      className="back"
                      aria-label="Voltar às conversas"
                      onClick={() => choose(null)}
                    >
                      <ArrowLeftIcon size={20} />
                    </button>
                    <Avatar name={conversation.nome} />
                    <div>
                      <h2>{conversation.nome}</h2>
                      <small>
                        {conversation.tipoPerfil === 'startup'
                          ? 'Startup'
                          : 'Investidor'}
                      </small>
                    </div>
                  </header>
                  <S.Timeline
                    ref={timeline}
                    aria-label="Histórico da conversa"
                    aria-busy={threadLoading}
                  >
                    {threadLoading ? (
                      <p>Carregando mensagens…</p>
                    ) : messages.length ? (
                      messages.map((m) => (
                        <S.Bubble key={m.id} $own={m.remetenteId === user.id}>
                          <div>
                            <strong>
                              {m.remetenteId === user.id
                                ? 'Você'
                                : conversation.nome}
                            </strong>
                            <p>{m.conteudo}</p>
                          </div>
                          <time dateTime={m.enviadoEm}>
                            {dateTime(m.enviadoEm)}
                            {m.remetenteId === user.id &&
                              (m.lidoEm ? (
                                <ChecksIcon
                                  aria-label="Mensagem lida"
                                  size={16}
                                />
                              ) : (
                                <CheckIcon
                                  aria-label="Mensagem enviada"
                                  size={16}
                                />
                              ))}
                          </time>
                        </S.Bubble>
                      ))
                    ) : (
                      <p>Envie a primeira mensagem para iniciar a conversa.</p>
                    )}
                  </S.Timeline>
                  {threadError && (
                    <div role="alert">
                      <p>{threadError}</p>
                      <Button
                        $variant="secondary"
                        onClick={() => setThreadAttempt((n) => n + 1)}
                      >
                        Atualizar conversa
                      </Button>
                    </div>
                  )}
                  <S.Composer
                    onSubmit={(e) => {
                      e.preventDefault();
                      void send();
                    }}
                  >
                    <div>
                      <textarea
                        aria-label="Mensagem"
                        placeholder="Escreva sua mensagem…"
                        maxLength={5000}
                        value={draft}
                        onChange={(e) =>
                          setDrafts((current) => ({
                            ...current,
                            [selected!]: e.target.value,
                          }))
                        }
                        disabled={sending || threadLoading}
                      />
                      <Button
                        type="submit"
                        aria-label="Enviar mensagem"
                        disabled={sending || threadLoading || !draft.trim()}
                      >
                        <PaperPlaneTiltIcon size={20} />
                        {sending ? 'Enviando…' : 'Enviar'}
                      </Button>
                    </div>
                    <small>{draft.length}/5000</small>
                  </S.Composer>
                </>
              )}
            </S.Thread>
          </S.Workspace>
        </S.Page>
      </Layout>
    </ThemeProvider>
  );
}
