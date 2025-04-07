import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'fc-admin-dashboard',
    imports: [
        CommonModule,
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

  serverStatuses: Array<{ url: string; status: 'pending' | 'online' | 'offline'; }> = [];

  constructor() {  
  }
  ngOnInit(): void {
    this.serverStatuses = [
      { url: `${environment.baseApiUrl}/metadata`, status: 'pending' }
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
