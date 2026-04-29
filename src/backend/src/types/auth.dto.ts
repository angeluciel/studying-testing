import z from 'zod';

export const loginSchema = z.object({
  email: z.email(),
  password: z.string().min(8, { error: 'Password too short.' }),
});

export const requestPasswordChangeSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});

export interface AuthenticatedRequest extends Request {
  user: { id: string; role: string; email: string };
}
