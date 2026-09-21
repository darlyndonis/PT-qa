import { test, expect } from '@playwright/test';

test.describe('Health Check', () => {
  test('GET /status debe devolver 200 y status OPERATIONAL', async ({ request }) => {
    const response = await request.get('status');

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty('status');
    expect(body.status).toBe('OPERATIONAL');
  });
});