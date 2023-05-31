import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SessionStorageService } from 'src/app/services/core/session.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-auth-bypass',
  standalone: true,
  imports: [
    CommonModule,
    MatCheckboxModule
  ],
  templateUrl: './auth-bypass.component.html',
  styleUrls: ['./auth-bypass.component.scss']
})
export class AuthBypassComponent {
  enableBypass: boolean = false;

  constructor(private sessionService: SessionStorageService) {}
  
  setBypassStatus(bypassStatus: boolean) {
    this.enableBypass = bypassStatus;
    this.sessionService.storeItem(environment.authBypassSessionKey, bypassStatus ? 'enabled' : 'disabled');
  }
}
