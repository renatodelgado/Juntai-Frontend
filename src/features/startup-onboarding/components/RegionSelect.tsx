import { MultiSelect } from '@/shared/components/forms/Fields';
import { Button } from '@/shared/components/ui/Button';
import { CheckIcon } from '@phosphor-icons/react';
import { regions, brazilRegionIds } from '../data/catalogs';
import { Fields } from '../pages/Onboarding.styles';

export function RegionSelect({
  id,
  label,
  value,
  onChange,
  error,
  apiCompatible = false,
}: {
  id: string;
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  error?: string;
  apiCompatible?: boolean;
}) {
  const allBrazil = brazilRegionIds.every((region) => value.includes(region));
  if (apiCompatible)
    return (
      <MultiSelect
        id={id}
        label={label}
        required
        error={error}
        options={[
          { value: 'northeast', label: 'Nordeste' },
          { value: 'brazil', label: 'Nacional' },
          ...regions
            .filter(
              (item) =>
                item.value !== 'northeast' &&
                value.includes(item.value) &&
                (!allBrazil || item.value === 'international'),
            )
            .map((item) => ({
              ...item,
              label: `${item.label} (indisponível; remova para continuar)`,
            })),
        ]}
        value={
          allBrazil
            ? [
                'brazil',
                ...value.filter((item) => !brazilRegionIds.includes(item)),
              ]
            : value
        }
        onChange={(next) =>
          onChange(
            next.includes('brazil')
              ? [
                  ...new Set([
                    ...brazilRegionIds,
                    ...next.filter((item) => item !== 'brazil'),
                  ]),
                ]
              : next,
          )
        }
        hint="O cadastro aceita Nordeste ou abrangência nacional. As demais regiões precisam ser disponibilizadas pelo servidor."
      />
    );
  return (
    <Fields>
      <MultiSelect
        id={id}
        label={label}
        options={regions}
        required
        value={value}
        onChange={onChange}
        error={error}
        hint="Escolha as regiões brasileiras e, se fizer sentido, o exterior."
      />
      <div>
        <Button
          type="button"
          $variant="quiet"
          aria-pressed={allBrazil}
          onClick={() =>
            onChange(
              allBrazil
                ? value.filter((region) => !brazilRegionIds.includes(region))
                : [...new Set([...value, ...brazilRegionIds])],
            )
          }
        >
          {allBrazil && <CheckIcon size={18} aria-hidden="true" />}
          {allBrazil
            ? 'Desmarcar regiões do Brasil'
            : 'Selecionar todo o Brasil'}
        </Button>
      </div>
    </Fields>
  );
}
