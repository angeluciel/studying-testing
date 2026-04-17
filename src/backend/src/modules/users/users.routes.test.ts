import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '../../app';
import { createAuthenticatedUser } from '../../tests/helpers/auth';
import { sendMailWithTemplate } from '../../utils/mail';
import { createUser } from './users.service';

vi.mock('../../utils/mail', () => ({
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
      expect.anything(),
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

  // BUSINESS RULES
  it('created role=user even if role is admin', async () => {});

  // TEST EMAIL
  it('returns 400 when email is MISSING (no field)', async () => {
    const result = await request(app).post('/users').send({
      name: 'teste',
      surname: 'testando',
      password: '1234567890abcdefghijklmnopqrstuvwxyz',
    });

    expect(result.status).toBe(400);
    expect(result.body).toMatchObject({
      issues: {
        fieldErrors: {
          email: ['Invalid Email'],
        },
      },
    });
  });
  it('returns 409 if email already exists', async () => {
    await createUser({
      email: 'test@example.com',
      name: 'first',
      surname: 'user',
      password: '1234567890abcdefghijklmnopqrstuvwxyz',
    });

    vi.clearAllMocks();

    const response = await request(app).post('/users').send({
      email: 'test@example.com',
      name: 'second',
      surname: 'user',
      password: '1234567890abcdefghijklmnopqrstuvwxyz',
    });

    expect(response.status).toBe(409);
    expect(response.body).toMatchObject({ message: 'Email already exists.' });
    expect(sendMailWithTemplate).not.toHaveBeenCalled();
  });
  it('returns 400 when email format is invalid', async () => {});

  // TEST USER-DATA
  it('returns 400 when name is missing', async () => {});
  it('returns 400 when surname is missing', async () => {});

  // TEST PASSWORD
  it('returns 400 when password is missing', async () => {});
  it('returns 400 when password is too weak', async () => {});
});
