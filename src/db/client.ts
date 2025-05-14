import { ClientConfig } from "@/lib/models/client";
import { db } from ".";
import { clientsTable } from "./schema";
import { and, eq } from "drizzle-orm";

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