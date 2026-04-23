import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as usersService from './users.service';
import { AppError } from '../../middlewares/error.middleware';
import { UserService } from './users.service';
import { createUserSchema, updateMeSchema, toUserResponse } from '../../types/user.dto';

export class UserController {
  constructor(private readonly userService: UserService) {}

  createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = createUserSchema.parse(req.body);
      const user = await this.userService.createUser(body);
      return res.status(201).json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  };
  getMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await this.userService.getMe(req.user!.id);
      return res.json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  };
  updateMe = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = updateMeSchema.parse(req.body);
      const user = await this.userService.updateMe(req.user!.id, body);
      return res.json(toUserResponse(user));
    } catch (err) {
      next(err);
    }
  };
  deleteUser = async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
    try {
      const targetUserId = req.params.id;

      if (req.user!.role !== 'admin' && req.user!.id !== targetUserId) {
        return next(new AppError(403, 'Forbidden.'));
      }

      await this.userService.deleteUser(targetUserId);
      return res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
