const defaultFhirBaseUrl = 'https://identity-matching.fast.hl7.org/fhir';

module.exports = {
  env: 'production',
  port: 4000,
  defaultFhirBaseUrl: defaultFhirBaseUrl,

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
  certGenerationEndpoint: 'https://udap-security.fast.hl7.org/api/cert/generate'
}
