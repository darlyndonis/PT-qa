import { test, expect } from '@playwright/test';

test.describe('Registro de Usuario', () => {
  test('POST /auth/register debe crear un usuario correctamente', async ({ request }) => {
    // Email único por ejecución para evitar conflictos con registros previos
    const uniqueEmail = `test.user.${Date.now()}@example.com`;
    const userName = 'Test User';

    const response = await request.post('auth/register', {
      data: {
        name: userName,
        email: uniqueEmail,
        password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
      },
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body).toHaveProperty('user');
    expect(body.user).toHaveProperty('name', userName);
    expect(body.user).toHaveProperty('email', uniqueEmail);
    });
});