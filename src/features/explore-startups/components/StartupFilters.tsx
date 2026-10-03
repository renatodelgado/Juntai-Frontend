import { useState } from 'react';
import {
  MagnifyingGlassIcon,
  SlidersHorizontalIcon,
  XIcon,
} from '@phosphor-icons/react';
import { ContentDialog } from '@/shared/components/ui/ContentDialog';
import {
  defaultFilters,
  investmentRanges,
  models,
  segments,
  stages,
  type Filters,
} from '../model';
import * as S from '../Explore.styles';

export function StartupFilters({
  filters,
  onChange,
  onClear,
}: {
  filters: Filters;
  onChange: (key: keyof Filters, value: string) => void;
  onClear: () => void;
}) {
  const [advanced, setAdvanced] = useState(false);
  const quick = [
    { key: 'segment', label: 'Todos os segmentos', options: segments },
    { key: 'stage', label: 'Estágio', options: stages },
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
      ],
    },
    { key: 'model', label: 'Modelo de negócio', options: models },
  ] as const;
  const labels: Partial<Record<keyof Filters, string>> = {
    q: 'Busca',
    segment: 'Segmento',
    stage: 'Estágio',
    location: 'Localização',
    model: 'Modelo',
    investment: 'Investimento',
    range: 'Faixa',
    min: 'Mínimo',
    max: 'Máximo',
    saved: 'Salvas',
  };
  const active = (Object.keys(defaultFilters) as (keyof Filters)[]).filter(
    (key) => filters[key] && labels[key],
  );
  return (
    <S.SearchArea aria-label="Busca e filtros de startups">
      <label className="search">
        <MagnifyingGlassIcon size={21} aria-hidden="true" />
        <input
          type="search"
          aria-label="Buscar startups"
          placeholder="Buscar startups por nome, solução ou mercado..."
          value={filters.q}
          onChange={(e) => onChange('q', e.target.value)}
        />
      </label>
      <div className="filters">
        {quick.map((filter) => (
          <select
            key={filter.key}
            aria-label={filter.label}
            value={filters[filter.key]}
            data-active={!!filters[filter.key]}
            onChange={(e) => onChange(filter.key, e.target.value)}
          >
            {filters[filter.key] &&
              !filter.options.some(
                (option: string) => option === filters[filter.key],
              ) && <option>{filters[filter.key]}</option>}
            <option value="">{filter.label}</option>
            {filter.options.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        ))}
        <select
          aria-label="Busca investimento"
          value={filters.investment}
          data-active={!!filters.investment}
          onChange={(e) => onChange('investment', e.target.value)}
        >
          <option value="">Busca investimento</option>
          <option value="yes">Está buscando investimento</option>
          <option value="no">Não está buscando investimento</option>
        </select>
        <button
          className="filter-button"
          aria-expanded={advanced}
          onClick={() => setAdvanced(true)}
        >
          <SlidersHorizontalIcon size={16} />
          Mais filtros
        </button>
        {!!active.length && (
          <button className="clear" onClick={onClear}>
            Limpar filtros
          </button>
        )}
      </div>
      {!!active.length && (
        <div className="chips" aria-label="Filtros ativos">
          {active.map((key) => (
            <button
              key={key}
              onClick={() => onChange(key, '')}
              aria-label={`Remover filtro ${labels[key]}`}
            >
              <span>
                {labels[key]}:{' '}
                {key === 'investment'
                  ? filters[key] === 'yes'
                    ? 'buscando'
                    : 'não buscando'
                  : key === 'saved'
                    ? 'somente salvas'
                    : filters[key]}
              </span>
              <XIcon size={12} />
            </button>
          ))}
        </div>
      )}
      <ContentDialog
        open={advanced}
        title="Refine sua descoberta"
        onClose={() => setAdvanced(false)}
        closeLabel="Ver resultados"
      >
        <S.Form as="div">
          <label>
            Estado, cidade ou região
            <input
              placeholder="Todo o Brasil"
              value={filters.location}
              onChange={(e) => onChange('location', e.target.value)}
            />
          </label>
          <label>
            Faixa de investimento
            <select
              value={filters.range}
              onChange={(e) => onChange('range', e.target.value)}
            >
              <option value="">Qualquer faixa</option>
              {investmentRanges.map((range) => (
                <option key={range.label}>{range.label}</option>
              ))}
            </select>
          </label>
          <div className="pair">
            <label>
              Mínimo personalizado (R$)
              <input
                type="number"
                min="0"
                value={filters.min}
                onChange={(e) => onChange('min', e.target.value)}
              />
            </label>
            <label>
              Máximo personalizado (R$)
              <input
                type="number"
                min={filters.min || 0}
                value={filters.max}
                onChange={(e) => onChange('max', e.target.value)}
              />
            </label>
          </div>
          {!!filters.min &&
            !!filters.max &&
            Number(filters.min) > Number(filters.max) && (
              <p className="error">
                O máximo deve ser maior ou igual ao mínimo.
              </p>
            )}
          <p>
            Valores personalizados substituem a faixa selecionada. Startups sem
            valor público continuam aparecendo; a ausência de informação não
            elimina uma oportunidade.
          </p>
        </S.Form>
      </ContentDialog>
    </S.SearchArea>
  );
}
