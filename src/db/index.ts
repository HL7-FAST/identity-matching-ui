import 'dotenv/config';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { appConfig } from '@/config';
import drizzleConfig from 'drizzle.config';
import { registerClient } from '@/lib/utils/udap';
import { getGeneratedCertificate, getSubjectAltName, loadCertificate } from '@/lib/utils/cert';
import { clientConfigToClientRequest, createClient } from '@/lib/utils/client';
import { getClientsByConfig } from '@/db/client';
import { isMainModule } from '@angular/ssr/node';
import { isDevMode } from '@angular/core';
import { Client } from '@/lib/models/client';

export const db = getDatabase();

export function getDatabase(): LibSQLDatabase {
  // Return the database connection
  if (isMainModule(import.meta.url) || isDevMode()) {
    return drizzle(appConfig.database.url);
  }

  return drizzle(':memory:');
}

export async function initDatabase() {
  // apply any pending migrations
  console.log('Applying database migrations...');
  console.time('Database migrations complete.');
  await migrate(getDatabase(), {
    migrationsFolder: drizzleConfig.out || 'drizzle',
  });
  console.timeEnd('Database migrations complete.');

  // create default clients
  console.log('Creating default clients...');
  console.time('Default client initialization complete.');
  for (const client of appConfig.defaultClients) {

    try {
      await createClient(client);
    }
    catch (error) {
      console.error(
        `Error creating client for ${client.fhirServer}:`,
        error
      );
    }

    // console.log(`Creating client for ${client.fhirServer} (${client.grantTypes.join(',')})`);

    // // check if the client already exists in the database
    // // still need to run registration in the event the auth server doesn't have this client anymore
    // const existingClients = await getClientsByConfig(client);
    // let existingClient: Client | undefined = undefined;
    // if (existingClients.length > 0) {
    //   existingClient = existingClients[0];

    //   // client issuer needs to match the certificate subject alt name
    //   const cert = await loadCertificate(existingClient.certificate, existingClient.certificatePass || appConfig.defaultCertPass);
    //   const san = getSubjectAltName(cert);
    //   console.log('Existing client SAN:', san);
    //   if (san !== client.issuer) {
    //     client.issuer = san.replace('URI:', '');
    //   }
    // }
    

    // try {
    //   let certString = existingClient ? existingClient.certificate : client.certificate;
    //   let certPassword = (existingClient ? existingClient.certificatePass : client.certificatePass) || appConfig.defaultCertPass;

    //   // if a certificate is provided, attempt to load it
    //   try {

    //     if (!certString) {

    //       const certProvider = appConfig.certGenerationProviders[0];

    //       if (!certProvider) {
    //         console.error(
    //           `No certificate configured for ${client.fhirServer} (${client.grantTypes.join(',')}) and no certificate provider conifigured.`
    //         );
    //         continue;
    //       }

    //       const subjectAltName = `${new URL(appConfig.appUrl).href}#${crypto.randomUUID()}`;
    //       client.issuer = subjectAltName;

    //       certString = await getGeneratedCertificate(
    //         [subjectAltName],
    //         appConfig.defaultCertPass,
    //         certProvider.endpoint
    //       );

    //       if (!certString) {
    //         console.error(
    //           `Failed to generate certificate for ${client.fhirServer} (${client.grantTypes.join(',')}). Certificate provider returned empty string.`
    //         );
    //         continue;
    //       }

    //       console.log(`Generated certificate for ${client.fhirServer}`);
    //     }

    //   } catch (error) {
    //     // skip this client if the certificate cannot be loaded
    //     console.error(
    //       `Error loading certificate for ${
    //         client.fhirServer
    //       } (${client.grantTypes.join(',')}):`,
    //       error
    //     );
    //     continue;
    //   }

    //   const request = clientConfigToClientRequest(client);
    //   const newClient = await registerClient(request, certString, certPassword, existingClient);
    //   console.log(`Client ${newClient.id} with client ID ${newClient.clientId} registered for ${client.fhirServer}`);
      
    // } catch (error) {
    //   console.error(
    //     `Error registering client for ${client.fhirServer}:`,
    //     error
    //   );
    // }
  }
  console.timeEnd('Default client initialization complete.');

}
