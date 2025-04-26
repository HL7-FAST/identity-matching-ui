import { sqliteTable, text } from "drizzle-orm/sqlite-core";


export const sessionsTable = sqliteTable("sessions", {
  sid: text().primaryKey(),
  expired: text().notNull(),
  sess: text().notNull(),
});

export const clientsTable = sqliteTable("clients", {
  id: text().primaryKey().$default(() => crypto.randomUUID()),
  fhirBaseUrl: text().notNull(),

  // clientId on the auth server
  clientId: text().notNull(),
  grantTypes: text().notNull(),
  scopes: text().notNull(),

  // endpoints
  authorizationEndpoint: text(),
  userinfoEndpoint: text(),
  tokenEndpoint: text().notNull(),

  // certificate data
  certificate: text().notNull(),
  certificatePass: text(),

  // current access token
  currentToken: text(),

  // timestamps
  createdAt: text().notNull().$default(() => new Date().toUTCString()),
  updatedAt: text().notNull().$default(() => new Date().toUTCString()),
  lastUsedAt: text()
});
