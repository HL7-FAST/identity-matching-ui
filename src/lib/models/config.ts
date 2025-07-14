import { ClientConfig } from "./client";

export interface AppConfig {

  env: 'production' | 'development';
  port: number;
  appUrl: string;
  defaultFhirBaseUrl: string;
  defaultCertPass: string;
  authSecret: string;

  database: {
    url: string;
  };

  defaultClients: ClientConfig[];
  certGenerationEndpoint: string;

  clientCreationRetry: {
    // maximum number of attempts to create a client
    maxAttempts: number;
    // delay between retries in milliseconds
    delay: number;
  };

}