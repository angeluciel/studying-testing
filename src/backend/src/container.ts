import { Db } from './db/pool';
import { UserRepository } from './modules/users/users.repository';
import { UserService } from './modules/users/users.service';
import { UserController } from './modules/users/users.controller';

const userRepository = new UserRepository(Db);
export const userService = new UserService(userRepository);
export const userController = new UserController(userService);

const authRepository = new AuthRepository(pool);
export const authService = new AuthService(authRepository);
export const authController = new AuthController(authService);
