import { sqliteTable, text } from "drizzle-orm/sqlite-core";
import { db } from "..";
import { GrantType } from "@/lib/models/auth";
import { and, eq } from "drizzle-orm";
import { ClientConfig } from "@/lib/models/client";


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



export async function getClientsByConfig(clientConfig: ClientConfig) {
  return await db
    .select()
    .from(clientsTable)
    .where(
      and(
        eq(clientsTable.fhirBaseUrl, clientConfig.fhirServer),
        eq(clientsTable.grantTypes, clientConfig.grantTypes?.join(" ") || ""),
        eq(clientsTable.scopesRequested, clientConfig.scopes || "")
      )
    )
    .all();

}
