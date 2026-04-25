import { hashPassword } from '@/utils/password';
import { sendMailWithTemplate } from '@/utils/mail';
import { WelcomeEmail } from '@/emails/WelcomeEmail';
import { env } from '@/config/env';
import { UpdateUserInput, UserRow } from '@/types/user';
import { AppError } from '@/middlewares/error.middleware';
import { UserRepository } from './users.repository';
import { DatabaseError } from 'pg';

export type CreateUserInput = {
  email: string;
  name: string;
  surname: string;
  password: string;
  role?: 'admin' | 'user';
};

export class UserService {
  constructor(private readonly userRepo: UserRepository) {}

  async createUser(input: CreateUserInput) {
    const passwordHash = await hashPassword(input.password);

    try {
      const user = await this.userRepo.create({ ...input, passwordHash });

      await sendMailWithTemplate(
        user.email,
        'Welcome - Your account is ready.',
        WelcomeEmail({
          name: user.name,
          email: user.email,
          tempPassword: input.password,
          loginUrl: `${env.APP_BASE_URL}/login`,
        }),
      );

      return user;
    } catch (err: unknown) {
      if (
        (err instanceof DatabaseError && err.code === '23505') ||
        (err instanceof Error && err.cause instanceof DatabaseError && err.cause.code === '23505')
      ) {
        throw new AppError(409, 'Email already exists.');
      }
      if (err instanceof AppError) {
        throw err;
      }

      throw new AppError(500, 'An unexpected error occurred.');
    }
  }

  async getMe(userId: string) {
    const user = await this.userRepo.findById(userId);
    if (!user) throw new AppError(404, 'User not found.');
    return user;
  }

  async updateMe(userId: string, data: UpdateUserInput) {
    const user = await this.userRepo.update(userId, data);
    if (!user) throw new AppError(404, 'User not found.');

    return user;
  }
  async deleteUser(userId: string) {
    await this.userRepo.delete(userId);
  }
}
