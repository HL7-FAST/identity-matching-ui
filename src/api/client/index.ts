import { Router } from 'express';
import { db } from '@/db';
import { clientsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { registerClient } from '@/lib/utils/udap';
import { createClient } from '@/lib/utils/client';
import { ClientDTO } from '@/lib/models/client';

export const clientRouter = Router();

clientRouter.get('/list', async (req, res) => {
  const clients = await db.select({
    id: clientsTable.id,
    fhirBaseUrl: clientsTable.fhirBaseUrl,
    grantTypes: clientsTable.grantTypes,
    scopesRequested: clientsTable.scopesRequested,
    scopesGranted: clientsTable.scopesGranted,
  }).from(clientsTable);

  res.json(clients);
});

clientRouter.get('/current', async (req, res) => {
  const clientId = req.session.currentClient;
  if (!clientId) {
    res.json({ message: 'No client selected' });
    return;
  }
  const client = await db.select().from(clientsTable).where(eq(clientsTable.id, clientId)).limit(1);
  if (client.length > 0) {
    res.json({
      id: client[0].id,
      fhirBaseUrl: client[0].fhirBaseUrl,
      grantTypes: client[0].grantTypes,
      scopesRequested: client[0].scopesRequested,
      scopesGranted: client[0].scopesGranted,
    });
    res.json()
  } else {
    res.status(404).json({ message: `Client ${clientId} not found` });
  }
});


clientRouter.post('/', async (req, res) => {
  console.log('Creating client:', req.body);
  const { fhirBaseUrl, grantTypes, scopesRequested } = req.body;

  try {
    const client = await createClient({
      fhirServer: fhirBaseUrl,
      grantTypes: [grantTypes],
      scopes: scopesRequested,
    });
    if (client) {
      res.status(201).json({
        id: client.id,
        fhirBaseUrl: client.fhirBaseUrl,
        grantTypes: client.grantTypes,
        scopesRequested: client.scopesRequested,
        scopesGranted: client.scopesGranted,
      });
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
  const client = await db.select().from(clientsTable).where(eq(clientsTable.id,id)).limit(1);
  if (client.length > 0) {
    req.session.currentClient = client[0].id;
    req.session.currentToken = undefined;

    const retVal: ClientDTO = {
      id: client[0].id,
      fhirBaseUrl: client[0].fhirBaseUrl,
      grantTypes: client[0].grantTypes,
      scopesRequested: client[0].scopesRequested,
      scopesGranted: client[0].scopesGranted,
      redirectUris: client[0].redirectUris,
      authorizationEndpoint: client[0].authorizationEndpoint,
      userinfoEndpoint: client[0].userinfoEndpoint,
      tokenEndpoint: client[0].tokenEndpoint,
      revocationEndpoint: client[0].revocationEndpoint,
      createdAt: client[0].createdAt,
      updatedAt: client[0].updatedAt,
      lastUsedAt: null
    }
    res.json(retVal);
  } else {
    res.status(404).json({ message: `Client ${id} not found` });
  }
});
