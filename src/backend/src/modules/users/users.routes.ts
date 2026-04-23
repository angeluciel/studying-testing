import { Router } from 'express';
import { userController } from '../../container';
import { authMiddleware } from '../../middlewares/auth.middleware';
import { requireRole } from '../../middlewares/requireRole.middleware';

export const usersRouter = Router();

// --- Public routes ---
usersRouter.post('/', userController.createUser);

// --- Protected routes ---
usersRouter.use(authMiddleware);
usersRouter.get('/me', userController.getMe);
usersRouter.patch('/me', userController.updateMe);
usersRouter.delete('/:id', userController.deleteUser);
