import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';
import { app } from '@/app';
import { createAuthenticatedUser } from '@/tests/helpers/auth';
import { sendMailWithTemplate } from '@/utils/mail';
import { UserRow } from '@/types/user';
import { AppError } from '@/middlewares/error.middleware';
import { pool } from '@/db/pool';

vi.mock('../../utils/mail', () => ({
  sendMailWithTemplate: vi.fn(),
}));
vi.mock('../db', () => ({
  pool: { query: vi.fn() },
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

  it('returns 200 with authenticated user data', async () => {
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
      emailConfirmed: expect.any(Boolean),
      isActive: expect.any(Boolean),
      createdAt: expect.any(String),
    });
  });

  it('returns 404 if user no longer exists', async () => {
    const { user, token } = await createAuthenticatedUser('user');

    await pool.query('DELETE FROM users WHERE id = $1', [user.id]);

    const response = await request(app).get('/users/me').auth(token, { type: 'bearer' });

    expect(response.status).toBe(404);
    expect(response.body).toMatchObject({ message: 'User not found.' });
  });
});

/**
 * Validate:
 *  if duplicate email, should error and return that
 *  if email invalid, should error and return invalid
 *  if weak password, should error and return weak password
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
      'Welcome - Your account is ready.',
      expect.anything(),
    );
    expect(response.body.email).toBe('teste@example.com');
    expect(response.body).toMatchObject({
      id: expect.any(String),
      email: 'teste@example.com',
      name: 'teste',
      surname: 'testando',
      role: 'user',
      emailConfirmed: false,
      isActive: expect.any(Boolean),
      createdAt: expect.any(String),
    });
    expect(response.body.password).toBeUndefined();
    expect(response.body.password_hash).toBeUndefined();
  });

  describe('business rules', () => {
    it.todo('creates role=user even if role=admin is sent', async () => {});
  });

  describe('email validation', () => {
    it('returns 409 if email already exists', async () => {
      const emailToBeTested = 'single@email.com';

      await request(app).post('/users').send({
        email: emailToBeTested,
        name: 'first',
        surname: 'user',
        password: '1234567890abcdefghijklmnopqrstuvwxyz',
      });

      vi.mocked(sendMailWithTemplate).mockClear();

      const response = await request(app).post('/users').send({
        email: emailToBeTested,
        name: 'second',
        surname: 'user',
        password: '1234567890abcdefghijklmnopqrstuvwxyz',
      });

      expect(response.status).toBe(409);
      expect(response.body).toMatchObject({ message: 'Email already exists.' });
      expect(sendMailWithTemplate).not.toHaveBeenCalled();
    });
    it('returns 400 when email format is invalid', async () => {
      const response = await request(app).post('/users').send({
        email: 'testandoErrorTop',
        name: 'teste',
        surname: 'testando',
        password: '1234567890abcdefghijklmnopqrstuvwxyz',
      });

      expect(response.status).toBe(400);
      expect(response.body).toMatchObject({
        issues: {
          fieldErrors: {
            email: ['Invalid email.'],
          },
        },
      });
    });
  });

  describe('field validation', () => {
    it.each([
      [{ email: 'a@b.com', surname: 'x', password: '...' }, 'name'],
      [{ email: 'a@b.com', name: '', surname: 'x', password: '...' }, 'name'],
      [{ email: 'a@b.com', name: 'x', password: '...' }, 'surname'],
      [{ email: 'a@b.com', name: 'x', surname: '', password: '...' }, 'surname'],
      [{ email: 'a@b.com', name: 'x', surname: 'x' }, 'password', 'Password is missing.'],
      [
        { email: 'a@b.com', name: 'x', surname: 'x', password: 'abc' },
        'password',
        'Password is too weak.',
      ],
      [{ name: 'x', surname: 'x', password: '...' }, 'email', 'Email is required.'],
      [{ email: '', name: 'x', surname: 'x', password: '...' }, 'email', 'Email is required.'],
    ])('returns 400 for invalid field - %j', async (body, field, message?) => {
      const response = await request(app).post('/users').send(body);
      expect(response.status).toBe(400);
      expect(response.body.issues.fieldErrors).toHaveProperty(field);

      if (message) {
        expect(response.body.issues.fieldErrors[field]).toContain(message);
      }
    });
  });

  describe('error handling', () => {
    it('re-throws AppError as-is', async () => {
      const appError = new AppError(409, 'User already exists');
    });
    it('wraps unexpected errors in a 500 AppError', async () => {
      // vi.mocked(pool.query).mockRejectedValue(new AppError(400, 'DB connection failed'))
    });
  });
});

/**
 * Validate:
 *  return 401 if no token
 *  return 401 if trying to update password
 *  return 400 if name = blank
 *  return 400 if surname if blank
 *  return 400 if both fields are missing from the body
 *  return 200 with updated user when name is changed
 *  return 200 with updated user when surname is changed
 *  return 200 with updates user when both are changed
 *  return 200 and keeps original name when only surname is provided
 *  return 200 and keeps original surname when only name is provided
 */

describe('PATCH /users/me', async () => {
  it('return 401 if no token', async () => {
    const response = await request(app).patch('/users/me');

    expect(response.status).toBe(401);
    expect(response.body).toMatchObject({
      message: 'Missing or invalid token',
    });
  });

  describe('data validation', () => {
    let user: UserRow;
    beforeAll(async () => {
      ({ user } = await createAuthenticatedUser('user'));
      return user;
    });

    it.each([['blank name'], ['blank surname'], ['both blank'], ['both missing']])(
      'returns 400 when %s',
      async (scenario) => {
        const bodies: Record<string, object> = {
          'blank name': { name: '', surname: 'x' },
          'blank surname': { name: 'x', surname: '' },
          'both blank': { name: '', surname: '' },
          'both missing': {},
        };
        const { token } = await createAuthenticatedUser('user');
        const result = await request(app)
          .patch('/users/me')
          .send(bodies[scenario])
          .auth(token, { type: 'bearer' });

        expect(result.status).toBe(400);
      },
    );
  });
});
