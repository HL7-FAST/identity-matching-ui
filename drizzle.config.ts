import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { appConfig } from '@/config'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: appConfig.database.url,
  },
});