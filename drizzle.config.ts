import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
import { appConfig } from '@/config'

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema',
  dialect: 'sqlite',
  dbCredentials: {
    url: appConfig.database.url,
  },
});