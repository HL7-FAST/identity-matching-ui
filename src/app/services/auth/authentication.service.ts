import { Injectable } from '@angular/core';
import { OAuthService } from 'angular-oauth2-oidc';
import { UserProfile } from 'src/app/models/user-pofile.model';
import { UserProfileService } from '../core/user-profile.service';
import { authCodeFlowConfig } from 'src/app/config/auth-code-flow.config';
import { filter } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  userProfile!: UserProfile;
  

  constructor(private oauthService: OAuthService, private profileService: UserProfileService) {

    if (!this.oauthService.hasValidAccessToken()) {
      this.oauthService.configure(authCodeFlowConfig); 
      this.oauthService.loadDiscoveryDocumentAndLogin();
      this.oauthService.setupAutomaticSilentRefresh();

      // Automatically load user profile
      this.oauthService.events
        .pipe(filter((e) => e.type === 'token_received'))
        .subscribe((_) => {
          this.oauthService.loadUserProfile().then(() => {
            //build user profile from token          
            const claims = this.oauthService.getIdentityClaims();
            //const scopes = this.oauthService.getGrantedScopes();

            this.userProfile = new UserProfile(
              claims['email'],
              claims['given_name'],
              claims['family_name'],
              ["TestFacility01", "TestFacility02"],
              [],
              ["Admin"]
            );

            this.profileService.setProfile(this.userProfile);            
          })          
        });
    }
    else {
      this.userProfile = this.profileService.getProfile();      
    }

  }  

  //TODO - Build out way to rebuild the service configuration if this can be pointed at multiple RIs

  isLoggedIn(): boolean {
    return this.oauthService.hasValidAccessToken();
  }

  logout(): void {
    this.oauthService.logOut();
  }
}
