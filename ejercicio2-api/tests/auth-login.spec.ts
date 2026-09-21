import { test, expect } from '@playwright/test';

test.describe('Login de Usuario', () => {
  const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';
  let registeredEmail: string;

  test.beforeAll(async ({ playwright }) => {
    // Registramos un usuario fresco para probar el login sobre credenciales conocidas
    const context = await playwright.request.newContext({
      baseURL: process.env.GOAL_TRACKER_API_URL,
    });

    registeredEmail = `test.login.${Date.now()}@example.com`;

    await context.post('auth/register', {
      data: {
        name: 'Login Test User',
        email: registeredEmail,
        password,
      },
    });

    await context.dispose();
  });

  test('Login con credenciales válidas debe devolver un token', async ({ request }) => {
    const response = await request.post('auth/login', {
      data: {
        email: registeredEmail,
        password,
      },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    console.log('Respuesta login exitoso:', JSON.stringify(body, null, 2));
    expect(body).toHaveProperty('token');
    expect(typeof body.token).toBe('string');
    expect(body.token.length).toBeGreaterThan(0);
  });

  test('Login con credenciales inválidas debe devolver 401', async ({ request }) => {
    const response = await request.post('auth/login', {
      data: {
        email: registeredEmail,
        password: 'WrongPassword999!',
      },
    });

    expect(response.status()).toBe(401);

    const body = await response.json();
    expect(body).toEqual({ msg: 'Invalid Credentials' });
  });
});