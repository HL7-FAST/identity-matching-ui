import { Router } from 'express';
import { authRouter } from './auth';
import { clientRouter } from './client';

export const apiRouter = Router();


// /api/auth endpoint
// apiRouter.use("/auth", ExpressAuth({ providers: [GitHub] }));
apiRouter.use('/auth', authRouter);


// /api/client registration endpoints
apiRouter.use('/client', clientRouter);



apiRouter.get('/redirect', (req, res) => {
  console.log('Redirecting to /home');
  res.redirect(301, '/home');
});


// Catch all endpoint
apiRouter.all<{ splat: string[] }>('/{*splat}', (req, res) => {
  console.log('Catch all api endpoint:', req.params.splat);
  res.status(404).json({ message: 'Not found' });
});
