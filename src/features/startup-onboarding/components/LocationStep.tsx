import { apiRegions } from '@/features/auth/services/registration';
import { useEffect, useState } from 'react';
import { ArrowClockwiseIcon } from '@phosphor-icons/react';
import { Select } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import { getCities, type City } from '../services/locations';
import type { OnboardingController } from '../hooks/useOnboarding';
import { bindFields } from './fields';
import { states } from '../data/catalogs';
import { RegionSelect } from './RegionSelect';
import { Columns, Fields, Notice } from '../pages/Onboarding.styles';

export function LocationStep({ form }: { form: OnboardingController }) {
  const [result, setResult] = useState<{
    state: string;
    cities: City[];
    error: string;
  } | null>(null);
  const [attempt, setAttempt] = useState(0);
  const state = form.data.state;
  useEffect(() => {
    if (!state) return;
    const controller = new AbortController();
    getCities(state, controller.signal)
      .then((cities) => {
        if (!controller.signal.aborted) setResult({ state, cities, error: '' });
      })
      .catch(() => {
        if (!controller.signal.aborted)
          setResult({
            state,
            cities: [],
            error:
              'Não conseguimos carregar as cidades. Confira sua conexão e tente novamente.',
          });
      });
    return () => controller.abort();
  }, [state, attempt]);
  const loading = !!state && result?.state !== state;
  const cities = result?.state === state ? result.cities : [];
  const error = result?.state === state ? result.error : '';
  const fields = bindFields(form);
  const options = cities.map((city) => ({ value: city.id, label: city.name }));
  if (
    form.data.cityId &&
    !options.some((option) => option.value === form.data.cityId)
  )
    options.push({ value: form.data.cityId, label: form.data.cityName });
  return (
    <Fields>
      <Columns>
        {fields.select('state', 'Estado', states)}
        <Select
          id="cityId"
          label="Cidade"
          required
          options={options}
          value={form.data.cityId}
          disabled={!state || loading || !!error}
          placeholder={
            loading
              ? 'Carregando cidades…'
              : !state
                ? 'Escolha o estado primeiro'
                : 'Selecione uma cidade'
          }
          error={form.errors.cityId}
          onChange={(event) => {
            const city = cities.find((item) => item.id === event.target.value);
            form.update('cityId', city?.id ?? '');
            form.update('cityName', city?.name ?? '');
          }}
        />
      </Columns>
      {error && (
        <Notice role="alert">
          {error}
          <div>
            <Button
              type="button"
              $variant="quiet"
              onClick={() => {
                setResult(null);
                setAttempt((value) => value + 1);
              }}
            >
              <ArrowClockwiseIcon size={18} aria-hidden="true" />
              Tentar novamente
            </Button>
          </div>
        </Notice>
      )}
      {fields.select('registrationRegion', 'Região do cadastro', apiRegions)}
      <RegionSelect
        id="targetRegions"
        label="Em quais regiões vocês pretendem crescer?"
        value={form.data.targetRegions}
        error={form.errors.targetRegions}
        onChange={(value) => form.update('targetRegions', value)}
      />
    </Fields>
  );
}
