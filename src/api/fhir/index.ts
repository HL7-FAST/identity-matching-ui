import { appConfig } from '@/config';
import { db } from '@/db';
import { clientsTable } from '@/db/schema';
import { Client } from '@/lib/models/client';
import { Request, Router } from 'express';
import { eq } from "drizzle-orm";
import {
  createProxyMiddleware,
} from 'http-proxy-middleware';
import { refreshToken } from '@/lib/utils/udap';
import jwt from 'jsonwebtoken';

export const fhirRouter = Router();

function getFhirServerUrl(req: Request): string {
  // Should use the current server from the session if available
  if (req.session.fhirServer) {
    return req.session.fhirServer;
  }

  // Otherwise, use the default server
  return appConfig.defaultFhirBaseUrl;
}


async function getClient(req: Request): Promise<Client> {

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
  if (!client) {
    const fhirBase = getFhirServerUrl(req);
    const clientsFound = await db.select().from(clientsTable).where(eq(clientsTable.fhirBaseUrl, fhirBase));
    if (clientsFound.length > 0) {
      // prefer a client with client_credentials grant type but fallback to the first one if none found
      client = clientsFound.find((c) => c.grantTypes.includes('client_credentials')) || clientsFound[0];
    } else {
      throw new Error(`No client found for FHIR server ${fhirBase}`);
    }
  }

  // let isTokenExpired = false;
  // if (client.currentToken) {
  //   // parse the token to get the expiration time
  //   const token = jwt.decode(client.currentToken);
  //   if (token && typeof token === 'object' && token.exp) {
  //     const exp = token.exp * 1000; // convert to milliseconds
  //     const now = Date.now();
  //     isTokenExpired = now > exp;
  //   } else {
  //     console.warn('Invalid token format or missing expiration time');
  //   }    
  // }

  // // Ensure we have a valid access token
  // if (!client.currentToken || isTokenExpired) {
  //   client = await refreshClientToken(client, req);
  //   // console.log('Refreshed client token:', client.currentToken);
  // }


  return client;

}


async function getAccessToken(req: Request, client: Client): Promise<string> {

  let isTokenExpired = false;
  if (req.session.currentToken) {
    // parse the token to get the expiration time
    const token = jwt.decode(req.session.currentToken);
    if (token && typeof token === 'object' && token.exp) {
      const exp = token.exp * 1000; // convert to milliseconds
      const now = Date.now();
      isTokenExpired = now > exp;
    } else {
      console.warn('Invalid token format or missing expiration time');
    }    
  }

  // Ensure we have a valid access token
  if (!req.session.currentToken || isTokenExpired) {
    req.session.currentToken = await refreshToken(client, req);
    // console.log('Refreshed client token:', client.currentToken);
  }

  return req.session.currentToken;

}


fhirRouter.use(
  '/{*splat}',
  async (req, res, next) => {
    // Attach the target URL to the request object for use in the proxy
    const client = await getClient(req);
    const token = await getAccessToken(req, client);
    req.headers['Authorization'] = `Bearer ${token}`;
    (req as any).targetFhirUrl = client.fhirBaseUrl + req.originalUrl.replace('/api/fhir', '');
    next();
  },
  createProxyMiddleware({
    changeOrigin: true,
    // pathRewrite: (path, req) => path,
    ignorePath: true,
    router: (req) => {
      console.log('Proxying FHIR request to', (req as any).targetFhirUrl);
      return (req as any).targetFhirUrl;
    },
  })
);

// fhirRouter.use('/{*splat}', (req, res, next) => {
//   createProxyMiddleware({
//     target: getFhirServerUrl(req),
//   });
// });

// Forward all requests to the FHIR server
// fhirRouter.use('*', async (req, res, next) => {
//   try {
//     const baseUrl = getFhirServerUrl(req);
//     const url = baseUrl + req.originalUrl.replace(/^\/fhir/, '');

//     const fetchOptions: RequestInit = {
//       method: req.method,
//       // headers: { ...req.headers, host: undefined },
//       body: ['GET', 'HEAD'].includes(req.method) ? undefined : req.body && JSON.stringify(req.body),
//     };

//     const fhirRes = await fetch(url, fetchOptions);

//     // Forward status and headers
//     res.status(fhirRes.status);
//     fhirRes.headers.forEach((value, key) => res.setHeader(key, value));

//     // Forward body
//     const data = await fhirRes.arrayBuffer();
//     res.send(Buffer.from(data));
//   } catch (err) {
//     next(err);
//   }
// });
