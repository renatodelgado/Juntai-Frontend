import { chromium } from 'playwright';
import { preview } from 'vite';
import assert from 'node:assert/strict';

const server = await preview({
  preview: { host: '127.0.0.1', port: 5206, strictPort: true },
});
const browser = await chromium.launch({
  headless: true,
  channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge',
});
const page = await browser.newPage();
const token = 'a'.repeat(64);
const requests = [];
try {
  await page.route('**/auth/forgot-password', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { message: 'ok' } });
  });
  await page.route('**/auth/reset-password', async (route) => {
    requests.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, json: { message: 'ok' } });
  });
  await page.goto('http://127.0.0.1:5206/esqueci-minha-senha');
  await page.getByLabel('E-mail cadastrado').fill('user@example.invalid');
  await page.getByRole('button', { name: 'Continuar' }).click();
  await page.getByRole('status').waitFor();
  assert.equal(requests[0].email, 'user@example.invalid');
  await page.goto(`http://127.0.0.1:5206/redefinir-senha#${token}`);
  await page.getByLabel('Nova senha').fill('password-one');
  await page.getByLabel('Confirme a senha').fill('different');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(requests.length, 1);
  await page.getByLabel('Confirme a senha').fill('password-one');
  await page.getByRole('button', { name: 'Redefinir senha' }).click();
  await page.getByRole('status').waitFor();
  assert.deepEqual(requests[1], { token, senha: 'password-one' });
  assert.equal(new URL(page.url()).hash, '');
  console.log(
    'Password recovery form: request, mismatch, reset and fragment removal passed.',
  );
} finally {
  await browser.close();
  await server.close();
}
