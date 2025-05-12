import { X509Certificate } from "crypto";
import * as forge from "node-forge";

export type GrantType = 'authorization_code' | 'refresh_token' | 'client_credentials';


export type P12Certificate = forge.pkcs12.Pkcs12Pfx;

export interface UdapClientRequest {
  fhirServer: string;
  grantTypes: GrantType[];
  issuer: string;
  clientName: string;
  contacts: string[];
  scopes: string[];
  redirectUris?: string[];
  logoUri?: string;
}

export interface UdapMetadata {
  udap_versions_supported: ["1"];
  udap_profiles_supported: string[];
  udap_authorization_extensions_supported: string[];
  udap_authorization_extensions_required: string[];
  udap_certifications_supported: string[];
  udap_certifications_required: string[];
  grant_types_supported: ("authorization_code" | "refresh_token" | "client_credentials")[];
  scopes_supported: string[];
  authorization_endpoint?: string;
  token_endpoint: string;
  userinfo_endpoint?: string;
  revocation_endpoint?: string;
  token_endpoint_auth_methods_supported: ["private_key_jwt"];
  token_endpoint_auth_signing_alg_values_supported: string[];
  registration_endpoint: string;
  registration_endpoint_jwt_signing_alg_values_supported: string[];
  signed_metadata: string;
}


export interface UdapX509Header {
  alg: "RS256" | "RS384";
  x5c: X509Certificate;
}

export interface UdapSoftwareStatement {
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  jti: string;
  client_name: string;
  redirect_uris?: string[];
  contacts: string[];
  logo_uri?: string;
  grant_types: string[];
  response_types?: string[] | null;
  token_endpoint_auth_method: ["private_key_jwt"];
  scope: string;
}

export interface UdapRegistration {
  header: UdapX509Header;
  softwareStatement: UdapSoftwareStatement;
}

export interface UdapRegistrationRequest {
  /**
   * Signed JWT containing the software statement
   */
  software_statement: string;
  udap: "1";
}

export interface UdapRegistrationResponse {
  client_id: string;
  software_statement: string;
  iss: string;
  sub: string;
  aud: string;
  exp: number;
  iat: number;
  jti: string;
  client_name: string;
  redirect_uris: string[];
  logo_uri: string;
  contacts: string[];
  grant_types: string[];
  response_types: string[];
  token_endpoint_auth_method: string;
  scope: string;
}

export interface UserInfo {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  email: string;
}
