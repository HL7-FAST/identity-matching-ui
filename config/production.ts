import AppConfig from "@/lib/models/config"


const defaultFhirBaseUrl = 'https://identity-matching.fast.hl7.org/fhir';

const config: Partial<AppConfig> = {
  env: 'production',
  port: 4000,
  defaultFhirBaseUrl: defaultFhirBaseUrl,

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