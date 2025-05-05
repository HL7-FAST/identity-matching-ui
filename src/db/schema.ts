
import { sqliteTable, text } from "drizzle-orm/sqlite-core";



export const sessionsTable = sqliteTable("sessions", {
  sid: text().primaryKey(),
  expired: text().notNull(),
  sess: text().notNull(),
});



export const clientsTable = sqliteTable("clients", {
  id: text().primaryKey().$default(() => crypto.randomUUID()),
  fhirBaseUrl: text().notNull(),

  /**
   * This refers to the clientId on the auth server
   */
  clientId: text().notNull(),

  /**
   * client_credential or authorization_code
   */
  grantTypes: text().notNull(),

  /**
   * Space delimited list of scopes requested by the client
   */
  scopesRequested: text().notNull(),

  /**
   * Space delimited list of scopes granted by the auth server
   */
  scopesGranted: text().notNull(),

  redirectUris: text(),

  // endpoints
  authorizationEndpoint: text(),
  userinfoEndpoint: text(),
  tokenEndpoint: text().notNull(),
  revocationEndpoint: text(),

  // certificate data
  certificate: text().notNull(),
  certificatePass: text(),

  // timestamps
  createdAt: text().notNull().$default(() => new Date().toUTCString()),
  updatedAt: text().notNull().$default(() => new Date().toUTCString()),
  lastUsedAt: text()
});

