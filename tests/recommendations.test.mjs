import assert from 'node:assert/strict';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const result = await build({
  stdin: {
    contents: `export * from './src/features/auth/services/currentProfile'; export * from './src/features/explore-startups/recommendationPresentation'; export * from './src/features/explore-startups/api'; export * from './src/features/explore-startups/useExposure'; export { CompatibilityIndicator } from './src/features/explore-startups/components/StartupCard'; export { defaultFilters } from './src/features/explore-startups/model'; export { renderToStaticMarkup } from 'react-dom/server'; export { createElement } from 'react';`,
    resolveDir: process.cwd(),
  },
  jsx: 'automatic',
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  external: ['react', 'react-dom/server', 'react/jsx-runtime'],
  mainFields: ['module', 'main'],
  plugins: [
    {
      name: 'transport',
      setup(b) {
        b.onResolve({ filter: /^@\/shared\/services\/api$/ }, () => ({
          path: 'transport',
          namespace: 'mock',
        }));
        b.onResolve({ filter: /^@\// }, (args) => ({
          path: fileURLToPath(
            new URL(
              '../src/' +
                args.path.slice(2) +
                (args.path.endsWith('Button') ? '.tsx' : '.ts'),
              import.meta.url,
            ),
          ),
        }));
        b.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({
          contents:
            'export const apiRequest = (...args) => globalThis.transport(...args);',
        }));
      },
    },
  ],
});
// Place beside this test so external packages resolve from the project.
const { writeFile, unlink } = await import('node:fs/promises');
const file = new URL('./.integration-runtime.cjs', import.meta.url);
await writeFile(file, result.outputFiles[0].text);
const { default: m } = await import(file.href);
await unlink(file);
const user = {
  id: 'investor',
  nome: 'Teste',
  email: 'test@example.com',
  tipoPerfil: 'investidor',
};
const remote = {
  id: 'a',
  nomeFantasia: 'Startup A',
  segmento: 'fintech',
  estagio: 'mvp',
  modeloNegocio: 'b2b',
  statusModeracao: 'aprovado',
  atualizadoEm: '2026-11-01',
  criadoEm: '2026-11-01',
};
const facets = { locations: [], segments: 1, regions: 1 };

test('catalog summary counts all eligible startups without requesting a ranking', async () => {
  globalThis.transport = async (path, options) => {
    const query = new URL(path, 'http://backend').searchParams;
    assert.equal(query.get('sort'), 'recent');
    assert.equal(query.get('size'), '1');
    assert.equal(query.get('page'), '0');
    assert.equal(query.get('segment'), 'fintech');
    assert.equal(query.get('ids'), 'a,b');
    assert.equal(options.authenticated, true);
    return Response.json({ total: 1457, facets });
  };
  const summary = await m.startupRepository.summary(
    { ...m.defaultFilters, segment: 'Fintech', saved: 'yes' },
    ['a', 'b'],
  );
  assert.equal(summary.total, 1457);
  assert.deepEqual(summary.facets, facets);
});

test('technical warnings become clear explanations without inventing matching reasons', () => {
  const warnings = m.recommendationNotices([
    'ajuda: Áreas de ajuda ou necessidades não informadas. Necessidades sem equivalência definida: parcerias_estrategicas.',
    'Cobertura incompleta; compare o score junto da cobertura.',
    'Cobertura incompleta; compare o score junto da cobertura.',
  ]);
  assert.equal(warnings.length, 2);
  assert.ok(warnings[0].includes('parcerias estratégicas'));
  assert.ok(warnings[1].includes('informações disponíveis'));
  assert.ok(!warnings.join(' ').includes('parcerias_estrategicas'));
  assert.ok(!warnings.join(' ').includes('score'));
});

test('shared profile deduplicates reads, publishes saved photos, handles removal and isolates sessions', async () => {
  const storage = () => {
    const values = new Map();
    return {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
      removeItem: (k) => values.delete(k),
    };
  };
  globalThis.localStorage = storage();
  globalThis.sessionStorage = storage();
  const login = (token) =>
    localStorage.setItem(
      'juntai:auth-session',
      JSON.stringify({ token, usuario: user }),
    );
  login('session-one');
  let calls = 0;
  let release;
  globalThis.transport = () => {
    calls++;
    return new Promise((resolve) => {
      release = resolve;
    });
  };
  const first = m.refreshCurrentProfile();
  const second = m.refreshCurrentProfile();
  assert.equal(calls, 1);
  release(
    Response.json({
      statusModeracao: 'aprovado',
      avatarUrl: 'https://example.com/old.png',
    }),
  );
  await Promise.all([first, second]);
  assert.equal(m.getCurrentProfile().avatarUrl, 'https://example.com/old.png');
  const stale = m.refreshCurrentProfile();
  m.publishCurrentProfile(
    { statusModeracao: 'aprovado', avatarUrl: 'https://example.com/new.png' },
    'session-one',
  );
  release(
    Response.json({
      statusModeracao: 'aprovado',
      avatarUrl: 'https://example.com/old.png',
    }),
  );
  await stale;
  assert.equal(m.getCurrentProfile().avatarUrl, 'https://example.com/new.png');
  m.publishCurrentProfile(
    { statusModeracao: 'aprovado', avatarUrl: null },
    'session-one',
  );
  assert.equal(m.getCurrentProfile().avatarUrl, null);
  login('session-two');
  assert.equal(m.getCurrentProfile(), null);
  m.publishCurrentProfile(
    { statusModeracao: 'aprovado', avatarUrl: 'https://example.com/old.png' },
    'session-one',
  );
  assert.equal(m.getCurrentProfile(), null);
  localStorage.removeItem('juntai:auth-session');
});

