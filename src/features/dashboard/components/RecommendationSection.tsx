import { Link } from 'react-router-dom';
import { CompassIcon, LockSimpleIcon } from '@phosphor-icons/react';
import { Card, Muted } from '@/shared/components/profile/Profile.styles';
import { Button } from '@/shared/components/ui/Button';
import { Empty } from '../pages/Dashboard.styles';
import { moderation, type Dashboard } from '../model/dashboard';

// A future adapter must provide public data and server-computed matching factors.
export interface Recommendation {
  id: string;
  name: string;
  summary: string;
  compatibility: 'high' | 'good';
  factors: {
    key: 'segment' | 'stage' | 'region' | 'ticket' | 'businessModel';
    explanation: string;
  }[];
}

export function CompatibilityFactors({
  factors,
}: {
  factors: Recommendation['factors'];
}) {
  return (
    <details>
      <summary>Por que recomendamos esta conexão?</summary>
      <ul>
        {factors.map((factor) => (
          <li key={factor.key}>{factor.explanation}</li>
        ))}
      </ul>
      <Muted>
        A compatibilidade não representa garantia de qualidade, investimento ou
        retorno.
      </Muted>
    </details>
  );
}

export function RecommendationSection({
  data,
  recommendations = null,
}: {
  data: Dashboard;
  recommendations?: Recommendation[] | null;
}) {
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
          ? 'Um espaço para descobrir startups alinhadas aos seus interesses.'
          : 'Encontre investidores e mentores que compartilham dos seus objetivos.'}
      </Muted>
      {!approved ? (
        <Empty>
          <LockSimpleIcon size={32} aria-hidden="true" />
          <h3>
            {data.profile.statusModeracao === 'pendente'
              ? investor
                ? 'Suas recomendações aparecerão aqui'
                : 'Matchmaking aguardando aprovação'
              : 'Conexões indisponíveis no momento'}
          </h3>
          <p>
            Depois que seu perfil for aprovado, o Juntaí! poderá usar seus
            interesses, estágio, região e modelo de negócio para encontrar
            conexões compatíveis.
          </p>
          <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
            Consultar meu perfil
          </Button>
        </Empty>
      ) : recommendations === null ? (
        <Empty>
          <CompassIcon size={32} aria-hidden="true" />
          <h3>Estamos preparando suas recomendações</h3>
          <p>
            Seu perfil está aprovado. O serviço de recomendações ainda não está
            disponível. Suas conexões aparecerão aqui quando ele for liberado.
          </p>
          <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
            Revisar preferências
          </Button>
        </Empty>
      ) : recommendations.length === 0 ? (
        <Empty>
          <CompassIcon size={32} aria-hidden="true" />
          <h3>Ainda estamos procurando conexões para você</h3>
          <p>
            Revise seus interesses, estágios, regiões e faixa de investimento
            para representar suas preferências atuais.
          </p>
          <Button as={Link} to={`/${data.role}/perfil`} $variant="secondary">
            Atualizar preferências
          </Button>
        </Empty>
      ) : (
        recommendations.map((item) => (
          <article key={item.id}>
            <h3>{item.name}</h3>
            <p>{item.summary}</p>
            <strong>
              {item.compatibility === 'high'
                ? 'Alta compatibilidade'
                : 'Boa compatibilidade'}
            </strong>
            <CompatibilityFactors factors={item.factors} />
          </article>
        ))
      )}
    </Card>
  );
}
