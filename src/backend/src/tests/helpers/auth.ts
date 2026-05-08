import { SeedUtils } from '@/db/seed';
import { UserRow } from '@/types/user';
import { signAccessToken } from '@/utils/jwt';
import { DrizzleDb } from '@/db/pool';

export class Auth {
  private readonly seed: SeedUtils;

  constructor(private readonly db: DrizzleDb) {
    this.seed = new SeedUtils(db);
  }

  // esse metodo e chamado diretamente nos testes, entao tem que ser arrow function
  createUser = async (role: UserRow[`role`]) => {
    const user: UserRow = await this.seed.seedUser('j@a.com', role);

    const token: string = signAccessToken({
      sub: user.id,
      role: user.role,
      email: user.email,
    });

    return { user, token };
  };
}
