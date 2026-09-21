import {
  supportedSegment,
  supportedModel,
} from '@/shared/config/registrationCatalogs';
import { useEffect, useState } from 'react';
import { LinkedinLogoIcon } from '@phosphor-icons/react';
import {
  Input,
  Textarea,
  MultiSelect,
  RadioGroup,
  MoneyInput,
  Select,
  Checkbox,
} from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import { LegalDocument } from '@/features/legal/LegalPage';
import {
  Fields,
  Columns,
} from '@/features/startup-onboarding/pages/Onboarding.styles';
import { RegionSelect } from '@/features/startup-onboarding/components/RegionSelect';
import {
  getCities,
  type City,
} from '@/features/startup-onboarding/services/locations';
import * as catalogs from '@/features/startup-onboarding/data/catalogs';
import * as model from '../model/investor';
import { InvestorSummary } from './InvestorSummary';
import { ImageUpload } from '@/shared/components/forms/ImageUpload';

export interface InvestorFieldProps {
  data: model.InvestorDraft;
  step: model.InvestorStep;
  errors: model.InvestorErrors;
  update: <K extends keyof model.InvestorDraft>(
    key: K,
    value: model.InvestorDraft[K],
  ) => void;
  edit?: (step: model.InvestorStep) => void;
}
export function InvestorFields({
  data,
  step,
  errors,
  update,
  edit,
}: InvestorFieldProps) {
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null);
  type Lists =
    | 'segments'
    | 'stages'
    | 'businessModels'
    | 'expertise'
    | 'previousSectors'
    | 'interactions'
    | 'offers';
  type Choices =
    | 'participation'
    | 'risk'
    | 'history'
    | 'investmentCount'
    | 'frequency'
    | 'openInvestment';
  const multi = (
    key: Lists,
    label: string,
    options: readonly catalogs.Option[],
    required = true,
  ) => (
    <MultiSelect
      id={key}
      label={label}
      options={options}
      required={required}
      value={data[key]}
      error={errors[key]}
      onChange={(value) => update(key, value)}
    />
  );
  const radio = (
    key: Choices,
    label: string,
    options: readonly catalogs.Option[],
    required = true,
  ) => (
    <RadioGroup
      id={key}
      label={label}
      options={options}
      required={required}
      value={data[key]}
      error={errors[key]}
      onChange={(value) => update(key, value)}
    />
  );
  const text = (
    key: 'bio' | 'experience' | 'preferences',
    label: string,
    placeholder?: string,
  ) => (
    <Textarea
      id={key}
      label={label}
      value={data[key]}
      rows={5}
      maxLength={1500}
      placeholder={placeholder}
      onChange={(event) => update(key, event.target.value)}
    />
  );
  const sections = {
    about: (
      <>
        <ImageUpload
          id="investor-photo"
          label="Foto de perfil"
          value={data.photo}
          onChange={(value) => update('photo', value)}
        />
        <Input
          id="name"
          label="Nome completo"
          required
          autoComplete="name"
          value={data.name}
          error={errors.name}
          onChange={(event) => update('name', event.target.value)}
        />
        <Input
          id="title"
          label="Título profissional"
          value={data.title}
          placeholder="Empreendedor | Investidor Anjo | Mentor de Startups"
          onChange={(event) => update('title', event.target.value)}
        />
        <InvestorLocation data={data} update={update} errors={errors} />
        <Input
          id="linkedin"
          label="LinkedIn"
          icon={<LinkedinLogoIcon size={20} />}
          type="url"
          placeholder="https://linkedin.com/in/seu-perfil"
          value={data.linkedin}
          error={errors.linkedin}
          onChange={(event) => update('linkedin', event.target.value)}
        />
        {text(
          'bio',
          'Como você se apresentaria para uma startup?',
          'Conte brevemente sobre sua trajetória, atuação profissional e experiência.',
        )}
      </>
    ),
    participation: radio(
      'participation',
      'Como você quer participar?',
      model.participation,
    ),
    interests: multi(
      'segments',
      'Segmentos de interesse',
      catalogs.segments.filter(
        (item) =>
          supportedSegment(item.value) || data.segments.includes(item.value),
      ),
    ),
    stages: multi('stages', 'Estágios de interesse', catalogs.stages),
    investment:
      data.participation === 'mentor' ? (
        <p>
          Você escolheu participar como mentor. Não é necessário informar
          valores de investimento.
        </p>
      ) : (
        <Columns>
          <MoneyInput
            id="ticketMin"
            label="Qual é o menor valor que você costuma investir?"
            required
            value={data.ticketMin}
            error={errors.ticketMin}
            onValueChange={(value) => update('ticketMin', value)}
          />
          <MoneyInput
            id="ticketMax"
            label="Qual é o maior valor que você costuma investir?"
            required
            value={data.ticketMax}
            error={errors.ticketMax}
            onValueChange={(value) => update('ticketMax', value)}
          />
        </Columns>
      ),
    market: (
      <>
        {multi(
          'businessModels',
          'Modelos de negócio',
          catalogs.businessModels.filter(
            (item) =>
              supportedModel(item.value) ||
              data.businessModels.includes(item.value),
          ),
        )}
        <RegionSelect
          apiCompatible
          id="regions"
          label="Onde você gostaria de encontrar oportunidades?"
          value={data.regions}
          error={errors.regions}
          onChange={(value) => update('regions', value)}
        />
      </>
    ),
    experience: (
      <>
        {data.participation !== 'mentor' &&
          radio(
            'risk',
            'Perfil de risco',
            model.risks.filter((item) => item.value !== 'early_stage'),
          )}
        {multi(
          'expertise',
          'Em quais áreas você poderia ajudar uma startup?',
          model.expertise,
        )}
      </>
    ),
    history: (
      <>
        {radio(
          'history',
          'Você já investiu ou atuou com startups?',
          model.historyOptions,
        )}
        {data.history === 'yes' && (
          <>
            {data.participation !== 'mentor' &&
              radio(
                'investmentCount',
                'Número aproximado de investimentos',
                model.counts,
                false,
              )}
            {text(
              'experience',
              'Experiência anterior',
              'Conte brevemente sobre sua experiência com startups, investimentos ou mentorias.',
            )}
            {multi(
              'previousSectors',
              'Setores em que já atuou',
              catalogs.segments,
              false,
            )}
          </>
        )}
      </>
    ),
    availability: (
      <>
        {radio(
          'frequency',
          'Com que frequência você gostaria de interagir com startups?',
          model.frequencies,
        )}
        {multi(
          'interactions',
          'Que tipo de interação você prefere?',
          model.interactions,
        )}
        <RadioGroup
          id="acceptsMentoring"
          label="Você aceita mentorias?"
          required
          value={
            data.acceptsMentoring === null
              ? ''
              : data.acceptsMentoring
                ? 'yes'
                : 'no'
          }
          error={errors.acceptsMentoring}
          options={[
            { value: 'yes', label: 'Sim' },
            { value: 'no', label: 'Não' },
          ]}
          onChange={(value) => update('acceptsMentoring', value === 'yes')}
        />
        {data.participation !== 'mentor' &&
          radio(
            'openInvestment',
            'Você está aberto a novos investimentos neste momento?',
            model.openness,
          )}
      </>
    ),
    offers: multi(
      'offers',
      'O que você pode oferecer?',
      data.participation === 'mentor'
        ? model.offers.filter((option) => option.value !== 'capital')
        : model.offers,
    ),
    preferences: (
      <>
        <InvestorSummary data={data} onlyPreferences onEdit={edit} />
        {text(
          'preferences',
          'Preferências adicionais',
          'Algo mais sobre as startups que você gostaria de conhecer?',
        )}
        <p>Nesta etapa não há pontuação ou recomendação automática.</p>
      </>
    ),
    review: <InvestorSummary data={data} onEdit={edit} />,
    consent: (
      <>
        <p>
          Ao finalizar, sua identificação, atuação, interesses e dados de
          investimento serão enviados ao servidor. As informações complementares
          e os consentimentos só ficam neste navegador se você clicar em “Salvar
          e continuar depois”.
        </p>
        <Button
          type="button"
          $variant="quiet"
          onClick={() => setLegal('terms')}
        >
          Termos de Uso
        </Button>
        <Button
          type="button"
          $variant="quiet"
          onClick={() => setLegal('privacy')}
        >
          Política de Privacidade
        </Button>
        <Checkbox
          id="termsAccepted"
          label="Concordo com os Termos de Uso do Juntaí!."
          checked={data.termsAccepted}
          error={errors.termsAccepted}
          onChange={(value) => update('termsAccepted', value)}
        />
        <Checkbox
          id="privacyAcknowledged"
          label="Estou ciente de como meus dados pessoais serão tratados conforme a Política de Privacidade."
          checked={data.privacyAcknowledged}
          error={errors.privacyAcknowledged}
          onChange={(value) => update('privacyAcknowledged', value)}
        />
        <Checkbox
          id="matchingConsent"
          label="Quero que minhas preferências sejam consideradas em futuras sugestões de conexões."
          checked={data.matchingConsent}
          onChange={(value) => update('matchingConsent', value)}
        />
      </>
    ),
  };
  return (
    <Fields>
      {sections[step]}
      <ContentDialog
        open={legal !== null}
        title={legal === 'terms' ? 'Termos de Uso' : 'Política de Privacidade'}
        onClose={() => setLegal(null)}
      >
        {legal && <LegalDocument document={legal} />}
      </ContentDialog>
    </Fields>
  );
}

