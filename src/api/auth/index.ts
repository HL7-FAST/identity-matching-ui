import { Router } from 'express';

export const authRouter = Router();

authRouter.get('/login', (req, res) => {
  // Implement login logic
  req.session.user = { id: 1, name: 'John Doe' };
  // console.log('Login endpoint', req.session.user, req.session.id);
  res.json({ message: 'Login successful: ' + req.session.id });
});


authRouter.get('/userinfo', (req, res) => {
  // console.log('User info endpoint', req.session, req.session.id);
  
  if (req.session.user) {
    res.json({ user: req.session.user });
  } else {
    res.status(401).json({ message: 'Unauthorized' });
  }
});
