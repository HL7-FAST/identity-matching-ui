export const environment = {
  production: true,
  baseApiUrl: (window as any)['env']['baseApiUrl'] || "https://identity-matching.fast.hl7.org/fhir",
  authBypassSessionKey: "auth-bypass-header-enabled",
  idpIssuer: "",
  idpClientId: 'fast-identity-matching',
  idpClientSecret: '',
  idpScope: 'openid user/*.read user/*.rs',
  clientName: 'Identity Matching Client',
  redirectUri: window.location.origin,
  // loginUrl: window.location.origin,
};
