import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  BookmarkSimpleIcon,
  SquaresFourIcon,
  ListIcon,
  SparkleIcon,
  CompassIcon,
} from '@phosphor-icons/react';
import { Button } from '@/shared/components/ui/Button';
import { PageHeader } from '@/shared/components/profile/PageHeader';
import logoSymbol from '@/shared/assets/images/logo-symb.svg';
import {
  defaultFilters,
  selectStartups,
  type Filters,
  type Startup,
} from './model';
import { useDiscovery } from './useDiscovery';
import { DiscoveryLayout } from './components/DiscoveryLayout';
import { StartupCard } from './components/StartupCard';
import { StartupMasonryGrid } from './components/StartupMasonryGrid';
import { StartupFilters } from './components/StartupFilters';
import { InterestConfirmationModal } from './components/ConnectionModals';
import * as S from './Explore.styles';

export function ExploreStartups() {
  const data = useDiscovery();
  const [params, setParams] = useSearchParams();
  const [interest, setInterest] = useState<Startup | null>(null);
  const filters = Object.fromEntries(
    Object.keys(defaultFilters).map((key) => [key, params.get(key) || '']),
  ) as Filters;
  function change(key: keyof Filters, value: string) {
    setParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (value) next.set(key, value);
        else next.delete(key);
        return next;
      },
      { replace: true },
    );
  }
  function clear() {
    setParams(
      (previous) => {
        const next = new URLSearchParams();
        for (const key of ['sort', 'view']) {
          const value = previous.get(key);
          if (value) next.set(key, value);
        }
        return next;
      },
      { replace: true },
    );
  }
  const personalized = data.startups.some(
    (item) => item.compatibility !== undefined,
  );
  const visible = selectStartups(
    data.startups,
    {
      ...filters,
      sort: filters.sort || (personalized ? 'recommended' : 'recent'),
    },
    data.state.saved,
  );
  return (
    <DiscoveryLayout data={data}>
      <PageHeader
        title="Explorar startups"
        subtitle="Descubra empresas, conheça novas soluções e encontre oportunidades alinhadas aos seus interesses."
        breadcrumbs={[{ label: 'Explorar' }]}
        actions={
          <Button
            $variant="secondary"
            aria-pressed={!!filters.saved}
            onClick={() => change('saved', filters.saved ? '' : 'yes')}
            aria-label={`Startups salvas (${data.state.saved.length})`}
          >
            <BookmarkSimpleIcon
              size={19}
              weight={filters.saved ? 'fill' : 'regular'}
            />
            <span className="saved-label">Salvas</span>
            <span>{data.state.saved.length}</span>
          </Button>
        }
      />
      <S.Hero>
        <div>
          <div className="label">
            <SparkleIcon size={15} /> Ideias que aproximam
          </div>
          <h2>Novas ideias. Novas conexões.</h2>
          <p>
            Explore quem está construindo o próximo capítulo de diferentes
            mercados. Sua experiência pode fazer parte dessa história.
          </p>
          <div className="stats">
            <span>
              <strong>{visible.length}</strong> startups disponíveis
            </span>
            <span>
              <strong>{new Set(visible.map((s) => s.segment)).size}</strong>{' '}
              segmentos
            </span>
            <span>
              <strong>
                {new Set(visible.map((s) => s.location.region)).size}
              </strong>{' '}
              regiões
            </span>
          </div>
        </div>
        <img
          className="brand-symbol"
          src={logoSymbol}
          alt=""
          aria-hidden="true"
        />
      </S.Hero>
      {!data.loading && !data.failed && !personalized && (
        <div className="personalize">
          <h3>Personalize suas recomendações</h3>
          <p>
            Complete seus interesses e preferências no perfil para receber
            recomendações mais alinhadas.
          </p>
          <Button as={Link} to="/investidor/perfil" $variant="quiet">
            Completar perfil
          </Button>
        </div>
      )}
      <StartupFilters filters={filters} onChange={change} onClear={clear} />
      <div className="results">
        <div>
          <h2>Startups encontradas</h2>
          <small aria-live="polite">
            {data.loading
              ? 'Buscando oportunidades…'
              : `${visible.length} oportunidades para explorar`}
          </small>
        </div>
        <div className="actions">
          <select
            aria-label="Ordenar startups"
            value={filters.sort || (personalized ? 'recommended' : 'recent')}
            onChange={(e) => change('sort', e.target.value)}
          >
            {personalized && (
              <>
                <option value="recommended">Recomendadas para você</option>
                <option value="compatibility">Maior compatibilidade</option>
              </>
            )}
            <option value="recent">Mais recentes</option>
            <option value="investment">Em busca de investimento</option>
            <option value="name">Nome: A–Z</option>
          </select>
          <div className="view-toggle">
            <button
              aria-label="Visualização em grade"
              aria-pressed={filters.view !== 'list'}
              onClick={() => change('view', '')}
            >
              <SquaresFourIcon size={18} />
            </button>
            <button
              aria-label="Visualização em lista"
              aria-pressed={filters.view === 'list'}
              onClick={() => change('view', 'list')}
            >
              <ListIcon size={18} />
            </button>
          </div>
        </div>
      </div>
      {data.loading ? (
        <S.Grid $list={false} aria-busy="true" aria-label="Carregando startups">
          {[1, 2].map((n) => (
            <S.Card $list={false} key={n}>
              <div
                className="body"
                style={{ height: n === 1 ? 390 : 470, background: '#f0ece8' }}
              />
            </S.Card>
          ))}
        </S.Grid>
      ) : data.failed ? (
        <div className="empty" role="alert">
          <h2>Não foi possível carregar as startups</h2>
          <p>Tente novamente em instantes.</p>
          <Button onClick={data.retry}>Tentar novamente</Button>
        </div>
      ) : !visible.length ? (
        <div className="empty">
          <CompassIcon size={40} />
          <h2>Nenhuma startup encontrada</h2>
          <p>Experimente alterar os filtros ou buscar por outros termos.</p>
          <Button onClick={clear}>Limpar filtros</Button>
        </div>
      ) : (
        <StartupMasonryGrid
          items={visible}
          list={filters.view === 'list'}
          render={(index) => {
            const startup = visible[index]!;
            return (
              <StartupCard
                key={startup.id}
                startup={startup}
                saved={data.state.saved.includes(startup.id)}
                sent={data.state.interests.some(
                  (item) => item.startupId === startup.id,
                )}
                list={filters.view === 'list'}
                returnSearch={params.toString()}
                onSave={() => data.save(startup.id)}
                onInterest={() => setInterest(startup)}
              />
            );
          }}
        />
      )}
      <InterestConfirmationModal
        startup={interest}
        data={data}
        onClose={() => setInterest(null)}
      />
    </DiscoveryLayout>
  );
}
