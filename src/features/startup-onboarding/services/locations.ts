import { z } from 'zod';

const citiesSchema = z.array(z.object({ id: z.number(), nome: z.string() }));
export type City = { id: string; name: string };
// The profile API persists the city name, not the IBGE identifier.
export function citySelection(
  cities: City[],
  location: { cityId: string; cityName: string },
) {
  const selected =
    cities.find((city) => city.id === location.cityId) ??
    cities.find((city) => city.name === location.cityName);
  const options = cities.map((city) => ({ value: city.id, label: city.name }));
  const value = selected?.id ?? (location.cityName ? 'saved-city' : '');
  if (value === 'saved-city') options.push({ value, label: location.cityName });
  return { options, value };
}
const cache = new Map<string, City[]>();

export async function getCities(
  state: string,
  signal: AbortSignal,
): Promise<City[]> {
  const cached = cache.get(state);
  if (cached) return cached;
  const response = await fetch(
    `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${encodeURIComponent(state)}/municipios?orderBy=nome`,
    { signal: AbortSignal.any([signal, AbortSignal.timeout(15000)]) },
  );
  if (!response.ok)
    throw new Error(
      'Não foi possível carregar as cidades. Confira sua conexão e tente novamente.',
    );
  const payload: unknown = await response.json();
  const cities = citiesSchema
    .parse(payload)
    .map((city) => ({ id: String(city.id), name: city.nome }));
  cache.set(state, cities);
  return cities;
}
