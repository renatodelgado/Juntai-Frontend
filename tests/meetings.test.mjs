import assert from 'node:assert/strict';
import { test } from 'node:test';
import { build } from 'esbuild';
import { createRequire } from 'node:module';

const result = await build({
  entryPoints: ['src/features/meetings/repository.ts'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  plugins: [
    {
      name: 'transport',
      setup(build) {
        build.onResolve({ filter: /^@\/shared\/services\/api$/ }, () => ({
          path: 'api',
          namespace: 'mock',
        }));
        build.onLoad({ filter: /.*/, namespace: 'mock' }, () => ({
          contents:
            'export const apiRequest = (...args) => globalThis.meetingsTransport(...args);',
        }));
      },
    },
  ],
});
const module = { exports: {} };
new Function('module', 'exports', 'require', result.outputFiles[0].text)(
  module,
  module.exports,
  createRequire(import.meta.url),
);
const { meetingsRepository } = module.exports;
const record = {
  id: '1',
  startupId: 's',
  startupNome: 'Startup',
  investidorId: 'i',
  investidorNome: 'Investor',
  dataHoraAgendada: '2026-11-10T01:00:00.000Z',
  status: 'agendada',
  linkReuniao: null,
  notas: null,
  criadoEm: '2026-11-09T12:00:00.000Z',
};

test('agenda uses authenticated API and preserves server status and Fortaleza date', async () => {
  globalThis.meetingsTransport = async (path, options) => {
    assert.equal(path, 'reunioes');
    assert.equal(options.authenticated, true);
    return { json: async () => [record] };
  };
  const [item] = await meetingsRepository.list();
  assert.equal(item.status, 'agendada');
  assert.equal(item.date, '2026-11-09');
  assert.equal(item.time, '22:00');
});

test('creation and final status changes send backend contracts and propagate failures', async () => {
  const input = {
    startupId: 's',
    dataHoraAgendada: record.dataHoraAgendada,
    notas: 'Notes',
  };
  globalThis.meetingsTransport = async (path, options) => {
    assert.equal(path, 'reunioes');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), input);
    return { json: async () => record };
  };
  await meetingsRepository.create(input);
  globalThis.meetingsTransport = async (path, options) => {
    assert.equal(path, 'reunioes/1/status');
    assert.equal(options.method, 'PATCH');
    assert.equal(options.authenticated, true);
    assert.deepEqual(JSON.parse(options.body), { status: 'no_show' });
    return { json: async () => ({ ...record, status: 'no_show' }) };
  };
  assert.equal(
    (await meetingsRepository.updateStatus('1', 'no_show')).status,
    'no_show',
  );
  globalThis.meetingsTransport = async () => {
    throw new Error('Forbidden');
  };
  await assert.rejects(meetingsRepository.create(input), /Forbidden/);
});
