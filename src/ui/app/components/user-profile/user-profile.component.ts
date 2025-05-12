import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { SettingsService } from '../../services/settings.service';
import { firstValueFrom } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { HttpClient } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss',
  imports: [
    MatButton,
    MatIconModule
  ],
})
export class UserProfileComponent implements OnInit {

  clientSettingsService = inject(SettingsService);
  userProfile: any = undefined;
  clientIsAuthCodeFlow = false;
  http = inject(HttpClient);
  platformId = inject(PLATFORM_ID);

  ngOnInit() {

    if (isPlatformBrowser(this.platformId)) {
      this.clientSettingsService.currentClient$.subscribe(() => {
        this.loadUserProfile();
      });
    }
  }

  async loadUserProfile() {

    // console.log('Loading user profile');

    this.userProfile = undefined;

    const client = await firstValueFrom(this.clientSettingsService.currentClient$);
    if (!client) {
      this.clientIsAuthCodeFlow = false;
      return;
    }

    this.clientIsAuthCodeFlow = client.grantTypes?.includes('authorization_code');
    if (!this.clientIsAuthCodeFlow) {
      return;
    }

    this.http.get('/api/auth/userinfo').subscribe({
      next: (data: any) => {
        this.userProfile = data;
      },
      error: () => {
        this.userProfile = undefined;
      }
    });

  }


  login() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/api/auth/login';
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      window.location.href = '/api/auth/logout';
    }
  }

}
