import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '../../app';
import { createAuthenticatedUser } from '../../tests/helpers/auth';
import { signAccessToken } from '../../utils/jwt';
import { UserRow } from '../../types/user';
import { sendMailWithTemplate } from '../../utils/mail';

vi.mock('../../emails/WelcomeEmail', () => ({
  sendMailWithTemplate: vi.fn(),
}));

describe('GET /health', () => {
  it('returns 200 with ok: true', async () => {
    const response = await request(app).get('/health');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });
});

/**
 * Either fail because user is unathorized or pass with authorization
 */
describe('GET /users/me', () => {
  it('returns 401 unauthorized', async () => {
    const response = await request(app).get('/users/me');
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Missing or invalid token' });
  });

  it("returns 200 with authenticated user's data", async () => {
    // seed test db
    const { user, token } = await createAuthenticatedUser('admin');
    const response = await request(app).get('/users/me').auth(token, { type: 'bearer' });

    expect(response.status).toBe(200);
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: user.email,
      name: user.name,
      surname: user.surname,
      role: user.role,
      email_confirmed: expect.any(Boolean),
      is_active: expect.any(Boolean),
      created_at: expect.any(String),
    });
  });
});

/**
 * Validate:
 *  if duplicate email, should error and return that
 *  if email invalid, should error and return that
 *  if weak password, should error and return that
 *  if email valid, should succeed and return user data
 *
 */
describe('POST /users', () => {
  it('returns 201 and creates a user with normalized email', async () => {
    const response = await request(app).post('/users').send({
      email: 'TESTE@EXAMPLE.com',
      name: 'teste',
      surname: 'testando',
      password: '1234567890abcdefghijklmnopqrstuvwxyz',
    });

    expect(response.status).toBe(201);
    expect(sendMailWithTemplate).toHaveBeenCalledTimes(1);
    expect(sendMailWithTemplate).toHaveBeenCalledWith(
      'teste@example.com',
      'Welcome — your account is ready',
      expect.any(String),
    );
    expect(response.body.email).toBe('teste@example.com');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: 'teste@example.com',
      name: 'teste',
      surname: 'testando',
      role: 'user',
      email_confirmed: false,
      is_active: expect.any(Boolean),
      created_at: expect.any(String),
    });
    expect(response.body.password).toBeUndefined();
    expect(response.body.password_hash).toBeUndefined();
  });
});
