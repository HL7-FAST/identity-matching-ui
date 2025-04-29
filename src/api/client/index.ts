import { Router } from 'express';
import { db } from '@/db';
import { clientsTable } from '@/db/schema';

export const clientRouter = Router();

clientRouter.get('/list', async (req, res) => {
  const clients = await db.select().from(clientsTable);

  res.json({
    message: 'Total clients: ' + clients.length,
  });
});


clientRouter.post('/create', async (req, res) => {
  const { clientId, clientSecret } = req.body;
  res.json({ message: 'Client created', clientId, clientSecret });
});


clientRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client details for ${id}` });
});

clientRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client ${id} deleted` });
});
