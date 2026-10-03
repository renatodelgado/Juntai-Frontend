import { Link } from 'react-router-dom';
import {
  BookmarkSimpleIcon,
  CheckCircleIcon,
  SparkleIcon,
  ArrowUpRightIcon,
  MapPinIcon,
  ChatCircleIcon,
  CalendarIcon,
  LeafIcon,
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import {
  StartupIdentity,
  CompatibilityIndicator,
} from '@/features/explore-startups/components/StartupCard';
import { SaveButton } from '@/features/explore-startups/Explore.styles';
import type { Discovery } from '@/features/explore-startups/useDiscovery';
import type { Startup } from '@/features/explore-startups/model';
import { matchStatus, statusLabels, type Match } from '../model';
import * as S from '../Matches.styles';

export function MatchReasons({
  startup,
  limit,
}: {
  startup: Startup;
  limit?: number;
}) {
  const factors = startup.compatibilityFactors?.slice(0, limit);
  return factors?.length ? (
    <ul className="factors">
      {factors.map((factor) => (
        <li key={factor}>
          <CheckCircleIcon size={14} aria-hidden="true" />
          {factor}
        </li>
      ))}
    </ul>
  ) : (
    <p style={{ fontSize: 12 }}>
      Ainda não há informações suficientes para explicar a compatibilidade.
    </p>
  );
}
type Props = {
  match: Match;
  data: Discovery;
  search: string;
  onInterest: () => void;
  onMeeting: () => void;
};
export function HighlightedMatch({
  match,
  data,
  search,
  onInterest,
}: Omit<Props, 'onMeeting'>) {
  const startup = match.startup;
  const sent = data.state.interests.some(
    (item) => item.startupId === startup.id,
  );
  return (
    <S.Highlight aria-label="Match em destaque">
      <div>
        <div className="eyebrow">
          <SparkleIcon size={15} />
          Uma conexão para conhecer
        </div>
        <div className="identity">
          <StartupIdentity startup={startup} />
          <div>
            <h2>{startup.name}</h2>
            <div className="meta">
              {startup.segment} · {startup.stage}
              <br />
              {startup.location.city}/{startup.location.state}
            </div>
          </div>
        </div>
        <p className="tagline">{startup.tagline}</p>
        <S.Status $status={matchStatus(match, data.state)}>
          {statusLabels[matchStatus(match, data.state)]}
        </S.Status>
      </div>
      <div className="reasons">
        <CompatibilityIndicator value={startup.compatibility} />
        <h3>Interesses que se encontram</h3>
        <MatchReasons startup={startup} limit={3} />
        <div className="actions">
          <Button
            as={Link}
            to={`/startups/${startup.id}`}
            state={{ returnTo: '/investidor/matches', returnSearch: search }}
            onClick={() => data.viewed(startup.id)}
          >
            Conhecer startup
            <ArrowUpRightIcon size={16} />
          </Button>
          <Button $variant="secondary" disabled={sent} onClick={onInterest}>
            {sent ? 'Interesse enviado' : 'Tenho interesse'}
          </Button>
        </div>
      </div>
    </S.Highlight>
  );
}
export function MatchCard({
  match,
  data,
  search,
  onInterest,
  onMeeting,
}: Props) {
  const startup = match.startup;
  const status = matchStatus(match, data.state);
  const sent = data.state.interests.some(
    (item) => item.startupId === startup.id,
  );
  const saved = data.state.saved.includes(startup.id);
  return (
    <S.MatchCard $list={false} aria-label={`Match: ${startup.name}`}>
      {startup.variant === 'visual' && (
        <div className="initials-banner">
          <span>{startup.tagline}</span>
          <LeafIcon size={28} aria-hidden="true" />
        </div>
      )}
      <div className="body">
        <div className="card-top">
          <StartupIdentity startup={startup} />
          <div>
            <span className="segment">{startup.segment}</span>
            <h3>{startup.name}</h3>
            <p className="location">
              <MapPinIcon size={13} aria-hidden="true" />
              {startup.location.city}/{startup.location.state}
            </p>
          </div>
          <SaveButton
            aria-label={`${saved ? 'Remover' : 'Salvar'} ${startup.name}`}
            aria-pressed={saved}
            onClick={() => data.save(startup.id)}
          >
            <BookmarkSimpleIcon size={20} weight={saved ? 'fill' : 'regular'} />
          </SaveButton>
        </div>
        <p className="description">{startup.description}</p>
        <div className="tags">
          <span>{startup.stage}</span>
          {startup.businessModel.map((model) => (
            <span key={model}>{model}</span>
          ))}
        </div>
        <div className="match-meta">
          <CompatibilityIndicator value={startup.compatibility} />
          <S.Status $status={status}>{statusLabels[status]}</S.Status>
        </div>
        {startup.seekingInvestment && (
          <div className="investment">
            <LeafIcon size={14} aria-hidden="true" />
            Em busca de investimento
          </div>
        )}
        <details>
          <summary>Por que este match?</summary>
          <MatchReasons startup={startup} />
        </details>
        <div className="card-footer">
          <Link
            to={`/startups/${startup.id}`}
            state={{ returnTo: '/investidor/matches', returnSearch: search }}
            onClick={() => data.viewed(startup.id)}
          >
            Conhecer startup
            <ArrowUpRightIcon size={17} />
          </Link>
          <button className="interest" disabled={sent} onClick={onInterest}>
            {sent ? '✓ Interesse enviado' : 'Tenho interesse'}
          </button>
        </div>
        {match.canMessage && (
          <div className="connection-actions">
            <Button
              as={Link}
              to={`/investidor/mensagens?startup=${startup.id}`}
              $variant="secondary"
            >
              <ChatCircleIcon size={16} />
              Enviar mensagem
            </Button>
            <Button $variant="quiet" onClick={onMeeting}>
              <CalendarIcon size={16} />
              Agendar reunião
            </Button>
          </div>
        )}
        <button className="discard" onClick={() => data.discard(startup.id)}>
          {status === 'discarded'
            ? 'Restaurar recomendação'
            : 'Descartar recomendação'}
        </button>
      </div>
    </S.MatchCard>
  );
}
