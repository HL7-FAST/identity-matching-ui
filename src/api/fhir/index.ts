import { getCurrentClient } from '@/lib/utils/client';
import { getBaseUrl } from '@/lib/utils/http';
import { getAccessToken } from '@/lib/utils/udap';
import { NextFunction, Request, Response, Router } from 'express';
import { BundleLink } from 'fhir/r4';
import {
  createProxyMiddleware,
  fixRequestBody,
  responseInterceptor,
} from 'http-proxy-middleware';
import { parseStringPromise } from 'xml2js';

export const fhirRouter = Router();
export type FhirProxyRequest = Request & { targetFhirUrl?: string };

fhirRouter.use(
  '/{*splat}',
  async (req: FhirProxyRequest, res: Response, next: NextFunction) => {
    let fhirBaseUrl = req.session.fhirServer;

    // If the request has the x-ignore-client header, don't try to get the client from the session
    if (!Object.hasOwn(req.headers, 'x-ignore-client')) {
      // Get the client from the session
      const client = await getCurrentClient(req, false);
      if (client) {
        try {
          const token = await getAccessToken(req, client);
          req.headers['Authorization'] = `Bearer ${token}`;
        } catch (error) {
          if (error instanceof Error) {
            const msg = 'Error getting access token: ' + error.message;
            res.status(401).json({ message: msg });
            return;
          }
          res
            .status(401)
            .json({ message: 'Error getting access token: ' + error });
          return;
        }
        fhirBaseUrl = client.fhirBaseUrl;
      }
    }
    // override the fhirBaseUrl if the request has special header
    if (req.headers['x-fhir-server']) {
      fhirBaseUrl = req.headers['x-fhir-server'] as string;
    }

    if (!fhirBaseUrl) {
      res.status(400).json({ message: 'No FHIR server base URL specified' });
      return;
    }

    // Attach the target URL to the request object for use in the proxy
    (req).targetFhirUrl =
      fhirBaseUrl + req.originalUrl.replace('/api/fhir', '');
    next();
  },
  createProxyMiddleware({
    changeOrigin: true,
    // pathRewrite: (path, req) => path,
    ignorePath: true,
    router: (req: FhirProxyRequest) => {
      console.log('Proxying FHIR request to', (req).targetFhirUrl);
      return (req).targetFhirUrl;
    },
    selfHandleResponse: true,
    on: {
      proxyReq: fixRequestBody,
      proxyRes: responseInterceptor(
        async (responseBuffer, proxyRes, req) => {
          if (proxyRes.statusCode !== 200) {
            // Handle non-200 responses here
            console.error(
              'Error response from FHIR server:',
              proxyRes.statusCode
            );
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
            if (
              contentType &&
              (contentType.includes('application/json') ||
                contentType.includes('application/fhir+json'))
            ) {
              parsed = JSON.parse(responseText);
              if (parsed.link) {
                // Modify the link URL(s) to point to this api proxy endpoint for paging
                parsed.link = parsed.link.map((link: BundleLink) => {
                  console.log(
                    'Link:',
                    link.url,
                    link.url.startsWith(client.fhirBaseUrl)
                  );
                  if (link.url && link.url.startsWith(client.fhirBaseUrl)) {
                    link.url = link.url.replace(
                      client.fhirBaseUrl,
                      getBaseUrl(req) + '/api/fhir'
                    );
                  }
                  return link;
                });
              }

              return Buffer.from(JSON.stringify(parsed));
            } else if (
              contentType &&
              (contentType.includes('application/xml') ||
                contentType.includes('application/fhir+xml') ||
                contentType.includes('text/xml'))
            ) {
              parsed = await parseStringPromise(responseText);
              console.log('Parsed XML:', parsed.Bundle.link);

              return responseBuffer;
            } else {
              return responseBuffer;
            }
          } catch (err) {
            console.error('Error parsing FHIR response:', err);
            return responseBuffer;
          }
        }
      ),
    },
  })
);

