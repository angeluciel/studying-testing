import { seedAdminUser, seedRegularUser } from '../../db/seed';
import { UserRow } from '../../types/user';
import { signAccessToken } from '../../utils/jwt';

export async function createAuthenticatedUser(role: UserRow['role']) {
  const user: UserRow = role === 'admin' ? await seedAdminUser() : await seedRegularUser();

  const token: string = signAccessToken({
    sub: user.id,
    role: user.role,
    email: user.email,
  });

  return { user, token };
}
