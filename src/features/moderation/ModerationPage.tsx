import { useEffect, useState } from 'react';
import { ThemeProvider } from 'styled-components';
import styled from 'styled-components';
import { getSession } from '@/features/auth/services/session';
import { ProfileSidebar } from '@/shared/components/profile/ProfileSidebar';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import { Layout } from '@/shared/components/profile/Profile.styles';
import { theme, investorTheme } from '@/shared/styles/theme';
import { Button } from '@/shared/components/ui/Button';
import { date, get, label, type Page, type Report, type Sanction } from './api';
export const Main = styled.main`
  padding: 2rem;
  width: 100%;
  max-width: 1000px;
  display: grid;
  align-content: start;
  gap: 1rem;
  section,
  article {
    background: white;
    border: 1px solid #ddd;
    border-radius: 0.8rem;
    padding: 1rem;
  }
  article + article {
    margin-top: 0.7rem;
  }
  p {
    overflow-wrap: anywhere;
  }
  label {
    display: grid;
    gap: 0.3rem;
  }
  input,
  select,
  textarea {
    font: inherit;
    padding: 0.5rem;
    max-width: 100%;
  }
  button {
    margin: 0.3rem;
  }
  pre {
    white-space: pre-wrap;
    overflow-wrap: anywhere;
  }
  @media (max-width: 600px) {
    padding: 1rem;
  }
`;
export function ModerationPage() {
  const startup = getSession()?.usuario.tipoPerfil === 'startup';
  const [reports, setReports] = useState<Page<Report>>();
  const [sanctions, setSanctions] = useState<Page<Sanction>>();
  const [rp, setRp] = useState(1);
  const [sp, setSp] = useState(1);
  const [error, setError] = useState('');
  useEffect(() => {
    get<Page<Report>>(`minhas-denuncias?page=${rp}`)
      .then(setReports)
      .catch((e) => setError(e.message));
  }, [rp]);
  useEffect(() => {
    get<Page<Sanction>>(`minhas-sancoes?historico=true&page=${sp}`)
      .then(setSanctions)
      .catch((e) => setError(e.message));
  }, [sp]);
  return (
    <ThemeProvider theme={startup ? theme : investorTheme}>
      <Layout $audience={startup ? 'startup' : 'investor'}>
        <ProfileSidebar />
        <Main>
          <PageHeader
            title="Denúncias e sanções"
            subtitle="Acompanhe suas denúncias e consulte seu histórico de sanções."
          />
          {error && <p role="alert">{error}</p>}
          <section>
            <h2>Minhas denúncias</h2>
            {!reports ? (
              <p>Carregando…</p>
            ) : (
              <>
                {!reports.items.length && <p>Nenhuma denúncia enviada.</p>}
                {reports.items.map((r) => (
                  <article key={r.id}>
                    <strong>
                      {label(r.tipoAlvo)} {r.campoAlvo && `· ${r.campoAlvo}`}
                    </strong>
                    <p>Identificador do conteúdo: {r.alvoId}</p>
                    <p>Motivo: {r.motivo}</p>
                    {r.conteudoDenunciado && (
                      <pre>{JSON.stringify(r.conteudoDenunciado, null, 2)}</pre>
                    )}
                    <p>
                      Enviada em {date(r.criadaEm)} · {label(r.status)}
                    </p>
                  </article>
                ))}
                <Button
                  $variant="secondary"
                  disabled={rp === 1}
                  onClick={() => setRp(rp - 1)}
                >
                  Anterior
                </Button>
                <span>Página {rp}</span>
                <Button
                  $variant="secondary"
                  disabled={!reports.hasMore}
                  onClick={() => setRp(rp + 1)}
                >
                  Próxima
                </Button>
              </>
            )}
          </section>
          <section>
            <h2>Histórico de advertências e sanções</h2>
            {!sanctions ? (
              <p>Carregando…</p>
            ) : (
              <>
                {!sanctions.items.length && <p>Nenhuma sanção registrada.</p>}
                {sanctions.items.map((s) => (
                  <article key={s.id}>
                    <strong>{label(s.tipo)}</strong>
                    {s.motivo && <p>Motivo: {s.motivo}</p>}
                    {s.revogadaEm && <p>Revogada: {date(s.revogadaEm)}</p>}
                    <p>
                      Início: {date(s.inicioEm)}
                      {s.fimEm && ` · Término: ${date(s.fimEm)}`}
                    </p>
                  </article>
                ))}
                <Button
                  $variant="secondary"
                  disabled={sp === 1}
                  onClick={() => setSp(sp - 1)}
                >
                  Anterior
                </Button>
                <span>Página {sp}</span>
                <Button
                  $variant="secondary"
                  disabled={!sanctions.hasMore}
                  onClick={() => setSp(sp + 1)}
                >
                  Próxima
                </Button>
              </>
            )}
          </section>
        </Main>
      </Layout>
    </ThemeProvider>
  );
}
