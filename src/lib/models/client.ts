import { GrantType } from "./auth";

export interface Client {
  id: string | null;
  fhirServer: string;
  clientId: string;
  grantTypes: GrantType[];
  scopes: string;

  authorizationEndpoint?: string;
  userinfoEndpoint?: string;
  tokenEndpoint: string;

  certificate: string;
  certificatePass: string | null;

  currentToken?: string;

  createdAt: Date;
  updatedAt: Date;
  lastUsedAt?: Date | null;
}

export interface ClientConfig {
  fhirServer: string;
  grantTypes: GrantType[];  
  clientName?: string;
  issuer?: string;
  contacts?: string[];
  logoUri?: string;
  scopes?: string;
  redirectUris?: string[];

  certificate?: string;
  certificatePass?: string;
}

export type ClientRegistration = ClientConfig;
