import { useEffect, useState } from 'react';
import { Button } from '@/shared/components/ui/Button';
import { Main } from './ModerationPage';
import { date, get, label, post, type Page, type Report } from './api';
export function AdminModerationPage() {
  const [list, setList] = useState<Page<Report>>();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [selected, setSelected] = useState<Report>();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [version, setVersion] = useState(0);
  const [just, setJust] = useState('');
  const [procedente, setProcedente] = useState('true');
  const [tipo, setTipo] = useState('');
  const [fim, setFim] = useState('');
  const [sancaoJust, setSancaoJust] = useState('');
  const [revoke, setRevoke] = useState('');
  useEffect(() => {
    get<Page<Report>>(
      `admin/denuncias?page=${page}${status ? `&status=${status}` : ''}`,
    )
      .then(setList)
      .catch((e) => setError(e.message));
  }, [page, status, version]);
  async function detail(id: string) {
    setError('');
    try {
      setSelected(await get<Report>(`admin/denuncias/${id}`));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha ao carregar detalhes.');
    }
  }
  async function action(path: string, body: object = {}) {
    setBusy(true);
    setError('');
    try {
      await post(path, body);
      setVersion((v) => v + 1);
      if (selected) await detail(selected.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Falha na operação.');
    } finally {
      setBusy(false);
    }
  }
  function decision() {
    if (!selected) return;
    const sancao = tipo
      ? {
          tipo,
          justificativa: sancaoJust,
          ...(fim && (tipo === 'suspensao' || tipo === 'restricao_chat')
            ? { fimEm: new Date(fim).toISOString() }
            : {}),
        }
      : undefined;
    void action(`admin/denuncias/${selected.id}/decisao`, {
      procedente: procedente === 'true',
      justificativa: just,
      ...(sancao ? { sancao } : {}),
    });
  }
  return (
    <Main>
      <h1>Moderação de denúncias</h1>
      {error && <p role="alert">{error}</p>}
      <section>
        <h2>Fila de denúncias</h2>
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
            {['pendente', 'em_analise', 'resolvida', 'rejeitada'].map((s) => (
              <option key={s} value={s}>
                {label(s)}
              </option>
            ))}
          </select>
        </label>
        {!list ? (
          <p>Carregando…</p>
        ) : (
          <>
            {!list.items.length && <p>Nenhuma denúncia encontrada.</p>}
            {list.items.map((r) => (
              <article key={r.id}>
                <strong>
                  {label(r.tipoAlvo)} · {label(r.status)}
                </strong>
                <p>
                  {r.motivo} · {date(r.criadaEm)}
                </p>
                <Button $variant="secondary" onClick={() => void detail(r.id)}>
                  Ver detalhes
                </Button>
              </article>
            ))}
            <Button
              $variant="secondary"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              Anterior
            </Button>{' '}
            Página {page}{' '}
            <Button
              $variant="secondary"
              disabled={!list.hasMore}
              onClick={() => setPage(page + 1)}
            >
              Próxima
            </Button>
          </>
        )}
      </section>
      {selected && (
        <section>
          <h2>Detalhes da denúncia</h2>
          <p>
            {label(selected.tipoAlvo)} · {selected.alvoId}{' '}
            {selected.campoAlvo && `· ${selected.campoAlvo}`}
          </p>
          <p>
            Status: {label(selected.status)} · {date(selected.criadaEm)}
          </p>
          <p>Motivo: {selected.motivo}</p>
          {selected.descricao && <p>Descrição: {selected.descricao}</p>}
          {selected.justificativaDecisao && (
            <p>Justificativa da decisão: {selected.justificativaDecisao}</p>
          )}
          {selected.evidencia && (
            <>
              <h3>Evidência</h3>
              <pre>{JSON.stringify(selected.evidencia.snapshot, null, 2)}</pre>
              {selected.evidencia.arquivo?.url && (
                <a
                  href={selected.evidencia.arquivo.url}
                  target="_blank"
                  rel="noreferrer"
                >
                  Abrir arquivo da evidência
                </a>
              )}
            </>
          )}
          {selected.status === 'pendente' && (
            <Button
              disabled={busy}
              onClick={() =>
                void action(`admin/denuncias/${selected.id}/assumir`)
              }
            >
              Assumir análise
            </Button>
          )}
          {selected.status === 'em_analise' && (
            <>
              <h3>Registrar decisão</h3>
              <label>
                Decisão
                <select
                  value={procedente}
                  onChange={(e) => {
                    setProcedente(e.target.value);
                    setTipo('');
                  }}
                >
                  <option value="true">Procedente</option>
                  <option value="false">Improcedente</option>
                </select>
              </label>
              <label>
                Justificativa
                <textarea
                  maxLength={2000}
                  value={just}
                  onChange={(e) => setJust(e.target.value)}
                />
              </label>
              {procedente === 'true' && (
                <>
                  <label>
                    Sanção opcional
                    <select
                      value={tipo}
                      onChange={(e) => setTipo(e.target.value)}
                    >
                      <option value="">Nenhuma</option>
                      {[
                        'advertencia',
                        'restricao_chat',
                        'suspensao',
                        'banimento',
                      ].map((t) => (
                        <option key={t} value={t}>
                          {label(t)}
                        </option>
                      ))}
                    </select>
                  </label>
                  {tipo && (
                    <label>
                      Justificativa da sanção
                      <textarea
                        maxLength={2000}
                        value={sancaoJust}
                        onChange={(e) => setSancaoJust(e.target.value)}
                      />
                    </label>
                  )}
                  {(tipo === 'suspensao' || tipo === 'restricao_chat') && (
                    <label>
                      Término
                      <input
                        type="datetime-local"
                        value={fim}
                        onChange={(e) => setFim(e.target.value)}
                      />
                    </label>
                  )}
                </>
              )}
              <Button
                disabled={
                  busy ||
                  !just.trim() ||
                  (!!tipo &&
                    (!sancaoJust.trim() ||
                      ((tipo === 'suspensao' || tipo === 'restricao_chat') &&
                        !fim)))
                }
                onClick={decision}
              >
                Registrar decisão
              </Button>
            </>
          )}
          <h3>Sanções</h3>
          {!selected.sancoes?.length && <p>Nenhuma sanção vinculada.</p>}
          {selected.sancoes?.map((s) => (
            <article key={s.id}>
              <strong>{label(s.tipo)}</strong>
              <p>
                {s.motivo} · {date(s.inicioEm)}{' '}
                {s.revogadaEm && `· Revogada em ${date(s.revogadaEm)}`}
              </p>
              {!s.revogadaEm && (
                <>
                  <label>
                    Justificativa da revogação
                    <input
                      maxLength={2000}
                      value={revoke}
                      onChange={(e) => setRevoke(e.target.value)}
                    />
                  </label>
                  <Button
                    disabled={busy || !revoke.trim()}
                    onClick={() =>
                      void action(`admin/sancoes/${s.id}/revogacao`, {
                        justificativa: revoke,
                      })
                    }
                  >
                    Revogar sanção
                  </Button>
                </>
              )}
            </article>
          ))}
          <h3>Histórico</h3>
          {!selected.historico?.length && <p>Sem registros.</p>}
          {selected.historico?.map((h) => (
            <article key={h.id}>
              <strong>{h.acao}</strong>
              <p>
                {date(h.criadoEm)} · {h.adminNome || 'Administrador'}
              </p>
              <pre>{JSON.stringify(h.detalhes, null, 2)}</pre>
            </article>
          ))}
        </section>
      )}
    </Main>
  );
}
