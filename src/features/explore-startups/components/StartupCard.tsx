import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowUpRightIcon,
  BookmarkSimpleIcon,
  MapPinIcon,
  SparkleIcon,
  LeafIcon,
} from '@phosphor-icons/react';
import type { Startup } from '../model';
import * as S from '../Explore.styles';

export function CompatibilityIndicator({ value }: { value?: number }) {
  return (
    <S.Compatibility title="Compatibilidade ilustrativa, gerada aleatoriamente">
      <SparkleIcon size={13} aria-hidden="true" />
      {value === undefined
        ? 'Compatibilidade indisponível'
        : `${value}% compatível`}
    </S.Compatibility>
  );
}
export function StartupIdentity({ startup }: { startup: Startup }) {
  const [failedUrl, setFailedUrl] = useState<string>();
  const initials = startup.name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
  return (
    <S.Logo $color={startup.color} aria-hidden="true">
      {startup.logoUrl && failedUrl !== startup.logoUrl ? (
        <img
          src={startup.logoUrl}
          alt=""
          onError={() => setFailedUrl(startup.logoUrl)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            borderRadius: 13,
          }}
        />
      ) : (
        initials
      )}
    </S.Logo>
  );
}
export function StartupCard({
  startup,
  saved,
  sent,
  list,
  returnSearch,
  onSave,
  onInterest,
  approved = true,
}: {
  startup: Startup;
  saved: boolean;
  sent: boolean;
  list: boolean;
  returnSearch: string;
  onSave: () => void;
  onInterest: () => void;
  approved?: boolean;
}) {
  return (
    <S.Card $list={list}>
      {startup.variant === 'visual' && !list && (
        <S.Visual className="visual" $color={startup.color} aria-hidden="true">
          <span className="field" />
          <span className="field" />
          <span className="field" />
          <span className="caption">Cultivando novas conexões</span>
          <span className="seed" />
          <span className="seed" />
        </S.Visual>
      )}
      <div className="body">
        <div className="card-top">
          <StartupIdentity startup={startup} />
          <div>
            <span className="segment">{startup.segment}</span>
            <h3>{startup.name}</h3>
            <p className="location">
              <MapPinIcon size={13} aria-hidden="true" />
              {startup.location.city}, {startup.location.state}
            </p>
          </div>
          <S.SaveButton
            aria-label={`${saved ? 'Remover' : 'Salvar'} ${startup.name}`}
            aria-pressed={saved}
            onClick={onSave}
          >
            <BookmarkSimpleIcon size={20} weight={saved ? 'fill' : 'regular'} />
          </S.SaveButton>
        </div>
        {startup.variant !== 'compact' && (
          <>
            <p className="tagline">{startup.tagline}</p>
            <p className="description">{startup.description}</p>
          </>
        )}
        <div className="tags">
          <span>{startup.stage}</span>
          {startup.businessModel.map((model) => (
            <span key={model}>{model}</span>
          ))}
        </div>
        <CompatibilityIndicator value={startup.compatibility} />
        {startup.seekingInvestment && (
          <div className="investment">
            <LeafIcon size={14} aria-hidden="true" /> Em busca de investimento
          </div>
        )}
        <div className="card-footer">
          <Link to={`/startups/${startup.id}`} state={{ returnSearch }}>
            Ver startup <ArrowUpRightIcon size={17} aria-hidden="true" />
          </Link>
          <button
            className="interest"
            disabled={!approved}
            onClick={onInterest}
          >
            {sent ? 'Iniciar conversa' : 'Tenho interesse'}
          </button>
        </div>
      </div>
    </S.Card>
  );
}
