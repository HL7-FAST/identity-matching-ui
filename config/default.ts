import AppConfig from "@/lib/models/config"


const defaultFhirBaseUrl = 'http://localhost:8080/fhir';

const config: AppConfig = {
  env: 'development',
  port: 4200,
  defaultFhirBaseUrl: defaultFhirBaseUrl,
  defaultCertPass: 'udap-test',
  authSecret: 'secret_key_that_should_be_changed',
  database: {
    url: 'file:db.sqlite',
  },

  defaultClients: [
    {
      fhirBaseUrl: defaultFhirBaseUrl,
      grantType: 'client_credentials',
      scopes: 'system/*.read',
    },
    {
      fhirBaseUrl: defaultFhirBaseUrl,
      grantType: 'authorization_code',
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