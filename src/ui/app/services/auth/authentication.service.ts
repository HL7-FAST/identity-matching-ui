import { Injectable } from '@angular/core';
import { OAuthService, UrlHelperService } from 'angular-oauth2-oidc';
import { UserProfile } from '@/ui/app/models/user-profile.model';
import { UserProfileService } from '../core/user-profile.service';
import { authCodeFlowConfig } from '@/ui/app/config/auth-code-flow.config';
import { firstValueFrom } from 'rxjs';
import { environment } from '@/ui/environments/environment';
import { HttpClient } from '@angular/common/http';
import { UdapMetadata, UdapSoftwareStatement } from '@/ui/app/models/udap';
import { SessionStorageService } from '../core/session.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userProfile!: UserProfile;
  

  constructor(private oauthService: OAuthService, private urlHelperService: UrlHelperService, private profileService: UserProfileService, private sessionStorage: SessionStorageService, private http: HttpClient) {

    this.oauthService.events.subscribe(e => {
      console.log('oauth event:', e);
    });

    if (!this.oauthService.hasValidAccessToken()) {

      try {
        this.getAccessToken().then((token) => {
          
        });
      } catch (error) {
        console.log('getAccessToken() error:', error);
      }

    }

  }
  
  

  async getAccessToken(): Promise<void> {

    // if (!this.sessionStorage.getItem('client_id') || !this.sessionStorage.getItem('auth_server')) {
    //   await this.registerClient();
    // }
    return;
    await this.registerClient();

    authCodeFlowConfig.clientId = <string>await this.sessionStorage.getItem('client_id');
    authCodeFlowConfig.issuer = <string>await this.sessionStorage.getItem('auth_server');

    this.oauthService.configure(authCodeFlowConfig);

    if (window.location.search && window.location.search.indexOf('code=') > -1) {
      
      let queryString: string = window.location.search;
      if (queryString.charAt(0) === '?') {
        queryString = queryString.substring(1);
      }
      let queryParts: any = this.urlHelperService.parseQueryString(queryString);

      let caRes = await firstValueFrom(this.http.post<any>(`${environment.baseApiUrl}/cert/client-assertion`, {
        client_id: authCodeFlowConfig.clientId
      }));
      const ca = caRes['client_assertion'];

      await this.oauthService.loadDiscoveryDocument(`${authCodeFlowConfig.issuer}/.well-known/udap`);

      this.oauthService.fetchTokenUsingGrant('authorization_code', {
        code: queryParts['code'],
        client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
        client_assertion: ca,
        redirect_uri: environment.redirectUri,
        udap: 1
      }).then((res) => {
        this.oauthService.setupAutomaticSilentRefresh({
          code: queryParts['code'],
          client_assertion_type: 'urn:ietf:params:oauth:client-assertion-type:jwt-bearer',
          client_assertion: ca,
          redirect_uri: environment.redirectUri,
          udap: 1
        });
      }).finally(() => {
        window.history.replaceState({}, document.title, '/');
      });


    } else {
      this.oauthService.loadDiscoveryDocument(`${authCodeFlowConfig.issuer}/.well-known/udap`).then((doc) => {
        this.oauthService.initCodeFlow(undefined, {
          aud: environment.baseApiUrl
        });
      });
    }
    
  }



  async registerClient(): Promise<string> {
    // register client
    console.log('registering this client...');

    const fhirMetadata = await firstValueFrom(this.http.get<UdapMetadata>(`${environment.baseApiUrl}/.well-known/udap`));
    this.sessionStorage.storeItem('auth_server', new URL(fhirMetadata.authorization_endpoint).origin);

    // const date = Math.floor(new Date().getTime() / 1000);

    const softwareStatement: UdapSoftwareStatement = {
      // iss: environment.baseApiUrl,
      // sub: environment.baseApiUrl,
      // aud: fhirMetadata.registration_endpoint,
      // exp: date + 300,
      // iat: date,
      jti: window.crypto.randomUUID(),
      client_name: environment.clientName,
      redirect_uris: [environment.redirectUri],
      contacts: [''],
      logo_uri: '',
      grant_types: ['authorization_code'],
      response_types: ['code'],
      token_endpoint_auth_method: 'private_key_jwt',
      scope: environment.idpScope,
    };

    // get signed software statement... we are using a helper from the server RI which hosts the test client cert
    const softwareStatementResponse = await firstValueFrom(this.http.post<any>(`${environment.baseApiUrl}/cert/software-statement`, softwareStatement));
    
    // register client
    const registrationBody = {
      software_statement: softwareStatementResponse['software_statement'],
      certifications: null,
      udap: "1"
    };
    const regResult = await firstValueFrom(this.http.post<any>(`${fhirMetadata.registration_endpoint}`, registrationBody));

    const clientId = regResult['client_id'];

    if (!clientId) {
      throw new Error('Client registration failed.');
    }

    this.sessionStorage.storeItem('client_id', clientId);

    return clientId;
  }


  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  logout(): void {
    this.oauthService.logOut();
  }
}
