import {
  Checkbox,
  MoneyInput,
  NumberInput,
  Slider,
} from '@/shared/components/forms/Fields';
import type { OnboardingController } from '../hooks/useOnboarding';
import { bindFields } from './fields';
import { RegionSelect } from './RegionSelect';
import * as catalogs from '../data/catalogs';
import { Fields, Columns, SubCard, Notice } from '../pages/Onboarding.styles';

export function TractionStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      <Fields>
        <NumberInput
          id="customers"
          label="Número de clientes"
          min={0}
          step={1}
          value={form.data.customers}
          disabled={form.data.hideCustomers}
          onValueChange={(value) => form.update('customers', value)}
          error={form.errors.customers}
        />
        <Checkbox
          id="hideCustomers"
          label="Prefiro não informar o número de clientes"
          checked={form.data.hideCustomers}
          onChange={(value) => form.update('hideCustomers', value)}
        />
      </Fields>
      <Slider
        id="revenue"
        label="Qual é o faturamento atual da startup?"
        options={[
          ...catalogs.revenueRanges,
          { value: 'undisclosed', label: 'Prefiro não informar' },
        ]}
        value={form.data.revenue}
        error={form.errors.revenue}
        onChange={(value) => form.update('revenue', value)}
      />
      <SubCard>
        <h2>Como o negócio tem evoluído?</h2>
        <Fields>
          <Notice>
            Se você já acompanha o crescimento, compartilhe seus números. Se
            ainda não, pode deixar em branco.
          </Notice>
          <Columns>
            {fields.select(
              'growthMetric',
              'O que cresceu?',
              [
                { value: 'revenue', label: 'Receita' },
                { value: 'customers', label: 'Clientes' },
              ],
              false,
            )}
            {fields.select(
              'growthPeriod',
              'Período de comparação',
              [
                { value: 'monthly', label: 'Mensal' },
                { value: 'yearly', label: 'Anual' },
              ],
              false,
            )}
          </Columns>
          <NumberInput
            id="growthPercent"
            label="Crescimento (%)"
            min={-100}
            max={100000}
            step="0.01"
            value={form.data.growthPercent}
            onValueChange={(value) => form.update('growthPercent', value)}
            error={form.errors.growthPercent}
            hint="Use um percentual, como 12,5. Valores negativos também são aceitos."
          />
          {fields.textarea(
            'growthNotes',
            'Quer contar mais sobre essa evolução?',
            { maxLength: 1000 },
          )}
        </Fields>
      </SubCard>
      {fields.select('teamSize', 'Tamanho da equipe', catalogs.teamSizes)}
    </Fields>
  );
}

export function InvestmentStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      {fields.radio(
        'seekingInvestment',
        'Vocês estão buscando investimento?',
        catalogs.seekingInvestment,
      )}
      {form.data.seekingInvestment === 'yes' && (
        <SubCard>
          <Fields>
            <MoneyInput
              id="capital"
              label="Quanto pretendem captar?"
              required
              value={form.data.capital}
              error={form.errors.capital}
              onValueChange={(value) => form.update('capital', value)}
            />
            {fields.multi(
              'investmentPurposes',
              'Finalidade do investimento',
              catalogs.investmentPurposes,
            )}
          </Fields>
        </SubCard>
      )}
      {fields.multi(
        'needs',
        'Além de capital, o que sua startup precisa neste momento?',
        catalogs.needs,
      )}
    </Fields>
  );
}

export function MatchingStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
      {fields.radio(
        'partnerType',
        'Tipo de parceiro desejado',
        catalogs.partnerTypes,
      )}
      {fields.multi(
        'expertise',
        'Que tipo de experiência seria mais valiosa para sua startup?',
        catalogs.expertise,
      )}
      <RegionSelect
        id="partnerRegions"
        label="Regiões de interesse para encontrar parceiros"
        value={form.data.partnerRegions}
        error={form.errors.partnerRegions}
        onChange={(value) => form.update('partnerRegions', value)}
      />
      {form.data.partnerType !== 'mentor' &&
        fields.multi(
          'partnerStages',
          'Investidores que apoiam quais estágios?',
          catalogs.stages,
          false,
          'Escolha os estágios em que seu futuro investidor costuma atuar.',
        )}
      {fields.textarea('preferences', 'Preferências adicionais', {
        maxLength: 1500,
        placeholder: 'Algo mais que ajudaria a encontrar o parceiro certo?',
      })}
    </Fields>
  );
}
