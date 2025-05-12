import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { PatientViewDialogComponent } from './patient-view-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Patient } from 'fhir/r4';

describe('PatientViewDialogComponent', () => {
  let component: PatientViewDialogComponent;
  let fixture: ComponentFixture<PatientViewDialogComponent>;

  const mockPatient: Patient = {
    resourceType: 'Patient',
    id: 'test-patient-id',
    name: [{ given: ['Test'], family: 'Patient' }]
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [PatientViewDialogComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { 
          provide: MAT_DIALOG_DATA, 
          useValue: { 
            dialogTitle: 'View Patient', 
            patient: mockPatient 
          } 
        },
        { provide: MatDialogRef, useValue: {} }
      ]
    });
    fixture = TestBed.createComponent(PatientViewDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
