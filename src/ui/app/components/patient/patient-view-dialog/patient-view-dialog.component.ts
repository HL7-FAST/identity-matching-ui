import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Patient } from 'fhir/r4';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PatientService } from '@/ui/app/services/patient.service';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatCardModule } from '@angular/material/card';

@Component({
    selector: 'app-patient-view-dialog',
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
  data = inject<{
    dialogTitle: string;
    patient: Patient;
}>(MAT_DIALOG_DATA);
  private dialogRef = inject<MatDialogRef<PatientViewDialogComponent>>(MatDialogRef);
  private snackBar = inject(MatSnackBar);
  private patientService = inject(PatientService);

  patient!: Patient;

  constructor() {
      const data = this.data;

      this.patient = data.patient;
    }
    
}