test('discovery preserves server order, signed contexts, probabilities and pagination', async () => {
  let query;
  globalThis.transport = async (path, options) => {
    query = new URL(path, 'http://backend');
    assert.equal(options.authenticated, true);
    return Response.json({
      items: [
        {
          ...remote,
          id: 'b',
          origemRecomendacao: 'supervised',
          probabilidadeInteresse: 0.1778,
          posicaoRanking: 1,
          contextoExposicao: 'signed',
          avisos: ['Experimental'],
        },
        {
          ...remote,
          origemRecomendacao: 'supervised',
          probabilidadeInteresse: 0.1,
        },
      ],
      total: 30,
      hasMore: true,
      facets,
      origemRecomendacao: 'supervised',
    });
  };
  const page = await m.startupRepository.page(
    user,
    { ...m.defaultFilters, segment: 'Fintech', q: 'pagamentos', saved: 'yes' },
    ['a', 'b'],
    1,
  );
  assert.deepEqual(
    page.items.map((s) => s.id),
    ['b', 'a'],
  );
  assert.equal(page.items[0].probabilidadeInteresse, 0.1778);
  assert.equal(page.items[0].compatibility, undefined);
  assert.equal(page.items[0].contextoExposicao, 'signed');
  assert.equal(page.items[0].compatibilityFactors, undefined);
  assert.equal(page.total, 30);
  assert.equal(page.hasMore, true);
  for (const [key, value] of Object.entries({
    page: '1',
    size: '24',
    segment: 'fintech',
    q: 'pagamentos',
    ids: 'a,b',
    sort: 'compatibility',
  }))
    assert.equal(query.searchParams.get(key), value);
});
test('rules fallback preserves the score and warning without inventing probability', async () => {
  globalThis.transport = async () =>
    Response.json({
      items: [{ ...remote, compatibility: 85, origemRecomendacao: 'rules' }],
      total: 1,
      hasMore: false,
      facets,
      origemRecomendacao: 'rules',
      fallback: { de: 'supervised', motivo: 'timeout' },
      avisos: ['Regras disponíveis'],
    });
  const page = await m.startupRepository.page(user, m.defaultFilters, [], 0);
  assert.equal(page.items[0].compatibility, 85);
  assert.equal(page.items[0].probabilidadeInteresse, undefined);
  assert.equal(page.fallback.motivo, 'timeout');
  assert.deepEqual(page.avisos, ['Regras disponíveis']);
});
test('ordinary discovery has no random score and keeps explicit sort', async () => {
  globalThis.transport = async (path) => {
    assert.match(path, /sort=recent/);
    return Response.json({ items: [remote], total: 1, hasMore: false, facets });
  };
  const page = await m.startupRepository.page(
    user,
    { ...m.defaultFilters, sort: 'recent' },
    [],
    0,
  );
  assert.equal(page.items[0].compatibility, undefined);
});
test('invalid probability is rejected and network errors propagate for retry UI', async () => {
  for (const value of [-1, 1.1, NaN, Infinity])
    assert.equal(
      m.recommendationFields.safeParse({ probabilidadeInteresse: value })
        .success,
      false,
    );
  globalThis.transport = async () => {
    throw new Error('503');
  };
  await assert.rejects(
    m.startupRepository.page(user, m.defaultFilters, [], 0),
    /503/,
  );
});
test('experimental metric has correct percentage, label and four visual levels', () => {
  for (const [prob, label] of [
    [0, 'Baixa'],
    [0.4, 'Moderada'],
    [0.7, 'Alta'],
    [0.9, 'Muito alta'],
    [1, 'Muito alta'],
  ]) {
    const html = m.renderToStaticMarkup(
      m.createElement(m.CompatibilityIndicator, {
        startup: {
          origemRecomendacao: 'supervised',
          probabilidadeInteresse: prob,
        },
      }),
    );
    assert.ok(html.includes(label));
    assert.ok(html.includes('Modelo experimental'));
    assert.ok(html.includes(`aria-valuenow="${prob * 100}"`));
    assert.ok(!html.includes('Compatibilidade por regras'));
  }
  const html = m.renderToStaticMarkup(
    m.createElement(m.CompatibilityIndicator, {
      startup: {
        origemRecomendacao: 'supervised',
        probabilidadeInteresse: 0.17781418561935425,
      },
    }),
  );
  assert.ok(html.includes('17,8%'));
  assert.equal(
    m.renderToStaticMarkup(
      m.createElement(m.CompatibilityIndicator, { startup: {} }),
    ),
    '',
  );
});
test('exposure posts exact signed context once for concurrent and repeated confirmations', async () => {
  let calls = 0;
  globalThis.transport = async (path, options) => {
    calls++;
    assert.equal(path, 'startups/exposicoes');
    assert.deepEqual(JSON.parse(options.body), {
      contexto: 'opaque-signed-token',
    });
    return Response.json({ id: 'exposure' });
  };
  await Promise.all([
    m.confirmExposure('opaque-signed-token'),
    m.confirmExposure('opaque-signed-token'),
  ]);
  await m.confirmExposure('opaque-signed-token');
  assert.equal(calls, 1);
});
test('failed exposure may be retried', async () => {
  let calls = 0;
  globalThis.transport = async () => {
    if (++calls === 1) throw new Error('unavailable');
    return Response.json({});
  };
  await assert.rejects(m.confirmExposure('retry-token'));
  await m.confirmExposure('retry-token');
  assert.equal(calls, 2);
});
