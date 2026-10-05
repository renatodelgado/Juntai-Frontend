import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  UsersIcon,
  RocketLaunchIcon,
  HandshakeIcon,
  GraduationCapIcon,
  ClipboardTextIcon,
  CalendarIcon,
  ClockCounterClockwiseIcon,
} from '@phosphor-icons/react';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { Area, Detail } from './styles';
import {
  adminGet,
  adminWrite,
  actions,
  types,
  statuses,
  date,
  type Row,
  type AuditRow,
  type PageData,
  type Metrics,
} from './api';

const labels: Record<string, string> = {
  problema: 'Problema',
  solucao: 'Solução',
  statusAnterior: 'Status anterior',
  statusNovo: 'Novo status',
  motivo: 'Motivo',
  resultado: 'Resultado',
  alteracoes: 'Alterações',
  antes: 'Antes',
  depois: 'Depois',
  id: 'Identificador',
  nome: 'Nome',
  nomeFantasia: 'Nome da startup',
  usuario: 'Responsável',
  logoUrl: 'Logo',
  apresentacaoUrl: 'Apresentação',
  descricaoCurta: 'Descrição curta',
  siteUrl: 'Site',
  linksSociais: 'Redes sociais',
  videoApresentacaoUrl: 'Vídeo de apresentação',
  segmento: 'Segmento',
  segmentosSecundarios: 'Segmentos secundários',
  estagio: 'Estágio',
  modeloNegocio: 'Modelo de negócio',
  estado: 'Estado',
  cidade: 'Cidade',
  regioesAtuacao: 'Regiões de atuação',
  regioesCrescimento: 'Regiões de crescimento',
  mercadoAlvo: 'Mercado alvo',
  metricaCrescimento: 'Métrica de crescimento',
  periodoComparacaoCrescimento: 'Período de comparação',
  taxaCrescimentoPct: 'Taxa de crescimento (%)',
  descricaoEvolucao: 'Evolução do negócio',
  numeroClientes: 'Número de clientes',
  faturamentoMensal: 'Faturamento mensal',
  tamanhoEquipe: 'Tamanho da equipe',
  buscaInvestimento: 'Busca investimento',
  capitalProcurado: 'Capital procurado',
  finalidadeInvestimento: 'Finalidade do investimento',
  necessidadesAdicionais: 'Necessidades além de capital',
  descricaoPitch: 'Pitch',
  canvasJson: 'Canvas',
  statusModeracao: 'Status de moderação',
  criadoEm: 'Criado em',
  atualizadoEm: 'Atualizado em',
  tituloProfissional: 'Título profissional',
  linkedinUrl: 'LinkedIn',
  bio: 'Biografia',
  tipoInvestidor: 'Tipo de investidor',
  areasAjuda: 'Áreas de ajuda',
  disponibilidade: 'Disponibilidade',
  jaAtuouComStartups: 'Já atuou com startups',
  numeroAproximadoInvestimentos: 'Investimentos realizados',
  descricaoExperiencia: 'Experiência',
  setoresAtuacao: 'Setores de atuação',
  anosExperiencia: 'Anos de experiência',
  ticketMinimo: 'Ticket mínimo',
  ticketMaximo: 'Ticket máximo',
  perfilRisco: 'Perfil de risco',
  segmentosInteresse: 'Segmentos de interesse',
  estagiosInteresse: 'Estágios de interesse',
  regioesInteresse: 'Regiões de interesse',
  modelosInteresse: 'Modelos de interesse',
  regiao: 'Região antiga',
};
const message = (error: unknown) =>
  error instanceof Error
    ? error.message
    : 'Não foi possível carregar os dados.';
