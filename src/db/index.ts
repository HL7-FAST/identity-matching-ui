import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import config from '@/config'
import drizzleConfig from 'drizzle.config';

export default getDatabase();

export function getDatabase() {
  // Return the database connection
  return drizzle(config.database.url);
}

export async function initDatabase() {
  // apply any pending migrations
  await migrate(getDatabase(), { migrationsFolder: drizzleConfig.out || 'drizzle' });

  // create default clients

  
}


