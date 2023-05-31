import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Patient } from 'fhir/r4';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientService } from 'src/app/services/patient.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-patient-view-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,  
    MatIconModule,
    MatToolbarModule,
    MatListModule,
    MatCardModule,
    MatSnackBarModule
  ],
  templateUrl: './patient-view-dialog.component.html',
  styleUrls: ['./patient-view-dialog.component.scss']
})
export class PatientViewDialogComponent {
  patient!: Patient;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { dialogTitle: string, patient: Patient },
    private dialogRef: MatDialogRef<PatientViewDialogComponent>, 
    private snackBar: MatSnackBar, 
    private patientService: PatientService) {
      this.patient = data.patient;
    }
    
}
