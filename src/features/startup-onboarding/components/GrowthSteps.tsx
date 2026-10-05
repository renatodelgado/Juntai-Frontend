import { MoneyInput, NumberInput } from '@/shared/components/forms/Fields';
import type { OnboardingController } from '../hooks/useOnboarding';
import { bindFields } from './fields';
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
          onValueChange={(value) => form.update('customers', value)}
          error={form.errors.customers}
        />
      </Fields>
      <NumberInput
        id="monthlyRevenue"
        label="Faturamento mensal (R$)"
        min={0}
        step="0.01"
        value={form.data.monthlyRevenue}
        error={form.errors.monthlyRevenue}
        onValueChange={(value) => form.update('monthlyRevenue', value)}
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
                { value: 'both', label: 'Clientes e receita' },
              ],
              false,
            )}
            {fields.select(
              'growthPeriod',
              'Período de comparação',
              [
                { value: 'three_months', label: 'Últimos 3 meses' },
                { value: 'six_months', label: 'Últimos 6 meses' },
                { value: 'since_founding', label: 'Desde a fundação' },
                { value: 'yearly', label: 'Último ano' },
              ],
              false,
            )}
          </Columns>
          <NumberInput
            id="growthPercent"
            label="Crescimento (%)"
            min={-100}
            max={9999.99}
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
      <NumberInput
        id="exactTeamSize"
        label="Tamanho da equipe"
        hint="Informe o número exato de pessoas na equipe."
        required
        min={1}
        max={32767}
        step={1}
        value={form.data.exactTeamSize}
        error={form.errors.exactTeamSize}
        onValueChange={(value) => form.update('exactTeamSize', value)}
      />
    </Fields>
  );
}

export function InvestmentStep({ form }: { form: OnboardingController }) {
  const fields = bindFields(form);
  return (
    <Fields>
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
      {fields.multi(
        'needs',
        'Além de capital, o que sua startup precisa neste momento?',
        catalogs.needs,
      )}
    </Fields>
  );
}
