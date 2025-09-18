import { Component, inject, OnInit } from '@angular/core';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SettingsService } from '@/ui/app/services/settings.service';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-admin-dashboard',
    imports: [
    MatButtonModule,
    MatCardModule,
    MatGridListModule,
    MatIconModule,
    MatListModule,
    MatToolbarModule,
    MatTooltipModule
],
    templateUrl: './admin-dashboard.component.html',
    styleUrls: ['./admin-dashboard.component.css']
})
export class AdminDashboardComponent implements OnInit {

  serverStatuses: { url: string; status: 'pending' | 'online' | 'offline'; }[] = [];

  settingsService = inject(SettingsService);

  async ngOnInit(): Promise<void> {

    const client = await firstValueFrom(this.settingsService.currentClient$);

    if (!client) {
      return;
    }
    this.serverStatuses = [
      { url: `${client.fhirBaseUrl}/metadata`, status: 'pending' }
    ];    

    this.serverStatuses.forEach((server) => {
      fetch(server.url)
        .then(() => {
          server.status = 'online';
        })
        .catch(() => {
          server.status = 'offline';
        });
    });

  }

}
