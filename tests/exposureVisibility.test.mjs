import { test } from 'node:test';
import assert from 'node:assert/strict';
import { observeExposure } from '../src/features/explore-startups/exposureVisibility.ts';

function environment(t) {
  t.mock.timers.enable({ apis: ['setTimeout'] });
  const priorDocument = globalThis.document;
  const priorObserver = globalThis.IntersectionObserver;
  const observers = [];
  const listeners = new Set();
  globalThis.document = {
    visibilityState: 'visible',
    addEventListener: (_type, listener) => listeners.add(listener),
    removeEventListener: (_type, listener) => listeners.delete(listener),
  };
  globalThis.IntersectionObserver = class {
    constructor(callback) {
      this.callback = callback;
      observers.push(this);
    }
    observe() {}
    disconnect() {
      this.disconnected = true;
    }
    show(ratio) {
      this.callback([{ isIntersecting: ratio > 0, intersectionRatio: ratio }]);
    }
  };
  t.after(() => {
    globalThis.document = priorDocument;
    globalThis.IntersectionObserver = priorObserver;
  });
  return {
    observers,
    listeners,
    visibility(state) {
      globalThis.document.visibilityState = state;
      listeners.forEach((fn) => fn());
    },
  };
}
const flush = async () => {
  for (let n = 0; n < 5; n++) await Promise.resolve();
};

test('card exige 50% visível durante um segundo, sem registro pelo mero retorno da API', async (t) => {
  const env = environment(t);
  const calls = [];
  const dispose = observeExposure({}, 'threshold', async (token) =>
    calls.push(token),
  );
  t.mock.timers.tick(5000);
  assert.equal(calls.length, 0);
  env.observers[0].show(0.49);
  t.mock.timers.tick(2000);
  assert.equal(calls.length, 0);
  env.observers[0].show(0.5);
  t.mock.timers.tick(999);
  assert.equal(calls.length, 0);
  t.mock.timers.tick(1);
  await flush();
  assert.deepEqual(calls, ['threshold']);
  dispose();
});
test('aba oculta e saída do viewport interrompem tempo contínuo', async (t) => {
  const env = environment(t);
  let count = 0;
  const dispose = observeExposure({}, 'hidden', async () => count++);
  env.observers[0].show(1);
  t.mock.timers.tick(900);
  env.visibility('hidden');
  t.mock.timers.tick(2000);
  assert.equal(count, 0);
  env.visibility('visible');
  t.mock.timers.tick(900);
  env.observers[0].show(0);
  t.mock.timers.tick(2000);
  assert.equal(count, 0);
  env.observers[0].show(1);
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(count, 1);
  dispose();
  assert.equal(env.listeners.size, 0);
});
test('remount e dois cards do mesmo contexto não duplicam confirmação', async (t) => {
  const env = environment(t);
  let count = 0;
  const send = async () => count++;
  const disposeA = observeExposure({}, 'same-token', send);
  const disposeB = observeExposure({}, 'same-token', send);
  env.observers.forEach((o) => o.show(1));
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(count, 1);
  disposeA();
  disposeB();
  const disposeC = observeExposure({}, 'same-token', send);
  assert.equal(env.observers.length, 2);
  disposeC();
});
test('desmontagem cancela timer e falha não bloqueia próxima tentativa', async (t) => {
  const env = environment(t);
  let count = 0;
  const disposeA = observeExposure({}, 'unmount', async () => count++);
  env.observers[0].show(1);
  disposeA();
  t.mock.timers.tick(2000);
  assert.equal(count, 0);
  const disposeB = observeExposure({}, 'retry', async () => {
    count++;
    throw Error('offline');
  });
  env.observers[1].show(1);
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(count, 1);
  env.observers[1].show(0);
  env.observers[1].show(1);
  t.mock.timers.tick(1000);
  await flush();
  assert.equal(count, 2);
  disposeB();
});
