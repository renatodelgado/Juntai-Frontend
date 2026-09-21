import { apiRegions } from '@/features/auth/services/registration';
import { FieldSync } from '@/shared/components/forms/RegistrationSync';
import type { ReactNode } from 'react';
import { PencilSimpleIcon } from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { Tag } from '@/shared/components/forms/styles';
import type { StartupDraft } from '../model/types';
import type { StepId } from '../data/steps';
import * as catalogs from '../data/catalogs';
import {
  Fields,
  SubCard,
  SummaryList,
  Notice,
} from '../pages/Onboarding.styles';

function SummaryCard({
  title,
  step,
  onEdit,
  children,
}: {
  title: string;
  step: StepId;
  onEdit: (step: StepId) => void;
  children: ReactNode;
}) {
  return (
    <SubCard>
      <header>
        <h2>{title}</h2>
        <Button
          type="button"
          $variant="quiet"
          aria-label={`Editar ${title}`}
          onClick={() => onEdit(step)}
        >
          <PencilSimpleIcon size={18} aria-hidden="true" />
          Editar
        </Button>
      </header>
      <SummaryList>{children}</SummaryList>
    </SubCard>
  );
}
function Item({
  label,
  field = '',
  children,
}: {
  label: string;
  field?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>
        <FieldSync field={field}>{children || 'Não informado'}</FieldSync>
      </dd>
    </div>
  );
}
function labels(options: readonly catalogs.Option[], values: string[]) {
  return values.length
    ? values.map((value) => (
        <Tag key={value}>{catalogs.optionLabel(options, value)}</Tag>
      ))
    : 'Não informado';
}

export function ReviewStep({
  data,
  attachment,
  onEdit,
}: {
  data: StartupDraft;
  attachment: File | null;
  onEdit: (step: StepId) => void;
}) {
  return (
    <Fields>
      <SummaryCard title="Sobre a startup" step="about" onEdit={onEdit}>
        <Item label="Responsável">{data.ownerName}</Item>
        <Item field="name" label="Nome">
          {data.name}
        </Item>
        <Item label="Nome público">{data.publicName}</Item>
        <Item field="description" label="Descrição">
          {data.description}
        </Item>
        <Item field="website" label="Site">
          {data.website}
        </Item>
        <Item field="linkedin" label="LinkedIn">
          {data.linkedin}
        </Item>
        <Item field="instagram" label="Instagram">
          {data.instagram}
        </Item>
        <Item field="otherLinks" label="Outros canais">
          {data.otherLinks.map((link) => link.url).join('\n')}
        </Item>
      </SummaryCard>
      <SummaryCard title="Negócio" step="business" onEdit={onEdit}>
        <Item label="Segmento principal">
          {catalogs.optionLabel(catalogs.segments, data.segment)}
        </Item>
        <Item field="secondarySegments" label="Categorias secundárias">
          {labels(catalogs.segments, data.secondarySegments)}
        </Item>
        <Item label="Estágio">
          {catalogs.optionLabel(catalogs.stages, data.stage)}
        </Item>
      </SummaryCard>
      <SummaryCard title="Mercado" step="market" onEdit={onEdit}>
        <Item field="businessModels" label="Modelo de negócio">
          {labels(catalogs.businessModels, data.businessModels)}
        </Item>
        <Item label="Modelo principal">
          {catalogs.optionLabel(
            catalogs.businessModels,
            data.primaryModel || data.businessModels[0] || '',
          )}
        </Item>
        <Item label="Público atendido">{data.targetMarket}</Item>
        <Item label="Problema">{data.problem}</Item>
        <Item label="Solução">{data.solution}</Item>
      </SummaryCard>
      <SummaryCard
        title="Localização e atuação"
        step="location"
        onEdit={onEdit}
      >
        <Item field="cityId" label="Localização">
          {data.cityName ? `${data.cityName} / ${data.state}` : ''}
        </Item>
        <Item label="Região do cadastro">
          {
            apiRegions.find((item) => item.value === data.registrationRegion)
              ?.label
          }
        </Item>
        <Item field="targetRegions" label="Mercados pretendidos">
          {labels(catalogs.regions, data.targetRegions)}
        </Item>
      </SummaryCard>
      <SummaryCard title="Tração" step="traction" onEdit={onEdit}>
        <Item field="customers" label="Clientes">
          {data.hideCustomers
            ? 'Prefiro não informar'
            : data.customers?.toLocaleString('pt-BR')}
        </Item>
        <Item field="revenue" label="Faturamento">
          {data.revenue === 'undisclosed'
            ? 'Prefiro não informar'
            : catalogs.optionLabel(catalogs.revenueRanges, data.revenue)}
        </Item>
        <Item label="Faturamento mensal exato">
          {data.revenue === 'none'
            ? 'R$ 0,00'
            : data.revenue !== 'undisclosed' && data.monthlyRevenue !== null
              ? new Intl.NumberFormat('pt-BR', {
                  style: 'currency',
                  currency: 'BRL',
                }).format(data.monthlyRevenue)
              : 'Não informado'}
        </Item>
        <Item field="growthPercent" label="Crescimento">
          {data.growthPercent !== null
            ? `${data.growthPercent.toLocaleString('pt-BR')}% ${data.growthPeriod === 'monthly' ? 'ao mês' : 'ao ano'} · ${data.growthMetric === 'revenue' ? 'Receita' : 'Clientes'}`
            : ''}
        </Item>
        <Item field="growthNotes" label="Evolução do negócio">
          {data.growthNotes}
        </Item>
        <Item field="exactTeamSize" label="Tamanho da equipe">
          {data.exactTeamSize}
        </Item>
      </SummaryCard>
      <SummaryCard
        title="Investimento e parcerias"
        step="investment"
        onEdit={onEdit}
      >
        {data.seekingInvestment === 'yes' && (
          <>
            <Item label="Capital procurado">
              {data.capital === null
                ? ''
                : new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  }).format(data.capital)}
            </Item>
            <Item label="Finalidade">
              {labels(catalogs.investmentPurposes, data.investmentPurposes)}
            </Item>
          </>
        )}
        <Item field="needs" label="Necessidades">
          {labels(catalogs.needs, data.needs)}
        </Item>

        <Item field="partnerType" label="Tipo de parceiro">
          {catalogs.optionLabel(catalogs.partnerTypes, data.partnerType)}
        </Item>
        <Item field="expertise" label="Experiência desejada">
          {labels(catalogs.expertise, data.expertise)}
        </Item>
        <Item field="preferences" label="Preferências adicionais">
          {data.preferences}
        </Item>
      </SummaryCard>
      <SummaryCard title="Pitch e Canvas" step="pitch" onEdit={onEdit}>
        <Item label="Pitch">{data.pitchText}</Item>
        <Item field="attachment" label="Apresentação">
          {attachment?.name}
        </Item>
        <Item field="videoUrl" label="Vídeo">
          {data.videoUrl}
        </Item>
        {catalogs.canvasFields.map((field) => (
          <Item key={field.value} label={field.label}>
            {data.canvas[field.value]}
          </Item>
        ))}
      </SummaryCard>
      <Notice>
        <strong>Tudo certo? Vamos criar seu perfil.</strong>
        <p>
          Ao finalizar, você revisará os termos e criará seu acesso. Para
          guardar suas informações neste navegador, clique em “Salvar e
          continuar depois”.
        </p>
      </Notice>
    </Fields>
  );
}
