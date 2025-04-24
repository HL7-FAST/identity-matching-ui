import { Router } from 'express';
import db from '@/db';
import { clientsTable } from 'src/db/schema';
import config from '@/config';

const clientRouter = Router();

clientRouter.get('/list', async (req, res) => {
  const clients = await db.select().from(clientsTable);  

  res.json({ 
    message: 'All registered clients: ' + clients.length,
  });
});


clientRouter.post('/create', (req, res) => {
  const { clientId, clientSecret } = req.body;
  res.json({ message: 'Client created', clientId, clientSecret });
});


clientRouter.get('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client details for ${id}` });
});

clientRouter.delete('/:id', (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client ${id} deleted` });
});


export default clientRouter;