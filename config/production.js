const defaultFhirBaseUrl = 'https://identity-matching.fast.hl7.org/fhir';

export const config = {
  env: 'production',
  port: 4000,
  defaultFhirBaseUrl: defaultFhirBaseUrl,

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
    },
  ],

  certGenerationProviders: [
    {
      name: "FAST Security Server (Foundry)",
      endpoint: "https://udap-security.fast.hl7.org/api/cert/generate",
    },
    {
      name: "FhirLabs UdapEd",
      endpoint: "https://udaped.fhirlabs.net/Infrastructure/JitFhirlabsCommunityCertificate",
    }
  ]
}
export default config;