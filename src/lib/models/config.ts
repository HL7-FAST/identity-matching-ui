import { CertGenerationProvider } from "./cert";
import { ClientConfig } from "./client";

export default interface AppConfig {

  env: 'production' | 'development';
  port: number;
  defaultFhirBaseUrl: string;
  defaultCertPass: string;
  authSecret: string;

  database: {
    url: string;
  };

  defaultClients: ClientConfig[];
  certGenerationProviders: CertGenerationProvider[];

}