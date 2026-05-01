import z from 'zod';

export const loginSchema = z.object({
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Email is required.' : 'Invalid input.'),
    })
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email.' }))
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8, { error: 'Password too short.' }),
});

export const requestPasswordChangeSchema = z.object({
  email: z.email(),
});

export const changePasswordSchema = z.object({
  token: z.string().min(1),
  newPassword: z.string().min(8),
});
