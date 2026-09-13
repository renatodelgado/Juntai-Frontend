import { FieldSync } from '@/shared/components/forms/RegistrationSync';
import type { ReactNode } from 'react';
import { Button } from '@/shared/components/ui/Button';
import {
  SubCard,
  Fields,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import * as model from '../model/investor';

export function InvestorSummary({
  data,
  onEdit,
  onlyPreferences = false,
}: {
  data: model.InvestorDraft;
  onEdit?: (step: model.InvestorStep) => void;
  onlyPreferences?: boolean;
}) {
  const labels = (options: readonly catalogs.Option[], values: string[]) =>
    values.map((value) => catalogs.optionLabel(options, value)).join(' · ') ||
    'Ainda não informado';
  const money = (value: number | null) =>
    value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) ??
    'Ainda não informado';
  function card(title: string, step: model.InvestorStep, content: ReactNode) {
    return (
      <SubCard>
        <header>
          <h2>{title}</h2>
          {onEdit && (
            <Button
              type="button"
              $variant="quiet"
              aria-label={`Editar ${title}`}
              onClick={() => onEdit(step)}
            >
              Editar
            </Button>
          )}
        </header>
        <div style={{ whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>
          <FieldSync
            field={
              ['history', 'availability', 'offers', 'preferences'].includes(
                step,
              )
                ? step
                : ''
            }
          >
            {content}
          </FieldSync>
        </div>
      </SubCard>
    );
  }
  return (
    <Fields>
      {!onlyPreferences && (
        <>
          {card(
            'Sobre você',
            'about',
            <>
              {data.photo && (
                <FieldSync field="photo">
                  <img
                    src={data.photo}
                    alt={`Foto de ${data.name}`}
                    width={80}
                    height={80}
                    style={{ objectFit: 'cover', borderRadius: 12 }}
                  />
                </FieldSync>
              )}
              <strong>{data.name}</strong>
              <FieldSync field="title">
                <p>{data.title}</p>
              </FieldSync>
              <FieldSync field="cityId">
                <p>
                  {data.cityName} / {data.state}
                </p>
              </FieldSync>
              <p>{data.bio}</p>
              <FieldSync field="linkedin">
                <p>{data.linkedin}</p>
              </FieldSync>
            </>,
          )}
          {card(
            'Atuação',
            'participation',
            catalogs.optionLabel(model.participation, data.participation),
          )}
        </>
      )}
      {card('Segmentos', 'interests', labels(catalogs.segments, data.segments))}
      {card('Estágios', 'stages', labels(catalogs.stages, data.stages))}
      {card(
        'Investimento',
        'investment',
        data.participation === 'mentor' ? (
          'Não se aplica ao perfil de mentor.'
        ) : (
          <>
            {money(data.ticketMin)} → {money(data.ticketMax)}
          </>
        ),
      )}
      {card(
        'Modelos e regiões',
        'market',
        <>
          <p>{labels(catalogs.businessModels, data.businessModels)}</p>
          <p>{labels(catalogs.regions, data.regions)}</p>
        </>,
      )}
      {card(
        'Experiência e perfil',
        'experience',
        <>
          {data.participation !== 'mentor' && (
            <p>{catalogs.optionLabel(model.risks, data.risk)}</p>
          )}
          <FieldSync field="expertise">
            <p>{labels(model.expertise, data.expertise)}</p>
          </FieldSync>
        </>,
      )}
      {!onlyPreferences && (
        <>
          {card(
            'Histórico',
            'history',
            <p>
              {catalogs.optionLabel(model.historyOptions, data.history)}
              {data.history === 'yes' && (
                <>
                  <br />
                  {data.participation !== 'mentor' &&
                    catalogs.optionLabel(model.counts, data.investmentCount)}
                  <br />
                  {data.experience}
                  <br />
                  {labels(catalogs.segments, data.previousSectors)}
                </>
              )}
            </p>,
          )}
          {card(
            'Disponibilidade',
            'availability',
            <>
              <p>{catalogs.optionLabel(model.frequencies, data.frequency)}</p>
              <p>{labels(model.interactions, data.interactions)}</p>
              <p>
                Aceita mentorias:{' '}
                {data.acceptsMentoring === null
                  ? 'Não informado'
                  : data.acceptsMentoring
                    ? 'Sim'
                    : 'Não'}
              </p>
              {data.participation !== 'mentor' && (
                <p>
                  Novos investimentos:{' '}
                  {catalogs.optionLabel(model.openness, data.openInvestment)}
                </p>
              )}
            </>,
          )}
          {card(
            'O que posso oferecer',
            'offers',
            labels(model.offers, data.offers),
          )}
          {card(
            'Preferências adicionais',
            'preferences',
            data.preferences || 'Ainda não informado',
          )}
        </>
      )}
    </Fields>
  );
}
