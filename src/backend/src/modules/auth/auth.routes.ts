import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authController } from '@/container';

export const authRouter = Router();

// --- All public routes ---
authRouter.post('/login', authController.login);
authRouter.post('/request-password-change', authController.requestPwdChange);
authRouter.post('/change-password', authController.changePwd);
