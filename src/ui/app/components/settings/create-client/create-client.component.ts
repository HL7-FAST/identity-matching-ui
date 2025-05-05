import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-create-client',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatChipsModule,
    MatIconModule
  ],
  templateUrl: './create-client.component.html',
  styleUrls: ['./create-client.component.scss']
})
export class CreateClientComponent {
  clientForm: FormGroup;
  scopesRequested: string[] = [];

  errorMessage = '';
  
  fb = inject(FormBuilder);
  dialogRef = inject(MatDialogRef<CreateClientComponent>);
  http = inject(HttpClient);
  snackbar = inject(MatSnackBar);
  
  constructor() {
    this.clientForm = this.fb.group({
      fhirBaseUrl: ['', [Validators.required, Validators.pattern('https?://.*')]],
      grantTypes: ['client_credentials', Validators.required],
      scopesRequested: [''],
    });
  }

  onSubmit(): void {
    if (this.clientForm.valid) {
      this.createClient(this.clientForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  async createClient(clientData: any) {
    this.errorMessage = '';
    try {
      const result = await firstValueFrom(this.http.post<any>('/api/client', clientData));
      if (result && result.id) {
        this.snackbar.open(`Client ${result.id} created successfully`, 'Close', {
          duration: 5000,
          panelClass: 'success-snackbar'
        });
        this.dialogRef.close(result);
      } else {
        throw new Error('Failed to create client.  Unexpected response: ' + JSON.stringify(result));
      }
    } catch (e) {
      console.error('Error creating client', e);
      if (e instanceof HttpErrorResponse) {
        this.errorMessage = 'Error creating client: ' + (e as HttpErrorResponse)?.error?.message || 'Unknown error';
      } else if (e instanceof Error) {
        this.errorMessage = 'Error creating client: ' + e.message;
      }
      else {
        this.errorMessage = 'Error creating client: ' + JSON.stringify(e);
      }
    }
  }
}