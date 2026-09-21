import { test, expect } from '@playwright/test';

test.describe.serial('Goals', () => {
  let token: string;
  let goalId1: string;
  let goalId2: string;

  const goal1 = {
    title: 'Aprender Playwright',
    description: 'Completar el curso oficial de Playwright y practicar con proyectos reales',
  };

  const goal2 = {
    title: 'Terminar la prueba técnica de QA',
    description: 'Completar los 5 ejercicios de la prueba técnica de QA Engineer',
  };

  test.beforeAll(async ({ playwright }) => {
    const context = await playwright.request.newContext({
      baseURL: process.env.GOAL_TRACKER_API_URL,
    });

    const email = `test.goals.${Date.now()}@example.com`;
    const password = process.env.TEST_USER_PASSWORD || 'TestPassword123!';

    await context.post('auth/register', {
      data: { name: 'Goals Test User', email, password },
    });

    const loginResponse = await context.post('auth/login', {
      data: { email, password },
    });
    const loginBody = await loginResponse.json();
    token = loginBody.token;

    await context.dispose();
  });

  test('Crear primer goal', async ({ request }) => {
    const response = await request.post('goals', {
      headers: { Authorization: `Bearer ${token}` },
      data: goal1,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.goal).toHaveProperty('title', goal1.title);
    expect(body.goal).toHaveProperty('description', goal1.description);
    expect(body.goal).toHaveProperty('_id');
    expect(body.goal).toHaveProperty('createdAt');

    goalId1 = body.goal._id;
  });

  test('Crear segundo goal', async ({ request }) => {
    const response = await request.post('goals', {
      headers: { Authorization: `Bearer ${token}` },
      data: goal2,
    });

    expect(response.status()).toBe(201);

    const body = await response.json();
    expect(body.goal).toHaveProperty('title', goal2.title);
    expect(body.goal).toHaveProperty('description', goal2.description);
    expect(body.goal).toHaveProperty('_id');
    expect(body.goal).toHaveProperty('createdAt');

    goalId2 = body.goal._id;
  });

  test('Consultar un goal específico por ID', async ({ request }) => {
    const response = await request.get(`goals/${goalId1}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    const goal = body.goal ?? body;
    expect(goal._id).toBe(goalId1);
    expect(goal.title).toBe(goal1.title);
    expect(goal.description).toBe(goal1.description);
  });

  test('Listar goals debe incluir los 2 creados', async ({ request }) => {
    const response = await request.get('goals', {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect(response.status()).toBe(200);

    const body = await response.json();
    expect(body.goals.length).toBe(2);

    const ids = body.goals.map((g: { _id: string }) => g._id);
    expect(ids).toContain(goalId1);
    expect(ids).toContain(goalId2);
  });

  test('Eliminar el primer goal', async ({ request }) => {
    const response = await request.delete(`goals/${goalId1}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([200, 204]).toContain(response.status());
  });

  test('Goal eliminado ya no debe existir', async ({ request }) => {
    const response = await request.get(`goals/${goalId1}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    expect([404, 400]).toContain(response.status());
  });
});