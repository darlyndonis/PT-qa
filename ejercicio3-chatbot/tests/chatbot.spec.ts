import { test, expect } from '@playwright/test';

test.describe('Chatbot Web - Botpress Docs', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('', { waitUntil: 'domcontentloaded' });
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
    if (await askDocsButton.getAttribute('aria-pressed') === 'true') {
      await askDocsButton.click();
      await expect(chatInput).toBeHidden();
    }

    // Ahora probamos que abrir funciona
    await askDocsButton.click();
    await expect(chatInput).toBeVisible({ timeout: 15000 }); 
    await expect(askDocsButton).toHaveAttribute('aria-pressed', 'true');
  });

  test('El botón de cerrar funciona', async ({ page }) => {
    const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
    const chatInput = page.getByPlaceholder('Ask a question...');

    // Aseguramos que esté abierto antes de probar el cierre
    if (await askDocsButton.getAttribute('aria-pressed') === 'false') {
      await askDocsButton.click();
      await expect(chatInput).toBeVisible({ timeout: 15000 }); 
    }

    // Ahora probamos que cerrar funciona
    await askDocsButton.click();
    await expect(askDocsButton).toHaveAttribute('aria-pressed', 'false');
    await expect(chatInput).toBeHidden();
  });

  test('Enviar mensaje "Hola" y recibir respuesta del bot', async ({ page }) => {
    const askDocsButton = page.getByRole('button', { name: 'Ask Docs' });
    const chatInput = page.getByPlaceholder('Ask a question...');
    const sendButton = page.getByRole('button', { name: 'Send' });

    // Asegurar que el widget está abierto
    if (await askDocsButton.getAttribute('aria-pressed') === 'false') {
      await askDocsButton.click();
      await expect(chatInput).toBeVisible({ timeout: 15000 }); 
    }

    // Escribir y enviar el mensaje
    await chatInput.fill('Hola');
    await expect(chatInput).toHaveValue('Hola');

    const startTime = Date.now();
    await sendButton.click();

    // Validar que el mensaje del usuario aparece en el historial
    await expect(page.getByText('Hola', { exact: true }).last()).toBeVisible();

    // Validar que se recibió una respuesta del bot
    const botResponse = page.getByText(/Botpress documentation questions/i);
    await expect(botResponse).toBeVisible({ timeout: 15000 });

    const responseTime = Date.now() - startTime;
    console.log(`Tiempo de respuesta: ${responseTime}ms`);

    expect(responseTime).toBeLessThan(15000);
  });
});