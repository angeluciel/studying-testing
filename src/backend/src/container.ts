import { pool } from './db/pool';
import { UserRepository } from './modules/users/users.repository';
import { UserService } from './modules/users/users.service';
import { UserController } from './modules/users/users.controller';

import { AuthRepository } from './modules/auth/auth.repository';
import { AuthService } from './modules/auth/auth.service';
import { AuthController } from './modules/auth/auth.controller';

const userRepository = new UserRepository(pool);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

const authRepository = new AuthRepository(pool);
export const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);
