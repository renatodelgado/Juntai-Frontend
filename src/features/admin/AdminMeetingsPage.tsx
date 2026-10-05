import { useEffect, useState } from 'react';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { Button } from '@/shared/components/ui/Button';
import { adminGet, date, type PageData } from './api';
import { Area, Detail } from './styles';

interface Meeting {
  id: string;
  startup: string;
  investidor: string;
  dataHoraAgendada: string;
  status: string;
  linkReuniao: string | null;
  notas: string | null;
  criadoEm: string;
}
const statuses: Record<string, string> = {
  agendada: 'Agendada',
  realizada: 'Realizada',
  cancelada: 'Cancelada',
  no_show: 'Não compareceu',
};
export function AdminMeetingsPage() {
  const [data, setData] = useState<PageData<Meeting>>({
    items: [],
    total: 0,
    page: 1,
    size: 15,
  });
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revision, setRevision] = useState(0);
  const [selected, setSelected] = useState<Meeting | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError('');
      const params = new URLSearchParams({ q, status, page: String(page) });
      void adminGet<PageData<Meeting>>('reunioes?' + params, controller.signal)
        .then((result) => {
          if (!controller.signal.aborted) setData(result);
        })
        .catch((e) => {
          if (!controller.signal.aborted)
            setError(
              e instanceof Error
                ? e.message
                : 'Não foi possível carregar as reuniões.',
            );
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 200);
    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [q, status, page, revision]);
  const clear = () => {
    setQ('');
    setStatus('');
    setPage(1);
  };
  return (
    <Area>
      <PageHeader
        title="Reuniões"
        subtitle="Consulte os agendamentos e participantes registrados na plataforma."
        breadcrumbs={[
          { label: 'Juntaí!', to: '/admin' },
          { label: 'Administração', to: '/admin' },
          { label: 'Reuniões' },
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
      <section className="panel">
        <h2>Lista de reuniões</h2>
        <div className="filters">
          <label>
            Buscar participante
            <input
              type="search"
              value={q}
              onChange={(e) => {
                setQ(e.target.value);
                setPage(1);
              }}
              placeholder="Startup ou investidor"
            />
          </label>
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
              {Object.entries(statuses).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <Button $variant="quiet" onClick={clear}>
            Limpar filtros
          </Button>
        </div>
        {error ? (
          <div className="error" role="alert">
            {error}{' '}
            <Button $variant="quiet" onClick={() => setRevision((n) => n + 1)}>
              Tentar novamente
            </Button>
          </div>
        ) : loading ? (
          <p role="status">Carregando reuniões…</p>
        ) : data.items.length ? (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Startup</th>
                  <th>Investidor</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((item) => (
                  <tr key={item.id}>
                    <td>{date(item.dataHoraAgendada)}</td>
                    <td>{item.startup}</td>
                    <td>{item.investidor}</td>
                    <td>
                      <span className="badge">
                        {statuses[item.status] || item.status}
                      </span>
                    </td>
                    <td>
                      <Button
                        $variant="quiet"
                        onClick={() => setSelected(item)}
                      >
                        Visualizar
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="empty">
            Nenhuma reunião encontrada para estes filtros.
          </p>
        )}
        {!error && !loading && (
          <div className="pagination">
            <span>
              {data.total} registros · Página {page} de{' '}
              {Math.max(1, Math.ceil(data.total / 15))}
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
              disabled={page * 15 >= data.total}
              onClick={() => setPage((p) => p + 1)}
            >
              Próxima
            </Button>
          </div>
        )}
      </section>
      <ContentDialog
        open={!!selected}
        title="Detalhes da reunião"
        onClose={() => setSelected(null)}
      >
        {selected && (
          <Detail>
            <dl>
              {Object.entries({
                Identificador: selected.id,
                Startup: selected.startup,
                Investidor: selected.investidor,
                Data: date(selected.dataHoraAgendada),
                Status: statuses[selected.status] || selected.status,
                'Criada em': date(selected.criadoEm),
                Notas: selected.notas || 'Não informado',
              }).map(([label, value]) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            {selected.linkReuniao &&
              /^https?:\/\//i.test(selected.linkReuniao) && (
                <a href={selected.linkReuniao} target="_blank" rel="noreferrer">
                  Abrir link da reunião
                </a>
              )}
          </Detail>
        )}
      </ContentDialog>
    </Area>
  );
}
