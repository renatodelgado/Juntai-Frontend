import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  CompassIcon,
  LockSimpleIcon,
  ArrowRightIcon,
} from '@phosphor-icons/react';
import { Card, Muted } from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';
import { startupRepository } from '@/features/explore-startups/api';
import type { Startup } from '@/features/explore-startups/model';
import {
  CompatibilityIndicator,
  StartupIdentity,
} from '@/features/explore-startups/components/StartupCard';
import { useExposure } from '@/features/explore-startups/useExposure';
import { Empty } from '../pages/Dashboard.styles';
import { moderation, type Dashboard } from '../model/dashboard';

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
  gap: 1rem;
  margin: 1.25rem 0;
`;
const Highlight = styled.article`
  min-width: 0;
  padding: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.accentBorder};
  border-radius: ${({ theme }) => theme.radii.card};
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  > header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  h3 {
    margin: 0.2rem 0;
    overflow-wrap: anywhere;
  }
  p {
    margin: 0;
    line-height: 1.6;
  }
  > p {
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  > a {
    margin-top: auto;
  }
`;
function HighlightCard({ startup }: { startup: Startup }) {
  const exposure = useExposure(startup.contextoExposicao);
  return (
    <Highlight ref={exposure}>
      <header>
        <StartupIdentity startup={startup} />
        <div>
          <Muted>{startup.segment}</Muted>
          <h3>{startup.name}</h3>
        </div>
      </header>
      <p>{startup.tagline || startup.description}</p>
      <CompatibilityIndicator startup={startup} />
      <Button as={Link} to={`/startups/${startup.id}`} $variant="secondary">
        Conhecer startup <ArrowRightIcon size={18} aria-hidden="true" />
      </Button>
    </Highlight>
  );
}
function InvestorRecommendations({
  profile,
}: {
  profile: Dashboard['profile'];
}) {
  const [attempt, setAttempt] = useState(0);
  const key = `${profile.id}:${profile.atualizadoEm}:${attempt}`;
  const [result, setResult] = useState<{
    key: string;
    items: Startup[];
    failed: boolean;
  } | null>(null);
  useEffect(() => {
    const controller = new AbortController();
    void startupRepository
      .highlights(controller.signal)
      .then((items) => {
        if (!controller.signal.aborted)
          setResult({ key, items, failed: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ key, items: [], failed: true });
      });
    return () => controller.abort();
  }, [key]);
  const current = result?.key === key ? result : null;
  return (
    <>
      {!current ? (
        <p role="status">
          Buscando as startups mais compatíveis com seu perfil…
        </p>
      ) : current.failed ? (
        <div role="alert">
          <p>Não conseguimos carregar suas recomendações agora.</p>
          <Button
            $variant="secondary"
            onClick={() => setAttempt((value) => value + 1)}
          >
            Tentar novamente
          </Button>
        </div>
      ) : current.items.length ? (
        <Grid>
          {current.items.map((startup) => (
            <HighlightCard key={startup.id} startup={startup} />
          ))}
        </Grid>
      ) : (
        <p>
          Ainda não encontramos startups compatíveis. Revise suas preferências
          ou explore o catálogo.
        </p>
      )}
      <Button as={Link} to="/investidor/startups" $variant="secondary">
        Descubra mais <ArrowRightIcon size={18} aria-hidden="true" />
      </Button>
    </>
  );
}
export function RecommendationSection({ data }: { data: Dashboard }) {
  const approved = moderation(data.profile.statusModeracao).approved;
  const investor = data.role === 'investidor';
  return (
    <Card aria-labelledby="recommendations-title">
      <header>
        <h2 id="recommendations-title">
          {investor ? 'Startups recomendadas para você' : 'Suas conexões'}
        </h2>
      </header>
      <Muted>
        {investor
          ? 'Conheça startups com as maiores pontuações para o seu perfil. Em caso de empate, variamos as sugestões.'
          : 'Encontre investidores e mentores que compartilham dos seus objetivos.'}
      </Muted>
      {!approved ? (
        <Empty>
          <LockSimpleIcon size={32} aria-hidden="true" />
          <h3>
            {data.profile.statusModeracao === 'pendente'
              ? 'Suas recomendações aparecerão aqui'
              : 'Conexões indisponíveis no momento'}
          </h3>
          <p>
            Depois que seu perfil for aprovado, você poderá acessar suas
            recomendações.
          </p>
          <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
            Consultar meu perfil
          </Button>
        </Empty>
      ) : investor ? (
        <InvestorRecommendations profile={data.profile} />
      ) : (
        <Empty>
          <CompassIcon size={32} aria-hidden="true" />
          <h3>Apresente sua startup a novas conexões</h3>
          <p>
            Seu perfil está aprovado e pode aparecer nas recomendações para
            investidores e mentores. Mantenha suas informações atualizadas.
          </p>
          <Button as={Link} to="/startup/perfil" $variant="secondary">
            Revisar objetivos
          </Button>
        </Empty>
      )}
    </Card>
  );
}
