import { appConfig } from "@/config";
import { UdapClientRequest } from "../models/auth";
import { ClientConfig } from "../models/client";
import { getBaseUrl } from "./http";

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
    request.redirectUris = config.redirectUris ?? [appConfig.appUrl];
    request.logoUri = config.logoUri || 'https://build.fhir.org/icon-fhir-16.png';
  }

  return request;
}