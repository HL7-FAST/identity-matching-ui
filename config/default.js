
const defaultAppPort = 4200;
const defaultFhirBaseUrl = 'http://localhost:8080/fhir';

module.exports = {
  env: 'development',
  port: process.env.PORT ?? defaultAppPort,
  appUrl: `http://localhost${ (process.env.PORT ?? defaultAppPort) == 80 ? '' : ':' + (process.env.PORT ?? defaultAppPort) }`,
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
      certGenerationProvider: 'Local',
    },
    {
      fhirServer: defaultFhirBaseUrl,
      grantTypes: ['authorization_code'],
      scopes: 'openid profile email user/*.read user/*.rs',
      certGenerationProvider: 'Local',
    },
  ],
  certGenerationEndpoint: 'https://localhost:5001/api/cert/generate'
}