import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const sessionsTable = sqliteTable("sessions", {
  sid: text().primaryKey(),
  expired: text().notNull(),
  sess: text().notNull(),
});
