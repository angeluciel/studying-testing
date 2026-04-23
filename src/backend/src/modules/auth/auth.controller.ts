import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as authService from './auth.service';
import { loginSchema, requestPasswordChangeSchema, changePasswordSchema } from '@/types/auth.dto';
import { AuthService } from './auth.service';

export class AuthController {
  constructor(private readonly authService: AuthService) {}

  login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = loginSchema.parse(req.body);
      const result = await this.authService.login(body.email, body.password);
      return res.json(result);
    } catch (err) {
      next(err);
    }
  };
  requestPwdChange = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = requestPasswordChangeSchema.parse(req.body);
      await this.authService.requestPwdChange(body.email);
      return res.json({ message: 'if the account exists, a password change email was sent' });
    } catch (err) {
      next(err);
    }
  };
  changePwd = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const body = changePasswordSchema.parse(req.body);
      await this.authService.changePassword(body.token, body.newPassword);
      return res.json({ message: 'Password updates successfully' });
    } catch (err) {
      next(err);
    }
  };
}
