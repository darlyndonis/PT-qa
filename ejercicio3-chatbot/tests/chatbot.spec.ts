import { test, expect, Page } from '@playwright/test';

async function setChatOpen(page: Page, open: boolean) {
  const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
  const chatInput = page.getByPlaceholder('Ask a question...');

  await expect(async () => {
    const isOpen = (await askDocsButton.getAttribute('aria-pressed', { timeout: 2000 })) === 'true';
    if (isOpen !== open) {
      await askDocsButton.click({ timeout: 5000 });
    }
    if (open) {
      await expect(chatInput).toBeVisible({ timeout: 3000 });
    } else {
      await expect(chatInput).toBeHidden({ timeout: 3000 });
    }
  }).toPass({ timeout: 40_000, intervals: [500, 1000, 2000] });
}

test.describe('Chatbot Web - Botpress Docs', () => {
  // Damos margen extra: en CI la página y el widget cargan más lento
  test.describe.configure({ timeout: 90_000 });

  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
    // Esperar a que la página esté realmente cargada (no solo el HTML inicial)
    await page.waitForLoadState('load');
    await expect(page.getByRole('button', { name: 'Ask Docs' })).toBeVisible({ timeout: 30_000 });
  });

  test('El sitio carga correctamente', async ({ page }) => {
    await expect(page).toHaveTitle(/Botpress/i);
    await expect(page.getByRole('heading', { name: 'Botpress documentation' })).toBeVisible();
  });

  test('El widget del chat está presente en el DOM', async ({ page }) => {
    const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
    await expect(askDocsButton).toBeVisible();
  });

  test('El botón de abrir funciona', async ({ page }) => {
    const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
    const chatInput = page.getByPlaceholder('Ask a question...');

    // El widget puede venir abierto por defecto; si es así, lo cerramos primero
    await setChatOpen(page, false);

    // Ahora probamos que abrir funciona
    await setChatOpen(page, true);
    await expect(chatInput).toBeVisible();
    await expect(askDocsButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('El botón de cerrar funciona', async ({ page }) => {
    const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
    const chatInput = page.getByPlaceholder('Ask a question...');

    // Aseguramos que esté abierto antes de probar el cierre
    await setChatOpen(page, true);

    // Ahora probamos que cerrar funciona
    await setChatOpen(page, false);
    await expect(askDocsButton).toHaveAttribute('aria-pressed', 'false');
    await expect(chatInput).toBeHidden();
  });

  test('Enviar mensaje "Hola" y recibir respuesta del bot', async ({ page }) => {
    const chatInput = page.getByPlaceholder('Ask a question...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Asegurar que el widget está abierto
    await setChatOpen(page, true);

    // Escribir y enviar el mensaje
    await chatInput.fill('Hola');
    await expect(chatInput).toHaveValue('Hola');

    const startTime = Date.now();
    await sendButton.click();

    // Validar que el mensaje del usuario aparece en el historial
    await expect(page.getByText('Hola', { exact: true }).last()).toBeVisible();

    // Validar que se recibió una respuesta del bot
    const botResponse = page.getByText(/Botpress documentation questions/i);
    await expect(botResponse).toBeVisible({ timeout: 30_000 });

    const responseTime = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(30_000);
  });
});