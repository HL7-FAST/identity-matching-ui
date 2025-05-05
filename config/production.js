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
      certificateProvider: 'fast-security-server',
    },
    {
      fhirServer: defaultFhirBaseUrl,
      grantTypes: ['authorization_code'],
      scopes: 'openid profile email user/*.read user/*.rs',
      certificateProvider: 'fast-security-server',
    },
  ],

  certGenerationProviders: [
    {
      id: "fast-security-server",
      name: "FAST Security Server (Foundry)",
      endpoint: "https://udap-security.fast.hl7.org/api/cert/generate",
    },
    {
      id: "fhir-labs",
      name: "FhirLabs UdapEd",
      endpoint: "https://udaped.fhirlabs.net/Infrastructure/JitFhirlabsCommunityCertificate",
    }
  ]
}
