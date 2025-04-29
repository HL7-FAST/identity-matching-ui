import { appConfig } from "@/config";
import { UdapClientRequest } from "../models/auth";
import { Client, ClientConfig } from "../models/client";
import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";

export function clientConfigToClientRequest(config: ClientConfig): UdapClientRequest {

  const request: UdapClientRequest = {
    fhirServer: config.fhirServer,
    grantTypes: config.grantTypes,
    issuer: config.issuer ?? new URL(appConfig.appUrl).href,
    clientName: config.clientName || "Identity Matching Client",
    contacts: config.contacts || ['mailto:tester@localhost'],
    scopes: config.scopes?.split(' ') || [
      config.grantTypes.includes('authorization_code') ? 'openid' : 'system/*read',
    ],
  };

  if (config.grantTypes.includes('authorization_code')) {
    request.redirectUris = config.redirectUris ?? [appConfig.appUrl + '/api/auth/callback'];
    request.logoUri = config.logoUri || 'https://build.fhir.org/icon-fhir-16.png';
  }

  return request;
}



export function getCurrentFhirServerUrl(req: Request): string {
  // Should use the current server from the session if available
  if (req.session.fhirServer) {
    return req.session.fhirServer;
  }

  // Otherwise, use the default server
  return appConfig.defaultFhirBaseUrl;
}


/**
 * 
 * @param req Incoming express request
 * @param returnDefault If true, will attempt to return a default client if no client is found in the session
 * @param preferGrantType The grant type to prefer when selecting a default client
 * @returns 
 */
export async function getCurrentClient(req: Request, returnDefault: boolean = true, preferGrantType: 'authorization_code'|'client_credentials' = 'client_credentials'): Promise<Client | null> {

  // Get the client from the session
  const clientId = req.session.currentClient;
  
  let client: Client | null = null;
  
  if (clientId) {
    const clientsFound = await db.select().from(clientsTable).where(eq(clientsTable.clientId, clientId)).limit(1);
    if (clientsFound.length > 0) {
      client = clientsFound[0];
    }
  }

  // No client yet, so get a default client for this FHIR server
  if (!client && returnDefault) {

    const fhirBase = getCurrentFhirServerUrl(req);
    const clientsFound = await db.select().from(clientsTable).where(eq(clientsTable.fhirBaseUrl, fhirBase));
    if (clientsFound.length > 0) {
      // prefer a client with the given grant type but fallback to the first one if none found
      client = clientsFound.find((c) => c.grantTypes.includes(preferGrantType)) || clientsFound[0];
    }
  }

  return client;

}


/**
 * 
 * @param req Incoming express request
 * @param res Outgoing express response
 * @param message Optional message to return.  Otherwise, a default message will be returned indicating why no client was found.
 */
export function handleNoClient(req: Request, res: Response, message?: string) {
  res.status(400);
  if (message) {
    res.json({ message });
  } else {
    res.json({ 
      message: req.session.fhirServer ? `No client available for FHIR server: ${req.session.fhirServer}` : 'No FHIR server selected for current session'
    });
  }
}