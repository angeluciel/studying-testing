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
