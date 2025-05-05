import { Component } from '@angular/core';
import { UserProfile } from './models/user-profile.model';
import { Breakpoints, BreakpointObserver } from '@angular/cdk/layout';
import { Observable, map, shareReplay } from 'rxjs';
import { UserProfileService } from './services/core/user-profile.service';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { SessionDialogComponent } from './components/core/session-dialog/session-dialog.component';
import { RouterModule } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatIconModule } from '@angular/material/icon';
import { LoadingIndicatorComponent } from './components/core/loading-indicator/loading-indicator.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CurrentSettingsComponent } from "./components/settings/current-settings/current-settings.component";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
    imports: [
    CommonModule,
    RouterModule,
    MatToolbarModule,
    MatTooltipModule,
    MatExpansionModule,
    MatButtonModule,
    MatDialogModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    LoadingIndicatorComponent,
    CurrentSettingsComponent
]
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

  constructor(private breakpointObserver: BreakpointObserver, private profileService: UserProfileService, private dialog: MatDialog) {

    this.profileService.userProfileUpdated.subscribe(profile => {
      this.userProfile = profile;
    });    

  }

  async ngOnInit(): Promise<void> {
    this.userProfile = await this.profileService.getProfile(); 
  }

  login() {
    window.location.href = '/api/auth/login';
  }

  logout() {
    window.location.href = '/api/auth/logout';
  }

  toggleMenuText() {
    this.showMenuText = !this.showMenuText;
  }

  showSessionDialog($event: Event) {
    $event.stopPropagation();

    this.dialog.open(SessionDialogComponent, { minWidth: '50vw' });
  }

}
