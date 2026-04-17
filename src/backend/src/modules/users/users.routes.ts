import { Router } from 'express';
import * as controller from './users.controller';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/requireRole.middleware';

export const usersRouter = Router();

usersRouter.post('/', controller.createUser);

usersRouter.use(authMiddleware);

usersRouter.get('/me', controller.getMe);
usersRouter.patch('/me', controller.updateMe);
usersRouter.delete('/:id', controller.deleteUser);
