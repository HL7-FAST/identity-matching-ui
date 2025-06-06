import { GrantType } from "./auth";
import { clientsTable } from "@/db/schema";
import { CertGenerationProvider } from "./cert";


export type Client = typeof clientsTable.$inferSelect;
export type ClientInsert = typeof clientsTable.$inferInsert;

export type ClientDTO = Omit<Client, "clientId" | "certificate" | "certificatePass">;

export interface ClientConfig {
  fhirServer: string;
  grantTypes: GrantType[];  
  clientName?: string;
  issuer?: string;
  contacts?: string[];
  logoUri?: string;
  scopes?: string;
  redirectUris?: string[];
  certificate?: string;
  certificatePass?: string;
  certGenerationProvider?: CertGenerationProvider;
}

export type ClientRegistration = ClientConfig;
