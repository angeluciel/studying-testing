import { it, expect, describe } from 'vitest';
import request from 'supertest';
import { app } from '@/app';
import { Auth } from '@/tests/helpers/auth';
import { Db } from '@/db/pool';

const auth = new Auth(Db);

describe('/POST login', () => {
  it('sucesso no login', async () => {
    const user = await auth.createUser('admin');

    const response = await request(app).post('/auth/login').send({
      email: user.user.email,
      password: '1234567890',
    });
    expect(response.statusCode).toBe(200);
  });

  it('retorna 401 quando email não está cadastrado', async () => {
    const response = await request(app).post('/auth/login').send({
      email: 'inexistente@email.com',
      password: '1234567890',
    });

    expect(response.statusCode).toBe(401);
    expect(response.body).toEqual({ message: 'Invalid credentials.' });
  });

  it('retorna 400 quando email está ausente', async () => {
    const response = await request(app).post('/auth/login').send({
      email: '',
      password: '1234567890',
    });

    expect(response.statusCode).toBe(400);
    expect(response.body).toMatchObject({
      issues: {
        fieldErrors: {
          email: ['Email is required.'],
        },
      },
    });
  });
});
