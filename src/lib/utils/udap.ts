import { P12Certificate, UdapClientRequest, UdapMetadata, UdapRegistration, UdapRegistrationRequest, UdapRegistrationResponse, UdapSoftwareStatement, UdapX509Header } from "../models/auth";
import { Client, ClientConfig, ClientRegistration } from "../models/client";
import * as forge from "node-forge";
import jwt from "jsonwebtoken";
import { getPrivateKey, getX509Certficate, loadCertificate, p12ToBase64 } from "./cert";


/**
 * Registers a new client with the given registration request.
 */
export async function registerClient(regReq: UdapClientRequest, certFile: string, certPassword: string): Promise<Client> {

  // load the certificate
  const cert = await loadCertificate(certFile, certPassword);

  // load udap endpoint for the FHIR base url
  const udapMeta = await discoverUdapEndpoint(regReq.fhirServer);
  // console.log("udapEndpoint", udapMeta);

  // build registration JWT (header and software statement JWT claims)
  const register = await buildRegister(regReq, udapMeta, cert);
  // console.log('register:', register);

  // build registration request body (get the signed software statement JWT)
  const regBody = await buildRequestBody(register, cert);
  // console.log('regBody:', regBody);

  // register client
  const regRes = await sendRegistrationRequest(udapMeta.registration_endpoint, regBody);

  const client: Client = {
    id: "",
    fhirServer: regReq.fhirServer,
    clientId: regRes.client_id,
    grantTypes: regReq.grantTypes,
    scopes: regRes.scope || regReq.scopes.join(" "),
    authorizationEndpoint: udapMeta.authorization_endpoint,
    userinfoEndpoint: udapMeta.userinfo_endpoint,
    tokenEndpoint: udapMeta.token_endpoint,
    certificate: certFile,
    certificatePass: certPassword,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  return client;
  
}



/**
 * Returns the UDAP discovery document for the given FHIR base URL.
 */
export async function discoverUdapEndpoint(fhirBaseUrl: string): Promise<UdapMetadata> {
  // load udap endpoint for the FHIR base url
  const udapEndpoint = fhirBaseUrl + "/.well-known/udap";

  // fetch the udap configuration
  const response = await fetch(udapEndpoint);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${udapEndpoint}: ${response.statusText}`);
  }

  const metadata = await response.json();

  if (!metadata) {
    throw new Error(`Invalid response from ${udapEndpoint}. Expected JSON.`);
  }

  // check that this appears to be a valid udap discovery document
  if (!metadata.udap_versions_supported || !metadata.udap_profiles_supported || !metadata.grant_types_supported || !metadata.signed_metadata) {
    throw new Error(`Invalid response from ${udapEndpoint}. Missing required fields.`);
  }

  return metadata as UdapMetadata;
}


/**
 * Builds the registration JWT for the given client.
 */

async function buildRegister(
  regReq: UdapClientRequest,
  metadata: UdapMetadata,
  cert: P12Certificate,
): Promise<UdapRegistration> {
  const iat = Math.floor(new Date().getTime() / 1000);
  const scopes = regReq.scopes.join(" ");
  let logo_uri = regReq.logoUri;
  if (!logo_uri && regReq.grantTypes.includes("authorization_code")) {
    logo_uri = "https://build.fhir.org/icon-fhir-16.png";
  }

  const softwareStatement: UdapSoftwareStatement = {
    iss: regReq.issuer,
    sub: regReq.issuer,
    aud: metadata.registration_endpoint,
    iat: iat,
    exp: iat + 300,
    jti: crypto.randomUUID(),
    client_name: regReq.clientName,
    redirect_uris: regReq.redirectUris,
    contacts: regReq.contacts,
    logo_uri: logo_uri,
    grant_types: regReq.grantTypes,
    response_types: (regReq.grantTypes || []).includes("authorization_code") ? ["code"] : null,
    token_endpoint_auth_method: ["private_key_jwt"],
    scope: scopes,
  } as UdapSoftwareStatement;

  const header: UdapX509Header = {
    alg: "RS256",
    x5c: await getX509Certficate(cert),
  };

  return {
    header: header,
    softwareStatement: softwareStatement,
  };
}

async function buildRequestBody(
  register: UdapRegistration,
  cert: P12Certificate,
): Promise<UdapRegistrationRequest> {
  const token = await signJWT(register.softwareStatement, cert);

  return {
    software_statement: token,
    udap: "1",
  };
}

async function sendRegistrationRequest(
  registrationUrl: string,
  registrationBody: UdapRegistrationRequest,
): Promise<UdapRegistrationResponse> {
  const regResp = await fetch(registrationUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(registrationBody),
  });

  const regJson = await regResp.json();
  if (!regResp.ok) {
    throw new Error(
      `Failed to register client: (${regResp.status}) ${regJson.error}: ${regJson.error_description}`,
      { cause: { status: regResp.status, body: regJson } },
    );
  }

  // console.log("sendRegistrationRequest response:", regJson);
  return regJson;
}

export async function signJWT(payload: string | object, cert: P12Certificate): Promise<string> {
  const pk = await getPrivateKey(cert);
  if (!pk) {
    throw new Error("Could not load private key.");
  }

  const pkPem = forge.pki.privateKeyToPem(pk);
  const x5c = (await getX509Certficate(cert)).raw.toString("base64");
  const header = { alg: "RS256", x5c: [x5c], typ: undefined };

  const token = jwt.sign(payload, pkPem, { algorithm: "RS256", header: header });
  // console.log('Signed JWT:', token);

  return token;
}

export async function getClientAssertion(
  clientId: string,
  tokenEndpoint: string,
  cert: P12Certificate,
): Promise<string> {
  const body = {
    iss: clientId,
    sub: clientId,
    aud: tokenEndpoint,
    iat: Math.floor(new Date().getTime() / 1000),
    exp: Math.floor(new Date().getTime() / 1000) + 300,
    jti: crypto.randomUUID(),
  };

  const token = await signJWT(body, cert);
  // console.log('Client assertion:', token);

  return token;
}
