import type { User } from './user';

declare module 'http' {
  interface IncomingMessage {
    user?: User;
  }
}
