import 'dotenv/config';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { appConfig } from '@/config';
import drizzleConfig from 'drizzle.config';
import { createClient } from '@/lib/utils/client';
import { isMainModule } from '@angular/ssr/node';
import { isDevMode } from '@angular/core';
import { ClientConfig } from '@/lib/models/client';

export const db = getDatabase();

export function getDatabase(): LibSQLDatabase {
  // Return the database connection
  if (isMainModule(import.meta.url) || isDevMode()) {
    return drizzle(appConfig.database.url);
  }

  return drizzle(':memory:');
}

/**
 * Retry client creation with configurable attempts and delay
 */
async function createClientWithRetry(client: ClientConfig): Promise<void> {

  const maxAttempts = appConfig.clientCreationRetry.maxAttempts || 10;
  const delay = appConfig.clientCreationRetry.delay || 5000;

  let lastError: unknown;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      await createClient(client);
      return;
    } catch (error) {
      lastError = error;
      
      if (attempt < maxAttempts) {
        console.log(`Client creation failed for ${client.fhirServer} (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  // If we get here, all attempts failed
  throw lastError;
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
  console.log('Default clients:', appConfig.defaultClients);
  for (const client of (appConfig.defaultClients || [])) {

    try {
      await createClientWithRetry(client);
    }
    catch (error) {
      console.error(
        `Failed to create client for ${client.fhirServer} after all retry attempts:`,
        error
      );
    }
  }
  
  console.timeEnd('Default client initialization complete.');

}
