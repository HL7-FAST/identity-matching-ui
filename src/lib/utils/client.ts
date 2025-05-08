import { appConfig } from "@/config";
import { UdapClientRequest } from "../models/auth";
import { Client, ClientConfig, ClientDTO } from "../models/client";
import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { Request, Response } from "express";
import { eq } from "drizzle-orm";
import { getClientsByConfig } from "@/db/client";
import { encryptCertificatePassword, getGeneratedCertificate, getSubjectAltName, loadCertificate } from "./cert";
import { registerClient } from "./udap";

export function clientConfigToClientRequest(config: ClientConfig): UdapClientRequest {

  const request: UdapClientRequest = {
    fhirServer: config.fhirServer,
    grantTypes: config.grantTypes,
    issuer: config.issuer ?? new URL(appConfig.appUrl).href,
    clientName: config.clientName || `Identity Matching Client ${Math.floor(new Date().getTime() / 1000)}`,
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


export async function createClient(client: ClientConfig): Promise<Client> {


  console.log(`Creating client for ${client.fhirServer} (${client.grantTypes.join(',')}) using provider ${client.certGenerationProvider || 'not specified'}`);

  // check if the client already exists in the database
  // still need to run registration in the event the auth server doesn't have this client anymore
  const existingClients = await getClientsByConfig(client);
  let existingClient: Client | undefined = undefined;
  if (existingClients.length > 0) {
    existingClient = existingClients[0];

    // client issuer needs to match the certificate subject alt name
    const cert = await loadCertificate(existingClient.certificate, existingClient.certificatePass || appConfig.defaultCertPass);
    const san = getSubjectAltName(cert);
    console.log('Existing client SAN:', san);
    if (san !== client.issuer) {
      client.issuer = san.replace('URI:', '');
    }
  }
  

  try {
    let certString = existingClient ? existingClient.certificate : client.certificate;
    let encryptedCertPass = (existingClient?.certificatePass) || encryptCertificatePassword(client.certificatePass || appConfig.defaultCertPass);

    // if a certificate is provided, attempt to load it
    try {

      if (!certString) {
        
        if (!appConfig.certGenerationEndpoint) {
          const msg = `No certificate configured for ${client.fhirServer} (${client.grantTypes.join(',')}) and no certificate provider configured.`;
          console.error(msg);
          throw new Error(msg);
        }

        const certProvider = client.certGenerationProvider || 'Local';
        console.log(`Generating certificate for ${client.fhirServer} (${client.grantTypes.join(',')}) using ${certProvider}`);

        const subjectAltName = `${new URL(appConfig.appUrl).href}#${crypto.randomUUID()}`;
        client.issuer = subjectAltName;

        certString = await getGeneratedCertificate(
          [subjectAltName],
          appConfig.defaultCertPass,
          appConfig.certGenerationEndpoint,
          certProvider
        );

        if (!certString) {
          const msg = `Failed to generate certificate for ${client.fhirServer} (${client.grantTypes.join(',')}). Certificate provider returned empty string.`;
          console.error(msg);
          throw new Error(msg);
        }

        console.log(`Generated certificate for ${client.fhirServer}`);
      }

    } catch (error) {
      // skip this client if the certificate cannot be loaded
      const msg = `Error loading certificate for ${client.fhirServer} (${client.grantTypes.join(',')}): ${error}`;
      console.error(msg);
      throw new Error(msg);
    }

    const request = clientConfigToClientRequest(client);
    const newClient = await registerClient(request, certString, encryptedCertPass, existingClient);
    console.log(`Client ${newClient.id} with client ID ${newClient.clientId} registered for ${client.fhirServer}`);

    return newClient;
    
  } catch (error) {
    const msg = `Error registering client for ${client.fhirServer} (${client.grantTypes.join(',')}): ${error}`;
    console.error(msg);
    throw new Error(msg);
  }

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
export async function getCurrentClient(req: Request, returnDefault: boolean = false, preferGrantType: 'authorization_code'|'client_credentials' = 'client_credentials'): Promise<Client | null> {

  // Get the client from the session
  const id = req.session.currentClient;
  
  let client: Client | null = null;
  
  if (id) {
    const clientsFound = await db.select().from(clientsTable).where(eq(clientsTable.id, id)).limit(1);
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

  if (client) {
    await db.update(clientsTable).set({ lastUsedAt: new Date().toISOString() }).where(eq(clientsTable.id, client.id)).execute();
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

  if (!message) {

    if (!req.session.currentClient && !req.session.fhirServer) {
      message = 'No client or FHIR server selected for current session';
    }
    else if (!req.session.currentClient && req.session.fhirServer) {
      message = `No client available for FHIR server: ${req.session.fhirServer}`;
    }
    else if (!req.session.fhirServer) {
      message = `No FHIR server selected for current session`;
    }
    else {
      message = 'No client available for current session';
    }
  }

  res.status(400);
  res.json({ message });
  
}


export function clientToDTO(client: Client): ClientDTO {
  return {
    id: client.id,
    fhirBaseUrl: client.fhirBaseUrl,
    grantTypes: client.grantTypes,
    scopesRequested: client.scopesRequested,
    scopesGranted: client.scopesGranted,
    redirectUris: client.redirectUris,
    authorizationEndpoint: client.authorizationEndpoint,
    userinfoEndpoint: client.userinfoEndpoint,
    tokenEndpoint: client.tokenEndpoint,
    revocationEndpoint: client.revocationEndpoint,
    createdAt: client.createdAt,
    updatedAt: client.updatedAt,
    lastUsedAt: client.lastUsedAt,
  };
}