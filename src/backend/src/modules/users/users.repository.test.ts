import request from 'supertest';
import { describe, it, expect, vi } from 'vitest';

import { app } from '@/app';
/* import { AppError } from '@/middlewares/error.middleware'; */
import { sendMailWithTemplate } from '@/utils/mail';

vi.mock('../../utils/mail', () => ({
  sendMailWithTemplate: vi.fn(),
}));
vi.mock('../db', () => ({
  pool: { query: vi.fn() },
}));

describe('POST /users', () => {
  it('WB_TEST sends welcome email to normalized address', async () => {
    await request(app).post('/users').send({
      email: 'TESTE@EXAMPLE.com',
      name: 'teste',
      surname: 'testando',
      password: 'abcdefghijklmnopqrstuvwxyz',
    });

    expect(sendMailWithTemplate).toHaveBeenCalledTimes(1);
    expect(sendMailWithTemplate).toHaveBeenCalledWith(
      'teste@example.com',
      'Welcome - Your account is ready.',
      expect.anything(),
    );
  });

  /* describe('error handling', () => {
    it('re-throws AppError as-is', async () => {
      const appError = new AppError(409, 'User already exists');
    });
    it('wraps unexpected errors in a 500 AppError', async () => {
      await vi.mocked(pool.query).mockRejectedValue((400, 'DB connection failed'))
    });
  }); */
});
