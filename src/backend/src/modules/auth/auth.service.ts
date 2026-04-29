import type { AuthRepository } from './auth.repository';

import { env } from '@/config/env';
import { PasswordResetEmail } from '@/emails/PasswordResetEmail';
import { AppError } from '@/middlewares/error.middleware';
import { signAccessToken } from '@/utils/jwt';
import { sendMailWithTemplate } from '@/utils/mail';
import { comparePassword, hashPassword } from '@/utils/password';
import { generateRawToken, hashToken } from '@/utils/tokens';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(email: string, password: string): Promise<{ accessToken: string }> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) throw new AppError(401, 'Invalid credentials.');
    if (!user.is_active) throw new AppError(401, 'Invalid credentials.');

    const valid = await comparePassword(password, user.password_hash);
    if (!valid) throw new AppError(401, 'Invalid credentials.');

    const accessToken = signAccessToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });
    return { accessToken };
  }
  async requestPwdChange(email: string): Promise<void> {
    const user = await this.authRepository.findByEmail(email);

    if (!user) return;
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    await this.authRepository.insertPwdChangeTk(user.id, tokenHash);
    const resetLink = `${env.APP_BASE_URL}/reset-password?token=${rawToken}`;

    await sendMailWithTemplate(
      user.email,
      'Reset your password:',
      PasswordResetEmail({ name: user.name, resetLink }),
    );
  }
  async changePassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = hashToken(token);
    const row = await this.authRepository.findPwdChangeTkByHash(tokenHash);

    if (!row) throw new AppError(400, 'Invalid or expired token');

    const passwordHash = await hashPassword(newPassword);
    await this.authRepository.updatePwdAndConsumeTk({
      userId: row.user_id,
      tokenId: tokenHash,
      passwordHash: passwordHash,
    });
  }
}
