import { Router } from 'express';
import { authRouter } from './auth';
import { clientRouter } from './client';
import { fhirRouter } from './fhir';

export const apiRouter = Router();


// /api/auth endpoint
// apiRouter.use("/auth", ExpressAuth({ providers: [GitHub] }));
apiRouter.use('/auth', authRouter);


// /api/client registration endpoints
apiRouter.use('/client', clientRouter);


// /api/fhir endpoint
apiRouter.use('/fhir', fhirRouter);



// /api/health endpoint
apiRouter.get('/health', async (req, res) => {
  res.json({ message: 'OK' });
});



apiRouter.get('/redirect', async (req, res) => {
  console.log('Redirecting to /home');
  res.redirect(301, '/home');
});


// Catch all endpoint
apiRouter.all<{ splat: string[] }>('/{*splat}', async (req, res) => {
  console.log('Catch all api endpoint:', req.params.splat);
  res.status(404).json({ message: 'Not found' });
});
