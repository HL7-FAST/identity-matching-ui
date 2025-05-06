import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatTooltipModule } from '@angular/material/tooltip';
import { HttpClient } from '@angular/common/http';

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
  http = inject(HttpClient);

  constructor(private clipboard: Clipboard) {
  }

  ngOnInit() {

    this.http.get('/api/auth/token').subscribe({
      next: (data: any) => {
        this.currentToken = data.token;
      },
      error: () => {
        this.currentToken = '';
      }
    });
    
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
