import { Link } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowUpRightIcon,
  BookmarkSimpleIcon,
  MapPinIcon,
  SparkleIcon,
  FireIcon,
  TrendUpIcon,
  CircleIcon,
  LeafIcon,
} from '@phosphor-icons/react';
import type { Startup } from '../model';
import * as S from '../Explore.styles';
import { useExposure } from '../useExposure';
import { recommendationNotices } from '../recommendationPresentation';

export function CompatibilityIndicator({ startup }: { startup: Startup }) {
  const supervised = startup.origemRecomendacao === 'supervised';
  const value = supervised
    ? startup.probabilidadeInteresse
    : startup.compatibility;
  if (value === undefined) return null;
  const percent = supervised ? value * 100 : value;
  const tier = percent >= 90 ? 4 : percent >= 70 ? 3 : percent >= 40 ? 2 : 1;
  const Icon =
    tier === 4
      ? FireIcon
      : tier === 3
        ? SparkleIcon
        : tier === 2
          ? TrendUpIcon
          : CircleIcon;
  const label =
    tier === 4
      ? 'Muito alta'
      : tier === 3
        ? 'Alta'
        : tier === 2
          ? 'Moderada'
          : 'Baixa';
  return (
    <S.Recommendation $tier={tier}>
      <div className="score-heading">
        <Icon
          size={tier === 4 ? 30 : 22}
          weight={tier >= 3 ? 'fill' : 'regular'}
          aria-hidden="true"
        />
        <div>
          <strong>
            {percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
          </strong>
          <span>
            {supervised
              ? 'Probabilidade estimada de interesse'
              : 'Compatibilidade com seu perfil'}
          </span>
        </div>
        <b>{label}</b>
      </div>
      <div
        role="meter"
        aria-label={
          supervised
            ? 'Probabilidade estimada de interesse'
            : 'Compatibilidade por regras'
        }
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="score-track"
      >
        <div style={{ width: `${percent}%` }} />
      </div>
      <small>
        {supervised
          ? 'Modelo experimental · Interações sintéticas'
          : 'Comparação com os interesses do seu perfil'}
      </small>
      {recommendationNotices(startup.avisos).map((notice) => (
        <small key={notice}>{notice}</small>
      ))}
      {startup.versaoModelo && (
        <details>
          <summary>Sobre o modelo</summary>
          <small>{startup.versaoModelo}</small>
        </details>
      )}
    </S.Recommendation>
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
          loading="lazy"
          decoding="async"
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
  const exposureRef = useExposure(startup.contextoExposicao);
  return (
    <S.Card ref={exposureRef} $list={list}>
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
        <CompatibilityIndicator startup={startup} />
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
