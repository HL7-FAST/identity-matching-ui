import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
    selector: 'app-session-dialog',
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
  snackBar = inject(MatSnackBar);

  constructor(private clipboard: Clipboard) {
  }

  async ngOnInit(): Promise<void> {
    this.currentToken = '';

    const res = await fetch('/api/auth/token');
    if (res.ok) {
      const data = await res.json();
      this.currentToken = data.token;
    } 
    else if (res.status === 401) {
      // nothing to do
    }
    else {
      console.error('Error fetching token:', res.statusText);
      this.snackBar.open(`Error fetching token: ${res.statusText}`, '', {
        duration: 3500,
        panelClass: 'error-snackbar',
        horizontalPosition: 'end',
        verticalPosition: 'top'
      });
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
