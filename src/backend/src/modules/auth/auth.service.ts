import { pool } from '../../db/pool';
import { comparePassword, hashPassword } from '../../utils/password';
import { signAccessToken } from '../../utils/jwt';
import { generateRawToken, hashToken } from '../../utils/tokens';
import { sendMailWithTemplate } from '../../utils/mail';
import { PasswordResetEmail } from '../../emails/PasswordResetEmail';
import { env } from '../../config/env';
import { AppError } from '../../middlewares/error.middleware';
import { AuthRepository } from './auth.repository';

export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  async login(email: string, password: string) {
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
  async requestPasswordChange(email: string) {
    const user = await this.authRepository.findByEmail(email);

    if (!user) return;
    const rawToken = generateRawToken();
    const tokenHash = hashToken(rawToken);

    await this.authRepository.inserPasswordChangeToken(user.id, tokenHash);
    const resetLink = `${env.APP_BASE_URL}/reset-password?token=${rawToken}`;

    await sendMailWithTemplate(
      user.email,
      'Reset your password:',
      PasswordResetEmail({ name: user.name, resetLink }),
    );
  }
  async changePassword(token: string, newPassword: string) {
    const tokenHash = hashToken(token);
    const row = await this.authRepository.findValidPasswordChangeTokenByHash(tokenHash);

    if (!row) throw new AppError(400, 'Invalid or expired token');

    const passwordHash = await hashPassword(newPassword);
    await this.authRepository.updatePasswordAndConsumeToken({
      userId: row.user_id,
      tokenId: tokenHash,
      passwordHash: passwordHash,
    });
  }
}
