import { getCurrentClient } from '@/lib/utils/client';
import { getBaseUrl } from '@/lib/utils/http';
import { getAccessToken } from '@/lib/utils/udap';
import { Request, Router } from 'express';
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from 'http-proxy-middleware';
import { parseStringPromise } from 'xml2js';

export const fhirRouter = Router();


fhirRouter.use(
  '/{*splat}',
  async (req, res, next) => {
    // Attach the target URL to the request object for use in the proxy
    // const client = await getCurrentClient(req, true, 'client_credentials');
    const client = await getCurrentClient(req, false);
    if (!client) {
      res.status(400);
      res.json({ message: `No client available for ${req.session.fhirServer}` });
      return;
    }
    try {
      const token = await getAccessToken(req, client);
      req.headers['Authorization'] = `Bearer ${token}`;
    } catch (error) {
      if (error instanceof Error) {
        const msg = 'Error getting access token: ' + error.message;
        res.status(401).json({ message: msg });
        return;
      }
      res.status(401).json({ message: 'Error getting access token: ' + error });
      return;      
    }
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
    selfHandleResponse: true,
    on: {
      proxyReq: fixRequestBody,
      proxyRes: responseInterceptor(async (responseBuffer, proxyRes, req, res) => {
        if (proxyRes.statusCode !== 200) {
          // Handle non-200 responses here
            console.error('Error response from FHIR server:', proxyRes.statusCode);
          return responseBuffer;
        }

        // lack of client should've failed above, but...
        const client = await getCurrentClient(req, false);
        if (!client) {
          return responseBuffer;
        }

        // attempt to parse the response (supporting JSON and XML responses)
        try {
          
          const responseText = responseBuffer.toString('utf8');
          const contentType = proxyRes.headers['content-type'];
          let parsed;
          if (contentType && (contentType.includes('application/json') || contentType.includes('application/fhir+json'))) {
            parsed = JSON.parse(responseText);
            if (parsed.link) {
              // Modify the link URL(s) to point to this api proxy endpoint for paging
              parsed.link = parsed.link.map((link: any) => {
                console.log('Link:', link.url, link.url.startsWith(client.fhirBaseUrl));
                if (link.url && link.url.startsWith(client.fhirBaseUrl)) {
                  link.url = link.url.replace(client.fhirBaseUrl, getBaseUrl(req) + '/api/fhir');
                }
                return link;
              });
            }

            return Buffer.from(JSON.stringify(parsed));            
          }
          else if (contentType && (contentType.includes('application/xml') || contentType.includes('application/fhir+xml') || contentType.includes('text/xml'))) {
            parsed = await parseStringPromise(responseText);
            console.log('Parsed XML:', parsed.Bundle.link);
            
            return responseBuffer;
          }
          else {
            return responseBuffer;
          }

        } catch (err) {
          console.error('Error parsing FHIR response:', err);
          return responseBuffer;
        }
        
      })
    }
  }),
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
