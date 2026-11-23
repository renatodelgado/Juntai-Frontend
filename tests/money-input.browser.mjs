import { chromium } from 'playwright';
import { createServer } from 'vite';
import assert from 'node:assert/strict';

const server = await createServer({
  server: { host: '127.0.0.1', port: 5198 },
});
await server.listen();
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  const page = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  });
  await page.goto('http://127.0.0.1:5198/tests/fixtures/money-input.html', {
    waitUntil: 'domcontentloaded',
    timeout: 120_000,
  });
  const field = page.getByLabel('Valor');
  const value = page.getByTestId('value');
  await field.pressSequentially('1234567,89');
  assert.equal(await field.inputValue(), '1.234.567,89');
  assert.equal(await value.textContent(), '1234567.89');
  await field.blur();
  assert.equal(await field.inputValue(), '1.234.567,89');
  await field.fill('');
  assert.equal(await value.textContent(), 'null');
  await field.pressSequentially('0,05');
  assert.equal(await value.textContent(), '0.05');
  await page.getByRole('button', { name: 'Restaurar' }).click();
  assert.equal(await field.inputValue(), '1.234,56');
  await field.fill('');
  await field.pressSequentially('1000');
  assert.equal(await field.inputValue(), '1.000');
  assert.equal(await value.textContent(), '1000');
  await field.blur();
  assert.equal(await field.inputValue(), '1.000,00');
  await field.focus();
  await field.press('Control+A');
  await field.pressSequentially('1234.56');
  assert.equal(await field.inputValue(), '1.234,56');
  assert.equal(await value.textContent(), '1234.56');
  console.log('Money input formats and preserves numeric values.');
} finally {
  await browser.close();
  await server.close();
}
