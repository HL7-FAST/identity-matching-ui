// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // baseApiUrl: (window as any)['env']['baseApiUrl'] || 'http://localhost:8080/fhir',
  baseApiUrl: 'http://localhost:8080/fhir',
  authBypassSessionKey: 'auth-bypass-header-enabled',
  idpIssuer: '',
  idpClientId: '',
  idpClientSecret: '',
  idpScope: 'openid user/*.read user/*.rs',
  clientName: 'Identity Matching Client',
  redirectUri: 'http://localhost:4200/auth-callback',
  // loginUrl: 'https://localhost:5001/connect/authorize',
};

