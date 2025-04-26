import { AppConfig } from "@/lib/models/config"


const defaultAppPort = 4200;
const defaultFhirBaseUrl = 'http://localhost:8080/fhir';

export const config: AppConfig = {
  env: 'development',
  port: defaultAppPort,
  appUrl: `http://localhost:${defaultAppPort}`,
  defaultFhirBaseUrl: defaultFhirBaseUrl,
  defaultCertPass: 'udap-test',
  authSecret: 'secret_key_that_should_be_changed',
  database: {
    url: 'file:db.sqlite',
  },

  defaultClients: [
    {
      fhirServer: defaultFhirBaseUrl,
      grantTypes: ['client_credentials'],
      scopes: 'system/*.read',
    },
    {
      fhirServer: defaultFhirBaseUrl,
      grantTypes: ['authorization_code'],
      scopes: 'openid user/*.read',
    }
  ],

  certGenerationProviders: [
    {
      name: "FAST Security Server (localhost)",
      endpoint: "https://localhost:5001/api/cert/generate",
    },
    {
      name: "FhirLabs UdapEd",
      endpoint: "https://udaped.fhirlabs.net/Infrastructure/JitFhirlabsCommunityCertificate",
    }
  ]
}
export default config;