import z from 'zod';
import { UserRow } from './user';

// --- Schemas ---
export const createUserSchema = z.object({
  email: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Email is required.' : 'Invalid input.'),
    })
    .min(1, { error: 'Email is required.' })
    .pipe(z.email({ error: 'Invalid email.' })),
  name: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Name is missing.' : 'Invalid name.'),
    })
    .min(1, { error: 'Name is required.' }),
  surname: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Surname is missing.' : 'Invalid surname.'),
    })
    .min(1, { error: 'Surname is required.' }),
  password: z
    .string({
      error: (issue) => (issue.input === undefined ? 'Password is missing.' : 'Invalid password.'),
    })
    .min(8, { error: 'Password is too weak.' }),
  role: z.enum(['admin', 'user']).optional(),
});

export const updateMeSchema = z
  .object({
    name: z.string().min(1, 'Name is required.').optional(),
    surname: z.string().min(1, 'Surname is required.').optional(),
  })
  .superRefine((data, ctx) => {
    if (!data.name && !data.surname) {
      ctx.addIssue({
        code: 'custom',
        message: "At least one of 'name' or 'surname' must be provided.",
        path: ['name'],
      });
    }
  });

// --- Input Types (inferred) ---
export type CreateuserDto = z.infer<typeof createUserSchema>;
export type UpdateMeDto = z.infer<typeof updateMeSchema>;

// --- Resposne Types
export type UserResponseDto = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: 'admin' | 'user';
  emailConfirmed: boolean;
  isActive: boolean;
  createdAt: string;
};

export function toUserResponse(row: UserRow): UserResponseDto {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    surname: row.surname,
    role: row.role,
    emailConfirmed: row.email_confirmed,
    isActive: row.is_active,
    createdAt: row.created_at.toISOString(),
  };
}
