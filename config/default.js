
const getAppPort = () => {
  return process.env.PORT ?? 4200;
};

const getDefaultFhirBaseUrl = () => {
  return process.env.DEFAULT_FHIR_BASE_URL ?? 'http://localhost:8080/fhir';
};

module.exports = {
  env: 'development',
  port: getAppPort(),
  appUrl: `http://localhost${ getAppPort() === 80 || getAppPort() === 443 ? '' : ':' + getAppPort() }`,
  defaultFhirBaseUrl: getDefaultFhirBaseUrl(),
  defaultCertPass: 'udap-test',
  authSecret: 'secret_key_that_should_be_changed',
  database: {
    url: 'file:db.sqlite',
  },

  defaultClients: [
    {
      fhirServer: getDefaultFhirBaseUrl(),
      grantTypes: ['client_credentials'],
      scopes: 'system/*.read system/*.rs',
      certGenerationProvider: 'Local',
    },
    {
      fhirServer: getDefaultFhirBaseUrl(),
      grantTypes: ['authorization_code'],
      scopes: 'openid profile email user/*.read user/*.rs',
      certGenerationProvider: 'Local',
    },
  ],
  certGenerationEndpoint: 'https://localhost:5001/api/cert/generate',
  clientCreationRetry: {
    maxAttempts: 20,
    delay: 5000,
  },
}