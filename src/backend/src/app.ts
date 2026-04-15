import express from 'express';
import pinoHttp from 'pino-http';
import { authRouter } from './modules/auth/auth.routes';
import { usersRouter } from './modules/users/users.routes';
import { errorMiddleware } from './middlewares/error.middleware';
import { logger } from './utils/logger';

export const app = express();

if (process.env.NODE_ENV !== 'test') {
  app.use(pinoHttp({ logger }));
}
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ ok: true });
});

app.use('/auth', authRouter);
app.use('/users', usersRouter);

app.use(errorMiddleware);
