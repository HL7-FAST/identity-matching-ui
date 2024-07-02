import { Component } from '@angular/core';
import { UserProfile } from './models/user-pofile.model';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { UserProfileService } from './services/core/user-profile.service';
import { AuthenticationService } from './services/auth/authentication.service';
import { MatDialog } from '@angular/material/dialog';
import { SessionDialogComponent } from './components/core/session-dialog/session-dialog.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'fhir-client';
  userProfile: UserProfile | undefined;
  showMenuText: boolean = true;

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, private authService: AuthenticationService, private profileService: UserProfileService, private dialog: MatDialog) {

    this.profileService.userProfileUpdated.subscribe(profile => {
      this.userProfile = profile;
    });    

  }

  ngOnInit(): void {
    this.userProfile = this.profileService.getProfile(); 
  }

  logout() {
    this.authService.logout();
  }

  toggleMenuText() {
    this.showMenuText = !this.showMenuText;
  }

  showSessionDialog($event: Event) {
    $event.stopPropagation();

    this.dialog.open(SessionDialogComponent, { minWidth: '50vw' }).afterClosed().subscribe(res => {
      if (res) {
        window.location.reload();
      }
    });
  }

}
