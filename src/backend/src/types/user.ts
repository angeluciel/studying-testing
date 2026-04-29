export type UserRole = 'admin' | 'user';

export interface UserRow {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: UserRole;
  email_confirmed: boolean;
  is_active: boolean;
  created_at: Date;
}

export interface CreateUserInput {
  email: string;
  name: string;
  surname: string;
  passwordHash: string;
  role?: 'admin' | 'user';
}

export interface UpdateUserInput {
  name?: string;
  surname?: string;
}
