import { Router } from 'express';
import { authRouter } from './auth';
import { clientRouter } from './client';
import { fhirRouter } from './fhir';

export const apiRouter = Router();


// /api/auth endpoint
apiRouter.use('/auth', authRouter);


// /api/client registration endpoints
apiRouter.use('/client', clientRouter);


// /api/fhir endpoint
apiRouter.use('/fhir', fhirRouter);



// /api/health endpoint
apiRouter.get('/health', async (req, res) => {
  res.json({ message: 'OK' });
});


// Catch all endpoint
apiRouter.all<{ splat: string[] }>('/{*splat}', async (req, res) => {
  res.status(404).json({ message: 'Not found' });
});