function valueText(value: unknown): string {
  if (value === null || value === undefined || value === '')
    return 'Não informado';
  if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
  if (Array.isArray(value))
    return value.length ? value.map(valueText).join(', ') : 'Não informado';
  if (typeof value === 'object')
    return Object.entries(value)
      .map(
        ([key, nested]) =>
          `${labels[key] || key.replace(/([A-Z])/g, ' $1')}: ${valueText(nested)}`,
      )
      .join('\n');
  if (typeof value === 'string' && statuses[value]) return statuses[value];
  return String(value);
}
const safeUrl = (value: unknown) =>
  typeof value === 'string' && /^https?:\/\//i.test(value) ? value : null;
type Modal =
  | { kind: 'detail' | 'approve' | 'reject' | 'edit'; row: Row }
  | { kind: 'audit'; row: AuditRow };
const empty: PageData<Row> = { items: [], total: 0, page: 1, size: 15 };
export function AdminPage() {
  const { pathname } = useLocation();
  const section = pathname.split('/')[2] || '';
  const overview = !section;
  const audit = section === 'auditoria';
  const users = section === 'usuarios';
  const forced = section === 'startups' ? 'startup' : '';
  const [q, setQ] = useState('');
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('');
  const [action, setAction] = useState('');
  const [actor, setActor] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [resource, setResource] = useState('');
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<PageData<Row>>(empty);
  const [logs, setLogs] = useState<PageData<AuditRow>>({ ...empty, items: [] });
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [revision, setRevision] = useState(0);
  const [modal, setModal] = useState<Modal | null>(null);
  const [detail, setDetail] = useState<Record<string, unknown> | null>(null);
  const [detailError, setDetailError] = useState('');
  const [reason, setReason] = useState('');
  const [fields, setFields] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [modalError, setModalError] = useState('');
  const [detailRevision, setDetailRevision] = useState(0);
  // Remount per section in the router to keep filters scoped to each table.
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({
        q,
        tipo: forced || type,
        grupo: section === 'investidores' ? 'investidores' : '',
        status: overview ? 'pendente' : status,
        sort,
        page: String(page),
      });
      const load = async () => {
        if (overview) {
          const [m, p, a] = await Promise.all([
            adminGet<Metrics>('metricas', controller.signal),
            adminGet<PageData<Row>>('cadastros?' + params, controller.signal),
            adminGet<PageData<AuditRow>>('auditoria?size=5', controller.signal),
          ]);
          if (controller.signal.aborted) return;
          setMetrics(m);
          setRows(p);
          setLogs(a);
        } else if (audit) {
          const p = new URLSearchParams({
            q,
            acao: action,
            ator: actor,
            de: from,
            ate: to,
            recurso: resource,
            page: String(page),
          });
          const a = await adminGet<PageData<AuditRow>>(
            'auditoria?' + p,
            controller.signal,
          );
          if (!controller.signal.aborted) setLogs(a);
        } else {
          const p = await adminGet<PageData<Row>>(
            (users ? 'usuarios' : 'cadastros') + '?' + params,
            controller.signal,
          );
          if (!controller.signal.aborted) setRows(p);
        }
      };
      void load()
        .catch((e) => {
          if (!controller.signal.aborted) setError(message(e));
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [
    section,
    overview,
    audit,
    users,
    forced,
    q,
    type,
    status,
    sort,
    action,
    actor,
    from,
    to,
    resource,
    page,
    revision,
  ]);
  useEffect(() => {
    if (!modal || modal.kind === 'audit' || users) return;
    const controller = new AbortController();
    const row = modal.row;
    void adminGet<Record<string, unknown>>(
      'cadastros/' + row.tipo + '/' + row.id,
      controller.signal,
    )
      .then((data) => {
        if (!controller.signal.aborted) {
          setDetail(data);
          if (modal.kind === 'edit')
            setFields(
              row.tipo === 'startup'
                ? {
                    nomeFantasia: String(data.nomeFantasia || ''),
                    descricaoCurta: String(data.descricaoCurta || ''),
                  }
                : {
                    nome: String(data.nome || ''),
                    tituloProfissional: String(data.tituloProfissional || ''),
                    bio: String(data.bio || ''),
                  },
            );
        }
      })
      .catch((e) => {
        if (!controller.signal.aborted) setDetailError(message(e));
      });
    return () => controller.abort();
  }, [modal, users, detailRevision]);
  const open = (next: Modal) => {
    setDetail(null);
    setDetailError('');
    setModalError('');
    setReason('');
    setFields(
      next.kind === 'edit' && users
        ? { nome: next.row.nome, email: next.row.email }
        : {},
    );
    setModal(next);
  };
  const close = () => {
    if (!busy) setModal(null);
  };
  const mutate = async () => {
    if (!modal || modal.kind === 'audit' || modal.kind === 'detail') return;
    if (modal.kind === 'reject' && !reason.trim()) {
      setModalError('Informe o motivo da rejeição.');
      return;
    }
    setBusy(true);
    setModalError('');
    try {
      if (modal.kind === 'edit') {
        const resource = users
          ? 'usuarios'
          : modal.row.tipo === 'startup'
            ? 'startups'
            : 'investidores';
        await adminWrite(resource + '/' + modal.row.id, fields, 'PATCH');
        setNotice(
          'Dados atualizados. A alteração foi registrada na auditoria.',
        );
      } else {
        await adminWrite(
          'cadastros/' + modal.row.tipo + '/' + modal.row.id + '/decisao',
          {
            status: modal.kind === 'approve' ? 'aprovado' : 'rejeitado',
            motivo: reason,
          },
        );
        setNotice(
          modal.kind === 'approve'
            ? 'Cadastro aprovado.'
            : 'Cadastro rejeitado. O motivo foi registrado na auditoria.',
        );
      }
      setModal(null);
      setRevision((n) => n + 1);
    } catch (e) {
      setModalError(message(e));
    } finally {
      setBusy(false);
    }
  };
  const clear = () => {
    setQ('');
    setType('');
    setStatus('');
    setSort('');
    setAction('');
    setActor('');
    setFrom('');
    setTo('');
    setResource('');
    setPage(1);
  };
  const title = overview
    ? 'Painel Administrativo'
    : {
        cadastros: 'Cadastros para análise',
        usuarios: 'Usuários',
        startups: 'Startups',
        investidores: 'Investidores e mentores',
        auditoria: 'Auditoria',
      }[section] || 'Administração';
  const total = audit ? logs.total : rows.total;
  const pages = Math.max(1, Math.ceil(total / 15));
  const badges = (s: string) => (
    <span className="badge" data-status={s}>
      {statuses[s] || s}
    </span>
  );
  const auditTable = (items: AuditRow[]) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Data e hora</th>
            <th>Administrador</th>
            <th>Ação</th>
            <th>Recurso</th>
            <th>Resultado</th>
            <th>Detalhes</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>{date(row.criadoEm)}</td>
              <td>{row.ator || 'Administrador indisponível'}</td>
              <td>{actions[row.acao] || row.acao}</td>
              <td>
                {types[row.recurso] || row.recurso}
                <small style={{ display: 'block' }}>{row.entidadeId}</small>
              </td>
              <td>{valueText(row.detalhes?.resultado)}</td>
              <td>
                <Button
                  $variant="quiet"
                  onClick={() => open({ kind: 'audit', row })}
                >
                  Ver detalhes
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  const profileTable = (items: Row[]) => (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>Nome</th>
            <th>Tipo</th>
            {section === 'startups' && (
              <>
                <th>Responsável</th>
                <th>Segmento</th>
              </>
            )}
            <th>E-mail</th>
            <th>Cadastro</th>
            <th>Status</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => (
            <tr key={row.id}>
              <td>{row.nome}</td>
              <td>
                {row.tipoInvestidor === 'anjo_mentor'
                  ? 'Investidor e mentor'
                  : types[row.tipo] || row.tipo}
              </td>
              {section === 'startups' && (
                <>
                  <td>{row.responsavel || 'Não informado'}</td>
                  <td>{row.segmento || 'Não informado'}</td>
                </>
              )}
              <td>{row.email}</td>
              <td>{date(row.criadoEm)}</td>
              <td>{badges(row.status)}</td>
              <td>
                <div className="actions">
                  {!users && (
                    <Button
                      $variant="quiet"
                      onClick={() => open({ kind: 'detail', row })}
                    >
                      Visualizar
                    </Button>
                  )}
                  {!overview && (
                    <Button
                      $variant="quiet"
                      onClick={() => open({ kind: 'edit', row })}
                    >
                      Editar
                    </Button>
                  )}
                  {!users && row.status === 'pendente' && (
                    <>
                      <Button
                        $variant="quiet"
                        onClick={() => open({ kind: 'approve', row })}
                      >
                        Aprovar
                      </Button>
                      <Button
                        $variant="quiet"
                        onClick={() => open({ kind: 'reject', row })}
                      >
                        Rejeitar
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
  return (
    <Area>
      <PageHeader
        title={title}
        subtitle={
          overview
            ? 'Gerencie usuários, cadastros, dados e atividades da plataforma Juntaí!.'
            : 'Consulte os dados da plataforma e acompanhe as alterações administrativas.'
        }
        breadcrumbs={[
          { label: 'Juntaí!', to: '/admin' },
          ...(overview
            ? [{ label: 'Administração' }]
            : [{ label: 'Administração', to: '/admin' }, { label: title }]),
        ]}
        actions={
          <Button
            $variant="secondary"
            onClick={() => setRevision((n) => n + 1)}
          >
            Atualizar
          </Button>
        }
      />
      {notice && (
        <div role="status" className="feedback">
          {notice}{' '}
          <Button
            $variant="quiet"
            aria-label="Dispensar aviso"
            onClick={() => setNotice('')}
          >
            Fechar
          </Button>
        </div>
      )}
      {error ? (
        <div role="alert" className="error">
          {error}{' '}
          <Button $variant="quiet" onClick={() => setRevision((n) => n + 1)}>
            Tentar novamente
          </Button>
          {!overview && (
            <Button $variant="quiet" onClick={clear}>
              Limpar filtros
            </Button>
          )}
        </div>
      ) : loading ? (
        <div role="status" className="panel">
          Carregando dados administrativos…
        </div>
      ) : (
        <>
          {overview && metrics && (
            <div className="cards">
              {(
                [
                  [
                    'Usuários',
                    metrics.usuarios,
                    UsersIcon,
                    'Contas cadastradas',
                  ],
                  [
                    'Startups',
                    metrics.startups,
                    RocketLaunchIcon,
                    'Perfis cadastrados',
                  ],
                  [
                    'Investidores',
                    metrics.investidores,
                    HandshakeIcon,
                    'Inclui investidores e mentores',
                  ],
                  [
                    'Mentores',
                    metrics.mentores,
                    GraduationCapIcon,
                    'Mentores e anjos que também mentoram',
                  ],
                  [
                    'Cadastros pendentes',
                    metrics.pendentes,
                    ClipboardTextIcon,
                    'Aguardando sua análise',
                  ],
                  [
                    'Reuniões',
                    metrics.reunioes,
                    CalendarIcon,
                    'Registros de reuniões na plataforma',
                  ],
                ] as const
              ).map(([label, count, Icon, hint]) => (
                <div className="card" key={label}>
                  <Icon weight="duotone" />
                  <div>
                    <span>{label}</span>
                    <strong>{count}</strong>
                    <span>{hint}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <section className="panel">
            <div className="section-head">
              <h2>
                {overview
                  ? 'Cadastros pendentes'
                  : audit
                    ? 'Registros de auditoria'
                    : 'Lista de ' + (users ? 'usuários' : 'cadastros')}
              </h2>
              {overview && (
                <Link to="/admin/cadastros">Ver todos os cadastros</Link>
              )}
            </div>
            {!overview && (
              <>
                {section === 'cadastros' && (
                  <div className="tabs">
                    {[
                      ['', 'Todos'],
                      ['startup', 'Startups'],
                      ['investidor', 'Investidores'],
                      ['mentor', 'Mentores'],
                    ].map(([value, label]) => (
                      <Button
                        key={value}
                        $variant="quiet"
                        aria-pressed={type === value}
                        onClick={() => {
                          setType(value!);
                          setPage(1);
                        }}
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                )}
                <div className="filters">
                  <label>
                    Buscar
                    <input
                      type="search"
                      placeholder={
                        audit ? 'ID do recurso ou detalhes' : 'Nome ou e-mail'
                      }
                      value={q}
                      onChange={(e) => {
                        setQ(e.target.value);
                        setPage(1);
                      }}
                    />
                  </label>
                  {audit ? (
                    <>
                      <label>
                        Ação
                        <select
                          value={action}
                          onChange={(e) => {
                            setAction(e.target.value);
                            setPage(1);
                          }}
                        >
                          <option value="">Todas</option>
                          {Object.entries(actions).map(([k, v]) => (
                            <option key={k} value={k}>
                              {v}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Administrador
                        <input
                          value={actor}
                          onChange={(e) => {
                            setActor(e.target.value);
                            setPage(1);
                          }}
                        />
                      </label>
                      <label>
                        Recurso
                        <select
                          value={resource}
                          onChange={(e) => {
                            setResource(e.target.value);
                            setPage(1);
                          }}
                        >
                          <option value="">Todos</option>
                          {[
                            'startup',
                            'investidor',
                            'usuarios',
                            'startups',
                            'investidores',
                          ].map((k) => (
                            <option key={k} value={k}>
                              {types[k]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        De
                        <input
                          type="date"
                          value={from}
                          onChange={(e) => {
                            setFrom(e.target.value);
                            setPage(1);
                          }}
                        />
                      </label>
                      <label>
                        Até
                        <input
                          type="date"
                          value={to}
                          onChange={(e) => {
                            setTo(e.target.value);
                            setPage(1);
                          }}
                        />
                      </label>
                    </>
                  ) : (
                    <>
                      {users && (
                        <label>
                          Tipo
                          <select
                            value={type}
                            onChange={(e) => {
                              setType(e.target.value);
                              setPage(1);
                            }}
                          >
                            <option value="">Todos</option>
                            {['startup', 'investidor', 'admin'].map((k) => (
                              <option key={k} value={k}>
                                {types[k]}
                              </option>
                            ))}
                          </select>
                        </label>
                      )}
                      {section === 'investidores' && (
                        <label>
                          Tipo
                          <select
                            value={type}
                            onChange={(e) => {
                              setType(e.target.value);
                              setPage(1);
                            }}
                          >
                            <option value="">Todos</option>
                            <option value="investidor">Investidores</option>
                            <option value="mentor">Mentores</option>
                          </select>
                        </label>
                      )}
                      <label>
                        Status
                        <select
                          value={status}
                          onChange={(e) => {
                            setStatus(e.target.value);
                            setPage(1);
                          }}
                        >
                          <option value="">Todos</option>
                          {(users
                            ? ['ativo', 'inativo']
                            : ['pendente', 'aprovado', 'rejeitado', 'suspenso']
                          ).map((k) => (
                            <option key={k} value={k}>
                              {statuses[k]}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label>
                        Ordenar
                        <select
                          value={sort}
                          onChange={(e) => {
                            setSort(e.target.value);
                            setPage(1);
                          }}
                        >
                          <option value="">Mais recentes</option>
                          <option value="nome">Nome A–Z</option>
                        </select>
                      </label>
                    </>
                  )}
                  <Button $variant="quiet" onClick={clear}>
                    Limpar filtros
                  </Button>
                </div>
              </>
            )}
            {(audit ? logs.items : rows.items).length ? (
              audit ? (
                auditTable(logs.items)
              ) : (
                profileTable(rows.items)
              )
            ) : (
              <div className="empty">
                {overview
                  ? 'Nenhum cadastro aguardando análise.'
                  : 'Nenhum resultado encontrado para estes filtros.'}
              </div>
            )}
            {(!overview || rows.total > 15) && (
              <div className="pagination">
                <span>
                  {total} registros · Página {page} de {pages}
                </span>
                <Button
                  $variant="secondary"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Anterior
                </Button>
                <Button
                  $variant="secondary"
                  disabled={page >= pages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Próxima
                </Button>
              </div>
            )}
          </section>
          {overview && (
            <section className="panel">
              <div className="section-head">
                <h2>Atividade recente</h2>
                <Link to="/admin/auditoria">Ver todos os logs</Link>
              </div>
              {logs.items.length ? (
                <ul className="activity">
                  {logs.items.map((log) => (
                    <li key={log.id}>
                      <ClockCounterClockwiseIcon size={22} />
                      <div>
                        <strong>{actions[log.acao] || log.acao}</strong> ·{' '}
                        {log.ator}
                        <small>
                          {date(log.criadoEm)} ·{' '}
                          {types[log.recurso] || log.recurso}
                        </small>
                        <Button
                          $variant="quiet"
                          onClick={() => open({ kind: 'audit', row: log })}
                        >
                          Ver detalhes
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="hint">
                  Nenhuma atividade administrativa registrada.
                </p>
              )}
            </section>
          )}
        </>
      )}
      <ContentDialog
        open={!!modal}
        title={
          modal?.kind === 'approve'
            ? 'Aprovar cadastro'
            : modal?.kind === 'reject'
              ? 'Rejeitar cadastro'
              : modal?.kind === 'edit'
                ? 'Editar dados'
                : modal?.kind === 'audit'
                  ? 'Detalhes da auditoria'
                  : 'Detalhes do cadastro'
        }
        onClose={close}
        busy={busy}
        closeLabel={
          modal?.kind === 'approve' ||
          modal?.kind === 'reject' ||
          modal?.kind === 'edit'
            ? 'Cancelar'
            : 'Fechar'
        }
      >
        <Detail>
          {modal && modal.kind === 'audit' ? (
            <>
              <p>
                {actions[modal.row.acao] || modal.row.acao} · {modal.row.ator} ·{' '}
                {date(modal.row.criadoEm)}
              </p>
              <p>
                Recurso: {types[modal.row.recurso] || modal.row.recurso} ·{' '}
                {modal.row.entidadeId}
              </p>
              <pre>{valueText(modal.row.detalhes)}</pre>
            </>
          ) : (
            modal && (
              <>
                <h3>{modal.row.nome}</h3>
                {modal.kind === 'approve' || modal.kind === 'reject' ? (
                  <>
                    <p>
                      {modal.kind === 'approve'
                        ? 'Confirme a aprovação deste cadastro. O perfil poderá acessar os recursos liberados para perfis aprovados.'
                        : 'Confirme a rejeição deste cadastro e informe o motivo da decisão.'}
                    </p>
                    {modal.kind === 'reject' && (
                      <label>
                        Motivo da rejeição
                        <textarea
                          value={reason}
                          onChange={(e) => setReason(e.target.value)}
                          maxLength={2000}
                          rows={4}
                          required
                          disabled={busy}
                        />
                      </label>
                    )}
                  </>
                ) : modal.kind === 'edit' ? (
                  users || detail ? (
                    <>
                      {Object.entries(fields).map(([key, value]) => (
                        <label key={key}>
                          {labels[key] || (key === 'email' ? 'E-mail' : key)}
                          {key === 'bio' || key === 'descricaoCurta' ? (
                            <textarea
                              value={value}
                              maxLength={key === 'bio' ? 5000 : 300}
                              rows={4}
                              disabled={busy}
                              onChange={(e) =>
                                setFields((f) => ({
                                  ...f,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                          ) : (
                            <input
                              type={key === 'email' ? 'email' : 'text'}
                              value={value}
                              maxLength={150}
                              disabled={busy}
                              onChange={(e) =>
                                setFields((f) => ({
                                  ...f,
                                  [key]: e.target.value,
                                }))
                              }
                            />
                          )}
                        </label>
                      ))}
                      <p>A edição será registrada no histórico de auditoria.</p>
                    </>
                  ) : null
                ) : detail ? (
                  <>
                    <dl>
                      <div>
                        <dt>Responsável</dt>
                        <dd>
                          {valueText(
                            (detail.usuario as Record<string, unknown>)?.nome,
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt>E-mail</dt>
                        <dd>
                          {valueText(
                            (detail.usuario as Record<string, unknown>)?.email,
                          )}
                        </dd>
                      </div>
                      {Object.entries(detail)
                        .filter(([key]) => labels[key] && key !== 'usuario')
                        .map(([key, value]) => (
                          <div key={key}>
                            <dt>{labels[key]}</dt>
                            <dd>
                              {key === 'logoUrl' && safeUrl(value) ? (
                                <a
                                  href={safeUrl(value)!}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  <img
                                    src={safeUrl(value)!}
                                    alt="Logo da startup"
                                  />
                                </a>
                              ) : [
                                  'apresentacaoUrl',
                                  'siteUrl',
                                  'linkedinUrl',
                                  'videoApresentacaoUrl',
                                ].includes(key) && safeUrl(value) ? (
                                <a
                                  href={safeUrl(value)!}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {key === 'apresentacaoUrl'
                                    ? 'Abrir apresentação'
                                    : String(value)}
                                </a>
                              ) : (
                                valueText(value)
                              )}
                            </dd>
                          </div>
                        ))}
                    </dl>
                    <h3>Histórico de decisões e edições</h3>
                    {Array.isArray(detail.historico) &&
                    detail.historico.length ? (
                      detail.historico.map((entry: Record<string, unknown>) => (
                        <div key={String(entry.id)}>
                          <strong>
                            {actions[String(entry.acao)] || String(entry.acao)}
                          </strong>{' '}
                          · {String(entry.ator || 'Administrador indisponível')}{' '}
                          · {date(String(entry.criadoEm))}
                          <pre>{valueText(entry.detalhes)}</pre>
                        </div>
                      ))
                    ) : (
                      <p>Nenhuma alteração administrativa registrada.</p>
                    )}
                  </>
                ) : null}
                {(modal.kind === 'detail' || modal.kind === 'edit') &&
                  !users &&
                  !detail &&
                  !detailError && <p role="status">Carregando cadastro…</p>}
                {detailError && (
                  <div role="alert" className="error">
                    {detailError}{' '}
                    <Button
                      $variant="quiet"
                      onClick={() => {
                        setDetailError('');
                        setDetailRevision((n) => n + 1);
                      }}
                    >
                      Tentar novamente
                    </Button>
                  </div>
                )}
                {modalError && (
                  <p role="alert" className="error">
                    {modalError}
                  </p>
                )}
                {modal.kind !== 'detail' && (
                  <div className="buttons">
                    <Button
                      disabled={
                        busy || (modal.kind === 'edit' && !users && !detail)
                      }
                      onClick={() => void mutate()}
                    >
                      {busy
                        ? 'Salvando…'
                        : modal.kind === 'approve'
                          ? 'Confirmar aprovação'
                          : modal.kind === 'reject'
                            ? 'Confirmar rejeição'
                            : 'Salvar alterações'}
                    </Button>
                  </div>
                )}
              </>
            )
          )}
        </Detail>
      </ContentDialog>
    </Area>
  );
}
