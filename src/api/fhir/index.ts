import { getCurrentClient } from '@/lib/utils/client';
import { getAccessToken } from '@/lib/utils/udap';
import { Request, Router } from 'express';
import {
  createProxyMiddleware,
} from 'http-proxy-middleware';

export const fhirRouter = Router();


fhirRouter.use(
  '/{*splat}',
  async (req, res, next) => {
    // Attach the target URL to the request object for use in the proxy
    const client = await getCurrentClient(req);
    if (!client) {
      res.status(400);
      res.json({ message: `No client available for ${req.session.fhirServer}` });
      return;
    }
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
