import 'dotenv/config';
import { drizzle, LibSQLDatabase } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { appConfig } from '@/config';
import drizzleConfig from 'drizzle.config';
import { createClient } from '@/lib/utils/client';
import { isMainModule } from '@angular/ssr/node';
import { isDevMode } from '@angular/core';

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
  for (const client of (appConfig.defaultClients || [])) {

    try {
      await createClient(client);
    }
    catch (error) {
      console.error(
        `Error creating client for ${client.fhirServer}:`,
        error
      );
    }
  }
  
  console.timeEnd('Default client initialization complete.');

}
