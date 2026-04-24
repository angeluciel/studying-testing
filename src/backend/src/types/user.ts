export type UserRole = 'admin' | 'user';

export type UserRow = {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  email_confirmed: boolean;
  is_active: boolean;
  created_at: Date;
};

export type CreateUserInput = {
  email: string;
  name: string;
  surname: string;
  passwordHash: string;
  role?: 'admin' | 'user';
};

export type UpdateUserInput = {
  name?: string;
  surname?: string;
};
