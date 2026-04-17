import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as usersService from './users.service';
import { AppError } from '../../middlewares/error.middleware';

const createUserSchema = z.object({
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Email is required.' : 'Invalid input.'),
    })
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email.' })),
  name: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Name is missing.' : 'Invalid name.'),
    })
    .min(1, { error: 'Name is required.' }),
  surname: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Surname is missing.' : 'Invalid surname.'),
    })
    .min(1, { error: 'Surname is required.' }),
  password: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Password is missing.' : 'Invalid password.'),
    })
    .min(8, { error: 'Password is too weak.' }),
  role: z.enum(['admin', 'user']).optional(),
});

const updateMeSchema = z
  .object({
      name: z   
    .string({
      error: (issue) => (issue.input === undefined ? 'Name is missing.' : 'Invalid name.'),
    }),
  surname: z.string().min(1).optional(),
});

export async function createUser(req: Request, res: Response, next: NextFunction) {
  try {
    const body = createUserSchema.parse(req.body);
    const user = await usersService.createUser(body);
    return res.status(201).json(user);
  } catch (err) {
    next(err);
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await usersService.getMe(req.user!.id);

    if (!user) {
      return next(new AppError(404, 'User not found'));
    }

    return res.json(user);
  } catch (err) {
    //TODO: test 57 downards
    next(err);
  }
}

export async function updateMe(req: Request, res: Response, next: NextFunction) {
  try {
    const body = updateMeSchema.parse(req.body);
    const user = await usersService.updateMe(req.user!.id, body);
    return res.json(user);
  } catch (err) {
    next(err);
  }
}

export async function deleteUser(req: Request<{ id: string }>, res: Response, next: NextFunction) {
  try {
    const targetUserId = req.params.id;

    if (req.user!.role !== 'admin' && req.user!.id !== targetUserId) {
      return next(new AppError(403, 'Forbidden'));
    }

    await usersService.deleteUser(targetUserId);

    return res.status(204).send();
  } catch (err) {
    next(err);
  }
}
