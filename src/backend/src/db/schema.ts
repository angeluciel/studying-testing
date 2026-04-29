import { pgTable, text, pgEnum, timestamp, boolean, uuid } from 'drizzle-orm/pg-core';

import { timestamps } from '@/utils/columns.helper';
import generateNanoId from '@/utils/idGen';

const rolesEnum = pgEnum('role', ['user', 'admin']);

export const usersTable = pgTable('users', {
  id: text()
    .primaryKey()
    .$defaultFn(() => generateNanoId()),
  email: text().notNull().unique(),
  name: text().notNull(),
  surname: text().notNull(),
  password_hash: text().notNull(),
  email_confirmed: boolean().default(false).notNull(),
  is_active: boolean().default(true).notNull(),
  role: rolesEnum().default('user').notNull(),
  ...timestamps,
});

export const passwordChangeTokensTable = pgTable('password_change_tokens', {
  id: uuid().primaryKey().defaultRandom().notNull(),
  user_id: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  token_hash: text().notNull(),
  expires_at: timestamp().notNull(),
  used_at: timestamp(),
  created_at: timestamp().defaultNow().notNull(),
});
