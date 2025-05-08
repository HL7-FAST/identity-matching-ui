
import { Component, inject } from '@angular/core';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { HttpClient } from '@angular/common/http';
import { ClientDTO } from '@/lib/models/client';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatTableModule } from '@angular/material/table';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { firstValueFrom } from 'rxjs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { SettingsService } from '@/ui/app/services/settings.service';
import { CreateClientComponent } from '../create-client/create-client.component';
import { MatTooltipModule } from '@angular/material/tooltip';



type ClientListResponse = ClientDTO[] | { message: string };

@Component({
  selector: 'app-edit-clients',
  templateUrl: './edit-clients.component.html',
  styleUrl: './edit-clients.component.scss',
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatProgressSpinner,
    MatSnackBarModule,
    MatTableModule,
    MatToolbarModule,
    MatTooltipModule
  ],
})
export class EditClientsComponent {

  clients: ClientDTO[] = [];
  displayedColumns: string[] = [ 'select', 'fhirBaseUrl', 'grantTypes', 'scopesRequested', 'scopesGranted'];
  loading = false;

  http = inject(HttpClient);
  snackbar = inject(MatSnackBar);
  settingsService = inject(SettingsService);
  dialog = inject(MatDialog);
  currentClientId = '';


  ngOnInit() {
    this.loadClients();

    this.settingsService.currentClient$.subscribe(client => {
      // console.log('Current client settings updated', client);
      if (client) {
        this.currentClientId = client.id;
      }
      else {
        this.currentClientId = '';
      }
    });

  }


  async loadClients() {
    this.loading = true;

    try {
      const data = await firstValueFrom(this.http.get<ClientListResponse>('/api/client/list'));
      
      if (data instanceof Array) {
        this.clients = data;
      }
      else if ((data as { message?: string }).message) {
        console.error((data as { message: string }).message);
        this.snackbar.open((data as { message: string }).message, 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
      else {
        console.error('Error loading client list');
        this.snackbar.open('Error loading client list', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    }
    catch (e) {
      console.error('Error loading client list', e);
      this.snackbar.open('Error loading client list', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }
    finally {
      this.loading = false;
    }
  }

  async selectClient(client: ClientDTO) {

    try {
      // const data = await firstValueFrom(this.http.get<{ message: string }>(`/api/client/select/${client.id}`));
      const data = await this.settingsService.selectClient(client.id);
      if (data instanceof Object && 'id' in data) {
        this.snackbar.open(`Client ${data.id} selected.`, 'Close', {
          duration: 5000,
          panelClass: 'success-snackbar'
        });
      }
      else {
        console.error('Error selecting client');
        this.snackbar.open('Error selecting client', 'Close', {
          duration: 5000,
          panelClass: 'error-snackbar'
        });
      }
    }
    catch (e) {
      console.error('Error selecting client', e);
      this.snackbar.open('Error selecting client', 'Close', {
        duration: 5000,
        panelClass: 'error-snackbar'
      });
    }

  }


  
  openCreateClientDialog(): void {
    const dialogRef = this.dialog.open(CreateClientComponent, {
      width: '600px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle the new client data
        this.loadClients();
      }
    });
  }

}
