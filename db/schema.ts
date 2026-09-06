import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const wallet = sqliteTable('wallet', {id:integer('id').primaryKey(),data:text('data').notNull(),revision:integer('revision').notNull()});
