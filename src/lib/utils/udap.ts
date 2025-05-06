import { P12Certificate, UdapClientRequest, UdapMetadata, UdapRegistration, UdapRegistrationRequest, UdapRegistrationResponse, UdapSoftwareStatement, UdapX509Header } from "../models/auth";
import { Client, ClientInsert } from "../models/client";
import * as forge from "node-forge";
import jwt from "jsonwebtoken";
import { getPrivateKey, getX509Certficate, loadCertificate } from "./cert";
import { db } from "@/db";
import { clientsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Request } from "express";



export const CLIENT_ASSERTION_TYPE = "urn:ietf:params:oauth:client-assertion-type:jwt-bearer";



/**
 * Registers a new client with the given registration request.
 */
export async function registerClient(regReq: UdapClientRequest, certFile: string, encryptedCertPass: string, existingClient?: Client): Promise<Client> {

  // load the certificate
  const cert = await loadCertificate(certFile, encryptedCertPass);

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


  const insertClient: ClientInsert = {
    fhirBaseUrl: regReq.fhirServer,
    clientId: regRes.client_id,
    grantTypes: regReq.grantTypes?.join(" ") || "",
    scopesRequested: regReq.scopes?.join(" ") || "",
    scopesGranted: regRes.scope || "",
    redirectUris: regReq.redirectUris?.join(" "),
    authorizationEndpoint: udapMeta.authorization_endpoint,
    userinfoEndpoint: udapMeta.userinfo_endpoint,
    tokenEndpoint: udapMeta.token_endpoint,
    revocationEndpoint: udapMeta.revocation_endpoint,
    certificate: certFile,
    certificatePass: encryptedCertPass,
    createdAt: new Date().toUTCString(),
    updatedAt: new Date().toUTCString(),
  };


  if (existingClient) {
    // update existing client
    const updatedClient = {
      ...insertClient,
      id: existingClient.id,
      createdAt: existingClient.createdAt,
    };

    const res = await db.update(clientsTable).set(updatedClient).where(eq(clientsTable.id, existingClient.id)).returning();
    if (!res) {
      throw new Error(`Failed to update client: ${regRes}`);
    }
    return res[0];
  }

  const res = await db.insert(clientsTable).values(insertClient).returning();
  if (!res) {
    throw new Error(`Failed to register client: ${regRes}`);
  }

  return res[0];
  
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



export async function getAccessToken(req: Request, client: Client): Promise<string> {

  let isTokenExpired = false;
  if (req.session.currentToken) {
    // parse the token
    const token = jwt.decode(req.session.currentToken);
    
    if (token && typeof token === 'object') {
      // check that the client ID matches
      if (token.client_id && token.client_id !== client.clientId) {
        console.warn('Token client ID does not match the current client ID. Clearing token from session.');
        req.session.currentToken = undefined;
      } else {
        // check the expiration time
        if (token.exp) {
          const exp = token.exp * 1000; // convert to milliseconds
          const now = Date.now();
          isTokenExpired = now > exp;
        } else {
          console.warn('Invalid token format or missing expiration time');
        }
      }
    }
  }

  // Ensure we have a valid access token
  if (!req.session.currentToken || isTokenExpired) {
    req.session.currentToken = await getNewAccessToken(req, client);
    // console.log('Refreshed client token:', req.session.currentToken);
  }

  return req.session.currentToken;

}


export async function getNewAccessToken(req: Request, client: Client): Promise<string> {

  console.log("Getting new access token for client:", client.clientId);

  const grantType = client.grantTypes.includes("client_credentials") ? "client_credentials" : "authorization_code";
  if (grantType === "authorization_code") {
    if (!req.query?.code) {
      throw new Error("Client uses authorization_code flow but no code was provided.  User needs to log in first.");
    }
  }

  // load the client certificate
  const cert = await loadCertificate(client.certificate, client.certificatePass || "");

  // get the client assertion
  const assertion = await getClientAssertion(client.clientId, client.tokenEndpoint, cert);

  const tokenParams = {
    grant_type: grantType,
    code: req.query?.code?.toString() || "",
    client_assertion_type: CLIENT_ASSERTION_TYPE,
    client_assertion: assertion,
    redirect_uri: client.redirectUris?.split(" ")[0] || "",
    code_verifier: req.session.codeVerifier || "",
    udap: "1"
  };

  // console.log("Token params:", new URLSearchParams(tokenParams).toString());

  // request a new token
  const tokenResponse = await fetch(client.tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(tokenParams).toString(),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to get token: ${tokenResponse.statusText}`);
  }

  const tokenJson = await tokenResponse.json();
  if (!tokenJson.access_token) {
    throw new Error(`Failed to get token: ${tokenJson.error}: ${tokenJson.error_description}`);
  }

  // update the client with the new token
  // const updatedClient: Client = {
  //   ...client,
  //   currentToken: tokenJson.access_token,
  //   updatedAt: new Date().toUTCString(),
  // };

  // // save the updated client to the database
  // const res = await db.update(clientsTable).set(updatedClient).where(eq(clientsTable.id, client.id)).returning();
  // if (!res) {
  //   throw new Error(`Failed to update client: ${res}`);
  // }

  // return res[0];

  return tokenJson.access_token;
}
