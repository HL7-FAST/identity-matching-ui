import { Router } from 'express';
import { db } from '@/db';
import { clientsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getNewAccessToken } from '@/lib/utils/udap';
import { clientToDTO, createClient, getCurrentClient } from '@/lib/utils/client';
import { Client } from '@/lib/models/client';

export const clientRouter = Router();

clientRouter.get('/list', async (req, res) => {
  const clients = (await db.select().from(clientsTable)).map(client => clientToDTO(client));
  res.json(clients);
});

clientRouter.get('/current', async (req, res) => {
  const clientId = req.session?.currentClient;
  if (!clientId) {
    res.json({ message: 'No client selected' });
    return;
  }
  const client = await db.select().from(clientsTable).where(eq(clientsTable.id, clientId)).limit(1);
  if (client.length > 0) {
    res.json(clientToDTO(client[0]));
  } else {
    res.status(404).json({ message: `Client ${clientId} not found` });
  }
});


clientRouter.post('/', async (req, res) => {
  console.log('Creating client:', req.body);
  const { fhirBaseUrl, grantTypes, scopesRequested, certGenerationProvider } = req.body;

  try {
    const client = await createClient({
      fhirServer: fhirBaseUrl,
      grantTypes: [grantTypes],
      scopes: scopesRequested,
      certGenerationProvider: certGenerationProvider || 'Local'
    });
    if (client) {
      res.status(201).json(clientToDTO(client));
    } else {
      res.status(400).json({ message: 'Error creating client' });
    }
  }
  catch (error) {
    console.error('Error creating client:', error);

    if (error instanceof Error) {
      res.status(400).json({ message: error.message });
    } else {
      res.status(500).json({ message: 'Internal error while creating client.  Check server logs.' });
    }
  }
});

clientRouter.get('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client details for ${id}` });
});

clientRouter.delete('/:id', async (req, res) => {
  const { id } = req.params;
  res.json({ message: `Client ${id} deleted` });
});


clientRouter.get('/select/:id', async (req, res) => {
  const { id } = req.params;


  let client: Client | null = null;

  if (id === 'default') {
    client = await getCurrentClient(req, true, 'client_credentials');
    if (!client) {
      res.status(400).json({ message: 'No default client found' });
      return;
    }
  } else {
    const clientRes = await db.select().from(clientsTable).where(eq(clientsTable.id,id)).limit(1);
    if (clientRes.length > 0) {
      client = clientRes[0];
    } else {
      res.status(404).json({ message: `Client ${id} not found` });
      return;
    }
  }

  req.session.currentClient = client.id;
  req.session.currentToken = undefined;

  try {
    if (client.grantTypes.includes('client_credentials')) {
      req.session.currentToken = await getNewAccessToken(req, client);
    }
  } catch (error) {
    console.error('Error getting new access token:', error);
  }

  const retVal = clientToDTO(client);
  res.json(retVal);
    
});
