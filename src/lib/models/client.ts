import { GrantType } from "./auth";

export default interface Client {

  id: string;
  clientId: string;
  grantType: string;
  scopes: string;
  certificate: string;
  certificatePass: string | null;
  currentToken: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastUsedAt: Date | null;

}

export interface ClientConfig {
  fhirBaseUrl: string;
  grantType: GrantType;
  scopes: string;
}
