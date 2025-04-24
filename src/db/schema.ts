import { sqliteTable, text } from "drizzle-orm/sqlite-core";


export const sessionsTable = sqliteTable("sessions", {
  sid: text().primaryKey(),
  expired: text().notNull(),
  sess: text().notNull(),
});

export const clientsTable = sqliteTable("clients", {
  id: text().primaryKey().$default(() => crypto.randomUUID()),
  clientId: text().notNull(),
  grantType: text().notNull(),
  scopes: text().notNull(),
  certificate: text().notNull(),
  certificatePass: text(),
  currentToken: text(),
  createdAt: text().notNull().$default(() => new Date().toISOString()),
  updatedAt: text().notNull().$default(() => new Date().toISOString()),
  lastUsedAt: text()
});