function InvestorLocation({
  data,
  update,
  errors,
}: Pick<InvestorFieldProps, 'data' | 'update' | 'errors'>) {
  const [result, setResult] = useState<{
    state: string;
    cities: City[];
    error: boolean;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (!data.state) return;
    const controller = new AbortController();
    getCities(data.state, controller.signal)
      .then((cities) => {
        if (!controller.signal.aborted)
          setResult({ state: data.state, cities, error: false });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({ state: data.state, cities: [], error: true });
      });
    return () => controller.abort();
  }, [data.state, attempt]);
  const cities = result?.state === data.state ? result.cities : [];
  const loading = !!data.state && result?.state !== data.state;
  const failed = result?.state === data.state && result.error;
  return (
    <>
      <Columns>
        <Select
          id="state"
          label="Estado"
          required
          options={catalogs.states}
          value={data.state}
          error={errors.state}
          onChange={(event) => update('state', event.target.value)}
        />
        <Select
          id="cityId"
          label="Cidade"
          required
          options={cities.map((city) => ({ value: city.id, label: city.name }))}
          value={data.cityId}
          disabled={!data.state || loading || failed}
          placeholder={loading ? 'Carregando cidades…' : 'Selecione uma cidade'}
          error={errors.cityId}
          onChange={(event) => {
            const city = cities.find((item) => item.id === event.target.value);
            update('cityId', city?.id ?? '');
            update('cityName', city?.name ?? '');
          }}
        />
      </Columns>
      {failed && (
        <div role="alert">
          Não conseguimos carregar as cidades.{' '}
          <Button
            type="button"
            $variant="quiet"
            onClick={() => {
              setResult(null);
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </Button>
        </div>
      )}
    </>
  );
}
