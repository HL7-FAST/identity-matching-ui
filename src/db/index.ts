import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { appConfig } from '@/config';
import drizzleConfig from 'drizzle.config';
import { registerClient } from '@/lib/utils/udap';
import { getGeneratedCertificate, loadCertificate } from '@/lib/utils/cert';
import { P12Certificate } from '@/lib/models/auth';
import { clientConfigToClientRequest } from '@/lib/utils/client';
import { X509Certificate } from 'crypto';
import { clientsTable } from './schema';

export const db = getDatabase();

export function getDatabase() {
  // Return the database connection
  return drizzle(appConfig.database.url);
}

export async function initDatabase() {
  // apply any pending migrations
  await migrate(getDatabase(), {
    migrationsFolder: drizzleConfig.out || 'drizzle',
  });

  // create default clients
  for (const client of appConfig.defaultClients) {

    try {
      let certString = client.certificate;

      // if a certificate is provided, attempt to load it
      try {

        if (!certString) {

          const certProvider = appConfig.certGenerationProviders[0];

          if (!certProvider) {
            console.error(
              `No certificate configured for ${client.fhirServer} (${client.grantTypes.join(',')}) and no certificate provider conifigured.`
            );
            continue;
          }

          const subjectAltName = `${new URL(appConfig.appUrl).href}#${crypto.randomUUID()}`;
          client.issuer = subjectAltName;

          certString = await getGeneratedCertificate(
            [subjectAltName],
            appConfig.defaultCertPass,
            certProvider.endpoint
          );
          console.log('New cert:', certString);

          if (!certString) {
            console.error(
              `Failed to generate certificate for ${client.fhirServer} (${client.grantTypes.join(',')}). Certificate provider returned empty string.`
            );
            continue;
          }

          console.log(`Generated certificate for ${client.fhirServer}`);
        }

      } catch (error) {
        // skip this client if the certificate cannot be loaded
        console.error(
          `Error loading certificate for ${
            client.fhirServer
          } (${client.grantTypes.join(',')}):`,
          error
        );
        continue;
      }

      const request = clientConfigToClientRequest(client);
      const newClient = await registerClient(request, certString, client.certificatePass || appConfig.defaultCertPass);

      const res = await db.insert(clientsTable).values({
        fhirBaseUrl: newClient.fhirServer,
        clientId: newClient.clientId,
        grantTypes: newClient.grantTypes.join(' '),
        scopes: newClient.scopes,
        authorizationEndpoint: newClient.authorizationEndpoint,
        userinfoEndpoint: newClient.userinfoEndpoint,
        tokenEndpoint: newClient.tokenEndpoint,
        certificate: newClient.certificate,
        certificatePass: newClient.certificatePass,
        currentToken: newClient.currentToken,
        createdAt: newClient.createdAt.toUTCString(),
        updatedAt: newClient.updatedAt.toUTCString(),
      }).returning({ id: clientsTable.id });

      newClient.id = res[0].id;

      console.log(`Client ${newClient.id} with client ID ${newClient.clientId} registered for ${client.fhirServer}`);
      
    } catch (error) {
      console.error(
        `Error registering client for ${client.fhirServer}:`,
        error
      );
    }
  }
}
