import { ClientDTO } from '@/lib/models/client';
import { SettingsService } from '@/ui/app/services/settings.service';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterModule } from '@angular/router';


type CurrentClientResponse = ClientDTO | { message: string };


@Component({
  selector: 'app-current-settings',
  imports: [
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule,
    RouterModule
  ],
  templateUrl: './current-settings.component.html',
  styleUrl: './current-settings.component.scss'
})
export class CurrentSettingsComponent implements OnInit {

  currentServer = '';
  message = '';

  platformId = inject(PLATFORM_ID);
  http = inject(HttpClient);
  snackbar = inject(MatSnackBar);
  clientSettingsService = inject(SettingsService);


  async ngOnInit() {

    if (!isPlatformBrowser(this.platformId)) {
      return;
    }
    
    this.currentServer = '';
    this.message = '';

    // Subscribe to changes from the settings service
    this.clientSettingsService.currentClient$.subscribe(client => {
      // console.log('Current client settings updated', client);
      if (client) {
        const grantType = client.grantTypes?.includes('client_credentials') ? 'CC' : 'AC';
        this.currentServer = `${client.fhirBaseUrl} (${grantType})`;
        this.message = '';
      }
      else {
        this.currentServer = '';
        this.message = 'No client selected';
      }
    });

    // Load initial data
    try {
      this.http.get<CurrentClientResponse>('/api/client/current').subscribe({
        next: (data: CurrentClientResponse) => {
          if (data instanceof Object && 'id' in data) {
            const grantType = data.grantTypes?.includes('client_credentials') ? 'CC' : 'AC';
            this.currentServer = `${data.fhirBaseUrl} (${grantType})`;
          }
          else if (data instanceof Object && 'message' in data) {
            this.message = data.message;
          }
          
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error loading current settings', err);
          this.message = 'Error loading current settings';
          this.snackbar.open(this.message, 'Close', {
            duration: 5000,
            panelClass: 'error-snackbar'
          });
        }
      });

    }
    catch (e) {
      this.message = 'Error loading current settings';
      console.error('Caught error loading current settings', e);
      this.snackbar.open(this.message, 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }

  }


}
