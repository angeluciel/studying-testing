import type { NextFunction, Request, Response } from 'express';

import type { UserService } from './users.service';

import { AppError } from '@/middlewares/error.middleware';
import type { AuthenticatedRequest } from '@/types/auth.dto';
import { createUserSchema, updateMeSchema, toUserResponse } from '@/types/user.dto';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (
    req: Request,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const body = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(body);
      if (!user) {
        console.error('createUser erturned undefined for body:', body);
        throw new AppError(400, 'User creation failed.');
      }
      return res.status(201).json(toUserResponse(user));
    } catch (err) {
      next(err);
      return;
    }
  };
  getMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const user = await this.userService.getMe(req.user.id);
      return res.json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  };
  updateMe = async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    try {
      const body = updateMeSchema.parse(req.body);
      const user = await this.userService.updateMe(req.user.id, body);
      return res.json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  };
  deleteUser = async (
    req: Request<{ id: string }>,
    res: Response,
    next: NextFunction,
  ): Promise<Response | undefined> => {
    if (!req.user) {
      throw new AppError(400, 'Unauthorized');
    }
    try {
      const targetUserId = req.params.id;

      if (req.user.role !== 'admin' && req.user.id !== targetUserId) {
        throw new AppError(403, 'Forbidden.');
      }

      await this.userService.deleteUser(targetUserId);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
