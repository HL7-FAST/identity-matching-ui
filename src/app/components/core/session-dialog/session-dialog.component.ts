import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { OAuthService } from 'angular-oauth2-oidc';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-session-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatCardModule,
    MatDialogModule,
    MatIconModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  templateUrl: './session-dialog.component.html',
  styleUrls: ['./session-dialog.component.scss']
})
export class SessionDialogComponent implements OnInit {

  currentToken: string = '';

  constructor(private oauthService: OAuthService, private snackBar: MatSnackBar, private clipboard: Clipboard) {
  }

  ngOnInit(): void {
    if (this.oauthService.hasValidAccessToken()) {
      this.currentToken = this.oauthService.getAccessToken();
    }
  }


  copyToken() {
    this.clipboard.copy(this.currentToken);

    this.snackBar.open(`Auth token copied.`, '', {
      duration: 3500,
      panelClass: 'success-snackbar',
      horizontalPosition: 'end',
      verticalPosition: 'top'
    });
  }



}
