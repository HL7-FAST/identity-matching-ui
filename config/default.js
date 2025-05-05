
const defaultAppPort = 4200;
const defaultFhirBaseUrl = 'http://localhost:8080/fhir';

module.exports = {
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
      scopes: 'system/*.read system/*.rs',
      certificateProvider: 'localhost',
    },
    {
      fhirServer: defaultFhirBaseUrl,
      grantTypes: ['authorization_code'],
      scopes: 'openid profile email user/*.read user/*.rs',
      certificateProvider: 'localhost',
    },
  ],

  certGenerationProviders: [
    {
      id: "localhost",
      name: "FAST Security Server (localhost)",
      endpoint: "https://localhost:5001/api/cert/generate",
    },
    {
      id: "fhir-labs",
      name: "FhirLabs UdapEd",
      endpoint: "https://udaped.fhirlabs.net/Infrastructure/JitFhirlabsCommunityCertificate",
    }
  ]
}