import { Fragment, useEffect, useRef, useState } from 'react';
import {
  useNavigate,
  useRouteLoaderData,
  useSearchParams,
} from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import {
  ArchiveIcon,
  ArrowLeftIcon,
  CalendarIcon,
  ChatCircleIcon,
  CheckIcon,
  ChecksIcon,
  DotsThreeVerticalIcon,
  HandshakeIcon,
  PaperclipIcon,
  PaperPlaneTiltIcon,
  MagnifyingGlassIcon,
  ShieldCheckIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  getSession,
  logout,
  profilePath,
  type AuthUser,
} from '@/features/auth/services/session';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { demoMeetingsRepository } from '@/features/meetings/repository';
import { Layout, Badge } from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { theme, investorTheme } from '@/shared/styles/theme';
import {
  demoMessagesRepository,
  filterConversations,
  profileLabels,
  type Conversation,
  type Message,
  type Meeting,
} from './model';
import * as S from './Messages.styles';

const time = (date: string) =>
  new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit',
  });
const day = (date: string) => new Date(date).toLocaleDateString('pt-BR');
function Avatar({ name }: { name: string }) {
  return (
    <S.Avatar aria-hidden="true">
      {name
        .split(' ')
        .slice(0, 2)
        .map((word) => word[0])
        .join('')}
    </S.Avatar>
  );
}
function download(file: File) {
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = file.name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function MessagesPage() {
  const startupUser = useRouteLoaderData('startup-messages');
  const investorUser = useRouteLoaderData('investidor-messages');
  const user = (startupUser ??
    investorUser ??
    getSession()?.usuario) as AuthUser;
  return <MessagesScreen key={user.id} user={user} />;
}
function MessagesScreen({ user: initialUser }: { user: AuthUser }) {
  const [user] = useState(initialUser);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const requestedStartup = searchParams.get('startup');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [files, setFiles] = useState<Record<string, File | undefined>>({});
  const [dialog, setDialog] = useState<
    'profile' | 'match' | 'schedule' | 'matches' | null
  >(null);
  const [meetingDetail, setMeetingDetail] = useState<Meeting | null>(null);
  const [options, setOptions] = useState(false);
  const [notice, setNotice] = useState('');
  const fileInput = useRef<HTMLInputElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const timeline = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let active = true;
    demoMessagesRepository
      .list(user)
      .then((items) => {
        if (active) {
          setConversations(items);
          const requested = items.find(
            (item) =>
              item.participant.id === requestedStartup &&
              item.status === 'active',
          );
          if (requested) setSelected(requested.id);
        }
      })
      .catch(() => {
        if (active) setFailed(true);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [user, requestedStartup]);
  const conversation = conversations.find((item) => item.id === selected);
  const draft = selected ? (drafts[selected] ?? '') : '';
  const file = selected ? files[selected] : undefined;
  const unread = conversations.reduce(
    (total, item) => total + item.unreadCount,
    0,
  );
  const visible = filterConversations(conversations, search, filter);
  useEffect(() => {
    timeline.current?.scrollTo({ top: timeline.current.scrollHeight });
  }, [selected, conversation?.messages.length]);
  function openConversation(item: Conversation) {
    setSelected(item.id);
    setOptions(false);
    setNotice('');
    setConversations((items) =>
      items.map((current) =>
        current.id === item.id ? { ...current, unreadCount: 0 } : current,
      ),
    );
  }
  function append(
    message: Omit<Message, 'id' | 'conversationId' | 'senderId' | 'createdAt'>,
  ) {
    if (!conversation || conversation.status !== 'active') return;
    const createdAt = new Date().toISOString();
    const next: Message = {
      ...message,
      id: crypto.randomUUID(),
      conversationId: conversation.id,
      senderId: user.id,
      createdAt,
    };
    setConversations((items) =>
      items.map((item) =>
        item.id === conversation.id
          ? {
              ...item,
              messages: [...item.messages, next],
              updatedAt: createdAt,
            }
          : item,
      ),
    );
  }
  function send() {
    if (!draft.trim() || !selected || conversation?.status !== 'active') return;
    append({ type: file ? 'file' : 'text', content: draft.trim(), file });
    setDrafts((items) => ({ ...items, [selected]: '' }));
    setFiles((items) => ({ ...items, [selected]: undefined }));
    setNotice('Mensagem adicionada à demonstração.');
  }
  function archive(status: Conversation['status']) {
    setConversations((items) =>
      items.map((item) => (item.id === selected ? { ...item, status } : item)),
    );
    setOptions(false);
  }
  const filters = [
    ['all', 'Todas'],
    ['unread', 'Não lidas'],
    ...(user.tipoPerfil === 'startup'
      ? [
          ['investor', 'Investidores'],
          ['mentor', 'Mentores'],
        ]
      : [['startup', 'Startups']]),
  ];
  return (
    <ThemeProvider
      theme={user.tipoPerfil === 'startup' ? theme : investorTheme}
    >
      <Layout
        $audience={user.tipoPerfil === 'startup' ? 'startup' : 'investor'}
      >
        <ProfileSidebar
          profilePath={profilePath(user.tipoPerfil)}
          status={
            user.tipoPerfil === 'startup'
              ? 'Área da startup'
              : 'Área do investidor'
          }
          unreadMessages={unread}
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
            actions={
              <Button
                $variant="secondary"
                aria-label="Buscar conversa"
                onClick={() => {
                  setSelected(null);
                  requestAnimationFrame(() => searchInput.current?.focus());
                }}
              >
                <MagnifyingGlassIcon size={22} />
              </Button>
            }
          />
          <p className="demo">
            Demonstração · mensagens e convites ficam apenas nesta página.
          </p>
          <S.Workspace $selected={!!selected}>
            <S.List>
              <header>
                <h2>
                  Suas conversas{' '}
                  {unread > 0 && (
                    <Badge aria-label={`${unread} mensagens não lidas`}>
                      {unread}
                    </Badge>
                  )}
                </h2>
                <label>
                  <MagnifyingGlassIcon size={20} />
                  <input
                    ref={searchInput}
                    aria-label="Buscar conversa"
                    placeholder="Buscar conversa..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </label>
                <nav aria-label="Filtros de conversas">
                  {filters.map(([value, label]) => (
                    <button
                      key={value}
                      aria-pressed={filter === value}
                      onClick={() => setFilter(value!)}
                    >
                      {label}
                    </button>
                  ))}
                </nav>
              </header>
              <div>
                {loading ? (
                  <S.Empty role="status">Carregando conversas...</S.Empty>
                ) : failed ? (
                  <S.Empty role="alert">
                    Não foi possível carregar suas conversas.
                    <Button onClick={() => window.location.reload()}>
                      Tentar novamente
                    </Button>
                  </S.Empty>
                ) : conversations.length === 0 ? (
                  <S.Empty>
                    <ChatCircleIcon size={40} />
                    <h2>Você ainda não possui conversas.</h2>
                    <p>
                      Quando uma conexão estiver disponível, suas conversas
                      aparecerão aqui.
                    </p>
                    <Button
                      $variant="secondary"
                      onClick={() => setDialog('matches')}
                    >
                      Ver matches
                    </Button>
                  </S.Empty>
                ) : visible.length === 0 ? (
                  <S.Empty>
                    <MagnifyingGlassIcon size={32} />
                    <h2>Nenhuma conversa encontrada</h2>
                    <p>Tente outro nome, segmento ou filtro.</p>
                    <Button
                      $variant="quiet"
                      onClick={() => {
                        setSearch('');
                        setFilter('all');
                      }}
                    >
                      Limpar filtros
                    </Button>
                  </S.Empty>
                ) : (
                  visible.map((item) => (
                    <S.ConversationItem
                      key={item.id}
                      data-unread={item.unreadCount > 0}
                      aria-current={selected === item.id}
                      onClick={() => openConversation(item)}
                    >
                      <Avatar name={item.participant.name} />
                      <div>
                        <header>
                          <strong>{item.participant.name}</strong>
                          <time dateTime={item.updatedAt}>
                            {day(item.updatedAt) ===
                            day(new Date().toISOString())
                              ? time(item.updatedAt)
                              : day(item.updatedAt)}
                          </time>
                        </header>
                        <small>
                          {profileLabels[item.participant.type]} ·{' '}
                          {item.participant.segment}
                        </small>
                        <p>
                          {item.messages.at(-1)?.content ??
                            'Comece essa conexão com uma mensagem.'}
                        </p>
                        {item.status === 'archived' && <small>Arquivada</small>}
                        {item.unreadCount > 0 && (
                          <Badge aria-label={`${item.unreadCount} não lidas`}>
                            {item.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </S.ConversationItem>
                  ))
                )}
              </div>
              <footer>
                <ShieldCheckIcon size={18} />
                Conversas que começam com uma conexão.
              </footer>
            </S.List>
            <S.Thread>
              {!conversation ? (
                <S.Empty>
                  <ChatCircleIcon size={56} weight="duotone" />
                  <h2>Selecione uma conversa</h2>
                  <p>Escolha uma conexão ao lado para começar a conversar.</p>
                </S.Empty>
              ) : (
                <>
                  <header>
                    <Button
                      className="back"
                      $variant="quiet"
                      aria-label="Voltar para conversas"
                      onClick={() => setSelected(null)}
                    >
                      <ArrowLeftIcon size={20} />
                    </Button>
                    <Avatar name={conversation.participant.name} />
                    <div className="identity">
                      <h2>{conversation.participant.name}</h2>
                      <small>
                        {profileLabels[conversation.participant.type]} ·{' '}
                        {conversation.participant.segment} ·{' '}
                        {conversation.participant.location}
                      </small>
                    </div>
                    <div className="actions">
                      <Button
                        $variant="secondary"
                        onClick={() => setDialog('profile')}
                      >
                        {conversation.participant.type === 'startup'
                          ? 'Ver startup'
                          : 'Ver perfil'}
                      </Button>
                      <div className="options">
                        <Button
                          $variant="quiet"
                          aria-label="Opções da conversa"
                          aria-expanded={options}
                          onClick={() => setOptions(!options)}
                        >
                          <DotsThreeVerticalIcon size={22} />
                        </Button>
                        {options && (
                          <div>
                            <Button
                              $variant="quiet"
                              disabled={conversation.status !== 'active'}
                              onClick={() => {
                                setDialog('schedule');
                                setNotice('');
                                setOptions(false);
                              }}
                            >
                              <CalendarIcon size={18} />
                              Agendar reunião
                            </Button>
                            <Button
                              $variant="quiet"
                              disabled={conversation.status === 'closed'}
                              onClick={() =>
                                archive(
                                  conversation.status === 'archived'
                                    ? 'active'
                                    : 'archived',
                                )
                              }
                            >
                              <ArchiveIcon size={18} />
                              {conversation.status === 'archived'
                                ? 'Reativar conversa'
                                : 'Arquivar conversa'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </header>
                  <S.Match key={conversation.id}>
                    <summary>
                      Conexão realizada · {conversation.match.compatibility}% de
                      compatibilidade
                    </summary>
                    <p>
                      Compatibilidade identificada pelo Juntaí!
                      <br />
                      {conversation.match.factors.join(' · ')}
                    </p>
                    <Button $variant="quiet" onClick={() => setDialog('match')}>
                      <HandshakeIcon size={16} />
                      Ver detalhes do match
                    </Button>
                  </S.Match>
                  <S.Timeline
                    ref={timeline}
                    role="log"
                    aria-label={`Mensagens com ${conversation.participant.name}`}
                    aria-live="polite"
                  >
                    {conversation.messages.map((message, index) => (
                      <Fragment key={message.id}>
                        {(index === 0 ||
                          day(conversation.messages[index - 1]!.createdAt) !==
                            day(message.createdAt)) && (
                          <div className="date">
                            {day(message.createdAt) ===
                            day(new Date().toISOString())
                              ? 'Hoje'
                              : day(message.createdAt)}
                          </div>
                        )}
                        <S.Bubble $own={message.senderId === user.id}>
                          <div>
                            {message.senderId !== user.id && (
                              <Avatar name={conversation.participant.name} />
                            )}
                            <strong>
                              {message.senderId === user.id
                                ? 'Você'
                                : conversation.participant.name}
                            </strong>
                            <p>{message.content}</p>
                            {message.file && (
                              <Button
                                $variant="quiet"
                                onClick={() => download(message.file!)}
                              >
                                <PaperclipIcon size={18} />
                                {message.file.name}
                              </Button>
                            )}
                            {message.meeting && (
                              <>
                                <p>
                                  <CalendarIcon size={16} />{' '}
                                  {new Date(
                                    `${message.meeting.date}T12:00:00`,
                                  ).toLocaleDateString('pt-BR', {
                                    dateStyle: 'long',
                                  })}{' '}
                                  · {message.meeting.time}
                                  <br />
                                  {message.meeting.format} ·{' '}
                                  {message.meeting.duration} minutos
                                </p>
                                <Button
                                  $variant="secondary"
                                  onClick={() =>
                                    setMeetingDetail(message.meeting!)
                                  }
                                >
                                  Ver reunião
                                </Button>
                              </>
                            )}
                          </div>
                          <time dateTime={message.createdAt}>
                            {time(message.createdAt)}
                            {message.senderId === user.id &&
                              (message.readAt ? (
                                <ChecksIcon aria-label="Lida" size={16} />
                              ) : (
                                <CheckIcon
                                  aria-label="Adicionada à demonstração"
                                  size={16}
                                />
                              ))}
                          </time>
                        </S.Bubble>
                      </Fragment>
                    ))}
                  </S.Timeline>
                  {conversation.status === 'active' ? (
                    <S.Composer
                      onSubmit={(event) => {
                        event.preventDefault();
                        send();
                      }}
                    >
                      {file && (
                        <div>
                          <small>{file.name}</small>
                          <Button
                            type="button"
                            $variant="quiet"
                            aria-label="Remover anexo"
                            onClick={() =>
                              setFiles((items) => ({
                                ...items,
                                [conversation.id]: undefined,
                              }))
                            }
                          >
                            <XIcon size={16} />
                          </Button>
                        </div>
                      )}
                      <div>
                        <input
                          ref={fileInput}
                          type="file"
                          hidden
                          onChange={(event) => {
                            const next = event.target.files?.[0];
                            if (next && next.size > 10 * 1024 * 1024)
                              setNotice('Selecione um arquivo de até 10 MB.');
                            else
                              setFiles((items) => ({
                                ...items,
                                [conversation.id]: next,
                              }));
                            event.target.value = '';
                          }}
                        />
                        <Button
                          type="button"
                          $variant="quiet"
                          aria-label="Anexar arquivo"
                          onClick={() => fileInput.current?.click()}
                        >
                          <PaperclipIcon size={22} />
                        </Button>
                        <textarea
                          aria-label="Mensagem"
                          placeholder="Digite uma mensagem..."
                          rows={2}
                          value={draft}
                          onChange={(event) =>
                            setDrafts((items) => ({
                              ...items,
                              [conversation.id]: event.target.value,
                            }))
                          }
                          onKeyDown={(event) => {
                            if (
                              event.key === 'Enter' &&
                              !event.shiftKey &&
                              !event.nativeEvent.isComposing
                            ) {
                              event.preventDefault();
                              send();
                            }
                          }}
                        />
                        <Button
                          type="submit"
                          aria-label="Enviar mensagem"
                          disabled={!draft.trim()}
                        >
                          <PaperPlaneTiltIcon size={21} />
                        </Button>
                      </div>
                      <small>
                        Enter para enviar · Shift + Enter para nova linha ·
                        Anexos até 10 MB
                      </small>
                      <small role="status">{notice}</small>
                    </S.Composer>
                  ) : (
                    <S.Empty>
                      {conversation.status === 'archived' ? (
                        <>
                          <p>Esta conversa está arquivada.</p>
                          <Button onClick={() => archive('active')}>
                            Reativar conversa
                          </Button>
                        </>
                      ) : (
                        <p>
                          Esta conversa não está disponível para novas
                          mensagens.
                        </p>
                      )}
                    </S.Empty>
                  )}
                </>
              )}
            </S.Thread>
          </S.Workspace>
        </S.Page>
        <ContentDialog
          open={dialog !== null}
          title={
            dialog === 'profile'
              ? 'Perfil público da conexão'
              : dialog === 'match'
                ? 'Detalhes do match'
                : dialog === 'schedule'
                  ? 'Agendar reunião'
                  : 'Seus matches'
          }
          onClose={() => setDialog(null)}
        >
          {dialog === 'profile' && conversation && (
            <>
              <Avatar name={conversation.participant.name} />
              <h2>{conversation.participant.name}</h2>
              <p>
                {conversation.participant.segment} ·{' '}
                {conversation.participant.location}
              </p>
              <p>{conversation.participant.bio}</p>
              <dl>
                {Object.entries(conversation.participant.publicDetails).map(
                  ([label, value]) => (
                    <Fragment key={label}>
                      <dt>
                        <strong>{label}</strong>
                      </dt>
                      <dd style={{ margin: '.3rem 0 1rem' }}>{value}</dd>
                    </Fragment>
                  ),
                )}
              </dl>
            </>
          )}
          {dialog === 'match' && conversation && (
            <>
              <Badge>
                {conversation.match.compatibility}% de compatibilidade
              </Badge>
              <h3>Interesses que aproximam vocês</h3>
              <ul>
                {conversation.match.factors.map((factor) => (
                  <li key={factor}>{factor}</li>
                ))}
              </ul>
              <p>
                Este indicador do sistema não garante investimento ou parceria.
              </p>
              <p>Dados ilustrativos para demonstração.</p>
            </>
          )}
          {dialog === 'matches' && (
            <>
              <HandshakeIcon size={36} />
              <h3>Novas conexões começam por aqui</h3>
              <p>
                Os matches serão disponibilizados após a aprovação do perfil e a
                integração da plataforma. Assim que uma conexão for liberada,
                ela poderá aparecer em suas conversas.
              </p>
            </>
          )}
          {dialog === 'schedule' && conversation && (
            <S.Form
              onSubmit={(event) => {
                event.preventDefault();
                const data = new FormData(event.currentTarget);
                const meeting = Object.fromEntries(data) as Meeting;
                if (
                  new Date(
                    `${meeting.date}T${meeting.time}:00-03:00`,
                  ).getTime() <= Date.now()
                ) {
                  setNotice('Escolha uma data e um horário futuros.');
                  return;
                }
                try {
                  demoMeetingsRepository.create(user, {
                    participantId: conversation.participant.id,
                    date: meeting.date,
                    time: meeting.time,
                    duration: Number(meeting.duration),
                    format:
                      meeting.format === 'Reunião presencial'
                        ? 'presential'
                        : 'online',
                    title: `Conversa com ${conversation.participant.name}`,
                    description: meeting.notes,
                    link: meeting.link,
                    address: '',
                  });
                } catch (cause) {
                  setNotice(
                    cause instanceof Error
                      ? cause.message
                      : 'Não foi possível enviar o convite. Tente novamente.',
                  );
                  return;
                }
                append({
                  type: 'meeting',
                  content: 'Convite de reunião',
                  meeting,
                });
                setDialog(null);
                setNotice(
                  'Convite adicionado à demonstração. Aguardando confirmação da conexão.',
                );
              }}
            >
              <p>
                Combine os próximos passos com {conversation.participant.name}.
              </p>
              <label>
                Data
                <input
                  name="date"
                  type="date"
                  required
                  min={new Date().toLocaleDateString('en-CA')}
                />
              </label>
              <label>
                Horário
                <input name="time" type="time" required />
              </label>
              <label>
                Duração
                <select name="duration" defaultValue="30">
                  <option value="15">15 minutos</option>
                  <option value="30">30 minutos</option>
                  <option value="60">1 hora</option>
                </select>
              </label>
              <label>
                Tipo de reunião
                <select name="format">
                  <option>Reunião online</option>
                  <option>Reunião presencial</option>
                </select>
              </label>
              <label>
                Link da reunião
                <input
                  name="link"
                  type="url"
                  pattern="https?://.*"
                  placeholder="https://"
                />
              </label>
              <label>
                Observações
                <textarea name="notes" rows={3} maxLength={2000} />
              </label>
              <p role="status">{notice}</p>
              <Button type="submit">
                <CalendarIcon size={20} />
                Enviar convite
              </Button>
            </S.Form>
          )}
        </ContentDialog>
        <ContentDialog
          open={!!meetingDetail}
          title="Detalhes da reunião"
          onClose={() => setMeetingDetail(null)}
        >
          {meetingDetail && (
            <>
              <p>
                {new Date(`${meetingDetail.date}T12:00:00`).toLocaleDateString(
                  'pt-BR',
                )}{' '}
                às {meetingDetail.time} · {meetingDetail.duration} minutos
              </p>
              <p>{meetingDetail.format}</p>
              <p>Convite de demonstração · aguardando confirmação.</p>
              {/^https?:\/\//.test(meetingDetail.link) && (
                <a
                  href={meetingDetail.link}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Abrir link da reunião
                </a>
              )}
              <p style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
                {meetingDetail.notes}
              </p>
            </>
          )}
        </ContentDialog>
      </Layout>
    </ThemeProvider>
  );
}
