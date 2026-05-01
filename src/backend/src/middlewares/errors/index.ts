import type { AppError } from '../error.middleware';

export class DuplicateEmailError implements AppError {
  readonly name = 'duplicate_email';
  readonly statusCode = 400;
  readonly message = 'Email already registered.';
}
