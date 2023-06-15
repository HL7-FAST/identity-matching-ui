export const environment = {
  production: true,
  baseApiUrl: "https://identity-matching.fast.hl7.org/fhir",
  authBypassSessionKey: "auth-bypass-header-enabled",
  idpIssuer: "https://oauth.lantanagroup.com/auth/realms/Connectathon",
  idpClientId: 'fast-identity-matching',
  idpClientSecret: '',
  idpScope: 'openid profile email',
  redirectUri: window.location.origin + '/',
  loginUrl: window.location.origin + '/',
};
