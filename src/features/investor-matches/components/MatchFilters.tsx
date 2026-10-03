import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from '@phosphor-icons/react';
import {
  segments,
  stages,
  models,
  investmentRanges,
} from '@/features/explore-startups/model';
import { statusLabels, type MatchFilters as FiltersType } from '../model';
import * as S from '../Matches.styles';

export function MatchFilters({
  filters,
  change,
  clear,
}: {
  filters: FiltersType;
  change: (key: keyof FiltersType, value: string) => void;
  clear: () => void;
}) {
  const [open, setOpen] = useState(false);
  const controls = [
    {
      key: 'segment',
      label: 'Segmento',
      options: segments.map((value) => ({ value, label: value })),
    },
    {
      key: 'stage',
      label: 'Estágio da startup',
      options: stages.map((value) => ({ value, label: value })),
    },
    {
      key: 'location',
      label: 'Localização',
      options: [
        'Nordeste',
        'Norte',
        'Centro-Oeste',
        'Sudeste',
        'Sul',
        'Fortaleza',
        'Recife',
        'CE',
        'PE',
      ].map((value) => ({ value, label: value })),
    },
    {
      key: 'model',
      label: 'Modelo de negócio',
      options: models.map((value) => ({ value, label: value })),
    },
    {
      key: 'range',
      label: 'Faixa de investimento',
      options: investmentRanges.map(({ label }) => ({ value: label, label })),
    },
    {
      key: 'minimum',
      label: 'Compatibilidade mínima',
      options: [50, 70, 80, 90, 95, 100].map((value) => ({
        value: String(value),
        label: `${value}% ou mais`,
      })),
    },
    {
      key: 'status',
      label: 'Status da conexão',
      options: Object.entries(statusLabels)
        .filter(([value]) => !['mutual', 'new', 'viewed'].includes(value))
        .map(([value, label]) => ({
          value,
          label,
        })),
    },
  ] as const;
  const quick = [
    { value: '', label: 'Todos' },
    { value: 'high', label: 'Alta compatibilidade' },
    { value: 'saved', label: 'Salvos' },
  ];
  const active = controls.filter((control) => filters[control.key]);
  const hasFilters = !!active.length || !!filters.q || !!filters.quick;
  return (
    <S.Filters aria-label="Busca e filtros de matches">
      <label className="search">
        <MagnifyingGlassIcon size={21} aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar matches"
          placeholder="Buscar por startup, solução ou mercado..."
          value={filters.q}
          onChange={(event) => change('q', event.target.value)}
        />
      </label>
      <div className="quick">
        {quick.map((option) => (
          <button
            key={option.value}
            aria-pressed={filters.quick === option.value}
            onClick={() => change('quick', option.value)}
          >
            {option.label}
          </button>
        ))}
        <button
          className="more"
          aria-expanded={open}
          aria-controls="match-filter-controls"
          onClick={() => setOpen(!open)}
        >
          <SlidersHorizontalIcon size={16} />
          Filtros
        </button>
        {hasFilters && (
          <button className="clear" onClick={clear}>
            Limpar filtros
          </button>
        )}
      </div>
      <div className="controls" id="match-filter-controls" data-open={open}>
        {controls.map((control) => (
          <select
            key={control.key}
            aria-label={control.label}
            value={filters[control.key]}
            data-active={!!filters[control.key]}
            onChange={(event) => change(control.key, event.target.value)}
          >
            <option value="">{control.label}</option>
            {control.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ))}
      </div>
      {hasFilters && (
        <div className="chips" aria-label="Filtros ativos">
          {filters.q && (
            <button aria-label="Remover busca" onClick={() => change('q', '')}>
              Busca: {filters.q}
              <XIcon size={12} />
            </button>
          )}
          {filters.quick && (
            <button
              aria-label="Remover filtro rápido"
              onClick={() => change('quick', '')}
            >
              {quick.find((item) => item.value === filters.quick)?.label}
              <XIcon size={12} />
            </button>
          )}
          {active.map((control) => (
            <button
              key={control.key}
              aria-label={`Remover ${control.label}`}
              onClick={() => change(control.key, '')}
            >
              {control.label}:{' '}
              {control.options.find(
                (option) => option.value === filters[control.key],
              )?.label ?? filters[control.key]}
              <XIcon size={12} />
            </button>
          ))}
        </div>
      )}
      {filters.range && (
        <p style={{ fontSize: 11 }}>
          Startups sem valor de investimento público continuam nos resultados.
        </p>
      )}
    </S.Filters>
  );
}
