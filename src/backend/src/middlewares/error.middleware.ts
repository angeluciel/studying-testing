import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';

import { logger } from '../utils/logger';

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
  ) {
    super(message);
  }
}

export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({
      message: 'validation error',
      issues: err.flatten((issue) => issue.message),
    });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  if (err instanceof Error && (err as NodeJS.ErrnoException & { code?: string }).code === '23505') {
    return res.status(409).json({ message: 'Resource already exists.' });
  }

  logger.error(err);
  return res.status(500).json({ message: 'Internal server error' });
}
